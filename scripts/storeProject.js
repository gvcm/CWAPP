'use strict';
define([
  'jquery', 
  "three", 
  "underscore", 
  "jszip",
  'jszip-utils'
], function(
  jQuery, 
  THREE, 
  _, 
  jszip,
  jszipUtils 
) {
    // Zipper //
   var zip = new jszip();
   var menu = undefined;
    
    // Constructor //

    function StoreProject(lattice, motifeditor, camera, cellCamera, motifXcam, motifYcam, motifZcam, crystalRenderer, stlExporter, menuIn, gearTour, fitToCrystal) { 
        this.idle = false;
        this.lattice = lattice;
        this.motifeditor = motifeditor;
        this.cellCamera = cellCamera;
        this.motifXcam = motifXcam;
        this.motifYcam = motifYcam;
        this.motifZcam = motifZcam;
        this.camera = camera;
        this.crystalRenderer = crystalRenderer;
        this.stlExporter = stlExporter;
        this.gearTour = gearTour;
        this.dollGearBarME ;
        this.LOD;
        this.fitToCrystal = fitToCrystal;
        this.narrative_system ;
        menu = menuIn;
    };
     
    // Send JSON to Database //
    function sendToDatabase(text){
        
        var _this = this;
        
        var obj =  JSON.parse(text);  
        var str =  JSON.stringify(obj);
          
        // Send Request //
        var service = 'https://cwgl.herokuapp.com';
        var hash ='';
        
        var data = {
            url: document.location.origin,
            data: str
        };
        
        $.ajax(service + '/add', {
            method: 'POST',
            data: data,
            beforeSend: function(xmlHttpRequest) {
                xmlHttpRequest.withCredentials = true;
            }
        })
        .done(function(res) {  
            hash = res.slug;
            menu.updateLibrary('cw.gl/'+hash);
        });
    };
    
    // Construct JSON File //
    StoreProject.prototype.constructJSONString = function (argument, imgPreview){
        var checkIteration = false;
       
        // Start with App Info //
        var jsonText = '{"info":{';
        jsonText = jsonText + '"name":"'+argument.name+'","description":"'+argument.description+'",';
        if(imgPreview) {
            jsonText = jsonText + '"preview":"'+imgPreview+'",';
        }
        if(argument.tags.length > 0){
            jsonText = jsonText + '"tags":{';
            _.each(argument.tags,function($parameter,k){
                jsonText = jsonText + '"tag' + k + '":"' + $parameter + '",';
                checkIteration = true;
            });
            // Remove last comma //
            if (checkIteration === true){
                jsonText = jsonText.slice(0, -1);
                checkIteration = false;
            }
            jsonText = jsonText + '}},';
        }
        else {
            jsonText = jsonText.slice(0, -1);
            jsonText = jsonText + '},';
        }

        // App UI //
        jsonText = jsonText + '"appUI":{';
        
        // Menu Ribbon // 
        jsonText = jsonText + '"menuRibbon":{ "activeTab":"' + argument.app.activeTab + '", "disabledTabs":{';
        _.each(argument.app.tabDisable, function($parameter,k){ jsonText = jsonText + '"' + k + '":' + $parameter + ','; });
        jsonText = jsonText.slice(0, -1);
        jsonText = jsonText + '}, "toggleButtons":{';
        _.each(argument.app.toggleButtons, function($parameter,k){ 
            jsonText = jsonText + '"' + k + '":' + $parameter + ','; 
        });
        jsonText = jsonText.slice(0, -1);
        jsonText = jsonText + '}},'; // Close Toggle Buttons and Menu Ribbon //
        
        // Lattice Tab //
        jsonText = jsonText + '"latticeTab":{ "latticeSelecion": { "selectedLattice":"' + argument.app.selectedLattice + '", "selectedLatticeDisable":' + argument.app.selectedLatticeDisable + '},';
        jsonText = jsonText + '"latticeRepetition": { "repeatX":' + parseFloat(argument.app.repeatX) + ', "repeatY":' + parseFloat(argument.app.repeatY) + ', "repeatZ":' + parseFloat(argument.app.repeatZ) + '},';
        jsonText = jsonText + '"latticeLength": { "scaleX":' + parseFloat(argument.app.scaleX) + ', "scaleY":' + parseFloat(argument.app.scaleY) + ', "scaleZ":' + parseFloat(argument.app.scaleZ) + '},';
        jsonText = jsonText + '"latticeAngle": { "alpha":' + parseFloat(argument.app.alpha) + ', "beta":' + parseFloat(argument.app.beta) + ', "gamma":' + parseFloat(argument.app.gamma) + '},';
        jsonText = jsonText + '"padlocks": { "lattice": { "state":' + argument.app.latticePadlock + ', "disabled":' + argument.app.latticePadlockDisable + '}, "motif": { "state":' + argument.app.motifPadlock + ', "disabled":' + argument.app.motifPadlockDisable + '}},';
        jsonText = jsonText + '"cellVisualization": { "cellEdge": { "color":"' + argument.app.borderColor + '", "radius":' + parseFloat(argument.app.radius) + '}, "cellFace": { "color":"' + argument.app.filledColor + '", "opacity":' + parseFloat(argument.app.opacity) + '}}},';
        
        // Motif Tab //
        jsonText = jsonText + '"motifTab": { "lockCameras":' + argument.app.lockCameras + ', "tangency":' + argument.app.tangency + ', "cellVolume":' + parseFloat(argument.app.cellVolume) + ',';
        jsonText = jsonText + '"motifLabels": { "a":"' + argument.app.motifLabels.a + '", "b":"' + argument.app.motifLabels.b + '", "c":"' + argument.app.motifLabels.c + '", "alpha":"' + argument.app.motifLabels.alpha + '", "beta":"' + argument.app.motifLabels.beta + '", "gamma":"' + argument.app.motifLabels.gamma + '"}},';
        
        // Visual Tab //
        jsonText = jsonText + '"visualTab": { "visualParameters": { "renderizationMode": { "wireframe":' + argument.app.wireframe + ', "toon":' + argument.app.toon + ', "flat":' + argument.app.flat + ', "realistic":' + argument.app.realistic + '},';
        jsonText = jsonText + '"renderizationQuality" : { "autoQuality":' + argument.app.autoQuality + ', "lowQuality":' + argument.app.lowQuality + ', "mediumQuality":' + argument.app.mediumQuality + ', "highQuality":' + argument.app.highQuality + '},';
        jsonText = jsonText + '"lod" : { "lod":' + argument.app.lod + '},';
        jsonText = jsonText + '"lights" : { "lights":' + argument.app.lights + ', "ssao":' + argument.app.ssao + ', "shadows":' + argument.app.shadows + '},';
        jsonText = jsonText + '"visualizationMode" : { "distortionOn":' + argument.app.distortionOn + ', "distortionOff":' + argument.app.distortionOff + '},';
        jsonText = jsonText + '"stereoscopicEffect" : { "anaglyph":' + argument.app.anaglyph + ', "oculus":' + argument.app.oculus + ', "sideBySide3D":' + argument.app.sideBySide3D + ', "OnTop3D":' + argument.app.onTop3D + '},';
        jsonText = jsonText + '"stereoscopicCellEffect" : { "anaglyphCell":' + argument.app.anaglyphCell + ', "oculusCell":' + argument.app.oculusCell + ', "sideBySide3DCell":' + argument.app.sideBySide3DCell + ', "OnTop3DCell":' + argument.app.onTop3DCell + '},';
        jsonText = jsonText + '"focalPoint" : { "crystalCamTargetOn":' + argument.app.crystalCamTargetOn + ', "crystalCamTargetOff":' + argument.app.crystalCamTargetOff + '},';
        jsonText = jsonText + '"leapMotion":' + argument.app.leapMotion + ',';
        jsonText = jsonText + '"crystalModelRepresentation":{ "crystalClassic":' + argument.app.crystalClassic + ', "crystalSubstracted":' + argument.app.crystalSubstracted + ', "crystalSolidVoid":' + argument.app.crystalSolidVoid + ', "crystalGradeLimited":' + argument.app.crystalGradeLimited + '},';
        jsonText = jsonText + '"unitCellModelRepresentation":{ "cellClassic":' + argument.app.cellClassic + ', "cellSubstracted":' + argument.app.cellSubstracted + ',"cellSolidVoid":' + argument.app.cellSolidVoid + ', "cellGradeLimited":' + argument.app.cellGradeLimited + '}},';
        jsonText = jsonText + '"visualTools": { "menuZoom": { "autoZoom":' + argument.app.autoZoom + ', "zoom70":' + argument.app.zoom70 + ', "zoom80":' + argument.app.zoom80 + ', "zoom90":' + argument.app.zoom90 + ', "zoom100":' + argument.app.zoom100 + '},';
        jsonText = jsonText + '"fog": { "state":' + argument.app.fog + ', "color":"' + argument.app.fogColor + '", "density":' + parseFloat(argument.app.fogDensity) + '},';
        jsonText = jsonText + '"sound": { "state":' + argument.app.sounds + ', "volume":' + parseFloat(argument.app.soundVolume) + '},';
        jsonText = jsonText + '"colorization": { "crystalScreenColor":"' + argument.app.crystalScreenColor + '", "cellScreenColor":"' + argument.app.cellScreenColor + '", "motifXScreenColor":"' + argument.app.motifXScreenColor + '", "motifYScreenColor":"' + argument.app.motifYScreenColor + '", "motifZScreenColor":"' + argument.app.motifZScreenColor + '"}}},';
        
        // Library Tab //
        jsonText = jsonText + '"libraryTab": { "pngOptions": { "frameIT" :' + argument.app.frameIT + ', "qrCode":' + argument.app.qrCode + ', "printMode":' + argument.app.printMode + '}}';

        jsonText = jsonText + '},'; // Close App UI //
        
        
        // Notes //
        jsonText = jsonText + '"notes":{';
        _.each(argument.notes, function($parameter,k){
            checkIteration = true;
            if (k === 'activeEntry') jsonText = jsonText + '"activeEntry":false,';
            else {
                jsonText = jsonText + '"' + k + '":{';
                jsonText = jsonText + '"title":"' + $parameter.title + '",';
                jsonText = jsonText + '"body":"' + $parameter.body + '",';
                jsonText = jsonText + '"color":"' + $parameter.color + '",';
                jsonText = jsonText + '"opacity":"' + $parameter.opacity + '",';
                jsonText = jsonText + '"atomNote":"' + $parameter.atomNote + '",';
                jsonText = jsonText + '"x":"' + $parameter.x + '",';
                jsonText = jsonText + '"y":"' + $parameter.y + '"},';
            }
        });
        // Remove last comma //
        if (checkIteration === true){
            jsonText = jsonText.slice(0, -1);
            checkIteration = false;
        }
        jsonText = jsonText + '},'; // Close Notes //

        // Atom List //
        jsonText = jsonText + '"atomList":{';
        _.each(argument.atomList, function($parameter,k){
            jsonText = jsonText + '"' + k + '":{';
            jsonText = jsonText + '"role":"' + $parameter.role + '",';
            jsonText = jsonText + '"tangentTo":"' + $parameter.tangentTo + '",';
            jsonText = jsonText + '"visibility":' + $parameter.visibility + ',';
            jsonText = jsonText + '"chain":' + $parameter.chain + ',';
            jsonText = jsonText + '"level":"' + $parameter.level + '",';
            jsonText = jsonText + '"element":"' + $parameter.element + '",';
            jsonText = jsonText + '"sup":"' + $parameter.sup + '",';
            jsonText = jsonText + '"atomPos": "' + 0.0 /*$parameter.atomPos*/ + '"},';
            checkIteration = true;
        });
        // Remove last comma //
        if (checkIteration === true){
            jsonText = jsonText.slice(0, -1);
            checkIteration = false;
        }
        jsonText = jsonText + '},';
        
        // System //
        jsonText = jsonText + '"system": '+ this.getSystemState() +' ';

        jsonText = jsonText + '}'; // Close Object //
         
        return jsonText;
    };
    StoreProject.prototype.downLoadfile = function(argument){
        // json = application/json
        // text = application/text    

        var _this = this;

        if (argument.extention === 'json'){
            var blob = new Blob([JSON.stringify(JSON.parse(argument.data),null,2)], {type: argument.type});
            saveAs(blob, argument.name + '.' + argument.extention);

        }
        else if (argument.extention === 'png'){
             
            // Caprture Snapshot //
            
            var lod = this.LOD.lodLevel;
            this.LOD.setLOD({lod:5, dontReset : true});
           
            this.crystalRenderer.enabledRenders.doll = false;
            this.crystalRenderer.enabledRenders.compass = false;
            this.crystalRenderer.enabledRenders.navCube = false;
         
            var width = $('#crystalRenderer').find('canvas:first').width();
            var height = $('#crystalRenderer').find('canvas:first').height();
 
            var newWidth, adjustedHeight, urlFontSize, urlOffset;
            if(argument.metaData.resolution === 'low'){
                newWidth = 1200;
                adjustedHeight = 800;
                urlFontSize = 10;
                urlOffset = -4;
            }
            else if(argument.metaData.resolution === 'medium'){
                newWidth = 1600;
                adjustedHeight = 1200;
                urlFontSize = 15;
                urlOffset = -1;
            }   
            else{
                newWidth = 3200;
                adjustedHeight = 2400;
                urlFontSize = 30;
                urlOffset = 10;
            }
            var ratio = (newWidth/width); 
            var newHeight = ratio*height;
            
            var bgRenderColor = (!argument.metaData.pngOptions.printMode) ? ('#'+(this.crystalRenderer.renderer.getClearColor()).getHexString()) : '#ffffff';
 
            var tempRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true});
            
            tempRenderer.setSize( newWidth, newHeight );
            tempRenderer.setClearColor(bgRenderColor);
         
            var logoImageDims = { width : $('#appLogo').find( "img" ).width()*ratio, height : $('#appLogo').find( "img" ).height()*ratio};
            var QRImageDims = { width : logoImageDims.height, height : logoImageDims.height};
            var h = $('#appLogo').height()/3;
            var urlWPos = newWidth/2 + h + $('#appLogo').find('img:first').width()/2 + 1 ; 
            var leftQR = (newWidth/2 + (logoImageDims.width)/2 + 5);
            var bottomQR = (newHeight/15 + ((logoImageDims.height) - (QRImageDims.height/4) )/2  );
   
            var urlDiv = (argument.metaData.pngOptions.qrCode) ? '<div style="position : absolute; transform-origin:0% 0%; width : '+(logoImageDims.height/2)+'px; transform: rotate(270deg);font-size:'+urlFontSize+'px; left : '+(leftQR+QRImageDims.height/4 + urlOffset)+'px; bottom : '+(bottomQR-20)+'px; color : #3f4247; font-weight: bold;">'+($('#saveOnlineLink').val())+' </div>' : ' <div> </div>';

            var qrDiv = (argument.metaData.pngOptions.qrCode) ?  $('#QRImage').find( "img" ).clone().removeClass().css({
                position : 'absolute', 
                bottom : bottomQR+'px', 
                left : leftQR+'px', 
                width : (QRImageDims.width /4)+'px', 
                height : (QRImageDims.height /4)+'px'
            }) : ' <div> </div>';

            var divToPrint = $('#toPNGExport').clone();

            var divToPrintWrapper = $('#toPNGExport').clone();

            $(divToPrintWrapper) 
                .css({position : 'absolute', top: '0px', left : '0px', 'z-index' : 1, height : adjustedHeight+'px', width : newWidth+'px' })
                .appendTo(document.body); 

            $(divToPrint) 
                .css( {position : 'absolute', top: '0px', left : '0px', 'z-index' : 1,width : newWidth+'px' })
                .append(tempRenderer.domElement)
                .append($('#appLogo').find( "img" ).clone().removeClass().css({
                    position : 'absolute', 
                    bottom : (newHeight/15)+'px', 
                    left : (newWidth/2 - (logoImageDims.width/2))+'px', 
                    width : (logoImageDims.width)+'px', 
                    height : (logoImageDims.height)+'px'
                }))
                .append(qrDiv)
                .append(urlDiv)
                .appendTo(divToPrintWrapper);
            
            this.crystalRenderer.cameras[0].updateMatrix(); // make sure camera's local matrix is updated
            this.crystalRenderer.cameras[0].updateMatrixWorld(); // make sure camera's world matrix is updated

            tempRenderer.render(
                this.crystalRenderer.explorer.object3d, 
                this.crystalRenderer.cameras[0] 
            );  
              
            html2canvas($(divToPrintWrapper), {
              onrendered: function (canvas) { 
                var imgSrc = canvas.toDataURL(undefined, 1); 

                // Create Download Link //
                var dlLink = document.createElement('a');
                dlLink.download = argument.name + '.' + argument.extention;
                dlLink.href = imgSrc;
                dlLink.dataset.downloadurl = [argument.type, dlLink.download, dlLink.href].join(':');

                // Trigger and Dispose Link //
                document.body.appendChild(dlLink);
                dlLink.click();
                document.body.removeChild(dlLink);

                _this.crystalRenderer.enabledRenders.doll = true;
                _this.crystalRenderer.enabledRenders.compass = true;
                _this.crystalRenderer.enabledRenders.navCube = true;
                divToPrint.remove(); 
                divToPrintWrapper.remove(); 
                _this.LOD.setLOD({lod :lod, dontReset : true});
                _this.fitToCrystal.revertCamera({});
              }
            });
             
        }
        else if (argument.extention === 'zip'){
            
            menu.showInfoDialog({ messageID: 36 });
          
          
            var content = null;
            var settings = JSON.stringify(JSON.parse(this.constructJSONString(argument.details)),null,2);
            var url = 'https://cors-anywhere.herokuapp.com/http://github.com/gvcm/CWAPP/archive/master.zip';

            JSZipUtils.getBinaryContent(url, function(err, data) {
                if(err) {
                    menu.showInfoDialog({messageID : 37 });
                  throw err; // or handle err
                }

                menu.showInfoDialog({messageID : 38 });

                var zip = new jszip(data);

                zip.remove("CWAPP-master/config.ru");
                zip.remove("CWAPP-master/.ruby-version"); 
                zip.remove("CWAPP-master/LICENSE");
                zip.remove("CWAPP-master/Gemfile");
                zip.remove("CWAPP-master/Gemfile.lock");
                
                zip.file('CWAPP-master/settings.json',settings);
                 
                content = zip.generate({type:"blob"});
                saveAs(content, argument.name + '.' + argument.extention);  
                menu.showInfoDialog({messageID : 39 });
 
 
            }); 
        }
    };
    StoreProject.prototype.downloadProject = function(argument){
        this.downLoadfile({
            extention: 'zip',
            name: 'cw_bundle',
            details: argument 
        });
    };
    StoreProject.prototype.saveOnline = function(argument){

        var _this = this;
        
        var whatToPrint = $('#app-container'); 

        html2canvas(whatToPrint, {
          onrendered: function (canvas) { 
            var imgPreview = canvas.toDataURL(); 
            var json = _this.constructJSONString(argument, imgPreview);
            sendToDatabase(json);
          }
        });
 
    };
    StoreProject.prototype.exportJSON = function(argument){ 
        // Force User Download //
        var _this = this;

        var whatToPrint = $('#app-container'); 

        html2canvas(whatToPrint, {
          onrendered: function (canvas) { 
            var imgPreview = canvas.toDataURL();   
            _this.downLoadfile({
                data: _this.constructJSONString(argument, imgPreview),
                type: 'application/json;charset=utf-8;',
                extention: 'json',
                name: 'cwSettings_: ' + argument.name
            });

          }
        });


        
    };
    StoreProject.prototype.exportPNG = function(argument){ 
        // Force User Download //
        this.downLoadfile({
            type: 'image/png',
            extention: 'png',
            name: 'cwSnapshot',
            metaData : argument
        });
    };  
    StoreProject.prototype.getLatticeState = function() {
        var latticeParams;

        if(this.lattice.lattice){ 
            var restrictions = JSON.stringify(this.lattice.lattice.restrictions);
            var gridPoints =  JSON.stringify(this.lattice.lattice.gridPoints);
            var originArray = JSON.stringify(this.lattice.lattice.originArray);
            
            latticeParams = 
                '{"latticeParams": { "type": "object", "gearTourState" : '+this.gearTour.state+',"walkStep" : '+this.dollGearBarME.walkStep+', "lattice" : {"defaults" : {  "scaleX":'+this.lattice.parameters.scaleX+',  "scaleY":'+this.lattice.parameters.scaleY+', "scaleZ":'+this.lattice.parameters.scaleZ+',"alpha":'+this.lattice.parameters.alpha+', "beta":'+this.lattice.parameters.beta+', "gamma":'+this.lattice.parameters.gamma+' }, "latticeType":"'+this.lattice.lattice.latticeType+'","latticeName":"'+this.lattice.latticeName+'", "latticeSystem":"'+this.lattice.lattice.latticeSystem+'",  "vector" : { "x" : '+this.lattice.lattice.vector.x+', "y" :'+this.lattice.lattice.vector.y+', "z" : '+this.lattice.lattice.vector.z+'}, "restrictions" :  '+restrictions+', "gridPoints" :  '+gridPoints+',"originArray" :  '+originArray+' }, "repeatX":'+this.lattice.parameters.repeatX+', "repeatY":'+this.lattice.parameters.repeatY+', "repeatZ":'+this.lattice.parameters.repeatZ+',  "viewState": "todo"  },  ';
        }
        else{
            latticeParams = '{"latticeParams": { "type": "object" ,"lattice" : '+null+', "repeatX":'+this.lattice.parameters.repeatX+', "repeatY":'+this.lattice.parameters.repeatY+', "repeatZ":'+this.lattice.parameters.repeatZ+',  "viewState": "todo"  },  ';
        }

        return latticeParams;
    };
    StoreProject.prototype.getCamerasStates = function() {
        var cameraSettings  = '"cameraSettings" :{ "crystalCamera" :{  "position" : { "x" : '+this.camera.position.x+', "y" :'+this.camera.position.y+', "z" : '+this.camera.position.z+'}},"cellCamera" :{   "position" : { "x" : '+this.cellCamera.position.x+', "y" :'+this.cellCamera.position.y+', "z" : '+this.cellCamera.position.z+'}},  "motifCameras" :{  "xCam" :{"position" : { "x" : '+this.motifXcam.position.x+', "y" :'+this.motifXcam.position.y+', "z" : '+this.motifXcam.position.z+'}},"yCam" :{"position" : { "x" : '+this.motifYcam.position.x+', "y" :'+this.motifYcam.position.y+', "z" : '+this.motifYcam.position.z+'}},"zCam" :{"position" : { "x" : '+this.motifZcam.position.x+', "y" :'+this.motifZcam.position.y+', "z" : '+this.motifZcam.position.z+'} } } }';

        return cameraSettings;
    };
    StoreProject.prototype.getSystemState = function() {
        var _this = this ;
        if(!this.idle){   
  
            var start =  " "  ;
 
            var cellVisualization = '"cellVisualization" :{ "edges" : { "visible":'+this.lattice.gradeChoice.grid+', "radius":'+this.lattice.gradeParameters.radius+', "color":"'+this.lattice.gradeParameters.cylinderColor+'"}, "faces": { "visible": '+this.lattice.gradeChoice.face +', "opacity": '+this.lattice.gradeParameters.faceOpacity +', "color": "'+this.lattice.gradeParameters.faceColor +'"} },';
       
            var end = "}" ;

            var text =  start+
                this.getLatticeState()+
                cellVisualization+
                this.getMillerState()+
                this.getMotifState()+ 
                this.getUnitCellState()+
                this.getCamerasStates()+ 
                this.createJsonVisualizationParams()+ 
                this.getNotesState()+
                end ;
 
            return (text); 

        } 
    }; 
    StoreProject.prototype.createJsonVisualizationParams = function() {
        var text =[];
        var fog = ($('#fog').is(':checked')) ? true : false ;
        var anaglyph = ($('#anaglyph').is(':checked')) ? true : false ;
        var lights = ($('#lights').is(':checked')) ? true : false ;

        text.push(',"visualizationParams": { "anaglyph": '+anaglyph+', "fog" : ' +fog+', "fogColor" : "'+($( "#fogColor" ).val())+'", "fogDensity" : "'+($( "#fogDensity" ).val())+'" , "crystalScreenColor" : "'+($( "#crystalScreenColor" ).val())+'", "cellScreenColor" : "'+($( "#cellScreenColor" ).val())+'", "motifXScreenColor" : "'+($( "#motifXScreenColor" ).val())+'", "motifYScreenColor" : "'+($( "#motifYScreenColor" ).val())+'", "motifZScreenColor" : "'+($( "#motifZScreenColor" ).val())+'", "lights" : '+lights+' }');

        return text ;
    };
    StoreProject.prototype.getNotesState = function(){
      var cameraData = JSON.stringify(this.narrative_system.cameraData);
      var planeData = JSON.stringify(this.narrative_system.planeData);
      var dirData = JSON.stringify(this.narrative_system.dirData);
      var gridNotes = (this.lattice.grids[0] === undefined) ? JSON.stringify({}) : JSON.stringify(this.lattice.grids[0].grid.notStates);
      var faceNotes = (this.lattice.faces[0] === undefined) ? JSON.stringify({}) : JSON.stringify(this.lattice.faces[0].notStates);

      var randomKey = Object.keys(this.lattice.points)[0];
      var randomPoint = (randomKey === undefined) ? undefined : this.lattice.points[Object.keys(this.lattice.points)[0]];

      var pointNotes = ( randomPoint === undefined) ? JSON.stringify({}) : JSON.stringify(randomPoint.notStates);
      
      var text = ', "notesSettings" : {  "gridNotes" : '+gridNotes+' , "pointNotes" : '+pointNotes+' , "faceNotes" : '+faceNotes+' , "cameraData" :  '+cameraData+', "planeData" : '+planeData+' , "dirData" : '+ dirData+', "atoms" : [';

      var atomNoteData = [] ;
      var counter = 0; 

      for (var i = 0 ; i < this.lattice.actualAtoms.length ; i++) {
        var atom = this.lattice.actualAtoms[i] ;

        if(i>0)  atomNoteData.push(', ') ; 
 
        
        atomNoteData.push(JSON.stringify(atom.notStates) );  
  
      };

      atomNoteData.push(']'); 


      atomNoteData.push('}');
       
      return (text+atomNoteData.join('')) ;
      
        
    };
    StoreProject.prototype.getUnitCellState = function(){
        var _this = this ;

        var lastSpAd = (this.motifeditor.lastSphereAdded === undefined) ? undefined : this.motifeditor.lastSphereAdded.getID();
        var tangentTothis = (this.motifeditor.tangentToThis === undefined) ? 'undefined' : this.motifeditor.tangentToThis.id;
        var start = '"unitCell" :{ "padlock" : '+this.motifeditor.padlock+', "viewState":"'+this.motifeditor.viewState+'" , "dragMode" : '+this.motifeditor.dragMode+',"editorState" : '+JSON.stringify(this.motifeditor.editorState)+', "dimensions" : { "x" : '+this.motifeditor.cellParameters.scaleX+', "y" :'+this.motifeditor.cellParameters.scaleY+', "z" : '+this.motifeditor.cellParameters.scaleZ+'},"angles" : { "alpha" : '+this.motifeditor.cellParameters.alpha+', "beta" :'+this.motifeditor.cellParameters.beta+', "gamma" : '+this.motifeditor.cellParameters.gamma+'}, "lastSphereAdded" : "'+lastSpAd+'", "tangentToThis" : "'+tangentTothis+'", "tangency" : '+this.motifeditor.globalTangency+', "cellVolume" : { "xInitVal" : '+this.motifeditor.cellVolume.xInitVal+', "yInitVal" :'+this.motifeditor.cellVolume.yInitVal+', "zInitVal" : '+this.motifeditor.cellVolume.zInitVal+' }, "initialLatticeParams" : { "alpha" : '+this.motifeditor.initialLatticeParams.alpha+' , "beta" : '+this.motifeditor.initialLatticeParams.beta+', "gamma" : '+this.motifeditor.initialLatticeParams.gamma+' ,"scaleX" : '+this.motifeditor.initialLatticeParams.scaleX+', "scaleY" :'+this.motifeditor.initialLatticeParams.scaleY+', "scaleZ" : '+this.motifeditor.initialLatticeParams.scaleZ+' }, "leastCellLengths" : { "x" : '+this.motifeditor.leastCellLengths.x+', "y" :'+this.motifeditor.leastCellLengths.y+', "z" : '+this.motifeditor.leastCellLengths.z+' }, "newSphere": {';

        var newSphere = [];
         
        newSphere.push(' }, "positions" : [  ');

        var i = 0 , positions = [];

        _.each(this.motifeditor.unitCellPositions, function(p, r ) {
            if(i>0)  {
                positions.push(', ') ; 
            }
            i++;

            positions.push(' { "x" : '+p.position.x+', "y" :'+p.position.y+', "z" : '+p.position.z+', "reference": "'+r+'"}'  );
        }); 

        var end = ']},'
        return (start+newSphere.join('')+positions.join('')+end) ;

    };
    StoreProject.prototype.getMotifState = function(){

        var _this = this ;

        var start = '"motif": [' ;
        var motif = [] ;
        var counter = 0; 

        for (var i = 0 ; i < _this.motifeditor.motifsAtoms.length ; i++) {
            var atom = this.motifeditor.motifsAtoms[i] ;

            if(i>0)  motif.push(', ') ; 

            motif.push('{"visible" : ');
            motif.push(atom.visible );

            motif.push(',');

            motif.push('"id" : "');
            motif.push(atom.myID );

            motif.push('",');

            motif.push('"radius" : ');
            motif.push(atom.radius );

            motif.push(',');

            motif.push('"elementName" : "');
            motif.push(atom.elementName );

            motif.push('",');

            motif.push('"tangentParent" : "');
            motif.push(atom.tangentParent );

            motif.push('",');
            
            motif.push('"ionicIndex" : "');
            motif.push(atom.ionicIndex );

            motif.push('",');

            motif.push('"ionicValue" : "');
            motif.push(atom.ionicValue );

            motif.push('",');

            motif.push('"color" : "');
            motif.push(atom.color );

            motif.push('",');

            motif.push('"blinking" : "');
            motif.push(atom.blinkingMode );

            motif.push('",');

            motif.push('"position" : { "x" : '+atom.object3d.position.x+', "y" :'+atom.object3d.position.y+', "z" : '+atom.object3d.position.z+'}'  );

            motif.push(',');

            motif.push('"opacity" : ');
            motif.push(atom.opacity/10);

            motif.push(','); 

            motif.push('"uiRelPosition" : ');
            motif.push(JSON.stringify(atom.uiRelPosition));

            motif.push(','); 

            motif.push('"texture" : "');
            motif.push(atom.texture );

            motif.push('",');

            motif.push('"wireframe" : ' );
            motif.push(atom.wireframe );

            motif.push('} ');

        };

        motif.push('],');

        return (start+motif.join('')) ;
    };
    StoreProject.prototype.getMillerState = function(){

        var _this = this ;

        var start = '"millerObjects": { "directions":[' ;
        var directions = [], planes = [] ;
        var counter = 0;
        var directionsUnique = _.uniq(_this.lattice.millerDirections, function(d) { return d.id; }); 

        _.each(directionsUnique, function(directional ) {
            
            if(counter>0) directions.push(',');
            counter++;

            directions.push('{"visible" : ');
            directions.push(directional.visible );

            directions.push(',');

            directions.push('"id" : "');
          
            directions.push(directional.id );

            directions.push('",');

            directions.push('"startPoint" : { "x" : '+directional.startPoint.x+', "y" :'+directional.startPoint.y+', "z" : '+directional.startPoint.z+'},'  );
             
            directions.push('"endPoint" : { "x" : '+directional.endpointPoint.x+', "y" :'+directional.endpointPoint.y+', "z" : '+directional.endpointPoint.z+'}'  );

            directions.push(',');

            directions.push('"name" : "');
            directions.push(directional.name );

            directions.push('",');

            directions.push('"color" : "');
            directions.push(directional.directionColor );

            directions.push('",');

            directions.push('"radius" : "');
            directions.push(directional.dirRadius );

            directions.push('",');

            directions.push('"u" : ');
            directions.push(directional.u );

            directions.push(',');

            directions.push('"v" : ');
            directions.push(directional.v );

            directions.push(',');

            directions.push('"w" : ');
            directions.push(directional.w );

            directions.push('} ');

        });

        directions.push('], "planes":[ ');
        
        counter = 0;

        var planesIDs = [];
        var planesUnique = _.uniq(_this.lattice.millerPlanes, function(p) { return p.id; });

        _.each(planesUnique, function(plane ) {
            if(counter>0) planes.push(', ') ;
            counter++;
            planes.push('{"visible" : ');
            planes.push(plane.visible );

            planes.push(',');

            planes.push('"id" : "');
            planes.push(plane.id );

            planes.push('",');

            planes.push('"a" : { "x" : '+plane.a.x+', "y" :'+plane.a.y+', "z" : '+plane.a.z+'},'  );

            planes.push('"b" : { "x" : '+plane.b.x+', "y" :'+plane.b.y+', "z" : '+plane.b.z+'},'  );

            planes.push('"c" : { "x" : '+plane.c.x+', "y" :'+plane.c.y+', "z" : '+plane.c.z+'},'  );

            if(plane.d !== undefined) {  
                planes.push('"d" : { "x" : '+plane.d.x+', "y" :'+plane.d.y+', "z" : '+plane.d.z+'},'  ); 
            } 

            planes.push('"name" : "');
            planes.push(plane.planeName );

            planes.push('",');

            planes.push('"color" : "');
            planes.push(plane.planeColor );

            planes.push('",');

            planes.push('"opacity" : ');
            planes.push(plane.planeOpacity );

            planes.push(',');

            planes.push('"parallel" : ');
            planes.push(plane.parallel );

            planes.push(',');

            planes.push('"h" : ');
            planes.push(plane.h );

            planes.push(',');

            planes.push('"k" : ');
            planes.push(plane.k );

            planes.push(',');

            planes.push('"l" : ');
            planes.push(plane.l );

            planes.push('} ');

        });

        planes.push(']},');

        return (start+directions.join('')+planes.join('')) ;
    };

    return StoreProject;
});
