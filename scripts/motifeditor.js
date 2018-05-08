 
define([ 
  'jquery', 
  'pubsub', 
  'three', 
  'underscore', 
  'atomSphere',  
  'unitCellAtom',
  'unitCellExplorer' ,
  'csg',
  'threeCSG',
  'motifExplorer' 
], function(
  jQuery, 
  PubSub, 
  THREE,   
  _,
  AtomSphere,  
  UnitCellAtom, 
  UnitCellExplorer,
  csg,
  ThreeCSG,
  MotifExplorer 
) {
  var events = {
    LOAD: 'motifeditor.load',
    EDITOR_STATE: 'motifeditor.editor_state',
    VIEW_STATE: 'motifeditor.view_state'
  }; 

  function Motifeditor(cwState, menu, soundMachine) { 
    this.motifeditor = null;
    this.cwState = cwState;

    this.soundMachine = soundMachine;

    this.menu = menu ; 
    this.cellParameters = { "alpha" : 90, "beta" : 90, "gamma" : 90, "scaleX" : 1, "scaleY" : 1, "scaleZ" : 1 }; 
    this.initialLatticeParams = { "alpha" : 90, "beta" : 90, "gamma" : 90, "scaleX" : 1, "scaleY" : 1, "scaleZ" : 1 }; 
    
    this.motifsAtoms = [];
    this.unitCellAtoms = [];
    this.unitCellPositions = {}; 
    this.viewMode = 'cellClassic';
    this.editorState = {state : "initial", atomPosMode : 'absolute' } ; 
    this.isEmpty = true ;
    this.latticeName = 'none';
    this.latticeType = 'none';  
    this.latticeSystem = 'none';
  
    this.leastCellLengths = {'x' : 0, 'y' : 0, 'z' : 0 };
    this.leastCellAngles = {'alpha' : 2, 'beta' : 2, 'gamma' : 2 };
    this.snapData = {
      'collision' : {
        'aScale' : false, 
        'bScale' : false, 
        'cScale' : false 
      },
      'snapVal' : {
        'aScale' : 0, 
        'bScale' : 0, 
        'cScale' : 0 
      }
    };
    this.cellVolume =  {col : false, xInitVal : 0.5, yInitVal : 0.5, zInitVal : 0.5, aCol : false, bCol : false, cCol : false};

    this.newSphere ; 
    this.lastSphereAdded ; 
    this.dragMode = false;
    this.tangentToThis;
    this.rotAxis='x';
    this.mutex = true ;
    this.cellMutex = true ;
    this.globalTangency = true;
    this.padlock = true;
    
    // rendering mode
    this.renderingMode = 'realistic'; // todo change that to realistic 
    this.cellNeedsRecalculation = {'cellSolidVoid' : false, 'cellSubstracted' : false};
    this.cachedAtoms = [];
    this.cachedAtomsPositions = {};
    this.box3 = {bool : false, pos : undefined}; // temporal. must be removed after testing

    this.LOD = {level : 3}; 
    this.atomRelationshipManager;
    this.labeling = false;
 
  
  };  
  Motifeditor.prototype.toggleVisibilityByLatticeIndex = function(latticeIndex, visibility){ 

    for (var j = this.unitCellAtoms.length - 1; j >= 0; j--) {  

      if( this.unitCellAtoms[j].latticeIndex === latticeIndex){   
         this.unitCellAtoms[j].setVisibility(visibility);
      }
      else{
        this.unitCellAtoms[j].setVisibility(!visibility);
      }
    }
     
  };
  Motifeditor.prototype.setDraggableAtom = function(arg, doNotRepos){ 
   
    this.menu.rotAnglesSection(arg.dragMode);

    this.dragMode = arg.dragMode;

    if(arg.dragMode === true) {   
      if(!_.isUndefined(this.newSphere)) {
        this.newSphere.blinkMode(true, '#58D3F7');  
      }
          
      this.selectAtom(arg.parentId, doNotRepos, true);
      this.newSphere.tangentParent = arg.parentId ;
    }
    else if(arg.dragMode === false){ 
       
      if(!_.isUndefined(this.newSphere)) {
        this.newSphere.blinkMode(false);
      }
      this.newSphere.tangentParent = undefined;
      this.newSphere.tangentR = undefined; 
    } 
  };
  Motifeditor.prototype.updateCellDimens = function(arg){  
    if(!_.isUndefined(arg.x)) {
      if(this.latticeName !== 'hexagonal'){
        this.cellParameters.scaleX = arg.x ; 
        $('#scaleX').val(arg.x);
      }
    } 
    else if(!_.isUndefined(arg.y)) { 
      this.cellParameters.scaleY = arg.y ; 
      $('#scaleY').val(arg.y);
    }
    else if(!_.isUndefined(arg.z)) {  
      this.cellParameters.scaleZ = arg.z ;
      $('#scaleZ').val(arg.z); 
    } 
    this.configureCellPoints();
      
  };  
  Motifeditor.prototype.setLatticeParameters = function(data) { 

    this.latticeType = data.latticeType;  
    this.latticeSystem = data.latticeSystem; 
    this.latticeName = (data.latticeName) ? data.latticeName : this.latticeName; 

    this.initialLatticeParams.alpha = data.defaults.alpha ;
    this.initialLatticeParams.beta  = data.defaults.beta ;
    this.initialLatticeParams.gamma = data.defaults.gamma ; 

    this.initialLatticeParams.scaleX = data.defaults.scaleX ;
    this.initialLatticeParams.scaleY  = data.defaults.scaleY ;
    this.initialLatticeParams.scaleZ = data.defaults.scaleZ ; 
     
    if(data.restore === undefined ){ 
   
      this.cellParameters.alpha = data.defaults.alpha ;
      this.cellParameters.beta  = data.defaults.beta ;
      this.cellParameters.gamma = data.defaults.gamma ; 

      this.cellParameters.scaleX = data.defaults.scaleX ;
      this.cellParameters.scaleY  = data.defaults.scaleY ;
      this.cellParameters.scaleZ = data.defaults.scaleZ ;
       
    }   

  }; 
  Motifeditor.prototype.onEditorStateChange = function(callback) {
    PubSub.subscribe(events.EDITOR_STATE, callback);
  };
  Motifeditor.prototype.onviewModeChange = function(callback) {
    PubSub.subscribe(events.VIEW_STATE, callback);
  };
  Motifeditor.prototype.selectElem = function(params) {
      
    // late feature
    if(this.newSphere !== undefined){
       
      this.removeFromUnitCell(this.newSphere.getID());
      this.menu.breakChain({id : this.newSphere.getID(), remove : true});
      this.deleteTangentChild(this.newSphere.getID());
      this.newSphere.destroy(); 
      if(!_.isUndefined( this.motifsAtoms[0])) {   
        this.lastSphereAdded = this.motifsAtoms[this.motifsAtoms.length-1];
        this.newSphere =  undefined; 
        this.configureCellPoints();
      }
      else{
        this.newSphere = undefined ;
        this.lastSphereAdded = undefined ;
        this.isEmpty = true ; 
      }
      
      this.dragMode = false;  
      this.initVolumeState(); 
      
    }
 
    var _this = this ;
    
    var radius = parseFloat(params.ionicValue);
     
    var newId = "_"+this.produceUuid() ;
    var p = new THREE.Vector3(0,0,0);

    if(this.isEmpty) {  
      // first time  
      this.isEmpty = false; 
    }
    else{
      p = this.findNewAtomsPos(
        this.lastSphereAdded, 
        radius, 
        false, 
        params.element
      ); 
    } 

    var a = new AtomSphere( 
      true, 
      new THREE.Vector3(p.x,p.y,p.z), 
      radius, 
      params.atomColor,
      this.LOD.level, 
      params.element, 
      newId, 
      1,
      false,
      params.ionicIndex,
      this.labeling
    );
  
    this.newSphere = a;  
   
    this.addAtomInCell( 
      new THREE.Vector3(p.x,p.y,p.z), 
      radius, 
      params.atomColor,   
      params.element, 
      newId,
      1,
      false,
      undefined,
      params.ionicIndex
    ); 
    
  };
  Motifeditor.prototype.findNewAtomsPos = function(lastAtom, newAtomRadius, flag, elName ) {  

    var _this = this , posFound = false, posFoundx, posFoundy, posFoundz, position; 
    var x = lastAtom.object3d.position.x + lastAtom.getRadius() + newAtomRadius;
    var y = lastAtom.object3d.position.y ;
    var z = lastAtom.object3d.position.z ;
    
    if(!flag) { 
      this.newSphere = {
        "object3d" : {"position" : { "x": x, "y": y, "z": z, 
        clone: function() { return (new THREE.Vector3(this.x,this.y,this.z)); } } },
        getRadius: function() { return newAtomRadius; },
        getID: function() { return "-"; }, 
        getTangency: function() { return true; },
        getName: function() { return elName; },
        changeColor: function(a) {}  
      } ; 
    }
    else{
      this.newSphere.object3d.position.set(x,y,z);
    }

    if(this.latticeSystem === 'cubic' && this.motifsAtoms.length === 1 && this.latticeType === 'primitive'){
      
      if(this.latticeType === 'primitive'){   
        this.tangentToThis = _this.motifsAtoms[0] ;
        this.setTangentAngle(  45, 54.7354 , parseFloat(  newAtomRadius + this.motifsAtoms[0].getRadius() ), this.motifsAtoms[0]);
    
        this.menu.editMEInputs(
          { 
            'rotAngleTheta' :  54.7 , 
            'rotAnglePhi' :  45 
          }
        );
      }  
    }
    else if(this.latticeSystem === 'hexagonal' && this.motifsAtoms.length >= 1  ){
      this.tangentToThis = this.motifsAtoms[0] ;
      var sign = (this.motifsAtoms.length % 2 == 0) ? -1 : 1;
 
      this.setTangentAngle(0.0000, sign*35.2644 , parseFloat(  newAtomRadius + this.motifsAtoms[this.motifsAtoms.length-1].getRadius() ), this.motifsAtoms[this.motifsAtoms.length-1] );
   
      this.menu.editMEInputs(
        { 
          'rotAngleTheta' : 35.2 , 
          'rotAnglePhi' : 0 
        }
      );
    }
    else{  
      var posFound = _this.check("x");
      var vertNums = lastAtom.object3d.children[1].geometry.vertices.length;
       
      if(posFound.collisionsFound !== 0){
        for (var i = 0; i < vertNums; i+=20) { 

          var verPos = lastAtom.object3d.children[1].geometry.vertices[i].clone();  
          verPos.applyMatrix4( lastAtom.object3d.matrixWorld ); 

          _this.newSphere.object3d.position.x = verPos.x ;
          _this.newSphere.object3d.position.y = verPos.y ;
          _this.newSphere.object3d.position.z = verPos.z ; 

          _this.newSphere.object3d.position.x += _this.fixAtomPosition(lastAtom, "x") ;
          posFoundx = _this.check("x"); 
          if(posFoundx.collisionsFound === 0)  i = vertNums ;   
          
          _this.newSphere.object3d.position.y += _this.fixAtomPosition(lastAtom, "y") ;
          var posFoundy = _this.check("y"); 
          if(posFoundy.collisionsFound === 0)  i = vertNums ; 

          _this.newSphere.object3d.position.z += _this.fixAtomPosition(lastAtom, "z") ;
          var posFoundz = _this.check("z"); 
          if(posFoundz.collisionsFound === 0)  i = vertNums ; 
           
        }  
      } 
    }
    return _this.newSphere.object3d.position ;
  };
  Motifeditor.prototype.dragAtom = function(axis, pos, objID){  
    var _this = this ;
    var idIs = _this.newSphere.getID();
    var tempObj = _this.newSphere ;  
   
    this.newSphere = _.find(_this.motifsAtoms, function(atomSphere){ return atomSphere.object3d.id === objID; });  
    if(_.isUndefined(_this.newSphere) ) {
      this.newSphere = tempObj ; //in case he drags the this.newSphere already
    }
    var theID = _this.newSphere.getID(); 
  
    if(axis === 'x' ) {   
      this.newSphere.object3d.position.set(pos.x,pos.y,this.newSphere.object3d.position.z);  
      this.translateCellAtoms("x",  pos.x , theID);  
      this.translateCellAtoms("y",  pos.y , theID);

      if(idIs == this.newSphere.getID()){  
        $("#atomPosX").val(pos.x);
        $("#atomPosY").val(pos.y);  
        this.menu.setSliderValue("atomPosX", pos.x );
        this.menu.setSliderValue("atomPosY", pos.y ); 
      }
    }
    else if(axis === 'y' ) {   
      this.newSphere.object3d.position.set(_this.newSphere.object3d.position.x,pos.y,pos.z);  
      this.translateCellAtoms("z",  pos.z , theID);
      this.translateCellAtoms("y",  pos.y , theID);
      if(idIs == this.newSphere.getID()){  
        $("#atomPosY").val(pos.y);
        $("#atomPosZ").val(pos.z);
        this.menu.setSliderValue("atomPosZ", pos.z );
        this.menu.setSliderValue("atomPosY", pos.y ); 
      }
    }
    else if(axis === 'z' ) { 
      this.newSphere.object3d.position.set(pos.x, this.newSphere.object3d.position.y,pos.z);  
      this.translateCellAtoms("z",  pos.z , theID);
      this.translateCellAtoms("x",  pos.x , theID);
      if(idIs == this.newSphere.getID()){  
        $("#atomPosX").val(pos.x);
        $("#atomPosZ").val(pos.z);
        this.menu.setSliderValue("atomPosX", pos.x );
        this.menu.setSliderValue("atomPosZ", pos.z ); 
      }
    } 

    this.newSphere = tempObj ;

    this.configureCellPoints();  

    this.rotAxis = axis;
    
    this.menu.editMEInputs(
      {   
        'scaleZ' : this.cellParameters.scaleZ,
        'scaleX' : this.cellParameters.scaleX,
        'scaleY' : this.cellParameters.scaleY,
        'cellAlpha' : this.cellParameters.alpha,
        'cellBeta' : this.cellParameters.beta,
        'cellGamma' : this.cellParameters.gamma
      }
    ); 
 
    this.menu.breakChain({ id : this.newSphere.getID(), remove : false});
     
  };
  Motifeditor.prototype.atomPosMode = function(arg){   
       
    var x = this.cellParameters.scaleX;
    var y = this.cellParameters.scaleY;
    var z = this.cellParameters.scaleZ;
    
    this.menu.setLatticeCollision({ scaleX: false, scaleY: false,  scaleZ: false  });
    this.snapData.snapVal = { 'aScale' : undefined,  'bScale' : undefined,  'cScale' : undefined};

    this.editorState.atomPosMode = (arg.xyz !== undefined) ? 'absolute' : 'relative';
  
    if(this.editorState.atomPosMode === 'relative'){ 

      var bool = (this.editorState.atomPosMode === 'absolute') ? true : false ;

      this.padlockMode({padlock : !bool, manually : arg.manually}); 

      this.menu.editMEInputs(
        {
         'padlock' : bool ,
         'tangency' : bool 
        }
      );
      return;
      var pos = this.transformGeneric(this.newSphere.object3d.position.clone(), {'revertShearing' : true});

      /*
      if(pos.x < 0){
        pos.x = 0;
      }
      if(pos.y < 0){
        pos.y = 0;
      }
      if(pos.z < 0){
        pos.z = 0;
      }

      
      this.newSphere.object3d.position.set(pos.x, pos.y, pos.z);
      this.translateCellAtoms("x", pos.x ,this.newSphere.getID());
      this.translateCellAtoms("y", pos.y ,this.newSphere.getID());
      this.translateCellAtoms("z", pos.z ,this.newSphere.getID());
      */
 

      this.menu.setSliderMin('atomPosX', -4);
      this.menu.setSliderMax('atomPosX', 4); 
      this.menu.setSliderValue('atomPosX', toFixedDown((pos.x/x).toFixed(6), 3));

      this.menu.setSliderMin('atomPosY', -4);
      this.menu.setSliderMax('atomPosY', 4);
      this.menu.setSliderValue('atomPosY', toFixedDown((pos.y/y).toFixed(6), 3));

      this.menu.setSliderMin('atomPosZ', -4);
      this.menu.setSliderMax('atomPosZ', 4);
      this.menu.setSliderValue('atomPosZ', toFixedDown((pos.z/z).toFixed(6), 3));

    }
    else if(this.editorState.atomPosMode === 'absolute'){
      this.menu.setSliderMin('atomPosX', -20.0000000000);
      this.menu.setSliderMax('atomPosX', 20.0000000000);
      this.menu.setSliderValue('atomPosX', this.newSphere.object3d.position.x);

      this.menu.setSliderMin('atomPosY', -20.0000000000);
      this.menu.setSliderMax('atomPosY', 20.0000000000);
      this.menu.setSliderValue('atomPosY', this.newSphere.object3d.position.y);

      this.menu.setSliderMin('atomPosZ', -20.0000000000);
      this.menu.setSliderMax('atomPosZ', 20.0000000000);
      this.menu.setSliderValue('atomPosZ', this.newSphere.object3d.position.z);
 
    }
     
  };

  var firstTimeAndLast = true;
  Motifeditor.prototype.setAtomsPosition = function(param){ 
    
    var _this = this;  
     
    var oldX,oldY,oldZ;
    var stillColliding = true, doNotOverlap = this.globalTangency ;
    var xFactor = 1;
    var yFactor = 1;
    var zFactor = 1;
    
    if(firstTimeAndLast){
      this.atomPosMode({abc: true, manually : true});
      firstTimeAndLast = false;
    }
    
    this.menu.breakChain({ id : this.newSphere.getID(), remove : false});
      
    if(this.editorState.atomPosMode === 'relative'){  
      xFactor = this.cellParameters.scaleX;
      yFactor = this.cellParameters.scaleY;
      zFactor = this.cellParameters.scaleZ;
 
    }
 
    var sliderXVal, sliderYVal, sliderZVal ;
      
    sliderXVal = xFactor * parseFloat($('#atomPosX').val() ); 
    sliderYVal = yFactor * parseFloat($('#atomPosY').val() );
    sliderZVal = zFactor * parseFloat($('#atomPosZ').val() ); 
    

    if(this.editorState.atomPosMode === 'relative'){ 
      

      var vecHelper = this.transformHelper(new THREE.Vector3(sliderXVal, sliderYVal, sliderZVal));
       
      this.newSphere.object3d.position.set(vecHelper.x, vecHelper.y, vecHelper.z); 
     
      this.translateCellAtoms("x", vecHelper.x ,this.newSphere.getID());
      this.translateCellAtoms("y", vecHelper.y ,this.newSphere.getID());
      this.translateCellAtoms("z", vecHelper.z ,this.newSphere.getID());
    } 
    else{
      if(!_.isUndefined(param.atomPosX)){ 
        if(this.mutex){ 

          this.mutex = false; 
          
          this.newSphere.object3d.position.x = parseFloat(  param.atomPosX ) ;  
          
          this.translateCellAtoms("x", sliderXVal, this.newSphere.getID());

          if( this.motifsAtoms.length === 0 || doNotOverlap===false ){ 
            this.mutex = true;   
            this.configureCellPoints();
            return ;
          }

          var zOffset = this.check("z");
          var yOffset = this.check("y");
          
          if(yOffset.offset>=zOffset.offset){ 
            if(yOffset.offset!=0 && zOffset.offset!=0){
              this.newSphere.object3d.position.z += zOffset.offset ;
              var newSliderVal = sliderZVal + zOffset.offset ;
              this.menu.setSliderValue("atomPosZ", newSliderVal );
              this.translateCellAtoms("z",this.newSphere.object3d.position.z + zOffset.offset,this.newSphere.getID());
            }
          }
          else{ 
            this.newSphere.object3d.position.y += yOffset.offset ;
            var newSliderVal = sliderYVal + yOffset.offset ;
            this.menu.setSliderValue("atomPosY", newSliderVal );
            this.translateCellAtoms("y",this.newSphere.object3d.position.y + yOffset.offset,this.newSphere.getID());
          }

          this.mutex = true; 
          
        }
      }
      else if( !_.isUndefined(param.atomPosY) ) { 
        if(this.mutex){
          
          this.mutex = false; 

          this.newSphere.object3d.position.y = parseFloat(  param.atomPosY );
          this.translateCellAtoms("y", sliderYVal ,this.newSphere.getID());

          if(this.motifsAtoms.length===0 || doNotOverlap===false ){
            this.mutex = true; 
            this.configureCellPoints();
            return ;
          }

          var zOffset = this.check("z");
          var xOffset = this.check("x"); 

          if(xOffset.offset>=zOffset.offset){
            if(xOffset.offset!=0 && zOffset.offset!=0){  
              this.newSphere.object3d.position.z += zOffset.offset ;
              var newSliderVal = sliderZVal + zOffset.offset ;
              this.menu.setSliderValue("atomPosZ", newSliderVal );
              this.translateCellAtoms("z",this.newSphere.object3d.position.z + zOffset.offset,this.newSphere.getID());
            } 
          }
          else{ 

            this.newSphere.object3d.position.x += xOffset.offset ;
             var newSliderVal = sliderXVal + xOffset.offset ;
            this.menu.setSliderValue("atomPosX", newSliderVal );
            this.translateCellAtoms("x",this.newSphere.object3d.position.x + xOffset.offset,this.newSphere.getID());
          }

          this.mutex = true;

        }       
      }
      else if(!_.isUndefined(param.atomPosZ)){ 
        if(this.mutex){
          
          this.mutex = false; 
           
          this.newSphere.object3d.position.z = parseFloat(  param.atomPosZ ); 
          this.translateCellAtoms("z", sliderZVal ,this.newSphere.getID());

          if(this.motifsAtoms.length === 0 || doNotOverlap===false ){
            this.mutex = true; 
            this.configureCellPoints(); 
            return ;
          }

          var xOffset = this.check("x");
          var yOffset = this.check("y");
           
          if(xOffset.offset>=yOffset.offset){
            if(yOffset.offset!=0 && xOffset.offset!=0){ 
              this.newSphere.object3d.position.y += yOffset.offset ;
               var newSliderVal = sliderYVal + yOffset.offset ;
              this.menu.setSliderValue("atomPosY", newSliderVal );
              this.translateCellAtoms("y",this.newSphere.object3d.position.y + yOffset.offset,this.newSphere.getID());
            }
          }
          else{ 
            this.newSphere.object3d.position.x += xOffset.offset ;
            var newSliderVal = sliderXVal + xOffset.offset ;
            this.menu.setSliderValue("atomPosX", newSliderVal );
            this.translateCellAtoms("x",this.newSphere.object3d.position.x + xOffset.offset,this.newSphere.getID());
          }

          this.mutex = true; 

        }
      }  

       
      if(this.editorState.atomPosMode !== 'relative'){ 
        this.menu.editMEInputs(
          {   
            'scaleZ' : this.cellParameters.scaleZ,
            'scaleX' : this.cellParameters.scaleX,
            'scaleY' : this.cellParameters.scaleY,
            'cellAlpha' : this.cellParameters.alpha,
            'cellBeta' : this.cellParameters.beta,
            'cellGamma' : this.cellParameters.gamma
          }
        ); 
      }
    }

    this.configureCellPoints();

    this.menu.setLatticeCollision({ scaleX: false, scaleY: false,  scaleZ: false  });
    this.snapData.snapVal = { 'aScale' : undefined,  'bScale' : undefined,  'cScale' : undefined};
     
  }; 
  
  Motifeditor.prototype.check = function(axis){

    var _this = this;

    var c = {"offset":0, "collisionsFound":0}, i = 0;
     
    while(i<_this.motifsAtoms.length && !_.isUndefined(_this.motifsAtoms[i])) {
       
      if( (_this.globalTangency) && (_this.motifsAtoms[i].getID()!==_this.newSphere.getID())   ) { 
        
        var a = _this.newSphere.object3d.position.clone();
        var b = _this.motifsAtoms[i].object3d.position.clone();
        var realDistance =parseFloat(  (a.distanceTo(b)).toFixed(parseInt(10)) );

        var calculatedDistance = parseFloat( (_this.motifsAtoms[i].getRadius() + _this.newSphere.getRadius()).toFixed(parseInt(10)) ) ; 

        if (realDistance < calculatedDistance){   
          _this.motifsAtoms[i].changeColor('#FF0000', 250);  
          if(this.soundMachine.procced) this.soundMachine.play('atomCollision');
          c.offset = parseFloat((_this.fixAtomPosition(_this.motifsAtoms[i],axis)).toFixed(parseInt(10)) );
          c.collisionsFound++;  
        } 
      }
      i++;
    }; 

    return c;
  };
   
  Motifeditor.prototype.checkForMoreColls = function(){
    var coll = false;  
    for (var i = this.unitCellAtoms.length - 1; i >= 0; i--) {
      for (var j = this.unitCellAtoms.length - 1; j >= 0; j--) { 
        if((this.unitCellAtoms[i].latticeIndex != this.unitCellAtoms[j].latticeIndex) && (this.unitCellAtoms[j].object3d !== undefined) && (this.unitCellAtoms[i].object3d !== undefined)){   
          if( ((this.unitCellAtoms[i].object3d.position.distanceTo(this.unitCellAtoms[j].object3d.position) + 0.0000001) < (this.unitCellAtoms[i].getRadius() + this.unitCellAtoms[j].getRadius())) && (this.unitCellAtoms[j].object3d.position.distanceTo(this.unitCellAtoms[i].object3d.position) != 0 )){   
            coll = true;
          }
        }
      }
    }

    return coll;

  };

  var firstTimeAndLast3 = true;

  Motifeditor.prototype.setManuallyCellVolume = function(par, systemCall){ 
      
    var val = (par.step === undefined) ? parseFloat(par.cellVolume) : parseFloat(par.step);
    
    if(val <= 0 ) {
      return;
    }

    if(firstTimeAndLast3 && systemCall===undefined){ 

      this.atomPosMode({abc: true, manually : true});
      firstTimeAndLast3 = false; 

    }

    var newVals = {x : 1, y : 1, z : 1};
   
    val /= 100;
    
    newVals.x = val*this.cellVolume.xInitVal; 
    newVals.y = val*this.cellVolume.yInitVal;
    newVals.z = val*this.cellVolume.zInitVal;

    this.cellVolume.aCol = undefined;
    this.cellVolume.bCol = undefined;
    this.cellVolume.cCol = undefined;

    var newValA = newVals.z ;  

    this.setManuallyCellLengths({'scaleZ' : newValA }, 'volume', par.trigger);
    this.menu.setSliderValue("scaleZ", newValA); 
      
    var newValB = newVals.x ;
    this.setManuallyCellLengths({'scaleX' : newValB }, 'volume', par.trigger);
    this.menu.setSliderValue("scaleX", newValB);
     
    var newValC = newVals.y ;
    this.setManuallyCellLengths({'scaleY' : newValC }, 'volume', par.trigger);
    this.menu.setSliderValue("scaleY", newValC); 
     
    if( this.cellVolume.aCol !== undefined || this.cellVolume.bCol !== undefined || this.cellVolume.cCol !== undefined  ){  
        
      if( this.cellVolume.aCol === undefined){
        this.cellVolume.aCol = -1;
      } 
      if( this.cellVolume.bCol === undefined){
        this.cellVolume.bCol = -1;
      } 
      if( this.cellVolume.cCol === undefined){
        this.cellVolume.cCol = -1;
      } 
  
      if(this.cellVolume.bCol >= this.cellVolume.aCol && this.cellVolume.bCol >= this.cellVolume.cCol  ){ 
         
        var newPercX = this.cellParameters.scaleX/this.cellVolume.xInitVal ;
        
        var newZsc = this.cellVolume.zInitVal*newPercX; 
        this.cellParameters.scaleZ = newZsc;
        this.menu.setSliderValue("scaleZ", newZsc);
       
        var newYsc = this.cellVolume.yInitVal*newPercX; 
        this.cellParameters.scaleY = newYsc;
        this.menu.setSliderValue("scaleY", newYsc);
        
        this.menu.setSliderValue("scaleX", this.cellParameters.scaleX);
        
      }
      else if(this.cellVolume.cCol >= this.cellVolume.aCol && this.cellVolume.cCol >= this.cellVolume.bCol){
      
        var newPercY = this.cellParameters.scaleY/this.cellVolume.yInitVal ;

        var newZsc = this.cellVolume.zInitVal*newPercY; 
        this.cellParameters.scaleZ = newZsc;
        this.menu.setSliderValue("scaleZ", newZsc);
        
        var newXsc = this.cellVolume.xInitVal*newPercY;
        this.cellParameters.scaleX = newXsc; 
        this.menu.setSliderValue("scaleX", newXsc);
         
        this.menu.setSliderValue("scaleY", this.cellParameters.scaleY);
        
      }
      else if(this.cellVolume.aCol >= this.cellVolume.bCol && this.cellVolume.aCol >= this.cellVolume.cCol ){
       
        var newPercZ = this.cellParameters.scaleZ/this.cellVolume.zInitVal ;
        
        var newYsc = this.cellVolume.yInitVal*newPercZ; 
        this.cellParameters.scaleY = newYsc; 
        this.menu.setSliderValue("scaleY", newYsc);
         
        var newXsc = this.cellVolume.xInitVal*newPercZ; 
        this.cellParameters.scaleX = newXsc; 
        this.menu.setSliderValue("scaleX", newXsc);
         
        this.menu.setSliderValue("scaleZ", this.cellParameters.scaleZ);
         
      }  

      var newPerc = 100 * this.cellParameters.scaleX/this.cellVolume.xInitVal ;
      this.menu.setSliderValue("cellVolume", 100); 
       
    } 

    this.configureCellPoints('manual'); // final fix
 
   // this.boxHelper();  
  };
  Motifeditor.prototype.scaleRelative = function(par){

    var _this = this;

    var aScale = (par.scaleZ === undefined) ? undefined : parseFloat(par.scaleZ) ;
    var bScale = (par.scaleX === undefined) ? undefined : parseFloat(par.scaleX) ;
    var cScale = (par.scaleY === undefined) ? undefined : parseFloat(par.scaleY) ;
    
    var pos = { x : parseFloat($('#atomPosX').val()),  y :parseFloat($('#atomPosY').val()),  z : parseFloat($('#atomPosZ').val()) } ;
    var v = new THREE.Vector3( _this.cellParameters.scaleZ, 0, 0 ); 
    var axis = new THREE.Vector3( 0, 1, 0 );
    var angle =  4*Math.PI / 3 ; 
    v.applyAxisAngle( axis, angle );

    if(aScale != undefined){ 
       
      _.each(this.motifsAtoms, function(atom, r) { 
        if(_this.latticeName === 'hexagonal'){
          var rp = atom.uiRelPosition.clone();

          var aPos = v.clone().setLength(_this.cellParameters.scaleZ*rp.z);
          var bPos = new THREE.Vector3( _this.cellParameters.scaleZ*rp.x, 0, 0 );  
          bPos.add(aPos);

          _this.translateCellAtoms("x", bPos.x ,atom.getID());
          _this.translateCellAtoms("z", bPos.z ,atom.getID());
               
          atom.object3d.position.x = bPos.x; 
          atom.object3d.position.z = bPos.z; 
        } 
        else{
          var ratio = atom.object3d.position.z / _this.cellParameters.scaleZ ;
          var newPos = ratio * aScale ;
          atom.object3d.position.z = newPos; 
          _this.translateCellAtoms("z", newPos ,atom.getID());
        }
            
      }); 


      if(this.newSphere !== undefined){
        if(this.latticeName === 'hexagonal'){
          var rp = new THREE.Vector3(this.newSphere.uiRelPosition.x, this.newSphere.uiRelPosition.y, this.newSphere.uiRelPosition.z);;

          var aPos = v.clone().setLength(_this.cellParameters.scaleZ*rp.z);
          var bPos = new THREE.Vector3( _this.cellParameters.scaleZ*rp.x, 0, 0 );  
          bPos.add(aPos);

          this.translateCellAtoms("x", bPos.x ,this.newSphere.getID());
          this.translateCellAtoms("z", bPos.z ,this.newSphere.getID());
               
          this.newSphere.object3d.position.x = bPos.x; 
          this.newSphere.object3d.position.z = bPos.z; 
        } 
        else{ 
          var ratio = this.newSphere.object3d.position.z / this.cellParameters.scaleZ ;
          var newPos = ratio * aScale ;
          this.newSphere.object3d.position.z = newPos; 
          this.translateCellAtoms("z", newPos ,this.newSphere.getID());
        }
         
      } 

    }
    else if(bScale != undefined){ 

      _.each(this.motifsAtoms, function(atom, r) { 
        if(_this.latticeName === 'hexagonal'){
          var rp = atom.uiRelPosition.clone();

          var aPos = v.clone().setLength(_this.cellParameters.scaleZ*rp.z);
          var bPos = new THREE.Vector3( _this.cellParameters.scaleZ*rp.x, 0, 0 );  
          bPos.add(aPos);

          _this.translateCellAtoms("x", bPos.x ,atom.getID());
          _this.translateCellAtoms("z", bPos.z ,atom.getID());
               
          atom.object3d.position.x = bPos.x; 
          atom.object3d.position.z = bPos.z; 
        } 
        else{
          var ratio = atom.object3d.position.x / _this.cellParameters.scaleX ;
          var newPos = ratio * bScale ;
          atom.object3d.position.x = newPos;
          _this.translateCellAtoms("x", newPos ,atom.getID());
        }
      });

      if(this.newSphere !== undefined){
        if(this.latticeName === 'hexagonal'){
          var rp = new THREE.Vector3(this.newSphere.uiRelPosition.x, this.newSphere.uiRelPosition.y, this.newSphere.uiRelPosition.z);;

          var aPos = v.clone().setLength(_this.cellParameters.scaleZ*rp.z);
          var bPos = new THREE.Vector3( _this.cellParameters.scaleZ*rp.x, 0, 0 );  
          bPos.add(aPos);

          this.translateCellAtoms("x", bPos.x ,this.newSphere.getID());
          this.translateCellAtoms("z", bPos.z ,this.newSphere.getID());
               
          this.newSphere.object3d.position.x = bPos.x; 
          this.newSphere.object3d.position.z = bPos.z; 
        } 
        else{ 
          var ratio = this.newSphere.object3d.position.x / this.cellParameters.scaleX ;
          var newPos = ratio * bScale ;
          this.newSphere.object3d.position.x = newPos; 
          this.translateCellAtoms("x", newPos ,this.newSphere.getID());
        } 
      } 
    } 
    else if(cScale != undefined){ 

      _.each(this.motifsAtoms, function(atom, r) { 
        var ratio = atom.object3d.position.y / _this.cellParameters.scaleY ;
        var newPos = ratio * cScale ;
        atom.object3d.position.y = newPos;
        _this.translateCellAtoms("y", newPos ,atom.getID());
      });
      if(this.newSphere !== undefined){
        var ratio = this.newSphere.object3d.position.y / this.cellParameters.scaleY ;
        var newPos = ratio * cScale ;
        this.newSphere.object3d.position.y = newPos; 
        this.translateCellAtoms("y", newPos ,this.newSphere.getID());
      }  
    }
 
   
  };
  Motifeditor.prototype.setManuallyCellLengthsNoTangency = function(aScale, bScale, cScale){
    
    var scalingTo ;
    var collisionInOthers;

    if(aScale !== undefined) { 
      this.cellParameters.scaleZ = aScale ;   
      scalingTo = 'aScale';
      this.menu.setLatticeCollision({
        scaleY: false, 
        scaleX: false
      });
      this.snapData.snapVal['aScale'] = undefined;
      collisionInOthers = (this.snapData.collision['bScale'] === false &&  this.snapData.collision['cScale'] === false) ? false : true;
    } 

    if(bScale !== undefined) {
      this.cellParameters.scaleX = bScale ; 
      scalingTo = 'bScale';
      this.menu.setLatticeCollision({
        scaleY: false, 
        scaleZ: false
      });
      this.snapData.snapVal['bScale'] = undefined;
      collisionInOthers = (this.snapData.collision['aScale'] === false &&  this.snapData.collision['cScale'] === false) ? false : true;
    } 

    if(cScale !== undefined) {
      this.cellParameters.scaleY = cScale ; 
      scalingTo = 'cScale'; 
      this.menu.setLatticeCollision({
        scaleZ: false, 
        scaleX: false
      });
      this.snapData.snapVal['cScale'] = undefined;
      collisionInOthers = (this.snapData.collision['bScale'] === false &&  this.snapData.collision['aScale'] === false) ? false : true;
    } 
 
    this.configureCellPoints('manual');
 
    var storedScales = {
      aScale : this.cellParameters.scaleZ, 
      bScale : this.cellParameters.scaleX, 
      cScale : this.cellParameters.scaleY
    };

    var axis = 'none' ;
    var collisionHappened = false ;
    var counterHelper = 0; // help exit infinite loops in case of a bug
    var moreCollisions = true ;
     

    while(this.latticeName !== 'hexagonal' && moreCollisions === true && counterHelper < 20 && collisionInOthers === false){
       
      if(aScale != undefined){ 
        this.cellParameters.scaleZ = aScale ; 
        // tangency check
          
        this.configureCellPoints('manual');
         
        var offset = this.checkInterMotifCollision('z', aScale );
        this.cellParameters.scaleZ = offset ; 
        
        if(aScale != offset ) {   
          collisionHappened = true ; 
          this.cellVolume.aCol = Math.abs(offset - this.cellParameters.scaleZ); 
          this.menu.setLatticeCollision({
            scaleZ: offset 
          });
           
          this.snapData.snapVal['aScale'] = offset;
          this.snapData.collision['aScale'] = true;
        } 
        else{
          this.snapData.collision['aScale'] = false;
        }
        
        aScale = this.cellParameters.scaleZ ; // for recurrency of collision checks
        
      }
      else if(bScale != undefined){  
        this.cellParameters.scaleX = bScale ;
        // tangency check

        this.configureCellPoints('manual');   
        
        var offset = this.checkInterMotifCollision('x', bScale ); 
        
        this.cellParameters.scaleX = offset ;
          
        if(bScale != offset ) {  
          collisionHappened = true ;  
          this.cellVolume.bCol = Math.abs(offset - this.cellParameters.scaleX);
          this.menu.setLatticeCollision({
            scaleX: offset 
          }); 
          this.snapData.snapVal['bScale'] = offset; 
          this.snapData.collision['bScale'] = true;
        }
        else{
          this.snapData.collision['bScale'] = false;
        }
             
        bScale = this.cellParameters.scaleX ; // for recurrency of collision checks

      }
      else if(cScale != undefined){ 
        this.cellParameters.scaleY = cScale ;
        // tangency check
        this.configureCellPoints('manual');
      
        var offset = this.checkInterMotifCollision('y', cScale ); 
        this.cellParameters.scaleY = offset ;
        if(cScale != offset ) {
          collisionHappened = true ; 
          this.cellVolume.cCol = Math.abs(offset - this.cellParameters.scaleY); 
          this.menu.setLatticeCollision({
            scaleY: offset 
          }); 
          this.snapData.snapVal['cScale'] = offset; 
          this.snapData.collision['cScale'] = true;
        }
        else{
          this.snapData.collision['cScale'] = false;
        }
         
        cScale = this.cellParameters.scaleY ; // for recurrency of collision checks
      } 
      this.configureCellPoints('manual'); //second time
      this.updateLatticeTypeRL();

      moreCollisions = this.checkForMoreColls(); 
      counterHelper++;  
    } 
    

    if(this.snapData.collision['aScale'] === false && this.snapData.collision['bScale'] === false && this.snapData.collision['cScale'] === false){

    }
     
    if(collisionHappened === true ){
        
      this.cellParameters.scaleZ = storedScales.aScale;
      this.cellParameters.scaleY = storedScales.cScale;
      this.cellParameters.scaleX = storedScales.bScale;

      this.configureCellPoints('manual');
 
    } 

    if(this.latticeName === 'hexagonal'){  

      if(aScale !== undefined){
        this.cellParameters.scaleX = aScale ; 
        this.menu.setSliderValue("scaleX", aScale); 
      }
      else if(bScale !== undefined){
        this.cellParameters.scaleZ = bScale ;
        this.menu.setSliderValue("scaleZ", bScale);  
      }
    } 

   
  };
  Motifeditor.prototype.setManuallyCellLengths = function(par, volumeF, reducing){
      
    if(this.cellMutex === false) {
      return ;
    }
    
    var aScale, bScale, cScale;

    var scalingTo ;
  
    if(par.scaleZ !== undefined) {
      aScale = parseFloat(par.scaleZ) ;  
    } 

    if(par.scaleX !== undefined) {
      bScale = parseFloat(par.scaleX) ;  
    } 

    if(par.scaleY !== undefined) {
      cScale = parseFloat(par.scaleY) ;  
    } 
   
    if(this.editorState.atomPosMode === 'relative'){ 
      this.scaleRelative(par); 
      this.setManuallyCellLengthsNoTangency(aScale, bScale, cScale);
      return;
    }

    if(this.globalTangency === false && reducing === undefined){
      this.setManuallyCellLengthsNoTangency(aScale, bScale, cScale);
      this.cellMutex = true ;
      return;
    }

    if(par.scaleZ !== undefined) { 
      scalingTo = 'aScale';
      this.menu.setLatticeCollision({
        scaleY: false, 
        scaleX: false
      });
      this.snapData.snapVal['aScale'] = undefined;
    } 

    if(par.scaleX !== undefined) { 
      scalingTo = 'bScale';
      this.menu.setLatticeCollision({
        scaleY: false, 
        scaleZ: false
      });
      this.snapData.snapVal['bScale'] = undefined;
    } 

    if(par.scaleY !== undefined) { 
      scalingTo = 'cScale';
      this.menu.setLatticeCollision({
        scaleX: false, 
        scaleZ: false
      });
      this.snapData.snapVal['cScale'] = undefined;
    } 

    var moreCollisions = true;

    this.cellMutex = false ;

    var storedScales = {
      aScale : this.cellParameters.scaleZ, 
      bScale : this.cellParameters.scaleX, 
      cScale : this.cellParameters.scaleY
    };

    var axis = 'none' ;
    var collisionHappened = false ;
    var counterHelper = 0; // help exit infinite loops in case of a bug
 
    while(moreCollisions === true && counterHelper < 20 ){
       
      if(aScale != undefined){ 
        this.cellParameters.scaleZ = aScale ; 
        // tangency check
          
        this.configureCellPoints('manual');
        
        if(true){ 
          var offset = this.checkInterMotifCollision('z', aScale );
          this.cellParameters.scaleZ = offset ; 
          
          if(aScale != offset ) {   
            collisionHappened = true ; 
            if(this.globalTangency === true){
              this.menu.forceToLooseEvent('scaleZ');
            }
            this.menu.forceToLooseEvent('cellVolume'); // not needed in many cases 
            this.cellVolume.aCol = Math.abs(offset - this.cellParameters.scaleZ); 
            if(this.globalTangency === true) this.menu.setSliderValue("scaleZ", offset); 
            this.snapData.snapVal['aScale'] = offset; 
          } 
        }
        aScale = this.cellParameters.scaleZ ; // for recurrency of collision checks
        
      }
      else if(bScale != undefined){  
        this.cellParameters.scaleX = bScale ;
        // tangency check

        this.configureCellPoints('manual');   
        if(true){ 
          var offset = this.checkInterMotifCollision('x', bScale ); 
          
          this.cellParameters.scaleX = offset ;
            
          if(bScale != offset ) {  
            collisionHappened = true ;  
            if(this.globalTangency === true){
              this.menu.forceToLooseEvent('scaleX');
            }
            this.menu.forceToLooseEvent('cellVolume');
            this.cellVolume.bCol = Math.abs(offset - this.cellParameters.scaleX);
            if(this.globalTangency === true) this.menu.setSliderValue("scaleX", offset); 
            this.snapData.snapVal['bScale'] = offset; 
          }
           
        }
        bScale = this.cellParameters.scaleX ; // for recurrency of collision checks

      }
      else if(cScale != undefined){ 

        this.cellParameters.scaleY = cScale ;
        // tangency check
        this.configureCellPoints('manual');
        if(true){ 
          var offset = this.checkInterMotifCollision('y', cScale ); 
          this.cellParameters.scaleY = offset ;
          if(cScale != offset ) {
            collisionHappened = true ;
            if(this.globalTangency === true){
              this.menu.forceToLooseEvent('scaleY');
            }
            this.menu.forceToLooseEvent('cellVolume');
            this.cellVolume.cCol = Math.abs(offset - this.cellParameters.scaleY); 
            if(this.globalTangency === true) this.menu.setSliderValue("scaleY", offset);
            this.snapData.snapVal['cScale'] = offset; 
          }
        }
        cScale = this.cellParameters.scaleY ; // for recurrency of collision checks
      } 
      this.configureCellPoints('manual'); //second time
      this.updateLatticeTypeRL();

      moreCollisions = this.checkForMoreColls(); 
      counterHelper++;  
    } 
    

    //this.snapData.collision[scalingTo] = collisionHappened;
     
    if(collisionHappened === true ){
        
      this.cellParameters.scaleZ = storedScales.aScale;
      this.cellParameters.scaleY = storedScales.cScale;
      this.cellParameters.scaleX = storedScales.bScale;

      this.configureCellPoints('manual');
 
    }

     
    if(this.latticeSystem === 'hexagonal' && this.latticeType === 'hexagonal'){  

      if(aScale !== undefined){
        this.cellParameters.scaleX = aScale ; 
        this.menu.setSliderValue("scaleX", aScale); 
      }
      else if(bScale !== undefined){
        this.cellParameters.scaleZ = bScale ;
        this.menu.setSliderValue("scaleZ", bScale);  
      }
    }
    
    if(volumeF !== undefined || reducing !== undefined){
      this.menu.setLatticeCollision({ scaleX: false, scaleY: false,  scaleZ: false  });
      this.snapData.snapVal = { 'aScale' : undefined,  'bScale' : undefined,  'cScale' : undefined};
      
    }

    ///////////////////////
    this.cellMutex = true ;
    ///////////////////////   
  }; 
  Motifeditor.prototype.checkInterMotifCollision = function(angleORaxis, val){
     
    // here we compare the new value from the slider to the least cell dimensions/angles we have calculated in the past or just now (depends on the lattice)

    var _this = this;
    var lengthFix = ((angleORaxis === 'x') || (angleORaxis === 'y') || (angleORaxis === 'z')) ? true : false ;

    if(lengthFix){ 
      this.checkForLengthFix( angleORaxis, val ) ;

      switch(angleORaxis) { 
        case "x": 
          if( val < _this.leastCellLengths.x){
            return _this.leastCellLengths.x ;
          }
          else{
            return val;
          }
        break;

        case "y": 
          if( val < _this.leastCellLengths.y){
            return _this.leastCellLengths.y ;
          }
          else{
            return val;
          }

        break;

        case "z": 
          if( val < _this.leastCellLengths.z){
            return _this.leastCellLengths.z ;
          }
          else{
            return val;
          }

        break;
      }
    }
    else{
      // angles fix 
      var limit = this.checkForAngleFix( angleORaxis, val ) ;

      switch(angleORaxis) { 
        case "alpha": 
          if( val != _this.leastCellAngles.alpha){
            return { newVal : _this.leastCellAngles.alpha, limit : limit } ;
          }
          else{
            return { newVal : val };
          }
        break;

        case "beta": 

          if( val != _this.leastCellAngles.beta){
            return { newVal : _this.leastCellAngles.beta, limit : limit } ;
          }
          else{
            return { newVal : val };
          }

        break;

        case "gamma": 
          if( val != _this.leastCellAngles.gamma){
            return { newVal : _this.leastCellAngles.gamma, limit : limit } ;
          }
          else{
            return { newVal : val };
          }

        break;
      }
    }  
  };

  var motifVirtPositions = [] ;

  motifVirtPositions['cubicprimitive'] = [];
  motifVirtPositions['tetragonalprimitive'] = [];
  motifVirtPositions['orthorhombicprimitive'] = [];

  motifVirtPositions['cubicbody'] = [{a : 1/2, b : 1/2, c: 1/2}, {a : -1/2, b : 1/2,  c: 1/2}, {a : 1/2, b : -1/2,  c: 1/2}, {a : -1/2, b : -1/2,  c: 1/2}];
  motifVirtPositions['tetragonalbody'] = [{a : 1/2, b : 1/2, c: 1/2}, {a : -1/2, b : 1/2,  c: 1/2}, {a : 1/2, b : -1/2,  c: 1/2}, {a : -1/2, b : -1/2,  c: 1/2}];
  motifVirtPositions['orthorhombicbody'] = [{a : 1/2, b : 1/2, c: 1/2}, {a : -1/2, b : 1/2,  c: 1/2}, {a : 1/2, b : -1/2,  c: 1/2}, {a : -1/2, b : -1/2,  c: 1/2}];

  motifVirtPositions['cubicface'] = [{a : 0, b : 1/2, c: 1/2}, {a : 0, b : -1/2, c: 1/2}, {a : 1/2, b : 0, c: 1/2}, {a : -1/2, b : 0, c: 1/2}];
  motifVirtPositions['orthorhombicface'] = [{a : 0, b : 1/2, c: 1/2}, {a : 0, b : -1/2, c: 1/2}, {a : 1/2, b : 0, c: 1/2}, {a : -1/2, b : 0, c: 1/2}];

  motifVirtPositions['orthorhombicbase'] = [{a : 0, b : 1/2, c: 1/2 } ];
  motifVirtPositions['monoclinicbase'] = [] ;//[{a : 0, b : 1/2, c: 1/2 } ];
  
  motifVirtPositions['rhombohedralprimitive'] = [];
  motifVirtPositions['triclinicprimitive'] = []; 
  motifVirtPositions['monoclinicprimitive'] = [];

  motifVirtPositions['hexagonalhexagonal'] = [];

  Motifeditor.prototype.checkForLengthFix = function(axis, val){
    
    var withAngles, result = -1 ;

    if(
      this.latticeSystem === 'rhombohedral' || 
      this.latticeSystem === 'triclinic' || 
      (this.latticeSystem === 'monoclinic' && (this.latticeType === 'primitive' || this.latticeType === 'base')) ||
      (this.latticeSystem === 'hexagonal' && (this.latticeType === 'primitive')) ||
      (this.cellParameters.alpha !== 90 || this.cellParameters.beta !== 90 || this.cellParameters.gamma !== 90 )
    ) 
    {
      withAngles = 1;
    }
    
    var _this = this ;
 
    if(axis === 'x'){  
      this.cellParameters.scaleX =  val ;
      result = this.detectCollisionForLengths('x', withAngles);

      if(!result.normalize) {
        this.leastCellLengths.x = this.cellParameters.scaleX + result.offset ; 
      }
      else{
        this.leastCellLengths.x = (this.cellParameters.scaleX/2 + result.offset) *2 ; 
      }
      if(this.leastCellLengths.x < 0 ) this.leastCellLengths.x = val ;
    }
    else if(axis === 'y'){  
      this.cellParameters.scaleY =  val ;
      result = this.detectCollisionForLengths('y', withAngles);
      if(!result.normalize) {
        this.leastCellLengths.y = this.cellParameters.scaleY + result.offset ; 
      }
      else{
        this.leastCellLengths.y = (this.cellParameters.scaleY/2 + result.offset) *2 ; 
      }  
      if(this.leastCellLengths.y < 0 ) this.leastCellLengths.y = val ;
    }
    else if(axis === 'z'){  
      this.cellParameters.scaleZ =  val ;
      result = this.detectCollisionForLengths('z', withAngles);
      if(!result.normalize) {
        this.leastCellLengths.z = this.cellParameters.scaleZ + result.offset ; 
      }
      else{
        this.leastCellLengths.z = (this.cellParameters.scaleZ/2 + result.offset) *2 ; 
      }
      if(this.leastCellLengths.z < 0 ) this.leastCellLengths.z = val ;
    }          
  };
  Motifeditor.prototype.checkForAngleFix = function(angleName, val){
      
    var _this = this, result = {newVal : undefined, limit : undefined} ; 

    if(angleName === 'alpha'){  

      result = this.detectCollisionForAngles('alpha');
     
      this.leastCellAngles.alpha = this.cellParameters.alpha + result.offset ; 
       
      if(this.leastCellAngles.alpha < -1000 ) this.leastCellAngles.alpha = val ;

    }
    else if(angleName === 'beta'){  
      
      result = this.detectCollisionForAngles('beta');
       
      this.leastCellAngles.beta = this.cellParameters.beta + result.offset ; 
       
      if(this.leastCellAngles.beta < -1000 ) this.leastCellAngles.beta = val ;
    }
    else if(angleName === 'gamma'){  
       
      result = this.detectCollisionForAngles('gamma');
       
      this.leastCellAngles.gamma = this.cellParameters.gamma + result.offset ; 
       
      if(this.leastCellAngles.gamma < -1000 ) this.leastCellAngles.gamma = val ;
    }
    
    return result.limit;

  };

  var bbHelper = [] ;
  var spHelper = [] ;

  Motifeditor.prototype.sphereHelper = function(a, color){
     
    var material = [ new THREE.LineBasicMaterial({ color: color  }) ];
    var geometry = new THREE.SphereGeometry( 0.1, 32, 32 );
    
    var scene = UnitCellExplorer.getInstance().object3d;
     
    var g=0;

    if(spHelper.length > 1) {  
      while(g<spHelper.length) {   
        scene.remove(spHelper[g] );
        g++;
      }
      spHelper.splice(0);
    } 
       
    var scene = UnitCellExplorer.getInstance().object3d;

    var mesh = new THREE.Mesh(geometry, material[0]);
    mesh.position.set(a.x, a.y, a.z) ;
    spHelper.push(mesh);
    scene.add(mesh); 
  }

  Motifeditor.prototype.lineHelper = function(a,b, color){
    
    if(!color) color = 0xff0000;
    var material = [ new THREE.LineBasicMaterial({ color: color  }) ];
    var geometry = new THREE.Geometry();
    
    var scene = UnitCellExplorer.getInstance().object3d;
    
     
    var g=0;
    if(bbHelper.length > 50) {  
      while(g<bbHelper.length) {   
        //scene.remove(bbHelper[g] );
        g++;
      }
      bbHelper.splice(0);
    } 
     

    geometry.vertices.push( a, b );
    
    var scene = UnitCellExplorer.getInstance().object3d;

    var mesh = new THREE.Line(geometry, material[0]);
    bbHelper.push(mesh);
    scene.add(mesh); 
  }

  Motifeditor.prototype.boxHelper = function( ){
    
    if(this.box3.bool === true) { 

      var scene = UnitCellExplorer.getInstance().object3d;
       
      var g=0;
      while(g<bbHelper.length) {   
        scene.remove(bbHelper[g] );
        g++;
      }
      var j = 0,_this = this;  
      
      var objs = new THREE.Object3D();
    
      while(j<_this.motifsAtoms.length) {
        objs.add(_this.motifsAtoms[j].object3d.clone() );
        j++;
      }
      var mm = new THREE.Mesh(new THREE.SphereGeometry(this.newSphere.getRadius(), 32, 32), new THREE.MeshPhongMaterial());

      if(this.newSphere.object3d !== undefined){
        mm.position.set(this.newSphere.object3d.position.x, this.newSphere.object3d.position.y, this.newSphere.object3d.position.z );
      }
      else{
        mm.position.set(this.box3.pos.x, this.box3.pos.y, this.box3.pos.z );

      }

      objs.add(mm);

      _.each(_this.unitCellPositions, function(pos, k) {  
         
        var x2 = new THREE.BoundingBoxHelper( objs, 0xffffff );
   
        x2.update();
        x2.position.x +=  pos.position.x;  
        x2.position.y +=  pos.position.y;  
        x2.position.z +=  pos.position.z; 

        scene.add( x2 );

        bbHelper.push( x2  );

      });
    }else{
      var scene = UnitCellExplorer.getInstance().object3d; 
      var g=0;
      if(bbHelper.length > 1) {  
        while(g<bbHelper.length) {   
          scene.remove(bbHelper[g] );
          g++;
        }
        bbHelper.splice(0);
      } 
    }
    

  };
  Motifeditor.prototype.fakeFixAtomPositionWithAngles = function(helperAtom, otherAtom, eqAtom, axis){
    var _this = this,sign = 1; 

    var atomOverlapping = helperAtom.object3d.position.clone();

    var atomOverlapped = new THREE.Vector3(otherAtom.object3d.position.x,otherAtom.object3d.position.y,otherAtom.object3d.position.z) ;
    var equilOverlInMotif = new THREE.Vector3(eqAtom.object3d.position.x,eqAtom.object3d.position.y,eqAtom.object3d.position.z) ; 
  
    var realTimeHypotenuse = new THREE.Vector3( atomOverlapped.x - atomOverlapping.x, atomOverlapped.y - atomOverlapping.y, atomOverlapped.z - atomOverlapping.z );
    var calculatedHypotenuse = parseFloat( otherAtom.getRadius() + helperAtom.getRadius() ) ;  

    var fixedSide ;
    var wrongSide, rightSide ;
     
    if(axis === 'y'){ 
         
      var bVector = new THREE.Vector3( atomOverlapping.x - equilOverlInMotif.x, atomOverlapping.y - equilOverlInMotif.y, atomOverlapping.z - equilOverlInMotif.z);

      var aVector = new THREE.Vector3( atomOverlapped.x - equilOverlInMotif.x, atomOverlapped.y - equilOverlInMotif.y, atomOverlapped.z - equilOverlInMotif.z);
      
      var rr = bVector.clone();
      if(aVector.length() === 0){ 
       
        var offset = ( helperAtom.getRadius() + otherAtom.getRadius() -  bVector.length() ) ;
        bVector.setLength(bVector.length() + offset);

      }
      else{  
        var knownAngleCrads = bVector.angleTo(aVector)  ;
        var knownAngleCdegrs = bVector.angleTo(aVector)* 180 / Math.PI ;
        var C = Math.cos(knownAngleCrads);

        var c = 1;
        var a =  atomOverlapped.distanceTo(equilOverlInMotif) ;
        var b =  2*a*C;
        var offset = b - bVector.length()  ;
        bVector.setLength(bVector.length() + offset);
      }

      _.each(reverseShearing, function(k) {
        if (_.isUndefined(_this.cellParameters[k]) === false) { 
          var argument = {};
          argument[k] = -1 * parseFloat(_this.cellParameters[k]); 
          var matrix = transformationMatrix(argument);  
          bVector.applyMatrix4(matrix);  
        }
      }); 

      
      return (bVector.length() - this.cellParameters.scaleY);
      
    }
    else if(axis === 'z'){ 

      var bVector = new THREE.Vector3( atomOverlapping.x - equilOverlInMotif.x, atomOverlapping.y - equilOverlInMotif.y, atomOverlapping.z - equilOverlInMotif.z);

      var aVector = new THREE.Vector3( atomOverlapped.x - equilOverlInMotif.x, atomOverlapped.y - equilOverlInMotif.y, atomOverlapped.z - equilOverlInMotif.z);
      
      if(aVector.length() === 0){ 
       
        var offset = ( helperAtom.getRadius() + otherAtom.getRadius() -  bVector.length() ) ;
        bVector.setLength(bVector.length() + offset);

      }
      else{  
        var rr = bVector.clone();

        var knownAngleCrads = bVector.angleTo(aVector)  ;
        var knownAngleCdegrs = bVector.angleTo(aVector)* 180 / Math.PI ;
        var C = Math.cos(knownAngleCrads);
    
        var c = 1;
        var a =  atomOverlapped.distanceTo(equilOverlInMotif) ;
        var b =  2 * a * C ;
        var offset = b - bVector.length()  ;
        bVector.setLength(bVector.length() + offset);
      }
      if(_this.latticeSystem != 'hexagonal' && _this.latticeType != 'hexagonal'){  
        _.each(reverseShearing, function(k) {
          if (_.isUndefined(_this.cellParameters[k]) === false) {
            var argument = {};
            argument[k] = -1 * parseFloat(_this.cellParameters[k]);
            var matrix = transformationMatrix(argument);
            bVector.applyMatrix4(matrix);
          }
        });
      }
       
      return (bVector.length() - this.cellParameters.scaleZ);
         
    } 
 
  }; 
  Motifeditor.prototype.setManuallyCellAngles = function(par){

    if( this.cellMutex === false) { 
      return ;
    }

    this.cellMutex = false;
    var moreCollisions = true ;
    var angle = 'none' ;
    var counterHelper = 0 ; // to exit from infinite loops in case of bug

    var alpha = (par.alpha === undefined) ? undefined : parseFloat(par.alpha) ;
    var beta = (par.beta === undefined) ? undefined : parseFloat(par.beta) ;
    var gamma = (par.gamma === undefined) ? undefined : parseFloat(par.gamma) ;

    while(moreCollisions === true && counterHelper < 50 ){
      moreCollisions = false;
      if(alpha != undefined){ 
        this.cellParameters.alpha = alpha; 
        // tangency check
         
        this.configureCellPoints('manual');  
 
        if(this.globalTangency === true){ 
          var offset = this.checkInterMotifCollision('alpha', alpha);

          this.cellParameters.alpha = offset.newVal ;

          if(alpha != offset.newVal ) {  
            this.menu.setSliderValue("cellAlpha", offset.newVal); 
          } 
        } 
      }
      else if(beta != undefined){ 
        this.cellParameters.beta = beta; 
        // tangency check
         
        this.configureCellPoints('manual');  
        if(this.globalTangency ){ 
          var offset = this.checkInterMotifCollision('beta', beta);
          this.cellParameters.beta = offset.newVal ;
           
          if(par.cellBeta != offset.newVal ) {  
            this.menu.setSliderValue("cellBeta", offset.newVal);
            $('#cellBeta').val(offset.newVal);
          } 
        } 
      }
      else if(gamma != undefined){ 
        this.cellParameters.gamma = gamma; 
        // tangency check
        this.configureCellPoints('manual');  
        if(this.globalTangency){ 
          var offset = this.checkInterMotifCollision('gamma', gamma );
          this.cellParameters.gamma = offset.newVal ;

          if(par.cellGamma != offset.newVal ) {  
            this.menu.setSliderValue("cellGamma", offset.newVal);
            $('#cellGamma').val(offset.newVal);
          } 
        } 
      }
      
      this.configureCellPoints('manual');  
       
      this.updateLatticeTypeRL();
      moreCollisions = false;  
      counterHelper++;
      
    } 
        
    this.cellMutex = true ; 
  }; 

  Motifeditor.prototype.setDimsManually = function(par){
    
    // deprecated
    if( par.manualSetCellDims) { 
      $(".manualDims").css("display", "inline"); 
      $('input[name=manualSetCellDims]').attr('checked', true);
          
      this.menu.setSliderValue("scaleZ", this.cellParameters.scaleZ);
      this.menu.setSliderValue("scaleX", this.cellParameters.scaleX);
      this.menu.setSliderValue("scaleY", this.cellParameters.scaleY); 
      this.checkForLengthFix(); // calculate the least acceptable length for the cell
    }
     
  };  
  Motifeditor.prototype.fixAtomPosition = function(otherAtom,axis){
    var _this = this,sign = 1; 

    var movingSpherePosition = _this.newSphere.object3d.position.clone();

    var collisionSpherePosition = otherAtom.object3d.position.clone();
  
    var realTimeHypotenuse = collisionSpherePosition.distanceTo (movingSpherePosition);
    var calculatedHypotenuse = parseFloat( otherAtom.getRadius() + _this.newSphere.getRadius() ) ;  

    var fixedSide ;
    var wrongSide ;
     
    if(axis==="x"){ 
      wrongSide = Math.abs(movingSpherePosition.x - collisionSpherePosition.x);
      var projection = new THREE.Vector3(movingSpherePosition.x,collisionSpherePosition.y, collisionSpherePosition.z );
      fixedSide =  movingSpherePosition.distanceTo(projection);  
      if(movingSpherePosition.x < collisionSpherePosition.x) sign = -1 ;
    }
    else if(axis==="y"){ 
      wrongSide = Math.abs(movingSpherePosition.y - collisionSpherePosition.y);
      var projection = new THREE.Vector3(collisionSpherePosition.x,movingSpherePosition.y,collisionSpherePosition.z );
      fixedSide =  movingSpherePosition.distanceTo(projection);
      if(movingSpherePosition.y < collisionSpherePosition.y) sign = -1 ;
    }
    else{ 
      wrongSide = Math.abs(movingSpherePosition.z - collisionSpherePosition.z);
      var projection = new THREE.Vector3(collisionSpherePosition.x,collisionSpherePosition.y,movingSpherePosition.z ); 
      fixedSide =  movingSpherePosition.distanceTo(projection); 
      if(movingSpherePosition.z < collisionSpherePosition.z) sign = -1 ;  
    }   
    
    var rightSide = Math.sqrt ( ((calculatedHypotenuse*calculatedHypotenuse) - (fixedSide*fixedSide) )); 

    var offset = parseFloat( rightSide - wrongSide );
   
    return (sign*offset);
  } 
  Motifeditor.prototype.setAtomsParameter = function(param){
    var _this = this; 
     
    if(!_.isUndefined(param.atomOpacity) ) { 
      this.newSphere.setOpacity(param.atomOpacity, param.atomOpacity);
      this.unitCellAtomsOpacity(this.newSphere.getID(),param.atomOpacity);
    }
    else if(!_.isUndefined(param.atomColor)){  
      this.newSphere.setColorMaterial("#"+param.atomColor);
      this.newSphere.setOriginalColor("#"+param.atomColor);
      this.colorUnitCellAtoms(this.newSphere.getID(), "#"+param.atomColor);
    }
    else if(!_.isUndefined(param.atomTexture)){
      // deprecated 
      this.newSphere.setColorMaterial(param.atomTexture);
      this.unitCellAtomsTexture(this.newSphere.getID(), param.atomTexture);
    } 
    else if(!_.isUndefined(param.wireframe)){ 
      // deprecated
      this.newSphere.wireframeMat(param.wireframe);
      this.unitCellAtomsWireframe(this.newSphere.getID(), param.wireframe);
    }  
  };  
  Motifeditor.prototype.getMotif = function (store){ 
    var _this = this, copiedAr = this.motifsAtoms.slice() ;
     
    /*
    {
      "object3d" : {
        "position" : { 
          "x": _this.newSphere.object3d.position.x, 
          "y": _this.newSphere.object3d.position.y, 
          "z": _this.newSphere.object3d.position.z,
          clone: function() { return (new THREE.Vector3(this.x,this.y,this.z)); }
        },
        'children' : [
          
        ]
      }, 
      getRadius: function() { return _this.newSphere.getRadius(); }
    }
    */

    // store needs fix here
    if(this.newSphere !== undefined){ 
      var newSphereHelper = jQuery.extend(true, {}, this.newSphere);
      newSphereHelper.position = { 
        "x": _this.newSphere.position.x,
        "y": _this.newSphere.position.y,
        "z": _this.newSphere.position.z,
        clone: function() { return (new THREE.Vector3(this.x,this.y,this.z)); }
      };
      copiedAr.push(
        newSphereHelper
      );

    }
     
    return copiedAr; 

  };
   
  Motifeditor.prototype.getAllAtoms = function (){
    return this.motifsAtoms;
  };
  Motifeditor.prototype.getDimensions = function (){ 
    var  r = {
      'x' : this.cellParameters.scaleX, 
      'y' : this.cellParameters.scaleY, 
      'z' : this.cellParameters.scaleZ,
      'alpha' : this.cellParameters.alpha,
      'beta' : this.cellParameters.beta,
      'gamma' : this.cellParameters.gamma 
    } ;
      
    return r;
  };   
  Motifeditor.prototype.updateFixedDimensions = function (latticeParams) {

    if(!_.isUndefined(latticeParams.scaleX) ) { 
      if(this.latticeName !== 'hexagonal'){ 
        this.cellParameters.scaleZ = parseFloat(latticeParams.scaleZ) ; 
      }
    } 
    if(!_.isUndefined(latticeParams.scaleY) ) { 
      this.cellParameters.scaleY = parseFloat(latticeParams.scaleY) ; 
    }
    if(!_.isUndefined(latticeParams.scaleZ) ) { 
      this.cellParameters.scaleZ = parseFloat(latticeParams.scaleZ) ; 
    }
  };
  Motifeditor.prototype.submitAtom = function(parameters) {
    var _this = this;

    var buttonClicked = parameters.button;

    this.menu.setLatticeCollision({ scaleX: false, scaleY: false,  scaleZ: false  });
    this.snapData.snapVal = { 'aScale' : undefined,  'bScale' : undefined,  'cScale' : undefined};
    
    if(this.editorState.state === "creating"){ 
      switch(buttonClicked) { 
        case "saveChanges":   
          this.motifsAtoms.push(this.newSphere); 
          this.updateAtomList(
            this.newSphere.object3d.position.clone(), 
            this.newSphere.getID(), 
            this.newSphere.getRadius(), 
            this.newSphere.elementName,
            'edit',
            'bg-light-gray',
            this.newSphere.tangentParent,
            this.newSphere.color,
            this.newSphere.ionicIndex
          );
          PubSub.publish(events.EDITOR_STATE, {'state' : "initial"});
          this.lastSphereAdded = this.newSphere ;
          this.newSphere.blinkMode(false); 
          this.newSphere = undefined ;
          this.dragMode = false; 
 
          break;
        case "deleteAtom": 
          this.removeFromUnitCell(this.newSphere.getID());
          this.menu.breakChain({id : this.newSphere.getID(), remove : true});
          this.deleteTangentChild(this.newSphere.getID());
          this.newSphere.destroy(); 
          if(!_.isUndefined( this.motifsAtoms[0])) {   
            this.lastSphereAdded = this.motifsAtoms[this.motifsAtoms.length-1];
            this.newSphere =  undefined; 
            this.configureCellPoints();
          }
          else{
            this.newSphere = undefined ;
            this.lastSphereAdded = undefined ;
            this.isEmpty = true ; 
          }
          this.menu.setLatticeCollision({
            scaleX: false,
            scaleY: false, 
            scaleZ: false 
          }); 

          this.dragMode = false; 
          PubSub.publish(events.EDITOR_STATE, {'state' : "initial"});
          this.initVolumeState(); 
          break; 
      }
    }
    else if(this.editorState.state === "editing"){ 
      switch(buttonClicked) { 
        case "saveChanges": 
          this.motifsAtoms.push(this.newSphere);
          this.updateAtomList(
            this.newSphere.object3d.position.clone(), 
            this.newSphere.getID(), 
            this.newSphere.getRadius(),  
            this.newSphere.elementName,
            'edit',
            'bg-light-gray',
            this.newSphere.tangentParent,
            this.newSphere.color,
            this.newSphere.ionicIndex
          );
          PubSub.publish(events.EDITOR_STATE, {'state' : "initial"});
          this.newSphere.blinkMode(false);
          this.newSphere = undefined ;
          this.dragMode = false; 

          break;
        case "deleteAtom":
          this.removeFromUnitCell(this.newSphere.getID());
          this.menu.breakChain({id : this.newSphere.getID(), remove : true});
          this.newSphere.destroy(); 
          this.updateAtomList(
            undefined, 
            this.newSphere.getID(), 
            undefined, 
            undefined,
            'delete'
          );
          this.deleteTangentChild(this.newSphere.getID());
          //_.find(this.motifsAtoms, function(atom,k){ if(atom.getID() === this.newSphere.getID() ) this.motifsAtoms.splice(k,1); }); 
          if(!_.isUndefined( this.motifsAtoms[0])) {
            this.lastSphereAdded = this.motifsAtoms[this.motifsAtoms.length-1];
            this.newSphere =  undefined; //this.motifsAtoms[this.motifsAtoms.length-1];   
            this.configureCellPoints();
          }
          else{
            this.newSphere = undefined ;
            this.lastSphereAdded = undefined ;
            this.isEmpty = true ;  
          }
          this.dragMode = false; 
          PubSub.publish(events.EDITOR_STATE, {'state' : "initial"});  
          this.initVolumeState();  

          break; 
      }
    }  
  };
  Motifeditor.prototype.deleteTangentChild = function (id){
    // todo na feugei kai to tanngent icon apo to child kai na ginetai free
    _.each(this.motifsAtoms, function(atom, r) { 
      if(atom.tangentParent == id) { 

        atom.tangentParent = undefined ;
         
      }
    });   
  };
  Motifeditor.prototype.editorState_ = function (arg){ 
    var _this = this ;
    this.editorState.state = arg.state;
    var atomPos = (arg.atomPos === undefined) ? new THREE.Vector3(0,0,0) : arg.atomPos;
    var color = (arg.atomColor === undefined) ? '#ffffff' : (arg.atomColor);
     
    switch(arg.state) {
      case "initial":  
     
        this.menu.rotAnglesSection(false); 
        this.menu.disableMEButtons(
          {
            'atomPalette' : false,
            'saveAtomChanges' : true,   
            'deleteAtom' : true 
          }
        );
        this.menu.editMEInputs(
          {
            'atomPosX' : 0,
            'atomPosY' : 0,
            'atomPosZ' : 0,  
            'atomColor' : '#1F2227',  
            'atomOpacity' : 10,
            'atomName' : '-', 
            'scaleZ' : this.cellParameters.scaleZ,
            'scaleX' : this.cellParameters.scaleX,
            'scaleY' : this.cellParameters.scaleY,
            'cellAlpha' : this.cellParameters.alpha,
            'cellBeta' : this.cellParameters.beta,
            'cellGamma' : this.cellParameters.gamma
          }
        ); 
        this.menu.disableMEInputs(
          {
            'atomPosX' : true,
            'atomPosY' : true,
            'atomPosZ' : true,  
            'atomColor' : true,  
            'atomOpacity' : true,  
            'atomPositioningXYZ' : true,
            'atomPositioningABC' : true,  
            'rotAngleTheta' :  false, 
            'rotAnglePhi' : false,
            'tangentR' : false 
          }
        ); 
        break;
      case "creating":
      
        var pos = arg.atomPos;

        if(true /* this.editorState.atomPosMode === 'relative' */){
           
          pos =  new THREE.Vector3(this.newSphere.uiRelPosition.x, this.newSphere.uiRelPosition.y, this.newSphere.uiRelPosition.z);;
 
        } 
         
        this.menu.disableMEButtons(
          { 
            'saveAtomChanges' : false,  
            'deleteAtom' : false 
          }
        );  
        this.menu.editMEInputs(
          {
            'atomPosX' :  pos.x  ,
            'atomPosY' : pos.y  ,
            'atomPosZ' : pos.z , 
            'atomColor' : color,  
            'atomOpacity' : 10,   
            'scaleZ' : this.cellParameters.scaleZ,
            'scaleX' : this.cellParameters.scaleX,
            'scaleY' : this.cellParameters.scaleY,
            'cellAlpha' : this.cellParameters.alpha,
            'cellBeta' : this.cellParameters.beta,
            'cellGamma' : this.cellParameters.gamma
          }
        );   
         
        this.menu.disableMEInputs(
          {
            'atomPosX' : false,
            'atomPosY' : false,
            'atomPosZ' : false,  
            'atomColor' : false, 
            'atomOpacity' : false,     
            'atomPositioningXYZ' : false,
            'atomPositioningABC' : false 
          }
        );  
        break;
      case "editing": 
     
        var pos = arg.atomPos;
        if(true /* this.editorState.atomPosMode === 'relative' */){
     
          pos =  new THREE.Vector3(this.newSphere.uiRelPosition.x, this.newSphere.uiRelPosition.y, this.newSphere.uiRelPosition.z);

        }  
        this.menu.disableMEButtons(
          { 
            'saveAtomChanges' : false, 
            'deleteAtom' : false 
          }
        );   
        this.menu.editMEInputs(
          {
            'atomPosX' :  pos.x  ,
            'atomPosY' : pos.y  ,
            'atomPosZ' : pos.z ,   
            'atomColor' : color,  
            'atomOpacity' : arg.opacity, 
            'ionicIndex' : arg.ionicIndex, 
            'atomName' : arg.atomName.toLowerCase()
          }
        );   
 
        this.menu.disableMEInputs(
          {
            'atomPosX' : false,
            'atomPosY' : false,
            'atomPosZ' : false,  
            'atomColor' : false,  
            'atomOpacity' : false 
          }
        );  
        break;
    }
  }; 
  Motifeditor.prototype.updateAtomList = function(pos, id, radius, name, action, classColor, chainLevel, atomColor, ionicIndex) {
 
    var _this = this ;  

    if(action === 'delete'){
       this.menu.editSavedAtom({
        'action':action,
        'id':id
      });
    }
    else{  
     
      var atomPos, posCache = new THREE.Vector3(pos.x, pos.y, pos.z);
      
      if( pos.x !== '-'){

        var x = this.cellParameters.scaleX  ;
        var y = this.cellParameters.scaleY  ;
        var z = this.cellParameters.scaleZ  ;
        var iStr;
        var posForHex = new THREE.Vector3(pos.x, pos.y, pos.z);  
       
        pos = this.transformGeneric(pos.clone(), {'revertShearing' : true});

        if(isEpsilon(pos.x)) pos.x = 0;
        if(isEpsilon(pos.y)) pos.y = 0;
        if(isEpsilon(pos.z)) pos.z = 0;
 
        var xAdjR = 0; 
        var yAdjR = 0;
        var zAdjR = 0;

        if(this.latticeName === 'hexagonal'){  
 
          var v = new THREE.Vector3( z, 0, 0 );
          var v2 = v.clone();
          var v4 = v.clone();
          var v5 = v.clone();

          var axis = new THREE.Vector3( 0, 1, 0 );
          var angle = (Math.PI / 3) * 1 ; 
          v.applyAxisAngle( axis, angle );
          var hexSideLength = v.length();
          var v3;
          var zl = Math.abs(posForHex.z);

          // Z hex vector (4*PI/3)
          if(posForHex.z !== 0){ 
             
            var hypotenuse = zl / Math.sin(Math.PI/3); 

            zAdjR = toFixedDown((hypotenuse/hexSideLength ).toFixed(6), 3);
            zAdjR = (pos.z >0) ? (zAdjR) : (zAdjR * -1); 
          } 
          else {
            zAdjR = toFixedDown((0).toFixed(6), 3);
          }

          // X hex vector  
          if(posForHex.x !=0){ 
            if(posForHex.z !== 0) {
              angle = selectAngle({z : posForHex.z});
              v2.applyAxisAngle( axis, angle );
              v2.setLength(zl / Math.sin(Math.PI/3));
              v3 = posForHex.clone().add(v2); 
              xAdjR = toFixedDown((v3.x/hexSideLength).toFixed(6), 3);
            }
            else{  
               xAdjR = toFixedDown((posForHex.x/x).toFixed(6), 3); 
            } 
          }
          else{
            xAdjR = toFixedDown((0).toFixed(6), 3);
          }
 
          yAdjR = toFixedDown((posForHex.y/y).toFixed(6), 3); 

          var xInv = v4.applyAxisAngle( axis, (Math.PI) ).setLength(xAdjR*hexSideLength);
          var zInv = v5.applyAxisAngle( axis, (Math.PI/3) ).setLength(zAdjR*hexSideLength);
          xInv.add(zInv);
 
          var temp = -1*(+(zAdjR) + +(xAdjR));
         
          iStr = toFixedDown((temp).toFixed(6), 3);  
         
        } 
        else{
          pos.x = pos.x/ x ;
          pos.y = pos.y/ y ;
          pos.z = pos.z/ z ;

          xAdjR = toFixedDown((pos.x).toFixed(6), 3); 
          yAdjR = toFixedDown((pos.y).toFixed(6), 3);
          zAdjR = toFixedDown((pos.z).toFixed(6), 3);
        }
   
        this.newSphere.uiRelPosition = new THREE.Vector3(+xAdjR, +yAdjR, +zAdjR );
      
        var xAdjA = toFixedDown((posCache.x).toFixed(6), 3); 
        var yAdjA = toFixedDown((posCache.y).toFixed(6), 3);
        var zAdjA = toFixedDown((posCache.z).toFixed(6), 3);
        
        if(iStr === undefined){
          atomPos = zAdjR+','+xAdjR+','+yAdjR+'&'+zAdjA+','+xAdjA+','+yAdjA;
        }
        else{
          atomPos = zAdjR+','+xAdjR+','+iStr+','+yAdjR+'&'+zAdjA+','+xAdjA+','+yAdjA;
        }
      }
         
      this.menu.editSavedAtom({
        'action':action,
        'id':id, 
        'visible':true,
        'elementCode':name.toLowerCase(),
        'elementName':name,
        'atomColor':atomColor,
        'atomPos': atomPos,
        'ionicIndex': ionicIndex
      });

      this.menu.highlightAtomEntry({id : id, color : classColor});

      if(chainLevel !== undefined){ 
        this.menu.hideChainIcon({id : id, hide : false});
      }
    } 
  }; 
  function selectAngle(arg){
    if(arg.z > 0){
      return Math.PI/3;
    }
    else{
      return 4*Math.PI/3;
    }
  }
  function toFixedDown(figure, decimals) {
 
    if (!decimals) decimals = 3;
    var d = Math.pow(10,decimals);
    return (parseInt(figure*d)/d).toFixed(decimals);
  }
  function isEpsilon(number){
    // checks if close to 0
    if(Math.abs(number) < 1e-10)
      return true;
    else
      return false; 
  }
  Motifeditor.prototype.setTangentAngle = function(azimuthal, polar, r, tangentToThis){
     
    var _this = this ;  
    var pos = new THREE.Vector3();
         
    pos = _this.sphericalCoords( r, azimuthal *  (Math.PI/180) , polar *  (Math.PI/180) );  
     
    pos.x += tangentToThis.object3d.position.x ;
    pos.y += tangentToThis.object3d.position.y ;
    pos.z += tangentToThis.object3d.position.z ;
    
    this.newSphere.object3d.position.x = pos.x ;
    this.newSphere.object3d.position.y = pos.y ;
    this.newSphere.object3d.position.z = pos.z ;
     
    this.translateCellAtoms("x",  pos.x , this.newSphere.getID());
    this.translateCellAtoms("y",  pos.y , this.newSphere.getID());
    this.translateCellAtoms("z",  pos.z , this.newSphere.getID());
    this.configureCellPoints();
    this.findAngles('x');
    this.findAngles('y');
    this.findAngles('z'); 
  };
  Motifeditor.prototype.changeRotatingAngle = function(arg, tangentToThis){
     
    var _this = this ;  
    var pos = new THREE.Vector3();
    var tangentToThis = (tangentToThis === undefined) ? this.tangentToThis : tangentToThis ; 
    var r = this.newSphere.getRadius() + tangentToThis.getRadius() ;
   
    var polar = parseFloat( arg.rotAngleTheta );
    var azimuthal = parseFloat( arg.rotAnglePhi );
    if(this.dragMode){ 
      pos = _this.sphericalCoords( r, azimuthal *  (Math.PI/180) , polar *  (Math.PI/180) );  
    }
    pos.x += tangentToThis.object3d.position.x ;
    pos.y += tangentToThis.object3d.position.y ;
    pos.z += tangentToThis.object3d.position.z ;
    this.newSphere.object3d.position.set(pos.x , pos.y, pos.z); 
    this.translateCellAtoms("x",  pos.x , this.newSphere.getID());
    this.translateCellAtoms("y",  pos.y , this.newSphere.getID());
    this.translateCellAtoms("z",  pos.z , this.newSphere.getID());
    this.configureCellPoints();
    this.findAngles('x');
    this.findAngles('y');
    this.findAngles('z'); 
  };
  Motifeditor.prototype.sphericalCoords = function(r, azimuthalPhi , polarTheta){   
    var pos = new THREE.Vector3();
    pos.x = r * Math.sin(polarTheta) * Math.sin(azimuthalPhi);
    pos.y = r * Math.cos(polarTheta);
    pos.z = r * Math.sin(polarTheta) * Math.cos(azimuthalPhi); 
    return pos;
  };
  Motifeditor.prototype.findPolarAngles = function(p){   
     
    var angles = {'theta': 0 , 'phi': 0};
    var n = Math.sqrt(p.x*p.x + p.y*p.y + p.z*p.z );
    angles.theta = Math.acos(p.y/n) * (180/Math.PI);
    angles.phi = Math.atan(p.x/p.z) * (180/Math.PI);
    return angles;
  };    
  Motifeditor.prototype.rotateAroundAtom = function(_angle){
    var _this = this, colAtom; 
 
    if(this.dragMode === false && this.globalTangency === true){
      for (var i = this.motifsAtoms.length - 1; i >= 0; i--) {
        var realDist = this.motifsAtoms[i].object3d.position.distanceTo(this.newSphere.object3d.position);
        var calcDist = this.motifsAtoms[i].getRadius() + this.newSphere.getRadius();
        if((realDist<calcDist) && (this.motifsAtoms[i].getID() !== this.newSphere.getID())){ 
          colAtom = this.motifsAtoms[i];
        }
      };
    }

    if(this.dragMode === true || colAtom !== undefined){ 

      if(this.soundMachine.procced) this.soundMachine.play('popOutOfAtom');

      var axis = this.rotAxis;
      var movingAtom = this.newSphere;

      var stillAtom = (colAtom) ? colAtom : this.tangentToThis;

      var movingPoint = new THREE.Vector3(movingAtom.object3d.position.x, movingAtom.object3d.position.y, movingAtom.object3d.position.z); 
      var stillPoint = new THREE.Vector3(stillAtom.object3d.position.x, stillAtom.object3d.position.y, stillAtom.object3d.position.z);
      var tangentDistance = movingAtom.getRadius() + stillAtom.getRadius() ; 
      var angle = _angle;

      if(axis === 'x'){
        
        var thirdPoint = new THREE.Vector3(movingPoint.x, stillPoint.y, movingPoint.z); 
        var inactiveAxesPoint = new THREE.Vector3(stillPoint.x, stillPoint.y, movingPoint.z);
        var oldHypotenuseVec = movingPoint.sub(inactiveAxesPoint);
        var oldVerticalVec = thirdPoint.sub(inactiveAxesPoint);
        if (_.isUndefined(angle)) angle = calculateAngle( new THREE.Vector2(  1,0 ), new THREE.Vector2(  oldHypotenuseVec.x, oldHypotenuseVec.y ) ) ; 
        var inactiveAxesVec = inactiveAxesPoint.sub(stillPoint);  
        var correctHypotenuse = Math.sqrt( (tangentDistance * tangentDistance) -  (inactiveAxesVec.length() * inactiveAxesVec.length()) );
        var verticalSide = correctHypotenuse * Math.sin(angle * (Math.PI/180) );
        var horizontalSide = correctHypotenuse * Math.cos(angle * (Math.PI/180) );
        var position = new THREE.Vector3(stillPoint.x + horizontalSide, stillPoint.y + verticalSide, movingPoint.z );
         
        this.newSphere.object3d.position.y = position.y ;  
        this.newSphere.object3d.position.x = position.x ;   
        this.translateCellAtoms("y",  position.y , this.newSphere.getID());
        this.translateCellAtoms("x",  position.x , this.newSphere.getID());
    
        this.menu.editMEInputs(
          {  
            'rotAngleX' : angle.toFixed(0) 
          }
        );

        this.configureCellPoints();

        if(this.dragMode) {
          this.findAngles('y');
          this.findAngles('z');
        }
      }
      else if(axis === 'y'){

        var thirdPoint = new THREE.Vector3(movingPoint.x, stillPoint.y, movingPoint.z); 
        var inactiveAxesPoint = new THREE.Vector3(movingPoint.x, stillPoint.y, stillPoint.z);
        var oldHypotenuseVec = movingPoint.sub(inactiveAxesPoint);
        var oldVerticalVec = thirdPoint.sub(inactiveAxesPoint); 
        if (_.isUndefined(angle)) angle = calculateAngle( new THREE.Vector2( 1,0 ), new THREE.Vector2( -1 * oldHypotenuseVec.z, oldHypotenuseVec.y ) ) ; 
        var inactiveAxesVec = inactiveAxesPoint.sub(stillPoint); 
        var correctHypotenuse = Math.sqrt( (tangentDistance * tangentDistance) -  (inactiveAxesVec.length() * inactiveAxesVec.length()) );
        var verticalSide = correctHypotenuse * Math.sin(angle * (Math.PI/180) );
        var horizontalSide = correctHypotenuse * Math.cos(angle * (Math.PI/180) );
        var position = new THREE.Vector3(movingPoint.x  , stillPoint.y + verticalSide,  (stillPoint.z - horizontalSide) );

        this.newSphere.object3d.position.y = position.y ;  
        this.newSphere.object3d.position.z = position.z ;  
        this.translateCellAtoms("y",  position.y , _this.newSphere.getID());
        this.translateCellAtoms("z",  position.z , _this.newSphere.getID());
        var a = parseFloat((180 -angle).toFixed(0)) ;
        if(a<0) a = 360 + a ;
          
        this.menu.editMEInputs(
          {  
            'rotAngleY' : a 
          }
        );
        this.configureCellPoints();
        if(this.dragMode) {
          this.findAngles('x');
          this.findAngles('z');
        }
      }
      else if(axis === 'z'){
        var thirdPoint = new THREE.Vector3(stillPoint.x, movingPoint.y, movingPoint.z); 
        var inactiveAxesPoint = new THREE.Vector3(stillPoint.x, movingPoint.y, stillPoint.z); 
        var oldHypotenuseVec = movingPoint.sub(inactiveAxesPoint);
        var oldVerticalVec = thirdPoint.sub(inactiveAxesPoint); 
        if (_.isUndefined(angle)) angle = calculateAngle( new THREE.Vector2(  1,0 ), new THREE.Vector2(   oldHypotenuseVec.x, -1 * oldHypotenuseVec.z ) ) ; 
        var inactiveAxesVec = inactiveAxesPoint.sub(stillPoint);  
        var correctHypotenuse = Math.sqrt( (tangentDistance * tangentDistance) -  (inactiveAxesVec.length() * inactiveAxesVec.length()) ); 
        var verticalSide = correctHypotenuse * Math.sin(angle * (Math.PI/180) );
        var horizontalSide = correctHypotenuse * Math.cos(angle * (Math.PI/180) ); 
        var position = new THREE.Vector3(stillPoint.x + horizontalSide  , movingPoint.y ,  (stillPoint.z - verticalSide) );

        this.newSphere.object3d.position.x = position.x ;  
        this.newSphere.object3d.position.z = position.z ;  
        this.translateCellAtoms("x",  position.x , _this.newSphere.getID());
        this.translateCellAtoms("z",  position.z , _this.newSphere.getID());
        var a = (360 - angle).toFixed(0) ;
        if(a==360) a=0.000;
          
        this.menu.editMEInputs(
          {  
            'rotAngleX' : a
          }
        );
        this.configureCellPoints();
        if(this.dragMode) {
          this.findAngles('x');
          this.findAngles('y'); 
        }
      }
      this.menu.setSliderValue("atomPosX", _this.newSphere.object3d.position.x);
      this.menu.setSliderValue("atomPosY", _this.newSphere.object3d.position.y);
      this.menu.setSliderValue("atomPosZ", _this.newSphere.object3d.position.z);
      if(this.dragMode) {
        var p = new THREE.Vector3(
          this.newSphere.object3d.position.x-this.tangentToThis.object3d.position.x,
          this.newSphere.object3d.position.y-this.tangentToThis.object3d.position.y,
          this.newSphere.object3d.position.z-this.tangentToThis.object3d.position.z
          ); 
        var angles = _this.findPolarAngles(p);

        this.menu.editMEInputs(
          { 
            'rotAngleTheta' : toFixedDown(angles.theta , 2), 
            'rotAnglePhi' : toFixedDown(angles.phi , 2)    
          }
        );
      }
    } 

    if(this.padlock === true && this.globalTangency === true){
     
      var _dimensions = this.findMotifsDimensions(_this.newSphere.object3d.position, _this.newSphere.getRadius());   

      var dimensions = this.calcABCforParticularCases(_dimensions);

      // for volume reduce functionality 
      this.initVolumeState();

    } 
 
    this.checkCellForCollisions();
    this.checkMotifForCollisions();
  }; 
  Motifeditor.prototype.checkCellForCollisions = function(){

    if(this.atomRelationshipManager.highlightOverlapState === true){
      this.atomRelationshipManager.highlightOverlapState = false;  
      this.atomRelationshipManager.checkCellforOverlap();
      this.atomRelationshipManager.highlightOverlapState = true; 

    }   
    this.atomRelationshipManager.checkCellforOverlap(); 
  };
  Motifeditor.prototype.checkMotifForCollisions = function(){ 

    if(this.atomRelationshipManager.highlightOverlapState === true){
      this.atomRelationshipManager.highlightOverlapState = false; 
      this.atomRelationshipManager.checkMotiforOverlap(); 
      this.atomRelationshipManager.highlightOverlapState = true; 

    }  
    this.atomRelationshipManager.checkMotiforOverlap(); 
  };
  Motifeditor.prototype.findAngles = function(axis){ // set with parameter for flexibility
    var _this = this ; 
     
    var movingAtom = this.newSphere;
    var stillAtom = this.tangentToThis;
    var movingPoint = new THREE.Vector3(movingAtom.object3d.position.x, movingAtom.object3d.position.y, movingAtom.object3d.position.z); 
    var stillPoint = new THREE.Vector3(stillAtom.object3d.position.x, stillAtom.object3d.position.y, stillAtom.object3d.position.z);
    var tangentDistance = this.newSphere.tangentR ;  
    var angle;

    if(axis === 'x'){
      var thirdPoint = new THREE.Vector3(movingPoint.x, stillPoint.y, movingPoint.z); 
      var inactiveAxesPoint = new THREE.Vector3(stillPoint.x, stillPoint.y, movingPoint.z);
      var oldHypotenuseVec = movingPoint.sub(inactiveAxesPoint);
      var oldVerticalVec = thirdPoint.sub(inactiveAxesPoint);
      angle = calculateAngle( new THREE.Vector2(  1,0 ), new THREE.Vector2(  oldHypotenuseVec.x, oldHypotenuseVec.y ) ) ; 
      var inactiveAxesVec = inactiveAxesPoint.sub(stillPoint);  
      var correctHypotenuse = Math.sqrt( (tangentDistance * tangentDistance) -  (inactiveAxesVec.length() * inactiveAxesVec.length()) );
      var verticalSide = correctHypotenuse * Math.sin(angle * (Math.PI/180) );
      var horizontalSide = correctHypotenuse * Math.cos(angle * (Math.PI/180) );
      var position = new THREE.Vector3(stillPoint.x + horizontalSide, stillPoint.y + verticalSide, movingPoint.z );
      this.menu.editMEInputs(
        {  
          'rotAngleX' : angle.toFixed(0) 
        }
      );

    }
    else if(axis === 'y'){
      var thirdPoint = new THREE.Vector3(movingPoint.x, stillPoint.y, movingPoint.z); 
      var inactiveAxesPoint = new THREE.Vector3(movingPoint.x, stillPoint.y, stillPoint.z);
      var oldHypotenuseVec = movingPoint.sub(inactiveAxesPoint);
      var oldVerticalVec = thirdPoint.sub(inactiveAxesPoint); 
      angle = calculateAngle( new THREE.Vector2(  1,0 ), new THREE.Vector2(  -1 * oldHypotenuseVec.z, oldHypotenuseVec.y ) ) ; 
      var inactiveAxesVec = inactiveAxesPoint.sub(stillPoint); 
      var correctHypotenuse = Math.sqrt( (tangentDistance * tangentDistance) -  (inactiveAxesVec.length() * inactiveAxesVec.length()) );
      var verticalSide = correctHypotenuse * Math.sin(angle * (Math.PI/180) );
      var horizontalSide = correctHypotenuse * Math.cos(angle * (Math.PI/180) );
      var position = new THREE.Vector3(movingPoint.x  , stillPoint.y + verticalSide,  (stillPoint.z - horizontalSide) );
      var a = parseFloat((180 -angle).toFixed(0)) ;
      if(a<0) a = 360 + a ;
      this.menu.editMEInputs(
        {  
          'rotAngleY' : a 
        }
      ); 
    }
    else if(axis === 'z'){
      var thirdPoint = new THREE.Vector3(stillPoint.x, movingPoint.y, movingPoint.z); 
      var inactiveAxesPoint = new THREE.Vector3(stillPoint.x, movingPoint.y, stillPoint.z); 
      var oldHypotenuseVec = movingPoint.sub(inactiveAxesPoint);
      var oldVerticalVec = thirdPoint.sub(inactiveAxesPoint); 
      angle = calculateAngle( new THREE.Vector2(  1,0 ), new THREE.Vector2(   oldHypotenuseVec.x, -1 * oldHypotenuseVec.z ) ) ; 
      var inactiveAxesVec = inactiveAxesPoint.sub(stillPoint);  
      var correctHypotenuse = Math.sqrt( (tangentDistance * tangentDistance) -  (inactiveAxesVec.length() * inactiveAxesVec.length()) ); 
      var verticalSide = correctHypotenuse * Math.sin(angle * (Math.PI/180) );
      var horizontalSide = correctHypotenuse * Math.cos(angle * (Math.PI/180) ); 
      var position = new THREE.Vector3(stillPoint.x + horizontalSide  , movingPoint.y ,  (stillPoint.z - verticalSide) );
      var a = (360 - angle).toFixed(0) ;
      if(a==360) a=0.000;
      this.menu.editMEInputs(
        {  
          'rotAngleZ' : a
        }
      ); 
    } 
     
  };
  function calculateAngle(vec1, vec2){ 
    vec1.normalize();
    vec2.normalize(); 
    var angle = Math.atan2( vec2.y,vec2.x) -  Math.atan2(vec1.y,vec1.x); 
    var f = angle* (180/Math.PI);  
    if(f < 0 ) f = 360 + f ; 
     
    return f;  
  }
  Motifeditor.prototype.changeTangentR = function(arg){

    var movingAtom = this.newSphere;
    var stillAtom = this.tangentToThis;

    if(arg === undefined || arg.tangentR === ''){
      
      var tangentDistance = movingAtom.getRadius() + stillAtom.getRadius() ; 
      this.newSphere.tangentR = tangentDistance;
      this.menu.editMEInputs(
        { 
          'tangentR' : tangentDistance  
        }
      );
    }
    else{ 
      this.newSphere.tangentR = parseFloat(arg.tangentR);
      this.rotateAroundAtom();
      this.menu.editMEInputs(
        { 
          'tangentR' : arg.tangentR  
        }
      );
    }
     
  }; 
  Motifeditor.prototype.getConfirmationAnswer = function(arg){   
      
    if(arg.result === true){
      this.selectAtom(this.whichToConfirm, undefined, undefined, true);
    }
    this.whichToConfirm = undefined;
  };
  Motifeditor.prototype.selectAtom = function (which, doNotRepos, doNotChangeState, afterConfirm){ 
    var _this = this;
    var doNotDestroy = false;

    var x = this.cellParameters.scaleX;
    var y = this.cellParameters.scaleY;
    var z = this.cellParameters.scaleZ;
 
    this.menu.disableMEInputs(
    { 
      'atomPositioningXYZ' : false,
      'atomPositioningABC' : false
    });

     
    if(this.dragMode === true && doNotChangeState !== undefined) { 
        
      this.tangentToThis = _.find(_this.motifsAtoms, function(atom){ return atom.getID() == which; }); 
 
      if(doNotRepos === undefined) {  
        var newPos = this.findNewAtomsPos(this.tangentToThis, this.newSphere.getRadius(), true);  

        this.newSphere.object3d.position.set(newPos.x, newPos.y, newPos.z); 

        this.changeTangentR();

        this.translateCellAtoms("x",  newPos.x , this.newSphere.getID());
        this.translateCellAtoms("y",  newPos.y , this.newSphere.getID());
        this.translateCellAtoms("z",  newPos.z , this.newSphere.getID());
        this.configureCellPoints(); 

        this.menu.setSliderValue("atomPosX", this.newSphere.object3d.position.x);
        this.menu.setSliderValue("atomPosY", this.newSphere.object3d.position.y);
        this.menu.setSliderValue("atomPosZ", this.newSphere.object3d.position.z);
      }
      else{
        this.changeTangentR({'tangentR' : this.newSphere.tangentR});
      } 

      this.findAngles('x');
      this.findAngles('y');
      this.findAngles('z');

      var p = new THREE.Vector3(
        this.newSphere.object3d.position.x-_this.tangentToThis.object3d.position.x,
        this.newSphere.object3d.position.y-_this.tangentToThis.object3d.position.y,
        this.newSphere.object3d.position.z-_this.tangentToThis.object3d.position.z
      );
      var angles = _this.findPolarAngles(p);

      this.menu.editMEInputs(
        { 
          'rotAngleTheta' : toFixedDown(angles.theta, 2),  
          'rotAnglePhi' : toFixedDown(angles.phi, 2) 
        }
      );

    }
    else if(!this.dragMode){ 
      if(this.newSphere !== undefined && which === this.newSphere.getID()){
        // case where user clicks ont he current atom
        return;
      }
      else if(this.newSphere !== undefined){
        // case where the user clicks other atom without having saved last atom's changes
        if(this.newSphere.fresh === true && afterConfirm === undefined){

          this.whichToConfirm = which;

          this.menu.showWarningDialog({
            'message':'Your changes will be lost. Are you sure you want to proceed?'
          });
          return;
        }
        else if(this.newSphere.fresh === true && afterConfirm !== undefined){ 
          this.updateAtomList(
            undefined, 
            this.newSphere.getID(), 
            undefined, 
            undefined,
            'delete'
          );
        }
        else if(this.newSphere.fresh === false){
          
          if(afterConfirm === undefined){
            this.whichToConfirm = which;

            this.menu.showWarningDialog({
              'message':'Your changes will be automatically saved. Are you sure you want to proceed?'
            });
            return;
          }  
          else{ 
            this.motifsAtoms.push(this.newSphere);
            
            this.updateAtomList(
              this.newSphere.object3d.position.clone(), 
              this.newSphere.getID(), 
              this.newSphere.getRadius(),  
              this.newSphere.elementName,
              'edit',
              'bg-light-gray',
              this.newSphere.tangentParent,
              this.newSphere.color,
              this.newSphere.ionicIndex
            );
             
            this.newSphere.blinkMode(false);
            this.newSphere = undefined ;
            this.dragMode = false; 
            doNotDestroy = true;
          }
        }
      }
      if(this.newSphere !== undefined){
        this.menu.highlightAtomEntry({id : this.newSphere.getID(), color : 'bg-light-gray'});
      } 
      this.menu.highlightAtomEntry({id : which, color : 'bg-light-purple'}); 

      var name,color, opacity;
      
      if(!_.isUndefined(this.newSphere) && doNotDestroy === false) { 
        this.newSphere.destroy() ;  
        this.removeFromUnitCell(this.newSphere.getID());
        this.initVolumeState();
      }
       
      this.newSphere = _.find(_this.motifsAtoms, function(atom){ return atom.getID() == which; });
      this.newSphere.fresh = false;

      var pos = {x : undefined, y : undefined, z : undefined};

      if(this.editorState.atomPosMode === 'relative'){   

        pos = new THREE.Vector3(this.newSphere.uiRelPosition.x, this.newSphere.uiRelPosition.y, this.newSphere.uiRelPosition.z);;
      
      }
      else{
        pos.x = this.newSphere.object3d.position.x;
        pos.y = this.newSphere.object3d.position.y;
        pos.z = this.newSphere.object3d.position.z;
      }
       
      this.menu.setSliderValue('atomPosZ',  (pos.z).toFixed(10));  
      this.menu.setSliderValue('atomPosX',  (pos.x).toFixed(10));
      this.menu.setSliderValue('atomPosY',  (pos.y).toFixed(10));

      _.each(_this.motifsAtoms, function(atom, r) { 
        if(atom.getID() === which) { 
          _this.motifsAtoms.splice(r,1);
        }
      });   

      // drag mode restore
 
      if(this.newSphere.tangentParent !== undefined){
        this.setDraggableAtom({'dragMode': true, 'parentId': this.newSphere.tangentParent}, true);
      } 

      if(doNotChangeState === undefined){ 
        PubSub.publish(events.EDITOR_STATE,{ 'state' : 'editing', 'ionicIndex' : this.newSphere.ionicIndex,'atomName' : this.newSphere.getName(), 'atomPos' : pos, 'opacity' : this.newSphere.opacity*10, 'atomColor' : this.newSphere.color });
      }
    } 
  };
  Motifeditor.prototype.configureCellPoints = function(manual){  
  
    var _this = this;  
 
    if(this.isEmpty) {
      return; 
    }
    
    this.cellNeedsRecalculation = {'cellSolidVoid' : true, 'cellSubstracted' : true};

    if(this.viewMode !== 'cellClassic' ){ 
      this.setCSGmode({mode : 'cellClassic'} , 'reset', 'reconstruct');
      this.menu.chooseActiveUnitCellMode('cellClassic');
    } 

    var dimensions; 

    if( (!this.padlock && this.globalTangency === false) || (manual !== undefined)){   
      dimensions = {"xDim" : this.cellParameters.scaleX, "yDim" : this.cellParameters.scaleY, "zDim" : this.cellParameters.scaleZ };
    } 
    else{ 
      if(this.newSphere === undefined || this.newSphere.object3d === undefined){ 
        dimensions = this.findMotifsDimensions(undefined, undefined);  
      }
      else{ 
        dimensions = this.findMotifsDimensions(this.newSphere.object3d.position, this.newSphere.getRadius());   
      }
    } 

    this.revertShearing();
      
    if(this.latticeName !== 'hexagonal') {
      this.cellPointsWithScaling({xDim : 1, yDim : 1, zDim : 1}, false, manual); 
    } 
 
    this.cellPointsWithScaling(dimensions, true, manual); // todo fix that true  
     
    if(this.latticeName !== 'hexagonal'){

      this.cellPointsWithAngles();
     
      // reposition cell atoms after changing unitCellPositions
      switch(this.latticeType) {
        case "primitive":  // primitive  
          _.times(2 , function(_x) {
            _.times(2 , function(_y) {
              _.times(2 , function(_z) {  
                for (var i = _this.unitCellAtoms.length - 1; i >= 0; i--) {  
                  if(_this.unitCellAtoms[i].latticeIndex === ("_"+_x+_y+_z)  && _this.unitCellAtoms[i].temp === undefined ){  
                    var offset = _this.unitCellAtoms[i].getUserOffset(); 
                    if(!_.isUndefined(_this.unitCellAtoms[i].object3d)){ 
                      _this.unitCellAtoms[i].object3d.position.set( 
                        _this.unitCellPositions["_"+_x+_y+_z].position.x + offset.x , 
                        _this.unitCellPositions["_"+_x+_y+_z].position.y + offset.y , 
                        _this.unitCellPositions["_"+_x+_y+_z].position.z + offset.z 
                      );
                    } 
                  } 
                }   
              });
            });
          }); 
          break;
        case "face":   
          _.times(2 , function(_x) {
            _.times(2 , function(_y) {
              _.times(2 , function(_z) { 
                _.each(_this.unitCellAtoms, function(a, i) { 
                  if(a.latticeIndex === ("_"+_x+_y+_z)  && a.temp === undefined ){ 
 
                    var offset = a.getUserOffset();
                    
                    if(!_.isUndefined(a.object3d)){ 

                      a.object3d.position.set( 
                        _this.unitCellPositions["_"+_x+_y+_z].position.x + offset.x , 
                        _this.unitCellPositions["_"+_x+_y+_z].position.y + offset.y , 
                        _this.unitCellPositions["_"+_x+_y+_z].position.z + offset.z 
                      );
                    } 
                  } 
                });
              });
            });
          }); 
          for (var i = 0; i <= 1; i ++) {  
            for (var j = _this.unitCellAtoms.length - 1; j >= 0; j--) {
              if(  _this.unitCellAtoms[j].temp === undefined ){ 
                if(_this.unitCellAtoms[j].latticeIndex === ("_"+i) ){  
                  var offset = _this.unitCellAtoms[j].getUserOffset(); 
                  if(!_.isUndefined(_this.unitCellAtoms[j].object3d)){ 
                    _this.unitCellAtoms[j].object3d.position.set( 
                      _this.unitCellPositions["_"+i].position.x + offset.x , 
                      _this.unitCellPositions["_"+i].position.y + offset.y , 
                      _this.unitCellPositions["_"+i].position.z + offset.z 
                    );
                  }  
                }  
                if(_this.unitCellAtoms[j].latticeIndex === ("__"+i) ){  
                  var offset = _this.unitCellAtoms[j].getUserOffset(); 
                  if(!_.isUndefined(_this.unitCellAtoms[j].object3d)){ 
                    _this.unitCellAtoms[j].object3d.position.set( 
                      _this.unitCellPositions["__"+i].position.x + offset.x , 
                      _this.unitCellPositions["__"+i].position.y + offset.y , 
                      _this.unitCellPositions["__"+i].position.z + offset.z 
                    );
                  }  
                } 
                if(_this.unitCellAtoms[j].latticeIndex === ("___"+i) ){  
                  var offset = _this.unitCellAtoms[j].getUserOffset(); 
                  if(!_.isUndefined(_this.unitCellAtoms[j].object3d)){ 
                    _this.unitCellAtoms[j].object3d.position.set( 
                      _this.unitCellPositions["___"+i].position.x + offset.x , 
                      _this.unitCellPositions["___"+i].position.y + offset.y , 
                      _this.unitCellPositions["___"+i].position.z + offset.z 
                    );
                  }  
                }  
              }  
            }
          };
          // additional atoms for view modes 
          var j = 0;
          
          while(j <_this.cachedAtoms.length) {
            for ( var i = 0; i < 4; i ++ ) {  
               
              if(_this.cachedAtoms[j].latticeIndex === ("face"+i+'_1') ){
                var offset = _this.cachedAtoms[j].getUserOffset(); 
                if(!_.isUndefined(_this.cachedAtoms[j].object3d)){ 
                  _this.cachedAtoms[j].object3d.position.set( 
                    _this.cachedAtomsPositions["face"+i+'_1'].position.x + offset.x , 
                    _this.cachedAtomsPositions["face"+i+'_1'].position.y + offset.y , 
                    _this.cachedAtomsPositions["face"+i+'_1'].position.z + offset.z 
                  );
                }
              }
              else if(_this.cachedAtoms[j].latticeIndex === ("face"+i+'_2') ){
                var offset = _this.cachedAtoms[j].getUserOffset(); 
                if(!_.isUndefined(_this.cachedAtoms[j].object3d)){ 
                  _this.cachedAtoms[j].object3d.position.set( 
                    _this.cachedAtomsPositions["face"+i+'_2'].position.x + offset.x , 
                    _this.cachedAtomsPositions["face"+i+'_2'].position.y + offset.y , 
                    _this.cachedAtomsPositions["face"+i+'_2'].position.z + offset.z 
                  );
                }
              }
              else if(_this.cachedAtoms[j].latticeIndex === ("face"+i+'_3') ){
                var offset = _this.cachedAtoms[j].getUserOffset(); 
                if(!_.isUndefined(_this.cachedAtoms[j].object3d)){ 
                  _this.cachedAtoms[j].object3d.position.set( 
                    _this.cachedAtomsPositions["face"+i+'_3'].position.x + offset.x , 
                    _this.cachedAtomsPositions["face"+i+'_3'].position.y + offset.y , 
                    _this.cachedAtomsPositions["face"+i+'_3'].position.z + offset.z 
                  );
                }
              }
              else if(_this.cachedAtoms[j].latticeIndex === ("face"+i+'_4') ){
                var offset = _this.cachedAtoms[j].getUserOffset(); 
                if(!_.isUndefined(_this.cachedAtoms[j].object3d)){ 
                  _this.cachedAtoms[j].object3d.position.set( 
                    _this.cachedAtomsPositions["face"+i+'_4'].position.x + offset.x , 
                    _this.cachedAtomsPositions["face"+i+'_4'].position.y + offset.y , 
                    _this.cachedAtomsPositions["face"+i+'_4'].position.z + offset.z 
                  );
                }
              }
              else if(_this.cachedAtoms[j].latticeIndex === ("face"+i+'_5') ){
                var offset = _this.cachedAtoms[j].getUserOffset(); 
                if(!_.isUndefined(_this.cachedAtoms[j].object3d)){ 
                  _this.cachedAtoms[j].object3d.position.set( 
                    _this.cachedAtomsPositions["face"+i+'_5'].position.x + offset.x , 
                    _this.cachedAtomsPositions["face"+i+'_5'].position.y + offset.y , 
                    _this.cachedAtomsPositions["face"+i+'_5'].position.z + offset.z 
                  );
                }
              }
              else if(_this.cachedAtoms[j].latticeIndex === ("face"+i+'_6') ){
                var offset = _this.cachedAtoms[j].getUserOffset(); 
                if(!_.isUndefined(_this.cachedAtoms[j].object3d)){ 
                  _this.cachedAtoms[j].object3d.position.set( 
                    _this.cachedAtomsPositions["face"+i+'_6'].position.x + offset.x , 
                    _this.cachedAtomsPositions["face"+i+'_6'].position.y + offset.y , 
                    _this.cachedAtomsPositions["face"+i+'_6'].position.z + offset.z 
                  );
                }
              } 
                
            }
            j++;
          }
          break;
        case "body":  
          _.times(2 , function(_x) {
            _.times(2 , function(_y) {
              _.times(2 , function(_z) { 
                for (var i = _this.unitCellAtoms.length - 1; i >= 0; i--) {  
                  if(_this.unitCellAtoms[i].latticeIndex === ("_"+_x+_y+_z) && _this.unitCellAtoms[i].temp === undefined ){  
                    var offset = _this.unitCellAtoms[i].getUserOffset();
                    if(!_.isUndefined(_this.unitCellAtoms[i].object3d)){ 
                      _this.unitCellAtoms[i].object3d.position.set( 
                        _this.unitCellPositions["_"+_x+_y+_z].position.x + offset.x , 
                        _this.unitCellPositions["_"+_x+_y+_z].position.y + offset.y , 
                        _this.unitCellPositions["_"+_x+_y+_z].position.z + offset.z 
                      );
                    } 
                  } 
                }   
              });
            });
          }); 
          for (var i = _this.unitCellAtoms.length - 1; i >= 0; i--) {  
            if(_this.unitCellAtoms[i].latticeIndex === ("_c")  && _this.unitCellAtoms[i].temp === undefined ){  
              var offset = _this.unitCellAtoms[i].getUserOffset();
              if(!_.isUndefined(_this.unitCellAtoms[i].object3d)){ 
                _this.unitCellAtoms[i].object3d.position.set( 
                  _this.unitCellPositions["_c"].position.x + offset.x , 
                  _this.unitCellPositions["_c"].position.y + offset.y , 
                  _this.unitCellPositions["_c"].position.z + offset.z 
                );
              } 
            } 
          }  

          // additional atoms for view modes 
          var j = 0;
          
          while(j <_this.cachedAtoms.length) {
            for ( var i = 0; i < 4; i ++ ) {   
              if(_this.cachedAtoms[j].latticeIndex === ("body"+i+'_1') ){
                var offset = _this.cachedAtoms[j].getUserOffset(); 
                if(!_.isUndefined(_this.cachedAtoms[j].object3d)){ 
                  _this.cachedAtoms[j].object3d.position.set( 
                    _this.cachedAtomsPositions["body"+i+'_1'].position.x + offset.x , 
                    _this.cachedAtomsPositions["body"+i+'_1'].position.y + offset.y , 
                    _this.cachedAtomsPositions["body"+i+'_1'].position.z + offset.z 
                  );
                }
              } 
            }  
            
            if(_this.cachedAtoms[j].latticeIndex === ('body_1') ){
              var offset = _this.cachedAtoms[j].getUserOffset(); 
              if(!_.isUndefined(_this.cachedAtoms[j].object3d)){ 
                _this.cachedAtoms[j].object3d.position.set( 
                  _this.cachedAtomsPositions['body_1'].position.x + offset.x , 
                  _this.cachedAtomsPositions['body_1'].position.y + offset.y , 
                  _this.cachedAtomsPositions['body_1'].position.z + offset.z 
                );
              }
            }
            if(_this.cachedAtoms[j].latticeIndex === ('body_2') ){
              var offset = _this.cachedAtoms[j].getUserOffset(); 
              if(!_.isUndefined(_this.cachedAtoms[j].object3d)){ 
                _this.cachedAtoms[j].object3d.position.set( 
                  _this.cachedAtomsPositions['body_2'].position.x + offset.x , 
                  _this.cachedAtomsPositions['body_2'].position.y + offset.y , 
                  _this.cachedAtomsPositions['body_2'].position.z + offset.z 
                );
              }
            }
             
            j++;
          }
          break;
        case "base":   
          _.times(2 , function(_x) {
            _.times(2 , function(_y) {
              _.times(2 , function(_z) {
                for (var i = _this.unitCellAtoms.length - 1; i >= 0; i--) {  
                  if(_this.unitCellAtoms[i].latticeIndex === ("_"+_x+_y+_z) && _this.unitCellAtoms[i].temp === undefined ){  
                    var offset = _this.unitCellAtoms[i].getUserOffset();
                    if(!_.isUndefined(_this.unitCellAtoms[i].object3d)){ 
                      _this.unitCellAtoms[i].object3d.position.set( 
                        _this.unitCellPositions["_"+_x+_y+_z].position.x + offset.x , 
                        _this.unitCellPositions["_"+_x+_y+_z].position.y + offset.y , 
                        _this.unitCellPositions["_"+_x+_y+_z].position.z + offset.z 
                      );
                    } 
                  } 
                } 
              });
            });
          });   
          for (var j = _this.unitCellAtoms.length - 1; j >= 0; j--) {
            if(_this.unitCellAtoms[j].latticeIndex === ("_up")  && _this.unitCellAtoms[j].temp === undefined){  
              var offset = _this.unitCellAtoms[j].getUserOffset(); 
              if(!_.isUndefined(_this.unitCellAtoms[j].object3d)){ 
                _this.unitCellAtoms[j].object3d.position.set( 
                  _this.unitCellPositions["_up"].position.x + offset.x , 
                  _this.unitCellPositions["_up"].position.y + offset.y , 
                  _this.unitCellPositions["_up"].position.z + offset.z 
                );
              }  
            } 
            if(_this.unitCellAtoms[j].latticeIndex === ("_down") && _this.unitCellAtoms[j].temp === undefined ){  
              var offset = _this.unitCellAtoms[j].getUserOffset(); 
              if(!_.isUndefined(_this.unitCellAtoms[j].object3d)){ 
                _this.unitCellAtoms[j].object3d.position.set( 
                  _this.unitCellPositions["_down"].position.x + offset.x , 
                  _this.unitCellPositions["_down"].position.y + offset.y , 
                  _this.unitCellPositions["_down"].position.z + offset.z 
                );
              }  
            }  
          }

          // additional atoms for view modes 
          var j = 0;
 
          while(j <_this.cachedAtoms.length) { 
            for ( var i = 0; i < 4; i ++ ) {  
              if(_this.cachedAtoms[j].latticeIndex === ("base"+i+'_1') ){
                var offset = _this.cachedAtoms[j].getUserOffset(); 
                if(!_.isUndefined(_this.cachedAtoms[j].object3d)){ 
                  _this.cachedAtoms[j].object3d.position.set( 
                    _this.cachedAtomsPositions["base"+i+'_1'].position.x + offset.x , 
                    _this.cachedAtomsPositions["base"+i+'_1'].position.y + offset.y , 
                    _this.cachedAtomsPositions["base"+i+'_1'].position.z + offset.z 
                  );
                }
              }
              else if(_this.cachedAtoms[j].latticeIndex === ("base"+i+'_2') ){
                var offset = _this.cachedAtoms[j].getUserOffset(); 
                if(!_.isUndefined(_this.cachedAtoms[j].object3d)){ 
                  _this.cachedAtoms[j].object3d.position.set( 
                    _this.cachedAtomsPositions["base"+i+'_2'].position.x + offset.x , 
                    _this.cachedAtomsPositions["base"+i+'_2'].position.y + offset.y , 
                    _this.cachedAtomsPositions["base"+i+'_2'].position.z + offset.z 
                  );
                }
              }  
            }
            j++;
          }
          break;
      }
    } 
    else{
      var a = _this.cellParameters.scaleZ ;
      var c = _this.cellParameters.scaleY ; 

      var vertDist = a*Math.sqrt(3);

      _.times(2, function(_y) {
        _.times(1 , function(_x) {
          _.times(1 , function(_z) { 
            _.times(6 , function(_r) {
              for (var i = _this.unitCellAtoms.length - 1; i >= 0; i--) {  
                var v = new THREE.Vector3( a, 0, 0 );

                var axis = new THREE.Vector3( 0, 1, 0 );
                var angle = (Math.PI / 3) * _r ; 
                v.applyAxisAngle( axis, angle );

                var z = (_x % 2==0) ? (v.z + _z*vertDist) : ((v.z + _z*vertDist + vertDist/2));
                var y =  v.y + _y*c ;
                var x = v.x + _x*a*1.5 ;
                var zC = (_x % 2==0) ? (_z*vertDist) : (( _z*vertDist + vertDist/2));
                var yC =  _y*c ;
                var xC =  _x*a*1.5 ;
                var position = new THREE.Vector3( x, y, z);  
                var positionC = new THREE.Vector3( xC, yC, zC);  

                var reference = 'h_'+_x+_y+_z+_r ;
                var referenceC = 'hc_'+_x+_y+_z ;

                if(_this.unitCellAtoms[i].latticeIndex === (reference) && _this.unitCellAtoms[i].temp === undefined  ){  
                  var offset = _this.unitCellAtoms[i].getUserOffset();
                  if(!_.isUndefined(_this.unitCellAtoms[i].object3d)){ 
                    _this.unitCellAtoms[i].object3d.position.set( 
                      position.x + offset.x , 
                      position.y + offset.y , 
                      position.z + offset.z 
                    );
                  } 
                } 
                if(_this.unitCellAtoms[i].latticeIndex === (referenceC) && _this.unitCellAtoms[i].temp === undefined  ){  
                  var offset = _this.unitCellAtoms[i].getUserOffset();
                  if(!_.isUndefined(_this.unitCellAtoms[i].object3d)){ 
                    _this.unitCellAtoms[i].object3d.position.set( 
                      positionC.x + offset.x , 
                      positionC.y + offset.y , 
                      positionC.z + offset.z 
                    );
                  } 
                }  
              }    
            });
          });
        });
      });
      
      _.times(2, function(_y) {
        _.times(1 , function(_x) {
          _.times(1 , function(_z) { 
            _.times(6 , function(_r) {
              for (var i = _this.cachedAtoms.length - 1; i >= 0; i--) {  
                var v = new THREE.Vector3( a* Math.sqrt(3), 0, 0 );

                var axis = new THREE.Vector3( 0, 1, 0 );
                var angle = (Math.PI / 3) * _r + Math.PI/6; 
                v.applyAxisAngle( axis, angle );

                var z = (_x % 2==0) ? (v.z + _z*vertDist) : ((v.z + _z*vertDist + vertDist/2));
                var y =  v.y + _y*c ;
                var x = v.x + _x*a*1.5 ;
                var zC = (_x % 2==0) ? (_z*vertDist) : (( _z*vertDist + vertDist/2));
                var yC =  _y*c ;
                var xC =  _x*a*1.5 ;
                var pos = new THREE.Vector3( x, y, z);   

                var reference = 'h_'+_x+_y+_z+_r;  
               
                if(_this.cachedAtoms[i].latticeIndex === (reference)  ){   
                  var offset = _this.cachedAtoms[i].getUserOffset();
                  if(!_.isUndefined(_this.cachedAtoms[i].object3d)){ 
                    _this.cachedAtoms[i].object3d.position.set( 
                      pos.x + offset.x, 
                      pos.y + offset.y, 
                      pos.z + offset.z  
                    );
                  } 
                }
              }
            });
          });
        });
      });
      
      for (var i = _this.cachedAtoms.length - 1; i >= 0; i--) {
  
        if(_this.cachedAtoms[i].latticeIndex === ('h_c_up')  ){   
          var offset = _this.cachedAtoms[i].getUserOffset();
          if(!_.isUndefined(_this.cachedAtoms[i].object3d)){ 
            _this.cachedAtoms[i].object3d.position.set( 
              offset.x , 
              offset.y + _this.cellParameters.scaleY*2 , 
              offset.z
            );
          } 
        }

        if(_this.cachedAtoms[i].latticeIndex === ('h_c_down')  ){   
          var offset = _this.cachedAtoms[i].getUserOffset();
          if(!_.isUndefined(_this.cachedAtoms[i].object3d)){ 
            _this.cachedAtoms[i].object3d.position.set( 
              offset.x , 
              offset.y + _this.cellParameters.scaleY*-1 , 
              offset.z
            );
          } 
        }
      }
    }   
  };
  Motifeditor.prototype.addAtomInCell = function(pos, radius, color, name, id, opacity, wireframe, restore, ionicIndex){  
    var _this = this;  
    var dimensions, identity ;
   
    this.menu.setLatticeCollision({ scaleX: false, scaleY: false,  scaleZ: false  });
    this.snapData.snapVal = { 'aScale' : undefined,  'bScale' : undefined,  'cScale' : undefined};
 
    if( (!this.padlock && this.globalTangency === false) && _.isUndefined(restore)){
      dimensions = {"xDim" : this.cellParameters.scaleX, "yDim" : this.cellParameters.scaleY, "zDim" : this.cellParameters.scaleZ };
    } 
    else if(_.isUndefined(restore)){ 
      dimensions = this.findMotifsDimensions(pos, radius); // calculate dimensions of cell 
    }
      
    if(_.isUndefined(restore)) {
      this.cellPointsWithScaling(dimensions, true); // todo fix that true  
      this.cellPointsWithAngles();
    }
      
    this.box3.pos = pos;

    function createHelperObj(pos, radius, latticeIndex, x, y, z){
      var o = 
      { 
        "object3d" : {
          "position" : new THREE.Vector3(x,y,z)
        }, 
        'temp' : true,
        getRadius: function() { return radius; },
        'latticeIndex': latticeIndex, 
        "userOffset" : { 
          "x": pos.x, 
          "y": pos.y, 
          "z": pos.z
        }
      }; 
      return o; 
    } 
    
    if(this.latticeName !== 'hexagonal'){ 
      switch(_this.latticeType) {
        case "primitive":  // primitive  
          _.times(2 , function(_x) {
            _.times(2 , function(_y) {
              _.times(2 , function(_z) { 
                identity = "_"+_x+_y+_z; 
                _this.unitCellAtoms.push(
                  createHelperObj(
                    pos,
                    radius, 
                    identity, 
                    pos.x + _this.unitCellPositions[identity].position.x, 
                    pos.y + _this.unitCellPositions[identity].position.y, 
                    pos.z + _this.unitCellPositions[identity].position.z
                  )
                );  
             });
            });
          }); 
          break;
        case "face":   
          _.times(2 , function(_x) {
            _.times(2 , function(_y) {
              _.times(2 , function(_z) { 
                identity = "_"+_x+_y+_z; 
                _this.unitCellAtoms.push(
                  createHelperObj(
                    pos, 
                    radius, 
                    identity, 
                    pos.x + _this.unitCellPositions[identity].position.x, 
                    pos.y + _this.unitCellPositions[identity].position.y, 
                    pos.z + _this.unitCellPositions[identity].position.z
                  )
                ); 
              });
            });
          }); 
          for (var i = 0; i <= 1; i ++) {
            identity = "_"+i ; 
            _this.unitCellAtoms.push(
              createHelperObj(
                pos, 
                radius, 
                identity, 
                pos.x + _this.unitCellPositions[identity].position.x, 
                pos.y + _this.unitCellPositions[identity].position.y, 
                pos.z + _this.unitCellPositions[identity].position.z
              )
            );

            /////////////////
            identity = "__"+i ; 
            _this.unitCellAtoms.push(
              createHelperObj(
                pos, 
                radius, 
                identity, 
                pos.x + _this.unitCellPositions[identity].position.x, 
                pos.y + _this.unitCellPositions[identity].position.y, 
                pos.z + _this.unitCellPositions[identity].position.z
              )
            );

            ////////////////

            identity = "___"+i ; 
            _this.unitCellAtoms.push(
              createHelperObj(
                pos, 
                radius, 
                identity, 
                pos.x + _this.unitCellPositions[identity].position.x, 
                pos.y + _this.unitCellPositions[identity].position.y, 
                pos.z + _this.unitCellPositions[identity].position.z
              )
            );
          };
          break;
        case "body":  
          _.times(2 , function(_x) {
            _.times(2 , function(_y) {
              _.times(2 , function(_z) {   
                
                identity = "_"+_x+_y+_z ; 
                _this.unitCellAtoms.push(
                  createHelperObj(
                    pos, 
                    radius, 
                    identity, 
                    pos.x + _this.unitCellPositions[identity].position.x, 
                    pos.y + _this.unitCellPositions[identity].position.y, 
                    pos.z + _this.unitCellPositions[identity].position.z
                  )
                );

              });
            });
          });

          identity = "_c" ; 
          _this.unitCellAtoms.push(
            createHelperObj(
              pos, 
              radius, 
              identity, 
              pos.x + _this.unitCellPositions[identity].position.x, 
              pos.y + _this.unitCellPositions[identity].position.y, 
              pos.z + _this.unitCellPositions[identity].position.z
            )
          );

          break;
        case "base":  
          _.times(2 , function(_x) {
            _.times(2 , function(_y) {
              _.times(2 , function(_z) { 
                identity = "_"+_x+_y+_z; 
                _this.unitCellAtoms.push(
                  createHelperObj(
                    pos, 
                    radius, 
                    identity, 
                    pos.x + _this.unitCellPositions[identity].position.x, 
                    pos.y + _this.unitCellPositions[identity].position.y, 
                    pos.z + _this.unitCellPositions[identity].position.z
                  )
                ); 
              });
            });
          }); 
          
          identity = "_up"; 
          _this.unitCellAtoms.push(
            createHelperObj(
              pos, 
              radius, 
              identity, 
              pos.x + _this.unitCellPositions[identity].position.x, 
              pos.y + _this.unitCellPositions[identity].position.y, 
              pos.z + _this.unitCellPositions[identity].position.z
            )
          );

          /////

          identity = "_down" ; 
          _this.unitCellAtoms.push(
            createHelperObj(
              pos, 
              radius, 
              identity, 
              pos.x + _this.unitCellPositions[identity].position.x, 
              pos.y + _this.unitCellPositions[identity].position.y, 
              pos.z + _this.unitCellPositions[identity].position.z
            )
          );
   
          break;
      }
    }
    else{  
      
      var a = _this.cellParameters.scaleZ ;
      var c = _this.cellParameters.scaleY ; 

      var vertDist = a*Math.sqrt(3);

      _.times(2, function(_y) {
        _.times(1 , function(_x) {
          _.times(1 , function(_z) {  
            var y =  _y*c ;  
            _this.unitCellAtoms.push(  
              createHelperObj(
                pos,
                radius, 
                'hc_'+_x+_y+_z, 
                pos.x , 
                pos.y + y, 
                pos.z 
              ) 
            );  
                
            _.times(6 , function(_r) {

              var v = new THREE.Vector3( a, 0, 0 );

              var axis = new THREE.Vector3( 0, 1, 0 );
              var angle = (Math.PI / 3) * _r ; 
              v.applyAxisAngle( axis, angle );

              var z = (_x % 2==0) ? (v.z + _z*vertDist) : ((v.z + _z*vertDist + vertDist/2));
              var y =  v.y + _y*c ;
              var x = v.x + _x*a*1.5 ;
                
              var position = new THREE.Vector3( x, y, z); 

              var reference = 'h_'+_x+_y+_z+_r ;
              
              _this.unitCellAtoms.push( 
                createHelperObj(
                  pos,
                  radius, 
                  reference, 
                  pos.x + position.x, 
                  pos.y + position.y, 
                  pos.z + position.z
                )  
              );  
 
            });
          });
        });
      });   
    }
 
    this.reconstructCellPoints(restore);  
    
    if(this.padlock === true || this.globalTangency === true){

      this.leastVolume(restore);  

      this.cellVolume.xInitVal = this.cellParameters.scaleX;
      this.cellVolume.yInitVal = this.cellParameters.scaleY;
      this.cellVolume.zInitVal = this.cellParameters.scaleZ;
    }
    
    if(this.latticeName !== 'hexagonal'){ 
      switch(_this.latticeType) {
        case "primitive":  // primitive  
          _.times(2 , function(_x) {
            _.times(2 , function(_y) {
              _.times(2 , function(_z) { 
                identity = "_"+_x+_y+_z;
                 
                _this.unitCellAtoms.push(
                  new UnitCellAtom( 
                    _this.LOD.level, 
                    new THREE.Vector3(
                      pos.x + _this.unitCellPositions[identity].position.x, 
                      pos.y + _this.unitCellPositions[identity].position.y, 
                      pos.z + _this.unitCellPositions[identity].position.z
                    ), 
                    radius, 
                    color, 
                    true, 
                    name, 
                    id, 
                    identity,
                    opacity,
                    _this.renderingMode,
                    ionicIndex,
                    _this.labeling
                  ) 
                ); 

                _this.unitCellAtoms[_this.unitCellAtoms.length-1].setUserOffset("x",pos.x );
                _this.unitCellAtoms[_this.unitCellAtoms.length-1].setUserOffset("y",pos.y );
                _this.unitCellAtoms[_this.unitCellAtoms.length-1].setUserOffset("z",pos.z );
  
             });
            });
          });

          break;
        case "face":   
          _.times(2 , function(_x) {
            _.times(2 , function(_y) {
              _.times(2 , function(_z) {
                identity = "_"+_x+_y+_z;
                _this.unitCellAtoms.push(
                  new UnitCellAtom( 
                    _this.LOD.level, 
                    new THREE.Vector3(
                      pos.x + _this.unitCellPositions[identity].position.x, 
                      pos.y + _this.unitCellPositions[identity].position.y, 
                      pos.z + _this.unitCellPositions[identity].position.z
                    ), 
                    radius, 
                    color, 
                    true, 
                    name, 
                    id,  
                    identity, 
                    opacity,
                    _this.renderingMode,
                    ionicIndex,
                    _this.labeling
                  ) 
                ); 
                _this.unitCellAtoms[_this.unitCellAtoms.length-1].setUserOffset("x",pos.x );
                _this.unitCellAtoms[_this.unitCellAtoms.length-1].setUserOffset("y",pos.y );
                _this.unitCellAtoms[_this.unitCellAtoms.length-1].setUserOffset("z",pos.z );
 
              });
            });
          }); 
          for (var i = 0; i <= 1; i ++) {
            identity = "_"+i ;
            _this.unitCellAtoms.push(new UnitCellAtom( _this.LOD.level, 
                new THREE.Vector3(
                  pos.x + _this.unitCellPositions[identity].position.x, 
                  pos.y + _this.unitCellPositions[identity].position.y, 
                  pos.z + _this.unitCellPositions[identity].position.z
                ), 
                radius, 
                color, 
                true, 
                name, 
                id,
                identity, 
                opacity, 
                _this.renderingMode,
                ionicIndex,
                _this.labeling
              ) 
            ); 
            _this.unitCellAtoms[_this.unitCellAtoms.length-1].setUserOffset("x",pos.x );
            _this.unitCellAtoms[_this.unitCellAtoms.length-1].setUserOffset("y",pos.y );
            _this.unitCellAtoms[_this.unitCellAtoms.length-1].setUserOffset("z",pos.z );
 
            /////////////////
            identity = "__"+i ;
            _this.unitCellAtoms.push(
                new UnitCellAtom( _this.LOD.level, 
                  new THREE.Vector3(
                  pos.x + _this.unitCellPositions["__"+i].position.x, 
                  pos.y + _this.unitCellPositions["__"+i].position.y, 
                  pos.z + _this.unitCellPositions["__"+i].position.z
                ), 
                radius,
                color, 
                true, 
                name, 
                id,
                "__"+i, 
                opacity,
                _this.renderingMode,
                ionicIndex,
                _this.labeling
              ) 
            ); 
            _this.unitCellAtoms[_this.unitCellAtoms.length-1].setUserOffset("x",pos.x );
            _this.unitCellAtoms[_this.unitCellAtoms.length-1].setUserOffset("y",pos.y );
            _this.unitCellAtoms[_this.unitCellAtoms.length-1].setUserOffset("z",pos.z );
  
            ////////////////

            identity = "___"+i ;
            _this.unitCellAtoms.push(
              new UnitCellAtom( _this.LOD.level, 
                new THREE.Vector3(
                  pos.x + _this.unitCellPositions["___"+i].position.x, 
                  pos.y + _this.unitCellPositions["___"+i].position.y, 
                  pos.z + _this.unitCellPositions["___"+i].position.z), 
                radius, 
                color, 
                true, 
                name, 
                id, 
                "___"+i, 
                opacity,
                _this.renderingMode,
                ionicIndex,
                _this.labeling
              ) 
            ); 
            _this.unitCellAtoms[_this.unitCellAtoms.length-1].setUserOffset("x",pos.x );
            _this.unitCellAtoms[_this.unitCellAtoms.length-1].setUserOffset("y",pos.y );
            _this.unitCellAtoms[_this.unitCellAtoms.length-1].setUserOffset("z",pos.z ); 
 
          };
          break;
        case "body":  
          _.times(2 , function(_x) {
            _.times(2 , function(_y) {
              _.times(2 , function(_z) {   
                
                identity = "_"+_x+_y+_z ;
                _this.unitCellAtoms.push(
                    new UnitCellAtom( _this.LOD.level, 
                      new THREE.Vector3(
                      pos.x + _this.unitCellPositions[identity].position.x, 
                      pos.y + _this.unitCellPositions[identity].position.y, 
                      pos.z + _this.unitCellPositions[identity].position.z), 
                    radius, 
                    color, 
                    true, 
                    name, 
                    id,
                    identity, 
                    opacity,
                    _this.renderingMode,
                    ionicIndex,
                    _this.labeling
                  ) 
                ); 
                _this.unitCellAtoms[_this.unitCellAtoms.length-1].setUserOffset("x",pos.x );
                _this.unitCellAtoms[_this.unitCellAtoms.length-1].setUserOffset("y",pos.y );
                _this.unitCellAtoms[_this.unitCellAtoms.length-1].setUserOffset("z",pos.z );
 
              });
            });
          });

          identity = "_c" ;
          _this.unitCellAtoms.push(
            new UnitCellAtom( _this.LOD.level, 
              new THREE.Vector3(
                pos.x + _this.unitCellPositions[identity].position.x, 
                pos.y + _this.unitCellPositions[identity].position.y, 
                pos.z + _this.unitCellPositions[identity].position.z), 
              radius, 
              color, 
              true, 
              name, 
              id,
              identity, 
              opacity,
              _this.renderingMode,
              ionicIndex,
              _this.labeling
            ) 
          ); 
          _this.unitCellAtoms[_this.unitCellAtoms.length-1].setUserOffset("x",pos.x );
          _this.unitCellAtoms[_this.unitCellAtoms.length-1].setUserOffset("y",pos.y );
          _this.unitCellAtoms[_this.unitCellAtoms.length-1].setUserOffset("z",pos.z ); 
 
          break;
        case "base":  
          _.times(2 , function(_x) {
            _.times(2 , function(_y) {
              _.times(2 , function(_z) {

                identity = "_"+_x+_y+_z;
                _this.unitCellAtoms.push(
                  new UnitCellAtom( 
                    _this.LOD.level, 
                    new THREE.Vector3(
                      pos.x + _this.unitCellPositions[identity].position.x, 
                      pos.y + _this.unitCellPositions[identity].position.y, 
                      pos.z + _this.unitCellPositions[identity].position.z), 
                    radius, 
                    color, 
                    true, 
                    name, 
                    id,
                    identity, 
                    opacity,
                    _this.renderingMode,
                    ionicIndex,
                    _this.labeling
                  ) 
                ); 
                _this.unitCellAtoms[_this.unitCellAtoms.length-1].setUserOffset("x",pos.x );
                _this.unitCellAtoms[_this.unitCellAtoms.length-1].setUserOffset("y",pos.y );
                _this.unitCellAtoms[_this.unitCellAtoms.length-1].setUserOffset("z",pos.z );
 
              });
            });
          }); 
          
          identity = "_up";
          _this.unitCellAtoms.push(
            new UnitCellAtom( 
              _this.LOD.level, 
              new THREE.Vector3(
                pos.x + _this.unitCellPositions[identity].position.x, 
                pos.y + _this.unitCellPositions[identity].position.y, 
                pos.z + _this.unitCellPositions[identity].position.z), 
              radius, 
              color, 
              true, 
              name, 
              id, 
              identity, 
              opacity,
              _this.renderingMode,
              ionicIndex,
              _this.labeling
            ) 
          ); 
          _this.unitCellAtoms[_this.unitCellAtoms.length-1].setUserOffset("x",pos.x );
          _this.unitCellAtoms[_this.unitCellAtoms.length-1].setUserOffset("y",pos.y );
          _this.unitCellAtoms[_this.unitCellAtoms.length-1].setUserOffset("z",pos.z );
 
          /////

          identity = "_down" ;
          _this.unitCellAtoms.push(
            new UnitCellAtom( 
              _this.LOD.level, 
              new THREE.Vector3(
                pos.x + _this.unitCellPositions[identity].position.x, 
                pos.y + _this.unitCellPositions[identity].position.y, 
                pos.z + _this.unitCellPositions[identity].position.z), 
              radius, 
              color, 
              true, 
              name, 
              id, 
              identity, 
              opacity,
              _this.renderingMode,
              ionicIndex,
              _this.labeling
            ) 
          ); 
          _this.unitCellAtoms[_this.unitCellAtoms.length-1].setUserOffset("x",pos.x );
          _this.unitCellAtoms[_this.unitCellAtoms.length-1].setUserOffset("y",pos.y );
          _this.unitCellAtoms[_this.unitCellAtoms.length-1].setUserOffset("z",pos.z );

          break;
      }
    }
    else{  
      var a = _this.cellParameters.scaleZ ;
      var c = _this.cellParameters.scaleY ; 

      var vertDist = a*Math.sqrt(3);
      
      _.times(2, function(_y) {
        _.times(1 , function(_x) {
          _.times(1 , function(_z) {  
            var y =  _y*c ;  
            _this.unitCellAtoms.push(
              new UnitCellAtom( 
                _this.LOD.level, 
                new THREE.Vector3(
                  pos.x , 
                  pos.y + y, 
                  pos.z), 
                radius, 
                color,
                true, 
                name, 
                id, 
                'hc_'+_x+_y+_z, 
                opacity,
                _this.renderingMode,
                ionicIndex,
                _this.labeling
              ) 
            );  
            _this.unitCellAtoms[_this.unitCellAtoms.length-1].setUserOffset("x",pos.x );
            _this.unitCellAtoms[_this.unitCellAtoms.length-1].setUserOffset("y",pos.y );
            _this.unitCellAtoms[_this.unitCellAtoms.length-1].setUserOffset("z",pos.z );

             
            _.times(6 , function(_r) {

              var v = new THREE.Vector3( a, 0, 0 );

              var axis = new THREE.Vector3( 0, 1, 0 );
              var angle = (Math.PI / 3) * _r ; 
              v.applyAxisAngle( axis, angle );

              var z = (_x % 2==0) ? (v.z + _z*vertDist) : ((v.z + _z*vertDist + vertDist/2));
              var y =  v.y + _y*c ;
              var x = v.x + _x*a*1.5 ;
                
              var position = new THREE.Vector3( x, y, z); 

              var reference = 'h_'+_x+_y+_z+_r ;
                
              _this.unitCellAtoms.push(
                new UnitCellAtom( 
                  _this.LOD.level, 
                  new THREE.Vector3(
                    pos.x + position.x, 
                    pos.y + position.y, 
                    pos.z + position.z), 
                  radius, 
                  color, 
                  true, 
                  name, 
                  id, 
                  reference, 
                  opacity,
                  _this.renderingMode,
                  ionicIndex,
                  _this.labeling
                ) 
              );  

              _this.unitCellAtoms[_this.unitCellAtoms.length-1].setUserOffset("x",pos.x );
              _this.unitCellAtoms[_this.unitCellAtoms.length-1].setUserOffset("y",pos.y );
              _this.unitCellAtoms[_this.unitCellAtoms.length-1].setUserOffset("z",pos.z );    
 
            });
          });
        });
      }); 
    }
     
    // delete helpers
    for (var i = this.unitCellAtoms.length - 1; i >= 0; i--) {
      if(this.unitCellAtoms[i].temp !== undefined){  
        this.unitCellAtoms.splice(i,1);
      }
    };  
    
    if(this.newSphere !== undefined){  
      // autosave feature
      this.motifsAtoms.push(this.newSphere); 
      
      this.updateAtomList(
        pos, 
        this.newSphere.getID(), 
        this.newSphere.getRadius(), 
        this.newSphere.elementName,
        'save',
        'bg-light-gray',
        this.newSphere.tangentParent,
        this.newSphere.color,
        this.newSphere.ionicIndex
      );
      PubSub.publish(events.EDITOR_STATE, {'state' : "initial"});
      this.lastSphereAdded = this.newSphere ;
      this.newSphere.blinkMode(false); 
      this.newSphere = undefined ;
      this.dragMode = false; 
      // end
    }

    this.createAdditionalAtoms();
  }; 
  Motifeditor.prototype.atomVisibility = function(arg){ 
    for (var i = this.unitCellAtoms.length - 1; i >= 0; i--) { 
      if(this.unitCellAtoms[i].myID === arg.id){
        this.unitCellAtoms[i].object3d.visible = arg.visible;
      }
    }
    for (var i = this.motifsAtoms.length - 1; i >= 0; i--) { 
      if(this.motifsAtoms[i].getID() === arg.id){
        this.motifsAtoms[i].object3d.visible = arg.visible;
      }
    } 
    if(this.newSphere !== undefined && this.newSphere.getID() === arg.id){
      this.newSphere.object3d.visible = arg.visible;
    }
  };
  Motifeditor.prototype.leastVolume = function(restore){ 

    if(restore !== undefined || /*to remove this during restr*/ this.latticeName === 'hexagonal'/*to remove this during restr*/ ){
      return;
    }

    var coll = false;
    var step = 100;   
      
    this.menu.resetProgressBar('Constructing cell...');

    while(coll === false && this.unitCellAtoms.length !== 0){ 
    
      step -= 0.25; 
      this.setManuallyCellVolume({ 'step' : step, 'trigger' : 'reducer'}, true);
      if( this.cellVolume.aCol !== undefined || this.cellVolume.bCol !== undefined || this.cellVolume.cCol !== undefined  ){  
        coll = true;
      }
    }   
    
    this.menu.progressBarFinish();
 
  };
  Motifeditor.prototype.reconstructCellPoints = function(restore){
    var _this = this; 
    if(restore) return ;
    if(_this.latticeName !== 'hexagonal'){
      switch(_this.latticeType) {
        case "primitive":  // primitive  
          _.times(2 , function(_x) {
            _.times(2 , function(_y) {
              _.times(2 , function(_z) { 
                for (var i = _this.unitCellAtoms.length - 1; i >= 0; i--) {
                  if(!_.isUndefined(_this.unitCellAtoms[i].object3d) && _this.unitCellAtoms[i].latticeIndex === ("_"+_x+_y+_z)  && _this.unitCellAtoms[i].temp === undefined ){  
                    var offset = _this.unitCellAtoms[i].getUserOffset();  
                    _this.unitCellAtoms[i].object3d.position.set( 
                      _this.unitCellPositions["_"+_x+_y+_z].position.x + offset.x , 
                      _this.unitCellPositions["_"+_x+_y+_z].position.y + offset.y , 
                      _this.unitCellPositions["_"+_x+_y+_z].position.z + offset.z 
                    ); 
                  }
                }   
              });
            });
          });
          
          break;
        case "face":   
          _.times(2 , function(_x) {
            _.times(2 , function(_y) {
              _.times(2 , function(_z) {
                for (var i = _this.unitCellAtoms.length - 1; i >= 0; i--) {
                  if(!_.isUndefined(_this.unitCellAtoms[i].object3d) && _this.unitCellAtoms[i].latticeIndex === ("_"+_x+_y+_z)  && _this.unitCellAtoms[i].temp === undefined ){  
                    var offset = _this.unitCellAtoms[i].getUserOffset(); 
                    _this.unitCellAtoms[i].object3d.position.set( 
                      _this.unitCellPositions["_"+_x+_y+_z].position.x + offset.x , 
                      _this.unitCellPositions["_"+_x+_y+_z].position.y + offset.y , 
                      _this.unitCellPositions["_"+_x+_y+_z].position.z + offset.z 
                    ); 
                  }
                }  
              });
            });
          }); 
          for (var i = 0; i <= 1; i ++) { 
            for (var j = _this.unitCellAtoms.length - 1; j >= 0; j--) {
              if( _this.unitCellAtoms[j].wireframe !== undefined ){  
                if(!_.isUndefined(_this.unitCellAtoms[j].object3d) && _this.unitCellAtoms[j].latticeIndex === ("_"+i) ){  
                  var offset = _this.unitCellAtoms[j].getUserOffset(); 
                  _this.unitCellAtoms[j].object3d.position.set( 
                    _this.unitCellPositions["_"+i].position.x + offset.x , 
                    _this.unitCellPositions["_"+i].position.y + offset.y , 
                    _this.unitCellPositions["_"+i].position.z + offset.z 
                  ); 
                } 
                if(!_.isUndefined(_this.unitCellAtoms[j].object3d) && _this.unitCellAtoms[j].latticeIndex === ("__"+i) ){  
                  var offset = _this.unitCellAtoms[j].getUserOffset(); 
                  _this.unitCellAtoms[j].object3d.position.set( 
                    _this.unitCellPositions["__"+i].position.x + offset.x , 
                    _this.unitCellPositions["__"+i].position.y + offset.y , 
                    _this.unitCellPositions["__"+i].position.z + offset.z 
                  ); 
                } 
                if(!_.isUndefined(_this.unitCellAtoms[j].object3d) && _this.unitCellAtoms[j].latticeIndex === ("___"+i) ){  
                  var offset = _this.unitCellAtoms[j].getUserOffset(); 
                  _this.unitCellAtoms[j].object3d.position.set( 

                    _this.unitCellPositions["___"+i].position.x + offset.x , 
                    _this.unitCellPositions["___"+i].position.y + offset.y , 
                    _this.unitCellPositions["___"+i].position.z + offset.z 
                  ); 
                } 
              }
            }
          };
          break;
        case "body":  
          _.times(2 , function(_x) {
            _.times(2 , function(_y) {
              _.times(2 , function(_z) { 
                for (var i = _this.unitCellAtoms.length - 1; i >= 0; i--) {
                  if(!_.isUndefined(_this.unitCellAtoms[i].object3d) && _this.unitCellAtoms[i].latticeIndex === ("_"+_x+_y+_z) && _this.unitCellAtoms[i].temp === undefined ){  
                    var offset = _this.unitCellAtoms[i].getUserOffset(); 
                    _this.unitCellAtoms[i].object3d.position.set( 
                      _this.unitCellPositions["_"+_x+_y+_z].position.x + offset.x , 
                      _this.unitCellPositions["_"+_x+_y+_z].position.y + offset.y , 
                      _this.unitCellPositions["_"+_x+_y+_z].position.z + offset.z 
                    ); 
                  }
                }   
              });
            });
          });
          for (var i = _this.unitCellAtoms.length - 1; i >= 0; i--) {
            if(!_.isUndefined(_this.unitCellAtoms[i].object3d) && _this.unitCellAtoms[i].latticeIndex === ("_c")  && _this.unitCellAtoms[i].temp === undefined ){  
              var offset = _this.unitCellAtoms[i].getUserOffset(); 
              _this.unitCellAtoms[i].object3d.position.set( 
                _this.unitCellPositions["_c"].position.x + offset.x , 
                _this.unitCellPositions["_c"].position.y + offset.y , 
                _this.unitCellPositions["_c"].position.z + offset.z 
              ); 
            }
          }
          break;
        case "base":  
          _.times(2 , function(_x) {
            _.times(2 , function(_y) {
              _.times(2 , function(_z) {
                for (var i = _this.unitCellAtoms.length - 1; i >= 0; i--) {
                  if(!_.isUndefined(_this.unitCellAtoms[i].object3d) && _this.unitCellAtoms[i].latticeIndex === ("_"+_x+_y+_z)  && _this.unitCellAtoms[i].temp === undefined ){  
                    var offset = _this.unitCellAtoms[i].getUserOffset(); 
                    _this.unitCellAtoms[i].object3d.position.set( 
                      _this.unitCellPositions["_"+_x+_y+_z].position.x + offset.x , 
                      _this.unitCellPositions["_"+_x+_y+_z].position.y + offset.y , 
                      _this.unitCellPositions["_"+_x+_y+_z].position.z + offset.z 
                    ); 
                  }
                }  
              });
            });
          }); 
          for (var j = _this.unitCellAtoms.length - 1; j >= 0; j--) {
            if( _this.unitCellAtoms[j].wireframe !== undefined ){ 
              if(!_.isUndefined(_this.unitCellAtoms[j].object3d) && _this.unitCellAtoms[j].latticeIndex === ("_up") ){  
                var offset = _this.unitCellAtoms[j].getUserOffset(); 
                _this.unitCellAtoms[j].object3d.position.set( 
                  _this.unitCellPositions["_up"].position.x + offset.x , 
                  _this.unitCellPositions["_up"].position.y + offset.y , 
                  _this.unitCellPositions["_up"].position.z + offset.z 
                ); 
              } 
              if(!_.isUndefined(_this.unitCellAtoms[j].object3d) && _this.unitCellAtoms[j].latticeIndex === ("_down") ){  
                var offset = _this.unitCellAtoms[j].getUserOffset(); 
                _this.unitCellAtoms[j].object3d.position.set( 
                  _this.unitCellPositions["_down"].position.x + offset.x , 
                  _this.unitCellPositions["_down"].position.y + offset.y , 
                  _this.unitCellPositions["_down"].position.z + offset.z 
                ); 
              }  
            }  
          }
           
          break;
      }
    }
    else{
      var a = _this.cellParameters.scaleZ ;
      var c = _this.cellParameters.scaleY ; 

      var vertDist = a*Math.sqrt(3);

      _.times(2, function(_y) {
        _.times(1 , function(_x) {
          _.times(1 , function(_z) {  
            _.times(6 , function(_r) {
              var v = new THREE.Vector3( a, 0, 0 );

              var axis = new THREE.Vector3( 0, 1, 0 );
              var angle = (Math.PI / 3) * _r ; 
              v.applyAxisAngle( axis, angle );

              var z = (_x % 2==0) ? (v.z + _z*vertDist) : ((v.z + _z*vertDist + vertDist/2));
              var y =  v.y + _y*c ;
              var x = v.x + _x*a*1.5 ;
              var zC = (_x % 2==0) ? (_z*vertDist) : (( _z*vertDist + vertDist/2));
              var yC =  _y*c ;
              var xC =  _x*a*1.5 ;

              var position = new THREE.Vector3( x, y, z);  
              var positionC = new THREE.Vector3( xC, yC, zC);  

              var reference = 'h_'+_x+_y+_z+_r ;
              var referenceC = 'hc_'+_x+_y+_z ;

              for (var i = _this.unitCellAtoms.length - 1; i >= 0; i--) {
               
                if(!_.isUndefined(_this.unitCellAtoms[i].object3d) && ( _this.unitCellAtoms[i].latticeIndex === reference)  && _this.unitCellAtoms[i].temp === undefined ){  
                  var offset = _this.unitCellAtoms[i].getUserOffset(); 
                  _this.unitCellAtoms[i].object3d.position.set( 
                    position.x + offset.x ,  
                    position.y + offset.y , 
                    position.z + offset.z 
                  ); 
                }
                if(!_.isUndefined(_this.unitCellAtoms[i].object3d) && (_this.unitCellAtoms[i].latticeIndex === referenceC)  && _this.unitCellAtoms[i].temp === undefined ){  
                  var offset = _this.unitCellAtoms[i].getUserOffset(); 
                  _this.unitCellAtoms[i].object3d.position.set( 
                    positionC.x + offset.x ,  
                    positionC.y + offset.y , 
                    positionC.z + offset.z 
                  ); 
                }
              }   
            });
          });
        });
      });
    }
  }
  Motifeditor.prototype.translateCellAtoms = function(axes, val, id){    
    var _this = this;   
    var val = parseFloat(val);

    _.each(_this.unitCellAtoms, function(a, k) {  
      if(a.getID() === id ){
        switch(axes) {
          case "x":  
            a.object3d.position.x = val ;
            a.setUserOffset("x",val); 
            break;
          case "y": 
            a.object3d.position.y = val  ;
            a.setUserOffset("y",val); 
            break;
          case "z": 
            a.object3d.position.z = val  ;
            a.setUserOffset("z",val); 
            break;
        } 
      }
    });
  
    _.each(_this.cachedAtoms, function(a, k) { 
      if(a.getID() === id ){  

        switch(axes) {
          case "x":  
            a.object3d.position.x = val ;
            a.setUserOffset("x",val); 
            break;
          case "y": 
            a.object3d.position.y = val ;
            a.setUserOffset("y",val); 
            break;
          case "z": 
            a.object3d.position.z = val ;
            a.setUserOffset("z",val); 
            break;
        } 
      }
    });
  };
  Motifeditor.prototype.findMotifsDimensions = function(pos, radius){

    var _this = this, offsets = {x : 0, y : 0, z : 0 }, myf ;   
       
    if(!_.isUndefined(_this.newSphere)){  
      if(_.isUndefined(_this.newSphere.object3d)){
        if(!_.isUndefined(pos) ){
          var helperObj = {
            "object3d" : {
              "position" : { 
                "x": pos.x, 
                "y":pos.y, 
                "z": pos.z}
              }, 
            getRadius: function() { return radius; }
          } ; 
          this.motifsAtoms.push(helperObj); 
          myf=true;
        }
      }
      else{
        var helperObj = {"object3d" : {"position" : { "x": _this.newSphere.object3d.position.x, "y":_this.newSphere.object3d.position.y, "z": _this.newSphere.object3d.position.z}}, getRadius: function() { return _this.newSphere.getRadius(); } } ; 
        this.motifsAtoms.push(helperObj); 
        myf=true;
      } 
    } 

    // - find classic unit cell dimensions
    var distantLeftX  = _.min(_this.motifsAtoms, function(atom){ return (atom.object3d.position.x - atom.getRadius()); });
    var distantDownY  = _.min(_this.motifsAtoms, function(atom){ return (atom.object3d.position.y - atom.getRadius()); });
    var distantBackZ  = _.min(_this.motifsAtoms, function(atom){ return (atom.object3d.position.z - atom.getRadius()); });
    var distantRightX = _.max(_this.motifsAtoms, function(atom){ return (atom.object3d.position.x + atom.getRadius()); });
    var distantUpY    = _.max(_this.motifsAtoms, function(atom){ return (atom.object3d.position.y + atom.getRadius()); });
    var distantForthZ = _.max(_this.motifsAtoms, function(atom){ return (atom.object3d.position.z + atom.getRadius()); });

    var cell = { 
      xDim: Math.abs(distantLeftX.object3d.position.x - distantLeftX.getRadius() - (distantRightX.object3d.position.x + distantRightX.getRadius()) ),
      yDim: Math.abs(distantDownY.object3d.position.y - distantUpY.getRadius()   - (distantUpY.object3d.position.y    + distantDownY.getRadius())  ),
      zDim: Math.abs(distantBackZ.object3d.position.z - distantBackZ.getRadius() - (distantForthZ.object3d.position.z + distantForthZ.getRadius()) )
    } 
    
    if(cell.xDim===0) cell.xDim = distantRightX.getRadius()*2  ;
    if(cell.yDim===0) cell.yDim = distantUpY.getRadius()*2  ;
    if(cell.zDim===0) cell.zDim = distantForthZ.getRadius()*2  ;  
    // 
    
    if(_this.latticeName === 'hexagonal'){
      if(cell.zDim > cell.xDim){
        _this.cellParameters.scaleX = cell.zDim ;
        cell.xDim = cell.zDim ;
      }
      else{
        _this.cellParameters.scaleZ = cell.xDim ;
        cell.zDim = cell.xDim ; 
      }
    } 
 
    if(myf) {
      this.motifsAtoms.pop();
    }
    
    if(this.editorState.atomPosMode === 'absolute' && false){

      this.menu.setSliderMin('atomPosX',-1*cell.xDim);
      this.menu.setSliderMin('atomPosY',-1*cell.yDim);
      this.menu.setSliderMin('atomPosZ',-1*cell.zDim);

      this.menu.setSliderMax('atomPosX',cell.xDim);
      this.menu.setSliderMax('atomPosY',cell.yDim);
      this.menu.setSliderMax('atomPosZ',cell.zDim); 

      this.menu.setSliderMax('scaleX',cell.xDim*10);
      this.menu.setSliderMax('scaleY',cell.yDim*10);
      this.menu.setSliderMax('scaleZ',cell.zDim*10); 
    }

    return cell; // remember these dimensions are in 2l (e.g for cubic primitive)
  };
  Motifeditor.prototype.findHexTangentLengths = function(dimensions){
    var offsets = {x : 0, y : 0, z : 0 } ; 
    return dimensions.zDim;
    var finished = false, theXOffset=0, theYOffset=0, theZOffset=0;

    var motifHelper = [], j = 0;
    if(this.newSphere.object3d !== undefined){
      var rad = this.newSphere.getRadius();
      var helperObj = {"object3d" : {"position" : { "x": this.newSphere.object3d.position.x, "y":this.newSphere.object3d.position.y, "z": this.newSphere.object3d.position.z}}, getRadius: function() { return rad; } } ; 
      this.motifsAtoms.push(helperObj);
    }

    var minRadius = this.findShortestRadius(); 

    var movingOffset = 0.1; 

    while(j < this.motifsAtoms.length ) { 
       
      var r = this.motifsAtoms[j].getRadius();

      motifHelper.push( 
        {
          "object3d" : {"position" : { "x": this.motifsAtoms[j].object3d.position.x, "y": this.motifsAtoms[j].object3d.position.y, "z": this.motifsAtoms[j].object3d.position.z, clone: function() { return (new THREE.Vector3(this.x,this.y,this.z)); } } },
          "r" : r , 
          getRadius: function() { return (this.r); } 
        } 
      ); 
      j++;
    } 
     
    var a = dimensions.zDim ;
    var c = dimensions.yDim ; 
   
    var vertDist = a*Math.sqrt(3), _this = this;
     
    while(false){
      offsets.z -= movingOffset;

      _.times(6 , function(_r) {
          
        var v = new THREE.Vector3( a + offsets.z, 0, 0 );
       
        var axis = new THREE.Vector3( 0, 1, 0 );
        var angle = (Math.PI / 3) * _r ; 
        v.applyAxisAngle( axis, angle );

        for (var i = motifHelper.length - 1; i >= 0; i--) {
          motifHelper[i].object3d.position.x += v.x ;
          motifHelper[i].object3d.position.z += v.z ; 
        } 

        var ofst = _this.fakeCollision("x", motifHelper, new THREE.Vector3(v.x, 0 , v.z));   
        if( ofst > theZOffset) theZOffset = ofst ;

      });
          
      if (offsets.z < -5) finished = true ; 
    };
  
    if(this.newSphere.object3d !== undefined){
      this.motifsAtoms.pop();
    }; 
    return a ;
    dimensions.xDim += theZOffset;
    dimensions.zDim += theZOffset;
    return dimensions.xDim;
  }; 
  Motifeditor.prototype.transformHelper = function(vector){
    var _this = this ;

    if(this.latticeName !== 'hexagonal'){
      _.each(shearing, function(k) {  
        if (_.isUndefined(_this.cellParameters[k]) === false) { 
          var argument = {};
          argument[k] = parseFloat(_this.cellParameters[k]); 
          var matrix = transformationMatrix(argument);   
          vector.applyMatrix4(matrix);   
        }
      });
    }
    else if(this.latticeName === 'hexagonal'){
      var b = new THREE.Vector3( vector.x, vector.y, 0 ); 

      var axis = new THREE.Vector3( 0, 1, 0 );

      var a = new THREE.Vector3( vector.z, 0, 0 ); 
      var angle = (Math.PI + Math.PI / 3)  ; 
      a.applyAxisAngle( axis, angle );
      a.add(b);
      vector = a;
      
    }
  
    return vector;
  };

  // array to hold the lattice point in which if intermotif collision happens the offset must be scales before applied to ScaleX,Y,Z and sliders
  // if there us a collision and on of the atoms involved belongs to any of the special cases below, the result must be normalized
  var holdSpecialPos = {} ;
  holdSpecialPos['_0y'] = true;    //face 0     0.5  0.5
  holdSpecialPos['_0z'] = true;    //face 0     0.5  0.5
  holdSpecialPos['__0x'] = true;   //face 0.5   0    0.5
  holdSpecialPos['__0z'] = true;   //face 0.5   0    0.5
  holdSpecialPos['___0x'] = true;  //face 0.5   0.5  0
  holdSpecialPos['___0y'] = true;  //face 0.5   0.5  0

  holdSpecialPos['_1z'] = true;    //face 1     0.5  0.5
  holdSpecialPos['_1y'] = true;    //face 1     0.5  0.5
  holdSpecialPos['__1x'] = true;   //face 0.5   1    0.5
  holdSpecialPos['__1z'] = true;   //face 0.5   1    0.5
  holdSpecialPos['___1x'] = true;  //face 0.5   0.5  1
  holdSpecialPos['___1y'] = true;  //face 0.5   0.5  1

  holdSpecialPos['_cx'] = true;    //body 0.5   0.5  1
  holdSpecialPos['_cy'] = true;    //body 0.5   0.5  1
  holdSpecialPos['_cz'] = true;    //body 0.5   0.5  1

  holdSpecialPos['_upx'] = true;   //base 0.5   1    0.5
  holdSpecialPos['_upz'] = true;   //base 0.5   1    0.5

  holdSpecialPos['_downx'] = true; //base 0.5   0    0.5
  holdSpecialPos['_downz'] = true; //base 0.5   0    0.5

  Motifeditor.prototype.detectCollisionForLengths = function(axis, withAngles){
    var startTime = performance.now(), _this = this, offset = -1, posInlattice = 'none', normalize = false ;
    var noCollision = false ;
    aAtomIndex = undefined;
    bAtomIndex = undefined;

    for (var i = this.unitCellAtoms.length - 1; i >= 0; i--) {
      var a = this.unitCellAtoms[i];
  
      var rPos = new THREE.Vector3(
        this.unitCellPositions[a.latticeIndex].position.x + a.userOffset.x ,
        this.unitCellPositions[a.latticeIndex].position.y + a.userOffset.y ,
        this.unitCellPositions[a.latticeIndex].position.z + a.userOffset.z  
      );

      for (var j = this.unitCellAtoms.length - 1; j >= 0; j--) {
        var b = this.unitCellAtoms[j];
        if(a.latticeIndex != b.latticeIndex){ 
          var lPos = new THREE.Vector3(
            this.unitCellPositions[b.latticeIndex].position.x + b.userOffset.x ,
            this.unitCellPositions[b.latticeIndex].position.y + b.userOffset.y ,
            this.unitCellPositions[b.latticeIndex].position.z + b.userOffset.z  
          ), sign; 
          
          if( ((rPos.distanceTo(lPos) + 0.0000001) < (a.getRadius() + b.getRadius())) && (rPos.distanceTo(lPos) != 0 )){ // 0.00000000001 is for precision issues  
             
          //this.lineHelper( new THREE.Vector3(rPos.x,rPos.y,rPos.z), new THREE.Vector3(lPos.x,lPos.y,lPos.z) , 0xffffff );        // a to b : white

            var vecHelper;
            aAtomIndex = j ;
            bAtomIndex = i ;
            noCollision = false;
            if( !(this.latticeSystem === 'hexagonal') || !(this.latticeType === 'hexagonal'))
            {    
              if(!_.isUndefined( holdSpecialPos[b.latticeIndex+axis]) || !_.isUndefined( holdSpecialPos[a.latticeIndex+axis])) normalize = true;
               
              if(axis == 'x') {
                sign = (lPos.x>rPos.x) ? -1 : 1 ;
                vecHelper = this.transformHelper(new THREE.Vector3(this.cellParameters.scaleX,0,0));
              }
              else if(axis == 'y') {
                sign = (lPos.y>rPos.y) ? -1 : 1 ;
                vecHelper = this.transformHelper(new THREE.Vector3(0,this.cellParameters.scaleY,0));
              }
              else {
                sign = (lPos.z>rPos.z) ? -1 : 1 ;
                vecHelper = vecHelper = this.transformHelper(new THREE.Vector3( 0,0,this.cellParameters.scaleZ)); 
              }
              vecHelper.set(vecHelper.x*sign,vecHelper.y*sign,vecHelper.z*sign); 
            }
            else{
              vecHelper = new THREE.Vector3(
                this.unitCellPositions[a.latticeIndex].position.x-this.unitCellPositions[b.latticeIndex].position.x,
                this.unitCellPositions[a.latticeIndex].position.y-this.unitCellPositions[b.latticeIndex].position.y,
                this.unitCellPositions[a.latticeIndex].position.z-this.unitCellPositions[b.latticeIndex].position.z 
              );
            }

            var bortherPos = new THREE.Vector3(vecHelper.x + lPos.x, vecHelper.y + lPos.y, vecHelper.z + lPos.z ); 

            if(a.wireframe != undefined && this.latticeName !== 'hexagonal') a.changeColor((0xFF0000, 250));
            if(b.wireframe != undefined && this.latticeName !== 'hexagonal') b.changeColor((0xFF0000, 250));
           
            if(this.soundMachine.procced) this.soundMachine.play('cellCollision');

            var rA = a.getRadius();
            var rB = b.getRadius(); 

            offset = this.fixLengths(
              axis, 
              {
                "object3d" : {
                  "position" : {
                    "x": rPos.x, 
                    "y": rPos.y, 
                    "z": rPos.z, 
                  }
                }, 
                getRadius: function() { return rA; }
              },  
              {
                "object3d" : {
                  "position" : {
                    "x": lPos.x, 
                    "y": lPos.y, 
                    "z": lPos.z, 
                  }
                }, 
                getRadius: function() { return rB; }
              }, 
              {
                "object3d" : {
                  "position" : {
                    "x": bortherPos.x, 
                    "y": bortherPos.y, 
                    "z": bortherPos.z 
                  }
                }, 
                getRadius: function() { return rB; }
              },
              withAngles 
            );  
             
            j = -1;
            i = -1;
          }
        }  
      };
    };
     
    var endTime = performance.now(); 
    return {'offset': offset, 'normalize': normalize} ; 
  };

  var holdSpecialUnitCellPosFacs = {};

  holdSpecialUnitCellPosFacs['_c'] = {};

  Motifeditor.prototype.detectCollisionForAngles = function(angleName){
      
    var _this = this ;
    var alpha = -1000000;
    var beta = -1000000;
    var gamma = -1000000;
    
    aAtomIndex = undefined;
    bAtomIndex = undefined;
 
    for (var i = this.unitCellAtoms.length - 1; i >= 0; i--) {
      var rightSphere = this.unitCellAtoms[i];
      
      for (var j = this.unitCellAtoms.length - 1; j >= 0; j--) {

        var leftSphere = this.unitCellAtoms[j];

        if(leftSphere.latticeIndex != rightSphere.latticeIndex){ 
   
          if( ((rightSphere.object3d.position.distanceTo(leftSphere.object3d.position) + 0.0000001) < (rightSphere.getRadius() + leftSphere.getRadius())) && (rightSphere.object3d.position.distanceTo(leftSphere.object3d.position) != 0 )){
            
            aAtomIndex = j ;
            bAtomIndex = i ;

            rightSphere.changeColor((0xFF0000, 250));
            leftSphere.changeColor((0xFFFFFF, 250));
  
            if( angleName === 'beta'){ 
              if(rightSphere.object3d.position.x < leftSphere.object3d.position.x){
                // swap because we want to have the "right" atom in Xn2 so Xn2 - Xn1 = L > 0
                rightSphere = this.unitCellAtoms[j] ;
                leftSphere = this.unitCellAtoms[i] ; 
              }
              var _1_2 = Math.abs( leftSphere.object3d.position.y - rightSphere.object3d.position.y );
              var _1_4 = leftSphere.getRadius() + rightSphere.getRadius();  
              var _2_4 = Math.sqrt( _1_4 * _1_4 - _1_2 * _1_2 );
              var _2_3 = Math.abs(leftSphere.object3d.position.z - rightSphere.object3d.position.z);
              var _3_4 = Math.sqrt( _2_4 * _2_4 - _2_3 * _2_3 );
  
              var leftLatticePointIndex = ((leftSphere.object3d.position.x - leftSphere.userOffset.x) < (rightSphere.object3d.position.x - rightSphere.userOffset.x)) ? leftSphere.latticeIndex : rightSphere.latticeIndex ;

              var _initPos_1;
              var _initPos_2;

              if( leftLatticePointIndex === leftSphere.latticeIndex ){  
                var L = _3_4 + leftSphere.userOffset.x - rightSphere.userOffset.x ;
                _initPos_1 = this.initialCellPositions(leftSphere.latticeIndex) ;
                _initPos_2 = this.initialCellPositions(rightSphere.latticeIndex) ;

              }
              else if( leftLatticePointIndex === rightSphere.latticeIndex ){ 
                var L = -1*_3_4 + rightSphere.userOffset.x - leftSphere.userOffset.x ;
                _initPos_1 = this.initialCellPositions(rightSphere.latticeIndex) ;
                _initPos_2 = this.initialCellPositions(leftSphere.latticeIndex) ;
              }
   
              var parameters = this.cellParameters; 
              var parameterKeys = [ 'alpha' , 'gamma']; 

              _.each(parameterKeys, function(k) {   
                if (_.isUndefined(parameters[k]) === false) { 
                  var argument = {};
                   
                  argument[k] = parseFloat(parameters[k]);
                    
                  var matrix = transformationMatrix(argument); 
                   
                  _initPos_1.applyMatrix4(matrix); 
                  _initPos_2.applyMatrix4(matrix); 
                  
                }
              }); 

              var ab, Xn2, Xn1;

              if(_initPos_2.y === 0){
                Xn1 = ( L * _initPos_1.y - _initPos_2.x * _initPos_1.y + _initPos_1.x * _initPos_2.y) / (_initPos_2.y - _initPos_1.y);

                ab = ( Xn1 - _initPos_1.x ) / _initPos_1.y ;
              }
              else{
                Xn2 = ( L * _initPos_2.y + _initPos_1.x * _initPos_2.y - _initPos_2.x * _initPos_1.y ) / (_initPos_2.y - _initPos_1.y);

                ab = ( Xn2 - _initPos_2.x ) / _initPos_2.y ;
              }
  
              var atan_ab = Math.atan(ab) ;
               
              beta =  90 - atan_ab * 180 / Math.PI ; 
                 
              return { 'offset': (beta-this.cellParameters.beta) } ;
            }
            else if( angleName === 'alpha'){
              if(rightSphere.object3d.position.z < leftSphere.object3d.position.z){ 
                rightSphere = this.unitCellAtoms[j] ;
                leftSphere = this.unitCellAtoms[i] ; 
              }
              var _1_2 = Math.abs( leftSphere.object3d.position.y - rightSphere.object3d.position.y );
              var _1_4 = leftSphere.getRadius() + rightSphere.getRadius();  
              var _2_4 = Math.sqrt( _1_4 * _1_4 - _1_2 * _1_2 );

              var _2_3 = Math.abs(leftSphere.object3d.position.x - rightSphere.object3d.position.x);
              var _3_4 = Math.sqrt( _2_4 * _2_4 - _2_3 * _2_3 );
  
              var leftLatticePointIndex = ((leftSphere.object3d.position.z - leftSphere.userOffset.z) < (rightSphere.object3d.position.z - rightSphere.userOffset.z)) ? leftSphere.latticeIndex : rightSphere.latticeIndex ;

              var _initPos_2;
              var _initPos_1;

              if( leftLatticePointIndex === leftSphere.latticeIndex ){
                var L = _3_4 + leftSphere.userOffset.z - rightSphere.userOffset.z ;
                _initPos_1 = this.initialCellPositions(leftSphere.latticeIndex) ;
                _initPos_2 = this.initialCellPositions(rightSphere.latticeIndex) ;
              }
              else if( leftLatticePointIndex === rightSphere.latticeIndex ){
                var L = -1 * _3_4 + rightSphere.userOffset.z - leftSphere.userOffset.z ;
                _initPos_1 = this.initialCellPositions(rightSphere.latticeIndex) ;
                _initPos_2 = this.initialCellPositions(leftSphere.latticeIndex) ;
              }  

              var parameters = this.cellParameters; 
              var parameterKeys = [ 'beta' , 'gamma']; 

              _.each(parameterKeys, function(k) {   
                if (_.isUndefined(parameters[k]) === false) { 
                  var argument = {};
                   
                  argument[k] = parseFloat(parameters[k]);
                    
                  var matrix = transformationMatrix(argument); 
                   
                  _initPos_1.applyMatrix4(matrix); 
                  _initPos_2.applyMatrix4(matrix); 
                  
                }
              });
 
              var Zn2,Zn1; 
              var bc;
 
              if(_initPos_2.y === 0){
                Zn1 = ( L * _initPos_1.y + _initPos_1.z * _initPos_2.y - _initPos_2.z * _initPos_1.y ) / ( _initPos_2.y - _initPos_1.y) ;
                bc = ( Zn1 - _initPos_1.z ) / _initPos_1.y ;
              }
              else{
                Zn2 = ( L * _initPos_2.y + _initPos_2.y * _initPos_1.z - _initPos_1.y * _initPos_2.z ) / ( _initPos_2.y - _initPos_1.y) ;
                bc = ( Zn2 - _initPos_2.z ) / _initPos_2.y ; 
              } 

              var bc = Math.atan(bc) ; 

              alpha =  90 - bc * 180 / Math.PI ; 
  
              return {'offset': (alpha-this.cellParameters.alpha), } ;
            }
            else if( angleName === 'gamma'){
              if(rightSphere.object3d.position.x < leftSphere.object3d.position.x){
                // swap because we want to have the "right" atom in Xn2 so Xn2 - Xn1 = L > 0
                rightSphere = this.unitCellAtoms[j] ;
                leftSphere = this.unitCellAtoms[i] ; 
              }
              var _1_2 = Math.abs( leftSphere.object3d.position.y - rightSphere.object3d.position.y );
              var _1_4 = leftSphere.getRadius() + rightSphere.getRadius();  
              var _2_4 = Math.sqrt( _1_4 * _1_4 - _1_2 * _1_2 );
              var _2_3 = Math.abs(leftSphere.object3d.position.z - rightSphere.object3d.position.z);
              var _3_4 = Math.sqrt( _2_4 * _2_4 - _2_3 * _2_3 );
  
              var leftLatticePointIndex = ((leftSphere.object3d.position.x - leftSphere.userOffset.x) <= (rightSphere.object3d.position.x - rightSphere.userOffset.x)) ? leftSphere.latticeIndex : rightSphere.latticeIndex ;

              var _initPos_2;
              var _initPos_1;
  
              if( leftLatticePointIndex === leftSphere.latticeIndex ){  
                var L = _3_4 + leftSphere.userOffset.x - rightSphere.userOffset.x ;
                _initPos_1 = this.initialCellPositions(leftSphere.latticeIndex) ;
                _initPos_2 = this.initialCellPositions(rightSphere.latticeIndex) ;

              }
              else if( leftLatticePointIndex === rightSphere.latticeIndex ){ 
                var L = -1*_3_4 + rightSphere.userOffset.x - leftSphere.userOffset.x ;
                _initPos_1 = this.initialCellPositions(rightSphere.latticeIndex) ;
                _initPos_2 = this.initialCellPositions(leftSphere.latticeIndex) ;
              }

              var parameters = this.cellParameters; 
              var parameterKeys = [ 'alpha' , 'beta']; 

              _.each(parameterKeys, function(k) {   
                if (_.isUndefined(parameters[k]) === false) { 
                  var argument = {};
                   
                  argument[k] = parseFloat(parameters[k]);
                    
                  var matrix = transformationMatrix(argument); 
                   
                  _initPos_1.applyMatrix4(matrix); 
                  _initPos_2.applyMatrix4(matrix); 
                  
                }
              });
 
              var Xn2, Xn1 ; 
              var ac;

              if(_initPos_2.z === 0){ 
                Xn1 = (  L * _initPos_1.z - _initPos_2.x * _initPos_1.z + _initPos_1.x * _initPos_2.z) / (_initPos_2.z - _initPos_1.z);
                ac = ( Xn1 - _initPos_1.x ) / _initPos_1.z ;
              }
              else{
                Xn2 = ( _initPos_1.x * _initPos_2.z + L * _initPos_2.z - _initPos_2.x * _initPos_1.z ) / (_initPos_2.z - _initPos_1.z);
                ac = ( Xn2 - _initPos_2.x ) / _initPos_2.z ;
              }
  
              var atan_ac = Math.atan(ac) ;
               
              gamma =  90 - atan_ac * 180 / Math.PI ;  
 
              return {'offset': (gamma-this.cellParameters.gamma), } ;
            }

            // exit loop
            j = -1 ;
            i = -1 ;

          } 
        } 
      } 
    }  
    return {'offset': -1000000, 'normalize': false} ;
  };
  Motifeditor.prototype.fixAngles = function(angleName, a, b, thirdPoint){ 
    var _this = this, offset = 0 ;  
    var rA = a.getRadius();
    var rB = b.getRadius();
      
    var rPos = new THREE.Vector3(a.object3d.position.x, a.object3d.position.y, a.object3d.position.z);
    var lPos = new THREE.Vector3(b.object3d.position.x, b.object3d.position.y, b.object3d.position.z);
    var bBrPos = new THREE.Vector3(thirdPoint.object3d.position.x, thirdPoint.object3d.position.y, thirdPoint.object3d.position.z);
     
    //this.lineHelper( new THREE.Vector3(rPos.x,rPos.y,rPos.z), new THREE.Vector3(lPos.x,lPos.y,lPos.z) , 0xffffff );        // a to b : white
    //this.lineHelper( new THREE.Vector3(bBrPos.x,bBrPos.y,bBrPos.z), new THREE.Vector3(lPos.x,lPos.y,lPos.z) , 0xFF0000 );  // brotherOfB to b  : red
    //this.lineHelper( new THREE.Vector3(rPos.x,rPos.y,rPos.z), new THREE.Vector3(bBrPos.x,bBrPos.y,bBrPos.z) , 0x00FF00 );  // a to brotherOfB  :  green 
 

  };
  function compareWithHighPrecision(a,b){ // compare with high precision but not with absolute equality
    var precision = 0.000000001, r = false;
    var x = Math.abs(a-b);
    if(x<precision) r = true;
    return r;
  };

  var aAtomIndex, bAtomIndex;
 
  Motifeditor.prototype.fixLengths = function(axis, a, b, brotherOfb, withAngles){ 
    var _this = this, sign = 1, offset = 0 ;  
    var rA = a.getRadius();
    var rB = b.getRadius();
      
    var rPos = new THREE.Vector3(a.object3d.position.x, a.object3d.position.y, a.object3d.position.z);
    var lPos = new THREE.Vector3(b.object3d.position.x, b.object3d.position.y, b.object3d.position.z);
    var bBrPos = new THREE.Vector3(brotherOfb.object3d.position.x, brotherOfb.object3d.position.y, brotherOfb.object3d.position.z);
     
    //this.lineHelper( new THREE.Vector3(rPos.x,rPos.y,rPos.z), new THREE.Vector3(lPos.x,lPos.y,lPos.z) , 0xffffff );        // a to b : white
    //this.lineHelper( new THREE.Vector3(bBrPos.x,bBrPos.y,bBrPos.z), new THREE.Vector3(lPos.x,lPos.y,lPos.z) , 0xFF0000 );  // brotherOfB to b  : red
    //this.lineHelper( new THREE.Vector3(rPos.x,rPos.y,rPos.z), new THREE.Vector3(bBrPos.x,bBrPos.y,bBrPos.z) , 0x00FF00 );  // a to brotherOfB  :  green  
    
    var cVector = new THREE.Vector3( rPos.x - bBrPos.x, rPos.y - bBrPos.y, rPos.z - bBrPos.z); 
    var aVector = new THREE.Vector3( lPos.x - bBrPos.x, lPos.y - bBrPos.y, lPos.z - bBrPos.z);
    var bVector = new THREE.Vector3( lPos.x - rPos.x, lPos.y - rPos.y, lPos.z - rPos.z);
    
    var caseNoTriangle = compareWithHighPrecision((cVector.length() + aVector.length()), bVector.length() );
    if(!caseNoTriangle) caseNoTriangle = compareWithHighPrecision((cVector.length() + bVector.length()), aVector.length() );
    if(!caseNoTriangle) caseNoTriangle = compareWithHighPrecision((aVector.length() + bVector.length()), cVector.length() );
          
    if( caseNoTriangle ){  
      //  cases : 1. one atom in motif, 2. the collided atoms have their center on the same axis so triangle is not created ( ekfilismeno trigwno)
      var offset = ( rA + rB -  rPos.distanceTo(lPos) ) ;
      aVector.setLength(aVector.length() + offset);  
    }
    else{  
       
      var bSideLength = rA + rB;
       
      var cSideLength = cVector.length();
      var betaAngleRad = cVector.angleTo(aVector)
      
      var cAngleSin = cSideLength * Math.sin(betaAngleRad) / bSideLength ;
      var gammaAngleRad = Math.asin(cAngleSin);
      gammaAngleRad = (gammaAngleRad>Math.PI/2) ? (Math.PI - gammaAngleRad) : (gammaAngleRad) ;

      var alphaAngleRad = Math.PI - gammaAngleRad - betaAngleRad; 
      var aSideLength = bSideLength * Math.sin(alphaAngleRad) / Math.sin(betaAngleRad) ;

      var offset = aSideLength - aVector.length()  ;
      aVector.setLength(aVector.length() + offset);
 
    } 
  
    if(withAngles){   
      _.each(reverseShearing, function(k) {
        if (_.isUndefined(_this.cellParameters[k]) === false) { 
          var argument = {};
          argument[k] = -1 * parseFloat(_this.cellParameters[k]); 
          var matrix = transformationMatrix(argument);  
          aVector.applyMatrix4(matrix);  
        }
      });  
    }  

    if(axis === 'x') return (aVector.length() - this.cellParameters.scaleX);
    if(axis === 'y') return (aVector.length() - this.cellParameters.scaleY);
    if(axis === 'z') return (aVector.length() - this.cellParameters.scaleZ);
       
  }; 
  Motifeditor.prototype.fakeCollision = function(axis, motifHelper, motifCenter){
    
    var _this = this;
    
    var offset = -1, i = 0, j =0;
  
    while(i<motifHelper.length) {
      j = 0;   
      while(j<_this.motifsAtoms.length) {  
        var a = motifHelper[i].object3d.position.clone();
         
        var b = new THREE.Vector3(_this.motifsAtoms[j].object3d.position.x, _this.motifsAtoms[j].object3d.position.y, _this.motifsAtoms[j].object3d.position.z) ;
        var realDistance = parseFloat( (a.distanceTo(b)).toFixed(parseInt(10)) );
        var calculatedDistance = parseFloat( (_this.motifsAtoms[j].getRadius() + motifHelper[i].getRadius()).toFixed(parseInt(10)) ) ;  
        
        if (realDistance < calculatedDistance){   
           
          var val; 
          var bortherPos = new THREE.Vector3(motifCenter.x + b.x, motifCenter.y + b.y, motifCenter.z + b.z ); 
   
          var rA = motifHelper[i].getRadius();
          var rB = this.motifsAtoms[j].getRadius(); 

          var offset = this.fixLengths(
            axis, 
            {
              "object3d" : {
                "position" : {
                  "x": a.x, 
                  "y": a.y, 
                  "z": a.z, 
                }
              }, 
              getRadius: function() { return rA; }
            },  
            {
              "object3d" : {
                "position" : {
                  "x": b.x, 
                  "y": b.y, 
                  "z": b.z, 
                }
              }, 
              getRadius: function() { return rB; }
            }, 
            {
              "object3d" : {
                "position" : {
                  "x": bortherPos.x, 
                  "y": bortherPos.y, 
                  "z": bortherPos.z 
                }
              }, 
              getRadius: function() { return rB; }
            },
            true 
          ); 
          j = 100000;
          i = 100000;  
        }  
        j++;
      } 
      i++;
    };  
    return {'offset': offset } ; 

  }; 
  Motifeditor.prototype.fakeFixAtomPosition = function(helperAtom, otherAtom,axis){
    var _this = this, sign = 1; 

    var movingSpherePosition = helperAtom.object3d.position.clone();

    var collisionSpherePosition = new THREE.Vector3( otherAtom.object3d.position.x, otherAtom.object3d.position.y, otherAtom.object3d.position.z );
  
    var realTimeHypotenuse = collisionSpherePosition.distanceTo(movingSpherePosition);
    var calculatedHypotenuse = parseFloat( otherAtom.getRadius() + helperAtom.getRadius() ) ;  

    var fixedSide ;
    var wrongSide ;
     
    if(axis==="x"){ 
      wrongSide = Math.abs(movingSpherePosition.x - collisionSpherePosition.x);
      var projection = new THREE.Vector3(movingSpherePosition.x,collisionSpherePosition.y, collisionSpherePosition.z );
      fixedSide =  movingSpherePosition.distanceTo(projection);  
      if(movingSpherePosition.x < collisionSpherePosition.x) sign = -1 ;
    }
    else if(axis==="y"){ 
      wrongSide = Math.abs(movingSpherePosition.y - collisionSpherePosition.y);
      var projection = new THREE.Vector3(collisionSpherePosition.x,movingSpherePosition.y,collisionSpherePosition.z );
      fixedSide =  movingSpherePosition.distanceTo(projection);
      if(movingSpherePosition.y < collisionSpherePosition.y) sign = -1 ;
    }
    else{ 
      wrongSide = Math.abs(movingSpherePosition.z - collisionSpherePosition.z);
      var projection = new THREE.Vector3(collisionSpherePosition.x,collisionSpherePosition.y,movingSpherePosition.z ); 
      fixedSide =  movingSpherePosition.distanceTo(projection); 
      if(movingSpherePosition.z < collisionSpherePosition.z) sign = -1 ;  
    }   
    
    var rightSide = Math.sqrt ( ((calculatedHypotenuse*calculatedHypotenuse) - (fixedSide*fixedSide) )); 

    var offset = parseFloat( rightSide - wrongSide );
    return (sign*offset);
  };
  Motifeditor.prototype.customBox = function(points) { 
    if(this.unitCellAtoms.length === 0){
      return new THREE.Geometry();
    }
    var vertices = [];
    var faces = [];
    var _this = this ;

    if(this.latticeName !== 'hexagonal'){
      vertices.push(points['_000'].position); // 0
      vertices.push(points['_010'].position); // 1
      vertices.push(points['_011'].position); // 2

      vertices.push(points['_001'].position); // 3
      vertices.push(points['_101'].position); // 4
      vertices.push(points['_111'].position); // 5
      vertices.push(points['_110'].position); // 6
      vertices.push(points['_100'].position); // 7

      faces.push(new THREE.Face3(0,1,2));
      faces.push(new THREE.Face3(0,2,3));

      faces.push(new THREE.Face3(3,2,5));
      faces.push(new THREE.Face3(3,5,4));
   
      faces.push(new THREE.Face3(4,5,6));
      faces.push(new THREE.Face3(4,6,7));

      faces.push(new THREE.Face3(7,6,1));
      faces.push(new THREE.Face3(7,1,0));

      faces.push(new THREE.Face3(7,0,3));
      faces.push(new THREE.Face3(7,3,4));

      faces.push(new THREE.Face3(2,1,6));
      faces.push(new THREE.Face3(2,6,5)); 
    }
    else{
      var bottomFacePoints=[];
      var upperFacePoints=[]; 
      _.times(2, function(_y) {  
        _.times(6 , function(_r) { 

          var v = new THREE.Vector3( _this.cellParameters.scaleZ, 0, 0 ); 
          var axis = new THREE.Vector3( 0, 1, 0 );
          var angle = (Math.PI / 3) * _r ; 
          v.applyAxisAngle( axis, angle );

          var z = v.z ;
          var y = v.y + _y*_this.cellParameters.scaleY ;
          var x = v.x ; 
          var position = new THREE.Vector3( x, y, z);
          
          if(_y > 0){
            upperFacePoints.push(position);
          }
          else{
            bottomFacePoints.push(position);
          }
        }); 
      }); 

      for (var i = 0; i<6; i++) {
        vertices[i] = bottomFacePoints[i];
        vertices[i+6] = upperFacePoints[i];
      };
      
      for (var i = 0; i<4; i++) {
        faces.push(new THREE.Face3(0,i+1,i+2));
        faces.push(new THREE.Face3(i+8,i+7,6)); 
      } 
      for (var i = 0; i<5; i++) { 
        faces.push(new THREE.Face3(i+7,i+1,i));
        faces.push(new THREE.Face3(i+6,i+7,i));
      } 
      faces.push(new THREE.Face3(6,0,5));
      faces.push(new THREE.Face3(11,6,5));
    } 
 
    var geom = new THREE.Geometry();
    geom.vertices = vertices;
    geom.faces = faces;
    geom.mergeVertices();  
    geom.computeFaceNormals();
    return geom;
  }
  function customBox2(points) { 
    var vertices = [];
    var faces = []; 
    
    vertices.push(points['_111'].position); // 0
    vertices.push(points['_110'].position); // 1
    vertices.push(points['_101'].position); // 2 
    vertices.push(points['_100'].position); // 3
    vertices.push(points['_010'].position); // 4
    vertices.push(points['_011'].position); // 5
    vertices.push(points['_000'].position); // 6
    vertices.push(points['_001'].position); // 7

    faces.push(new THREE.Face3(0,2,1));
    faces.push(new THREE.Face3(2,3,1));

    faces.push(new THREE.Face3(4,6,5));
    faces.push(new THREE.Face3(6,7,5));
 
    faces.push(new THREE.Face3(4,5,1));
    faces.push(new THREE.Face3(5,0,1));

    faces.push(new THREE.Face3(7,6,2));
    faces.push(new THREE.Face3(6,3,2));

    faces.push(new THREE.Face3(5,7,0));
    faces.push(new THREE.Face3(7,2,0));

    faces.push(new THREE.Face3(1,3,4));
    faces.push(new THREE.Face3(3,6,4)); 
      
    var geometry = new THREE.Geometry();
    geometry.vertices = vertices;
    geometry.faces = faces;
        
    geometry.computeFaceNormals(); 
    geometry.computeVertexNormals();

    return geometry;
 
  }
  function flipNormals(geometry){
    for ( var i = 0; i < geometry.faces.length; i ++ ) {

      var face = geometry.faces[ i ];
      var temp = face.a;
      face.a = face.c;
      face.c = temp;

    }
     
    var faceVertexUvs = geometry.faceVertexUvs[ 0 ];
    for ( var i = 0; i < faceVertexUvs.length; i ++ ) {
    
      var temp = faceVertexUvs[ i ][ 0 ];
      faceVertexUvs[ i ][ 0 ] = faceVertexUvs[ i ][ 2 ];
      faceVertexUvs[ i ][ 2 ] = temp;
    
    } 
    return geometry;
  }; 
  Motifeditor.prototype.renderingModeChange = function(arg){ 

    this.renderingMode = arg.mode;

    if(arg.mode === 'wireframe'){
      this.menu.editMEInputs( { 'opacity' : 0} );
      if(this.unitCellAtoms.length !== 0 ){
        for (var i = 0, len = this.unitCellAtoms.length; i < len; i++) {
          this.unitCellAtoms[i].wireframeMat(true);
        } 
      }
    }
    else if(arg.mode === 'toon'){ 
      if(this.unitCellAtoms.length !== 0 ){ 
        for (var i = 0, len = this.unitCellAtoms.length; i < len; i++) {
          this.unitCellAtoms[i].wireframeMat(false);
        } 
      }
      for (var i = 0, len = this.unitCellAtoms.length; i < len; i++) {
        this.unitCellAtoms[i].coonMode(true);
      }
    }
    else if(arg.mode === 'flat'){
      if(this.unitCellAtoms.length !== 0 ){ 
        for (var i = 0, len = this.unitCellAtoms.length; i < len; i++) {
            this.unitCellAtoms[i].wireframeMat(false);
          } 
        for (var i = 0, len = this.unitCellAtoms.length; i < len; i++) {
          this.unitCellAtoms[i].flatMode(true);
        } 
      }
    }
    else if(arg.mode === 'realistic'){
      if(this.unitCellAtoms.length !== 0 ){ 
        for (var i = 0, len = this.unitCellAtoms.length; i < len; i++) {
            this.unitCellAtoms[i].wireframeMat(false);
          }  
        for (var i = 0, len = this.unitCellAtoms.length; i < len; i++) {
          this.unitCellAtoms[i].realisticMode(true);
        } 
      }
    }
  };
  Motifeditor.prototype.offsetMotifsPointsScaling = function(recreate){ 

    var atoms = this.cachedAtoms;
    var objName = 'cellGradeLimited';
      
    var i = 0, j = 0;
     
    var arr = [{a : 0, b : 1},{a : 1, b : 0},{a : 0, b : -1},{a : -1, b : 0}];
    var halfX = this.cellParameters.scaleX * 0.5;
    var halfY = this.cellParameters.scaleY * 0.5;
    var halfZ = this.cellParameters.scaleZ * 0.5;

    var leftPos = new THREE.Vector3(0, halfY, halfZ);
    var rightPos = new THREE.Vector3(this.cellParameters.scaleX, halfY, halfZ);
    var frontPos = new THREE.Vector3(halfX, halfY, this.cellParameters.scaleZ);
    var backPos = new THREE.Vector3(halfX, halfY, 0);
    var upPos = new THREE.Vector3(halfX, this.cellParameters.scaleY, halfZ);
    var downPos = new THREE.Vector3(halfX, 0, halfZ);

    var centerPos = new THREE.Vector3(halfX, halfY, halfZ);

    if(this.latticeType === 'face'){  
    
        for ( i = 0; i < 4; i ++ ) {
          if(recreate === true){
            this.cachedAtomsPositions["face"+i+'_1'] = {
              "position" : new THREE.Vector3( leftPos.x, leftPos.y + arr[i].b * this.cellParameters.scaleY, leftPos.z + arr[i].a * this.cellParameters.scaleZ ), 
              "latticeIndex" : "face"+i+'_1'
            } ;  
          }
          else{ 
            this.cachedAtomsPositions["face"+i+'_1'].position = new THREE.Vector3( leftPos.x, leftPos.y + arr[i].b * this.cellParameters.scaleY, leftPos.z + arr[i].a * this.cellParameters.scaleZ );  
          }
          
          if(recreate === true){
            this.cachedAtomsPositions["face"+i+'_2'] = {
              "position" : new THREE.Vector3( rightPos.x, rightPos.y + arr[i].b * this.cellParameters.scaleY, rightPos.z + arr[i].a * this.cellParameters.scaleZ ), 
              "latticeIndex" : "face"+i+'_2'
            } ;
          }
          else{
            this.cachedAtomsPositions["face"+i+'_2'].position = new THREE.Vector3( rightPos.x, rightPos.y + arr[i].b * this.cellParameters.scaleY, rightPos.z + arr[i].a * this.cellParameters.scaleZ );  
          }
          
          if(recreate === true){
            this.cachedAtomsPositions["face"+i+'_3'] = {
              "position" : new THREE.Vector3(frontPos.x + arr[i].a * this.cellParameters.scaleX, frontPos.y + arr[i].b * this.cellParameters.scaleY, frontPos.z), 
              "latticeIndex" : "face"+i+'_3'
            } ;
          }
          else{
            this.cachedAtomsPositions["face"+i+'_3'].position = new THREE.Vector3(frontPos.x + arr[i].a * this.cellParameters.scaleX, frontPos.y + arr[i].b * this.cellParameters.scaleY, frontPos.z);  
          }
          
          if(recreate === true){
            this.cachedAtomsPositions["face"+i+'_4'] = {
              "position" : new THREE.Vector3(backPos.x + arr[i].a * this.cellParameters.scaleX, backPos.y + arr[i].b * this.cellParameters.scaleY,backPos.z), 
              "latticeIndex" : "face"+i+'_4'
            } ;
          }
          else{
            this.cachedAtomsPositions["face"+i+'_4'].position = new THREE.Vector3(backPos.x + arr[i].a * this.cellParameters.scaleX, backPos.y + arr[i].b * this.cellParameters.scaleY,backPos.z);  
          }
          
          if(recreate === true){
            this.cachedAtomsPositions["face"+i+'_5'] = {
              "position" : new THREE.Vector3( 
                  upPos.x + arr[i].b * this.cellParameters.scaleX,
                  upPos.y,
                  upPos.z + arr[i].a * this.cellParameters.scaleZ
                ), 
              "latticeIndex" : "face"+i+'_5'
            } ;
          }
          else{
            this.cachedAtomsPositions["face"+i+'_5'].position = new THREE.Vector3( 
              upPos.x + arr[i].b * this.cellParameters.scaleX,
              upPos.y,
              upPos.z + arr[i].a * this.cellParameters.scaleZ
            );
          }
          
          if(recreate === true){
            this.cachedAtomsPositions["face"+i+'_6'] = {
              "position" : new THREE.Vector3( 
                  downPos.x + arr[i].b * this.cellParameters.scaleX,
                  downPos.y,
                  downPos.z + arr[i].a * this.cellParameters.scaleZ
                ), 
              "latticeIndex" : "face"+i+'_6'
            } ; 
          }
          else{
            this.cachedAtomsPositions["face"+i+'_6'].position = new THREE.Vector3( 
              downPos.x + arr[i].b * this.cellParameters.scaleX,
              downPos.y,
              downPos.z + arr[i].a * this.cellParameters.scaleZ
            );
          }
            
        }
         
    }
    else if(this.latticeType === 'base'){
        for ( i = 0; i < 4; i ++ ) {
          
          if(recreate === true){
            this.cachedAtomsPositions["base"+i+'_1'] = {
              "position" : new THREE.Vector3(
                  upPos.x + arr[i].b * this.cellParameters.scaleX,
                  upPos.y,
                  upPos.z + arr[i].a * this.cellParameters.scaleZ
                ),
              "latticeIndex" : "base"+i+'_1'
            } ; 
          }
          else{
            this.cachedAtomsPositions["base"+i+'_1'].position = new THREE.Vector3(
              upPos.x + arr[i].b * this.cellParameters.scaleX,
              upPos.y,
              upPos.z + arr[i].a * this.cellParameters.scaleZ
            );
          }
          
          if(recreate === true){
            this.cachedAtomsPositions["base"+i+'_2'] = {
              "position" : new THREE.Vector3(
                  downPos.x + arr[i].b * this.cellParameters.scaleX,
                  downPos.y,
                  downPos.z + arr[i].a * this.cellParameters.scaleZ
                ),
              "latticeIndex" : "base"+i+'_2'
            } ; 
          }
          else{
            this.cachedAtomsPositions["base"+i+'_2'].position = new THREE.Vector3(
              downPos.x + arr[i].b * this.cellParameters.scaleX,
              downPos.y,
              downPos.z + arr[i].a * this.cellParameters.scaleZ
            );
          } 
        } 
    } 
    else if(this.latticeType === 'body'){ 
        for ( i = 0; i < 4; i ++ ) {
          if(recreate === true){
            this.cachedAtomsPositions["body"+i+'_1'] = {
              "position" : new THREE.Vector3(
                  centerPos.x,
                  centerPos.y + arr[i].b * this.cellParameters.scaleY,
                  centerPos.z + arr[i].a * this.cellParameters.scaleZ
                ), 
              "latticeIndex" : "body"+i+'_1'
            } ; 
          }
          else{
            this.cachedAtomsPositions["body"+i+'_1'].position = new THREE.Vector3(
              centerPos.x,
              centerPos.y + arr[i].b * this.cellParameters.scaleY,
              centerPos.z + arr[i].a * this.cellParameters.scaleZ
            );
          }  
        }

        if(recreate === true){
          this.cachedAtomsPositions['body_1'] = {
            "position" : new THREE.Vector3(
                centerPos.x -1*this.cellParameters.scaleX,
                centerPos.y,
                centerPos.z
              ),
            "latticeIndex" : 'body_1'
          } ; 
        }
        else{
          this.cachedAtomsPositions['body_1'].position = new THREE.Vector3(
            centerPos.x -1*this.cellParameters.scaleX,
            centerPos.y,
            centerPos.z
          );
        } 

        if(recreate === true){
          this.cachedAtomsPositions['body_2'] = {
            "position" : new THREE.Vector3(
                centerPos.x +1*this.cellParameters.scaleX,
                centerPos.y,
                centerPos.z
              ),
            "latticeIndex" : 'body_2'
          } ;
        }
        else{
          this.cachedAtomsPositions['body_2'].position = new THREE.Vector3(
            centerPos.x +1*this.cellParameters.scaleX,
            centerPos.y,
            centerPos.z
          );
        } 
 
    }   
     
  }; 
  Motifeditor.prototype.createAdditionalAtoms = function(){
    var atoms = this.cachedAtoms;
    var objName = 'cellGradeLimited';
    var _this = this;
    var k = 0;

    while(k < this.cachedAtoms.length ){  
      this.cachedAtoms[k].destroy();    
      k++; 
    }  
    this.cachedAtoms.splice(0);

    for (var d = atoms.length - 1; d >= 0; d--) { 
      atoms[d].removesubtractedForCache();
      UnitCellExplorer.remove({'object3d' : atoms[d].object3d}); 
    };

    var i = 0, j = 0;

    var arr = [{a : 0, b : 1},{a : 1, b : 0},{a : 0, b : -1},{a : -1, b : 0}];
    var halfX = this.cellParameters.scaleX * 0.5;
    var halfY = this.cellParameters.scaleY * 0.5;
    var halfZ = this.cellParameters.scaleZ * 0.5;

    var leftPos = new THREE.Vector3(0, halfY, halfZ);
    var rightPos = new THREE.Vector3(this.cellParameters.scaleX, halfY, halfZ);
    var frontPos = new THREE.Vector3(halfX, halfY, this.cellParameters.scaleZ);
    var backPos = new THREE.Vector3(halfX, halfY, 0);
    var upPos = new THREE.Vector3(halfX, this.cellParameters.scaleY, halfZ);
    var downPos = new THREE.Vector3(halfX, 0, halfZ);

    var centerPos = new THREE.Vector3(halfX, halfY, halfZ);
    var renderingMode = this.renderingMode; 

    if(this.newSphere !== undefined){
      this.motifsAtoms.push(this.newSphere);
    }
      
    if(this.latticeType === 'face'){ 
      while(j <this.motifsAtoms.length) {

        var p = {x : this.motifsAtoms[j].position.x, y : this.motifsAtoms[j].position.y, z : this.motifsAtoms[j].position.z};
        var radius = this.motifsAtoms[j].radius; 
        var color = this.motifsAtoms[j].color; 
        var id = this.motifsAtoms[j].myID; 
        var elementName = this.motifsAtoms[j].elementName;  
        var opacity = this.motifsAtoms[j].opacity;  
        var ionicIndex = this.motifsAtoms[j].ionicIndex;  
        var identity;

        for ( i = 0; i < 4; i ++ ) { 
          identity = "face"+i+'_1';
          this.cachedAtoms.push(
            new UnitCellAtom( 
              this.LOD.level, 
              new THREE.Vector3( 
                p.x + this.cachedAtomsPositions[identity].position.x,
                p.y + this.cachedAtomsPositions[identity].position.y,
                p.z + this.cachedAtomsPositions[identity].position.z 
              ), 
              radius, 
              color, 
              false, 
              elementName, 
              id, 
              identity,
              opacity,
              renderingMode,
              ionicIndex,
              _this.labeling
            )
          );
          this.cachedAtoms[this.cachedAtoms.length-1].setUserOffset("x",p.x );
          this.cachedAtoms[this.cachedAtoms.length-1].setUserOffset("y",p.y );
          this.cachedAtoms[this.cachedAtoms.length-1].setUserOffset("z",p.z );

          identity = "face"+i+'_2';
          this.cachedAtoms.push(
            new UnitCellAtom( 
              this.LOD.level, 
              new THREE.Vector3( 
                p.x + this.cachedAtomsPositions[identity].position.x,
                p.y + this.cachedAtomsPositions[identity].position.y,
                p.z + this.cachedAtomsPositions[identity].position.z 
              ),  
              radius, 
              color, 
              false, 
              elementName, 
              id, 
              identity,
              opacity,
              renderingMode,
              _this.labeling
            )
          );
          this.cachedAtoms[this.cachedAtoms.length-1].setUserOffset("x",p.x );
          this.cachedAtoms[this.cachedAtoms.length-1].setUserOffset("y",p.y );
          this.cachedAtoms[this.cachedAtoms.length-1].setUserOffset("z",p.z );

          identity = "face"+i+'_3';
          this.cachedAtoms.push(
            new UnitCellAtom( 
              this.LOD.level, 
              new THREE.Vector3( 
                p.x + this.cachedAtomsPositions[identity].position.x,
                p.y + this.cachedAtomsPositions[identity].position.y,
                p.z + this.cachedAtomsPositions[identity].position.z 
              ), 
              radius, 
              color, 
              false, 
              elementName, 
              id, 
              identity,
              opacity,
              renderingMode,
              ionicIndex,
              _this.labeling
            )
          );
          this.cachedAtoms[this.cachedAtoms.length-1].setUserOffset("x",p.x );
          this.cachedAtoms[this.cachedAtoms.length-1].setUserOffset("y",p.y );
          this.cachedAtoms[this.cachedAtoms.length-1].setUserOffset("z",p.z );

          identity = "face"+i+'_4';
          this.cachedAtoms.push(
            new UnitCellAtom( 
              this.LOD.level, 
              new THREE.Vector3( 
                p.x + this.cachedAtomsPositions[identity].position.x,
                p.y + this.cachedAtomsPositions[identity].position.y,
                p.z + this.cachedAtomsPositions[identity].position.z 
              ), 
              radius, 
              color, 
              false, 
              elementName, 
              id, 
              identity,
              opacity,
              renderingMode,
              ionicIndex,
              _this.labeling
            )
          );
          this.cachedAtoms[this.cachedAtoms.length-1].setUserOffset("x",p.x );
          this.cachedAtoms[this.cachedAtoms.length-1].setUserOffset("y",p.y );
          this.cachedAtoms[this.cachedAtoms.length-1].setUserOffset("z",p.z );

          identity = "face"+i+'_5';
          this.cachedAtoms.push(
            new UnitCellAtom( 
              this.LOD.level, 
              new THREE.Vector3( 
                p.x + this.cachedAtomsPositions[identity].position.x,
                p.y + this.cachedAtomsPositions[identity].position.y,
                p.z + this.cachedAtomsPositions[identity].position.z 
              ),  
              radius, 
              color, 
              false, 
              elementName, 
              id, 
              identity,
              opacity,
              renderingMode,
              _this.labeling
            )
          ); 
          this.cachedAtoms[this.cachedAtoms.length-1].setUserOffset("x",p.x );
          this.cachedAtoms[this.cachedAtoms.length-1].setUserOffset("y",p.y );
          this.cachedAtoms[this.cachedAtoms.length-1].setUserOffset("z",p.z );

          identity = "face"+i+'_6';
          this.cachedAtoms.push(
            new UnitCellAtom( 
              this.LOD.level, 
              new THREE.Vector3( 
                p.x + this.cachedAtomsPositions[identity].position.x,
                p.y + this.cachedAtomsPositions[identity].position.y,
                p.z + this.cachedAtomsPositions[identity].position.z 
              ), 
              radius, 
              color, 
              false, 
              elementName, 
              id, 
              identity,
              opacity,
              renderingMode,
              ionicIndex,
              _this.labeling
            )
          );  
          this.cachedAtoms[this.cachedAtoms.length-1].setUserOffset("x",p.x );
          this.cachedAtoms[this.cachedAtoms.length-1].setUserOffset("y",p.y );
          this.cachedAtoms[this.cachedAtoms.length-1].setUserOffset("z",p.z );
        }
        j++;
      } 
    }
    else if(this.latticeType === 'base'){
      while(j <this.motifsAtoms.length) {
        var p = {x : this.motifsAtoms[j].position.x, y : this.motifsAtoms[j].position.y, z : this.motifsAtoms[j].position.z}; 
        var radius = this.motifsAtoms[j].radius; 
        var color = this.motifsAtoms[j].color; 
        var id = this.motifsAtoms[j].myID; 
        var elementName = this.motifsAtoms[j].elementName;   
        var opacity = this.motifsAtoms[j].opacity;  
        var ionicIndex = this.motifsAtoms[j].ionicIndex;  
        var identity;
 
        for ( i = 0; i < 4; i ++ ) {
          identity = "base"+i+'_1'; 
          this.cachedAtoms.push(
            new UnitCellAtom( 
              this.LOD.level, 
              new THREE.Vector3( 
                p.x + this.cachedAtomsPositions[identity].position.x,
                p.y + this.cachedAtomsPositions[identity].position.y,
                p.z + this.cachedAtomsPositions[identity].position.z 
              ),  
              radius, 
              color, 
              false, 
              elementName, 
              id, 
              identity,
              opacity,
              renderingMode,
              ionicIndex,
              _this.labeling
            )
          ); 
          this.cachedAtoms[this.cachedAtoms.length-1].setUserOffset("x",p.x );
          this.cachedAtoms[this.cachedAtoms.length-1].setUserOffset("y",p.y );
          this.cachedAtoms[this.cachedAtoms.length-1].setUserOffset("z",p.z );

          identity = "base"+i+'_2';
          this.cachedAtoms.push(
            new UnitCellAtom( 
              this.LOD.level, 
              new THREE.Vector3( 
                p.x + this.cachedAtomsPositions[identity].position.x,
                p.y + this.cachedAtomsPositions[identity].position.y,
                p.z + this.cachedAtomsPositions[identity].position.z 
              ),  
              radius, 
              color, 
              false, 
              elementName, 
              id, 
              identity,
              opacity,
              renderingMode,
              ionicIndex,
              _this.labeling
            )
          );   
          this.cachedAtoms[this.cachedAtoms.length-1].setUserOffset("x",p.x );
          this.cachedAtoms[this.cachedAtoms.length-1].setUserOffset("y",p.y );
          this.cachedAtoms[this.cachedAtoms.length-1].setUserOffset("z",p.z );
        }
        j++;
      }
    } 
    else if(this.latticeType === 'body'){
      while(j <this.motifsAtoms.length) {
        var p = {x : this.motifsAtoms[j].position.x, y : this.motifsAtoms[j].position.y, z : this.motifsAtoms[j].position.z}; 

        var radius = this.motifsAtoms[j].radius; 
        var color = this.motifsAtoms[j].color; 
        var id = this.motifsAtoms[j].myID; 
        var elementName = this.motifsAtoms[j].elementName;  
        var ionicIndex = this.motifsAtoms[j].ionicIndex;  
        var identity ; 
        var opacity = this.motifsAtoms[j].opacity; 
         
        for ( i = 0; i < 4; i ++ ) {
          identity = "body"+i+'_1';
          this.cachedAtoms.push(
            new UnitCellAtom( 
              this.LOD.level, 
              new THREE.Vector3( 
                p.x + this.cachedAtomsPositions[identity].position.x,
                p.y + this.cachedAtomsPositions[identity].position.y,
                p.z + this.cachedAtomsPositions[identity].position.z 
              ),  
              radius, 
              color, 
              false, 
              elementName, 
              id, 
              identity,
              opacity,
              renderingMode,
              ionicIndex,
              _this.labeling 
            )
          ); 
          this.cachedAtoms[this.cachedAtoms.length-1].setUserOffset("x",p.x );
          this.cachedAtoms[this.cachedAtoms.length-1].setUserOffset("y",p.y );
          this.cachedAtoms[this.cachedAtoms.length-1].setUserOffset("z",p.z ); 
        } 
        j++;
      }
      identity = 'body_1';
      this.cachedAtoms.push(
        new UnitCellAtom( 
          this.LOD.level, 
          new THREE.Vector3( 
            p.x + this.cachedAtomsPositions[identity].position.x,
            p.y + this.cachedAtomsPositions[identity].position.y,
            p.z + this.cachedAtomsPositions[identity].position.z 
          ),  
          radius, 
          color, 
          false, 
          elementName, 
          id, 
          identity,
          opacity,
          renderingMode,
          ionicIndex,
          _this.labeling
        )
      );
      this.cachedAtoms[this.cachedAtoms.length-1].setUserOffset("x",p.x );
      this.cachedAtoms[this.cachedAtoms.length-1].setUserOffset("y",p.y );
      this.cachedAtoms[this.cachedAtoms.length-1].setUserOffset("z",p.z );

      identity = 'body_2';
      this.cachedAtoms.push(
        new UnitCellAtom( 
          this.LOD.level, 
          new THREE.Vector3( 
            p.x + this.cachedAtomsPositions[identity].position.x,
            p.y + this.cachedAtomsPositions[identity].position.y,
            p.z + this.cachedAtomsPositions[identity].position.z 
          ), 
          radius, 
          color, 
          false, 
          elementName, 
          id, 
          identity,
          opacity,
          renderingMode,
          ionicIndex,
          _this.labeling
        )
      ); 
      this.cachedAtoms[this.cachedAtoms.length-1].setUserOffset("x",p.x );
      this.cachedAtoms[this.cachedAtoms.length-1].setUserOffset("y",p.y );
      this.cachedAtoms[this.cachedAtoms.length-1].setUserOffset("z",p.z ); 
    } 
    else if(this.latticeName === 'hexagonal'){
      while(j <this.motifsAtoms.length) {
        var p = {x : this.motifsAtoms[j].position.x, y : this.motifsAtoms[j].position.y, z : this.motifsAtoms[j].position.z};

        var radius = this.motifsAtoms[j].radius; 
        var color = this.motifsAtoms[j].color; 
        var id = this.motifsAtoms[j].myID; 
        var elementName = this.motifsAtoms[j].elementName;  
        var ionicIndex = this.motifsAtoms[j].ionicIndex;  
        var identity ; 
        var opacity = this.motifsAtoms[j].opacity; 
        
        var a = this.cellParameters.scaleZ * Math.sqrt(3) ;
        var c = this.cellParameters.scaleY  ; 

        var vertDist = a * Math.sqrt(3);

        _.times(2, function(_y) {
          _.times(1 , function(_x) {
            _.times(1 , function(_z) { 
              _.times(6 , function(_r) {
               
                var v = new THREE.Vector3( a, 0, 0 );

                var axis = new THREE.Vector3( 0, 1, 0 );
                var angle = (Math.PI / 3) * _r + Math.PI/6; 
                v.applyAxisAngle( axis, angle );

                var z = (_x % 2==0) ? (v.z + _z*vertDist) : ((v.z + _z*vertDist + vertDist/2));
                var y =  v.y + _y*c ;
                var x = v.x + _x*a*1.5 ;
                var zC = (_x % 2==0) ? (_z*vertDist) : (( _z*vertDist + vertDist/2));
                var yC =  _y*c ;
                var xC =  _x*a*1.5 ;
                var pos = new THREE.Vector3( x, y, z);   
                var reference = 'h_'+_x+_y+_z+_r;

                _this.cachedAtoms.push(
                  new UnitCellAtom( 
                    _this.LOD.level, 
                    new THREE.Vector3(
                      pos.x + p.x, 
                      pos.y + p.y,  
                      pos.z + p.z ), 
                    radius, 
                    color,
                    false, 
                    name, 
                    id, 
                    reference, 
                    opacity,
                    _this.renderingMode,
                    ionicIndex,
                    _this.labeling
                  ) 
                );  
                _this.cachedAtoms[_this.cachedAtoms.length-1].setUserOffset("x",p.x );
                _this.cachedAtoms[_this.cachedAtoms.length-1].setUserOffset("y",p.y );
                _this.cachedAtoms[_this.cachedAtoms.length-1].setUserOffset("z",p.z ); 
                
              });
            });
          });
        });  

        this.cachedAtoms.push(
          new UnitCellAtom( 
            this.LOD.level, 
            new THREE.Vector3(
              p.x,
              p.y + this.cellParameters.scaleY*2 ,  
              p.z), 
            radius, 
            color,
            false, 
            name, 
            id, 
            'h_c_up', 
            opacity,
            this.renderingMode,
            ionicIndex,
            this.labeling
          ) 
        );  
        this.cachedAtoms[_this.cachedAtoms.length-1].setUserOffset("x",p.x );
        this.cachedAtoms[_this.cachedAtoms.length-1].setUserOffset("y",p.y );
        this.cachedAtoms[_this.cachedAtoms.length-1].setUserOffset("z",p.z );

        this.cachedAtoms.push(
          new UnitCellAtom( 
            this.LOD.level, 
            new THREE.Vector3(
              p.x,
              p.y + this.cellParameters.scaleY*-1 ,  
              p.z), 
            radius, 
            color,
            false, 
            name, 
            id,  
            'h_c_down', 
            opacity,
            this.renderingMode,
            ionicIndex,
            this.labeling
          ) 
        );  
        this.cachedAtoms[_this.cachedAtoms.length-1].setUserOffset("x",p.x );
        this.cachedAtoms[_this.cachedAtoms.length-1].setUserOffset("y",p.y );
        this.cachedAtoms[_this.cachedAtoms.length-1].setUserOffset("z",p.z );

      j++;
      }
    }

    if(this.newSphere !== undefined){
      this.motifsAtoms.pop();
    }
        
  }; 
  Motifeditor.prototype.subtractedSolidView = function(box, mesh) {
    var _this = this; 
    
    var cube = THREE.CSG.toCSG(box);
    cube = cube.inverse();
    var sphere = THREE.CSG.toCSG(mesh);
    var geometry = sphere.intersect(cube);
    var geom = THREE.CSG.fromCSG(geometry);
    var finalGeom = assignUVs(geom);
    
    var sphereCut = new THREE.Mesh( finalGeom, mesh.material.clone()); 
    sphereCut.receiveShadow = true; 
    sphereCut.castShadow = true; 
    
    return sphereCut;

  };
  Motifeditor.prototype.editObjectsInScene = function(name, action, visible){ 
    var finished = false, found = false;
    var scene = UnitCellExplorer.getInstance().object3d;
    scene.traverse (function (object)
    { 
      if (object.name === name){
        
        found = true;
        if(action === 'remove'){ 
          scene.remove(object);
        }
        else if(action === 'visibility'){  
          object.visible = visible;
        }
      }  
    });
  
    return found;
  };
  Motifeditor.prototype.setCSGmode = function(arg, reset, reconstruct){ 
    var _this = this, i = 0;
    
    if(this.unitCellAtoms.length === 0){
      return;
    }
    this.viewMode = arg.mode;
 
    var g = this.customBox(this.unitCellPositions, this.latticeName);

    var box = new THREE.Mesh( g, new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, color: "#FF0000"}) );
    var scene = UnitCellExplorer.getInstance().object3d;
    
    if(this.viewMode === 'cellSubstracted'){ 

      this.editObjectsInScene('cellSolidVoid', 'visibility', false); 

      if(this.cellNeedsRecalculation.cellSubstracted === false && this.unitCellAtoms[0].subtractedForCache.object3d !== undefined){
        while(i < this.unitCellAtoms.length ){ 
          this.unitCellAtoms[i].object3d.visible = false; 
          this.unitCellAtoms[i].subtractedForCache.object3d.visible = true;  
          i++;
        }

        i =0;
        while(i < this.cachedAtoms.length ){ 
          this.cachedAtoms[i].object3d.visible = false; 
          this.cachedAtoms[i].subtractedForCache.object3d.visible = true;  
          i++;
        }
      }
      else{
        this.cellNeedsRecalculation.cellSubstracted = false;
        while(i < this.unitCellAtoms.length ) {
          this.unitCellAtoms[i].object3d.visible = false; 
          this.unitCellAtoms[i].subtractedSolidView(box, this.unitCellAtoms[i].object3d.position, true);  
          i++;
        } 
         
        i = 0;

        while(i < this.cachedAtoms.length ) {     
          this.cachedAtoms[i].object3d.visible = false; 
          this.cachedAtoms[i].subtractedSolidView(box, this.cachedAtoms[i].object3d.position, true);
          i++;
        } 
      }
 
      PubSub.publish(events.VIEW_STATE,"cellSubstracted");  
    }
    else if(this.viewMode === 'cellSolidVoid'){   
  
      var f = this.editObjectsInScene('cellSolidVoid', 'visibility', true);
 
      i = 0;
      while(i < this.unitCellAtoms.length ) { 
        this.unitCellAtoms[i].object3d.visible = false;     
        if(this.unitCellAtoms[i].subtractedForCache.object3d !== undefined){
          this.unitCellAtoms[i].subtractedForCache.object3d.visible = false;  
        }
        i++; 
      }

      i = 0;
      while(i < this.cachedAtoms.length ) { 
        this.cachedAtoms[i].object3d.visible = false;     
        if(this.cachedAtoms[i].subtractedForCache.object3d !== undefined){
          this.cachedAtoms[i].subtractedForCache.object3d.visible = false;  
        }
        i++; 
      }
 
      if(this.cellNeedsRecalculation.cellSolidVoid === false && f === true){
         return;
      }
      this.cellNeedsRecalculation.cellSolidVoid = false;
      
      var geometry = new THREE.Geometry(); 

      i = 0;

      var globalG = (this.unitCellAtoms[0] === undefined) ? undefined : this.unitCellAtoms[0].object3d.children[0].geometry.clone();

      while(i < this.unitCellAtoms.length ) {  
        this.unitCellAtoms[i].SolidVoid(this.unitCellAtoms[i].object3d.position);  
        var mesh = new THREE.Mesh(globalG, new THREE.MeshBasicMaterial() );
        mesh.scale.set(this.unitCellAtoms[i].getRadius(), this.unitCellAtoms[i].getRadius(), this.unitCellAtoms[i].getRadius());
        mesh.position.set( this.unitCellAtoms[i].object3d.position.x, this.unitCellAtoms[i].object3d.position.y, this.unitCellAtoms[i].object3d.position.z);
        mesh.updateMatrix();   
        geometry.merge( mesh.geometry, mesh.matrix ); 
        i++; 
      } 

      i=0;
  
      while(i < this.cachedAtoms.length ) { 
        this.cachedAtoms[i].SolidVoid(this.cachedAtoms[i].object3d.position);  
        var mesh = new THREE.Mesh(globalG, new THREE.MeshBasicMaterial() );
        mesh.scale.set(this.cachedAtoms[i].getRadius(), this.cachedAtoms[i].getRadius(), this.cachedAtoms[i].getRadius());
        mesh.position.set( this.cachedAtoms[i].object3d.position.x, this.cachedAtoms[i].object3d.position.y, this.cachedAtoms[i].object3d.position.z);
        mesh.updateMatrix();   
        geometry.merge( mesh.geometry, mesh.matrix ); 
        i++;  
      } 

      var cube = THREE.CSG.toCSG(box); 
      cube = cube.inverse();
      var spheres = THREE.CSG.toCSG(geometry);
       
      var geometryCSG = cube.subtract(spheres); 

      var geom = THREE.CSG.fromCSG(geometryCSG);
      var finalGeom = assignUVs(geom);
      
      var opacity = 0.5;

      for (var i = this.motifsAtoms.length - 1; i >= 0; i--) {
        if(this.motifsAtoms[i].opacity === 1 ){
          opacity = 1;
        }
      };
      if(this.newSphere !== undefined && this.newSphere.opacity === 1){
        opacity = 1;
      }

      var material = this.createMaterial("#9A2EFE", opacity);

      var solidBox = new THREE.Mesh( finalGeom, material );
      solidBox.name = 'cellSolidVoid';
      UnitCellExplorer.add({'object3d' : solidBox}); 
      PubSub.publish(events.VIEW_STATE,"cellSolidVoid"); 
    }
    else if(this.viewMode === 'cellGradeLimited'){ 
  
      this.editObjectsInScene('cellSolidVoid', 'visibility', false);

      var box = new THREE.Mesh(g, new THREE.MeshBasicMaterial({side: THREE.DoubleSide,transparent:true, opacity:0.2, color:0xFF0000}));
      box.visible = false;
      
      // find geometry's center
      var centroid = new THREE.Vector3(); 
      for ( var z = 0, l = g.vertices.length; z < l; z ++ ) {
        centroid.add( g.vertices[ z ] ); 
      }  
      centroid.divideScalar( g.vertices.length );
       
      UnitCellExplorer.add({'object3d' : box }); 

      var collidableMeshList = [] ;
      collidableMeshList.push(box);
        
      i=0;
    
      var dir = new THREE.Vector3(1,1000000,1); 

      while(i < this.unitCellAtoms.length ) {    
         
        this.unitCellAtoms[i].object3d.visible = true;  
           
        // workaround for points that are exactly on the grade (faces, cell points)
        var smartOffset = centroid.clone().sub(this.unitCellAtoms[i].object3d.position.clone());
        smartOffset.setLength(0.01);
        var originPointF = this.unitCellAtoms[i].object3d.position.clone().add(smartOffset);
        //

         
        var rayF = new THREE.Raycaster( originPointF, dir.clone().normalize() );
        var collisionResultsF = rayF.intersectObjects( collidableMeshList );
 
        var touches = true ;
        var radius = this.unitCellAtoms[i].getRadius() ; 

        if(collisionResultsF.length !== 1){ // case its center is not fully inside (if it is nothing happens and it remains visible)
  
          var vertexIndex = this.unitCellAtoms[i].object3d.children[0].geometry.vertices.length-1;
          var atomCentre = this.unitCellAtoms[i].object3d.position.clone();

          while( vertexIndex >= 0 )
          {     
            var localVertex = this.unitCellAtoms[i].object3d.children[0].geometry.vertices[vertexIndex].clone();
            var globalVertex = localVertex.applyMatrix4(this.unitCellAtoms[i].object3d.matrixWorld);
            var directionVector = globalVertex.sub( originPointF );     
            
            var ray = new THREE.Raycaster( originPointF, directionVector.clone().normalize() );
            
            var collisionResults = ray.intersectObjects( collidableMeshList );
               
            if( (collisionResults.length >= 1) &&  (collisionResults[0].distance <= radius) ) {
              vertexIndex = -2;   
            }
            vertexIndex--;
            if(vertexIndex === -1) touches = false;
          }  
          if(!touches) {
            this.unitCellAtoms[i].object3d.visible = false ;
          }
        } 
        this.unitCellAtoms[i].GradeLimited(); 
        if(this.unitCellAtoms[i].subtractedForCache.object3d !== undefined){
          this.unitCellAtoms[i].subtractedForCache.object3d.visible = false;  
        }
            
        i++;   
      } 

      i=0;

      while(i < this.cachedAtoms.length ) { 
         
        this.cachedAtoms[i].object3d.visible = true;  
           
        // workaround for points that are exactly on the grade (faces, cell points)
        var smartOffset = centroid.clone().sub(this.cachedAtoms[i].object3d.position.clone());
        smartOffset.setLength(0.01);
        var originPointF = this.cachedAtoms[i].object3d.position.clone().add(smartOffset);
        //

         
        var rayF = new THREE.Raycaster( originPointF, dir.clone().normalize() );
        var collisionResultsF = rayF.intersectObjects( collidableMeshList );
 
        var touches = true ;
        var radius = this.cachedAtoms[i].getRadius() ; 

        if(collisionResultsF.length !== 1){ // case its center is not fully inside (if it is nothing happens and it remains visible)
  
          var vertexIndex = this.cachedAtoms[i].object3d.children[0].geometry.vertices.length-1;
          var atomCentre = this.cachedAtoms[i].object3d.position.clone();

          while( vertexIndex >= 0 )
          {     
            var localVertex = this.cachedAtoms[i].object3d.children[0].geometry.vertices[vertexIndex].clone();
            var globalVertex = localVertex.applyMatrix4(this.cachedAtoms[i].object3d.matrixWorld);
            var directionVector = globalVertex.sub( originPointF );     
            
            var ray = new THREE.Raycaster( originPointF, directionVector.clone().normalize() );
            
            var collisionResults = ray.intersectObjects( collidableMeshList );
               
            if( (collisionResults.length >= 1) &&  (collisionResults[0].distance <= radius) ) {
              vertexIndex = -2;   
            }
            vertexIndex--;
            if(vertexIndex === -1) touches = false;
          }  
          if(!touches) {
            this.cachedAtoms[i].object3d.visible = false ;
          }
        }
        else{  
          this.cachedAtoms[i].object3d.visible = true;
        }
        i++;
      } 
      UnitCellExplorer.remove({'object3d' : box }); 

      PubSub.publish(events.VIEW_STATE,"cellGradeLimited"); 
    }
    else if(this.viewMode === 'cellClassic'){ 
      
      i = 0;  
      
      while(i < this.unitCellAtoms.length ){ 
         
        if(this.unitCellAtoms[i].setVisibility !== undefined){ 
          this.unitCellAtoms[i].setVisibility(true);  
         
          if(this.unitCellAtoms[i].subtractedForCache.object3d !== undefined){
            this.unitCellAtoms[i].subtractedForCache.object3d.visible = false;  
          } 
        }
        i++;
        
      }
      

      if(reset === undefined){  
        i = 0;
        while(i < this.cachedAtoms.length ){ 
          this.cachedAtoms[i].object3d.visible = false; 
          if(this.cachedAtoms[i].subtractedForCache.object3d !== undefined){
            this.cachedAtoms[i].subtractedForCache.object3d.visible = false;  
          }  
          i++;
        } 
         
        this.editObjectsInScene('cellSolidVoid', 'visibility', false);
      }
      else{ 
        this.createAdditionalAtoms();
        this.editObjectsInScene('cellSolidVoid', 'remove', true);
      }
      

      PubSub.publish(events.VIEW_STATE,"cellClassic");
    };
  };
  Motifeditor.prototype.createMaterial = function(color, opacity){
    var material; 

    if(this.renderingMode === 'wireframe') { 
      material = new THREE.MeshPhongMaterial({  specular: 0x050505, shininess : 100,color : color, wireframe: true, opacity:0}) ;
         
    }
    else if(this.renderingMode === 'realistic'){  
      material = new THREE.MeshPhongMaterial({ specular: 0x050505, shininess : 100, color: color, transparent:true, opacity:opacity }) ; 
    }
    else if(this.renderingMode === 'flat'){
      material = new THREE.MeshLambertMaterial({ color: color, transparent:true, opacity:opacity }) ; 
    }
    else if(this.renderingMode === 'toon'){ 
      var phongMaterial = createShaderMaterial("phongDiffuse");
      phongMaterial.uniforms.uMaterialColor.value.copy(new THREE.Color(color)); 
 
      material = phongMaterial;
    } 

    return material;
  }
  function assignUVs( geometry ){ 
     
    geometry.computeBoundingBox();

    var max     = geometry.boundingBox.max;
    var min     = geometry.boundingBox.min;

    var offset  = new THREE.Vector2(0 - min.x, 0 - min.y);
    var range   = new THREE.Vector2(max.x - min.x, max.y - min.y);

    geometry.faceVertexUvs[0] = [];
    var faces = geometry.faces;

    for (var i = 0; i < geometry.faces.length ; i++) {

      var v1 = geometry.vertices[faces[i].a];
      var v2 = geometry.vertices[faces[i].b];
      var v3 = geometry.vertices[faces[i].c];

      geometry.faceVertexUvs[0].push([
        new THREE.Vector2( ( v1.x + offset.x ) / range.x , ( v1.y + offset.y ) / range.y ),
        new THREE.Vector2( ( v2.x + offset.x ) / range.x , ( v2.y + offset.y ) / range.y ),
        new THREE.Vector2( ( v3.x + offset.x ) / range.x , ( v3.y + offset.y ) / range.y )
      ]);

    }

    geometry.uvsNeedUpdate = true;

    return geometry;
  }
  Motifeditor.prototype.updateLatticeTypeRL = function(){
    var params = this.cellParameters ;
    var type = this.latticeType ;
    var system = this.latticeSystem;

    if( this.latticeSystem === 'hexagonal' && this.latticeType === 'hexagonal') return; // it can never be something else
    // cubic
    if( params.scaleX === params.scaleY && params.scaleX === params.scaleZ && params.alpha === params.beta && params.beta === params.gamma && params.alpha == 90){
      if( type === 'primitive'){  
        $("select option[value='cubic_primitive']").attr("selected","selected");
      }
      else if( type === 'body'){ 
        $("select option[value='cubic_body_centered']").attr("selected","selected");
      }
      else if( type === 'face'){  
        $("select option[value='cubic_face_centered']").attr("selected","selected");
      }
      else { 
        $("select option[value='nonexistent']").attr("selected","selected");
      }
      
    }

    // tetragonal
    else if( params.scaleX === params.scaleZ && params.scaleX === params.scaleY && params.alpha === params.beta && params.beta === params.gamma && params.beta == 90){
      if( type === 'primitive'){  
        $("select option[value='tetragonal_primitive']").attr("selected","selected");
      }
      else if( type === 'body'){ 
        $("select option[value='tetragonal_body_centered']").attr("selected","selected");
      } 
      else { 
        $("select option[value='nonexistent']").attr("selected","selected");
      }
    }

    // Orthorhombic
    else if( params.scaleX != params.scaleY && params.scaleX != params.scaleZ && params.scaleY != params.scaleZ && params.alpha === params.beta && params.beta === params.gamma && params.beta == 90){
      if( type === 'primitive'){  
        $("select option[value='orthorhombic_primitive']").attr("selected","selected");
      }
      else if( type === 'body'){ 
        $("select option[value='orthorhombic_body_centered']").attr("selected","selected");
      }
      else if( type === 'face'){  
        $("select option[value='orthorhombic_face_centered']").attr("selected","selected");
      }
      else if( type === 'base'){  
        $("select option[value='orthorhombic_base_centered']").attr("selected","selected");
      }
      else { 
        $("select option[value='nonexistent']").attr("selected","selected");
      }
    } 

    // Rhombohedral
    else if( params.scaleX === params.scaleY && params.scaleX === params.scaleZ && params.alpha === params.beta && params.beta === params.gamma && params.alpha != 90){
      if( type === 'primitive'){  
        $("select option[value='rhombohedral_primitive']").attr("selected","selected");
      } 
      else { 
        $("select option[value='nonexistent']").attr("selected","selected");
      }
    }

    // Monoclinic
    else if( params.scaleX != params.scaleY && params.scaleX != params.scaleZ && params.scaleY != params.scaleZ && params.gamma === params.beta && params.beta == 90 && params.alpha != 90){
      if( type === 'primitive'){  
        $("select option[value='monoclinic_primitive']").attr("selected","selected");
      } 
      else if( type === 'base'){  
        $("select option[value='monoclinic_base_centered']").attr("selected","selected");
      }
      else { 
        $("select option[value='nonexistent']").attr("selected","selected");
      }
    }

    // Triclinic
    else if(params.scaleX != params.scaleY && 
            params.scaleX != params.scaleZ && 
            params.scaleY != params.scaleZ && 
            params.gamma  != params.beta && 
            params.gamma  != params.alpha && 
            params.alpha  != params.beta && 
            params.gamma  != 90 && 
            params.beta   != 90 && 
            params.alpha  != 90)
    {
      if( type === 'primitive'){  
        $("select option[value='triclinic_primitive']").attr("selected","selected");
      } 
      else { 
        $("select option[value='nonexistent']").attr("selected","selected");
      }
    }

    else{
      $("select option[value='nonexistent']").attr("selected","selected");
    }
  };
  Motifeditor.prototype.findShortestRadius = function(){
    var r = _.min(this.motifsAtoms, function(atom){ return (atom.getRadius()); });  
    return r.getRadius() ;
  };
  Motifeditor.prototype.leastVolume2 = function(restore){ 
 
    var coll = false;
    var step = 100;    

    this.menu.resetProgressBar('Constructing cell...');

    while(coll === false && this.unitCellAtoms.length !== 0){ 
    
      step -= 0.25; 
      this.setManuallyCellVolume({ 'step' : step, 'trigger' : 'reducer'}, true);
      if( this.cellVolume.aCol !== undefined || this.cellVolume.bCol !== undefined || this.cellVolume.cCol !== undefined  ){  
        coll = true;
      }
    }   
    
    this.menu.progressBarFinish();
 
  };
  var firstTimeAndLast2 = true;
  Motifeditor.prototype.setTangency = function(arg){ 
    
    if(firstTimeAndLast2){
      this.atomPosMode({abc: true, manually : true});
      firstTimeAndLast2 = false; 
    }
     
    this.leastVolume2();
    this.globalTangency = false;

    this.menu.setSliderValue("cellVolume", 100 );  

    this.cellVolume.xInitVal = this.cellParameters.scaleX;
    this.cellVolume.yInitVal = this.cellParameters.scaleY;
    this.cellVolume.zInitVal = this.cellParameters.scaleZ;
 
  };
  Motifeditor.prototype.padlockMode = function(arg, restore){
    var _this = this, i = 0;   
    this.padlock = !(arg.padlock);
    this.globalTangency = !(arg.padlock);
    
    if(restore !== undefined){
      return;
    }
    
    this.menu.setLatticeCollision({ scaleX: false, scaleY: false,  scaleZ: false  });
    this.snapData.snapVal = { 'aScale' : undefined,  'bScale' : undefined,  'cScale' : undefined};

    if(this.padlock === false) {  

      if(arg.manually === undefined) this.menu.setMotifPadlock('unlock');
  
      this.configureCellPoints();
 
      this.menu.setSliderValue("scaleX", this.cellParameters.scaleX );
      this.menu.setSliderValue("scaleZ", this.cellParameters.scaleZ );
      this.menu.setSliderValue("scaleY", this.cellParameters.scaleY );

    }
    else {  
      this.menu.setMotifPadlock('lock');
      this.cellParameters.alpha = this.initialLatticeParams.alpha ;
      this.cellParameters.beta  = this.initialLatticeParams.beta ;
      this.cellParameters.gamma = this.initialLatticeParams.gamma ;
       
      // for volume reduce functionality
      this.cellVolume.xInitVal = this.cellParameters.scaleX;
      this.cellVolume.yInitVal = this.cellParameters.scaleY;
      this.cellVolume.zInitVal = this.cellParameters.scaleZ;  
       // for volume reduce functionality 
  
      this.initVolumeState(); 
    }
  
  }; 

  Motifeditor.prototype.initVolumeState = function(){   
    
    /*to remove this during restr*/ 
    if(this.latticeName === 'hexagonal'){ 
      return;
    }
    /*to remove this during restr*/ 

    if(this.padlock === true || this.globalTangency === true){
      this.leastVolume();
            
      this.menu.setSliderValue("cellVolume", 100);  

      this.cellVolume.xInitVal = this.cellParameters.scaleX;
      this.cellVolume.yInitVal = this.cellParameters.scaleY;
      this.cellVolume.zInitVal = this.cellParameters.scaleZ;
    }

  };
  Motifeditor.prototype.removeFromUnitCell = function( id ){  //
    var _this = this, pos = [], pos2 = [];  

    for (var i = 0; i<this.unitCellAtoms.length; i++) {
      if(this.unitCellAtoms[i].getID() === id ){
        this.unitCellAtoms[i].destroy();
        this.unitCellAtoms[i].removesubtractedForCache();
        pos.push(i); 
      } 
    } 
    for (var i = pos.length - 1; i>= 0; i--) {
      this.unitCellAtoms.splice(pos[i],1);
    }   

    for (var i = 0; i<this.cachedAtoms.length; i++) {
      if(this.cachedAtoms[i].getID() === id ){ 
        this.cachedAtoms[i].destroy(); 
        this.cachedAtoms[i].removesubtractedForCache(); 
        pos2.push(i); 
      } 
    } 
    for (var i = pos2.length - 1; i>= 0; i--) { 
      this.cachedAtoms.splice(pos2[i],1);
    }     
  };  

  Motifeditor.prototype.colorUnitCellAtoms = function(id, color){   
    var _this = this; 
    for (var i = 0; i<this.unitCellAtoms.length; i++) { 
      if(this.unitCellAtoms[i].myID === id ){ 
        this.unitCellAtoms[i].setMaterial(color, this.renderingMode);
        this.unitCellAtoms[i].setOriginalColor(color);

      }
    }
    for (var i = 0; i<this.cachedAtoms.length; i++) { 
      if(this.cachedAtoms[i].myID === id ){ 
        this.cachedAtoms[i].setMaterial(color, this.renderingMode);
        this.cachedAtoms[i].setOriginalColor(color);
      }
    }  
    this.cellNeedsRecalculation = {'cellSolidVoid' : true, 'cellSubstracted' : true}; // for view modes
    if(this.viewMode !== 'cellClassic' ){
      this.setCSGmode({mode : 'cellClassic'} , 'reset');
      this.menu.chooseActiveUnitCellMode('cellClassic'); 
    } 
  }; 
  Motifeditor.prototype.unitCellAtomsWireframe = function(id, bool){   
    var _this = this; 
    for (var i = 0; i<this.unitCellAtoms.length; i++) { 
      if(this.unitCellAtoms[i].myID === id ){ 
        this.unitCellAtoms[i].wireframeMat(bool);
      }
    }
    for (var i = 0; i<this.cachedAtoms.length; i++) { 
      if(this.cachedAtoms[i].myID === id ){ 
        this.cachedAtoms[i].wireframeMat(bool);
      }
    }
    this.cellNeedsRecalculation = {'cellSolidVoid' : true, 'cellSubstracted' : true}; // for view modes
    if(this.viewMode !== 'cellClassic' ){
      this.setCSGmode({mode : 'cellClassic'} , 'reset' );
      this.menu.chooseActiveUnitCellMode('cellClassic');
    }
  };
  Motifeditor.prototype.unitCellAtomsTexture = function(id, texture){   
    var _this = this; 
    for (var i = 0; i<_this.unitCellAtoms.length; i++) { 
      if(this.unitCellAtoms[i].myID === id ){
        this.unitCellAtoms[i].setMaterialTexture(texture);
      }
    }
  };
  Motifeditor.prototype.unitCellAtomsOpacity = function(id, opacity){   
    var _this = this; 
    for (var i = 0; i<this.unitCellAtoms.length; i++) { 
      if(this.unitCellAtoms[i].myID === id ){
        this.unitCellAtoms[i].setOpacity(opacity, this.renderingMode);
      }
    }
    for (var i = 0; i<this.cachedAtoms.length; i++) { 
      if(this.cachedAtoms[i].myID === id ){
        this.cachedAtoms[i].setOpacity(opacity, this.renderingMode);
      }
    }
    this.cellNeedsRecalculation = {'cellSolidVoid' : true, 'cellSubstracted' : true}; // for view modes
    if(this.viewMode !== 'cellClassic'){
      this.setCSGmode({mode : 'cellClassic'} , 'reset'  );
      this.menu.chooseActiveUnitCellMode('cellClassic');
    }
  }; 
  Motifeditor.prototype.checkIfTangent = function(atom1, atom2){

    var tangentDistance = atom1.getRadius() + atom2.getRadius() ;
    var realDistance = atom1.object3d.position.distanceTo(atom2.object3d.position) ;
    
    if(Math.abs(tangentDistance-realDistance) <0.0001) { // not strict criteria to assume they are tangent 
      return true;
    }
    else{
      return false;
    }
       
  };
  Motifeditor.prototype.calcABCforParticularCases = function(dimensions){   
    
    if(_.isUndefined(dimensions)) {
      return ;
    }
 
    var _this = this, dims = { xDim : dimensions.xDim, yDim : dimensions.yDim, zDim : dimensions.zDim } ;
       
    //    c = y,    b = x,    a = z
    var LL = _.max([ dims.xDim, dims.yDim,dims.zDim ]);
    var ll = _.min([ dims.xDim, dims.yDim,dims.zDim ]);

    switch(_this.latticeSystem) {
      case "cubic":
        if(_this.motifsAtoms.length === 0){
          if(_this.latticeType === 'face'){
            dims.xDim = dims.yDim = dims.zDim = Math.sqrt(2) * dims.xDim ; 
          }
          else if(_this.latticeType === 'body'){
            dims.xDim = dims.yDim = dims.zDim = (2/Math.sqrt(3)) * dimensions.xDim ;
          }
        } 
        else if(_this.motifsAtoms.length >= 1){ // the second atom has not been added to the array yet, so we compare to 1 
          if(_this.latticeType === 'primitive'){
            dims.xDim = dims.yDim = dims.zDim = LL ; 
          }
          else if(_this.latticeType === 'face'){
            dims.xDim = dims.yDim = dims.zDim = 2 * LL ; 
          }
          else if(_this.latticeType === 'body'){
            dims.xDim = dims.yDim = dims.zDim = 2 * LL;
          } 
        } 
      break;

      case "tetragonal": 
        if(_this.motifsAtoms.length === 0){
          if(_this.latticeType === 'primitive'){ 
            dims.yDim *= 1.3 ; 
          }
          else if(_this.latticeType === 'body'){
            dims.xDim = dims.zDim = (2/Math.sqrt(3)) * dimensions.xDim ;
            dims.yDim = 1.3 * (2/Math.sqrt(3)) * dimensions.xDim ;
          } 
        }
        else if(_this.motifsAtoms.length >= 1){
          if(_this.latticeType === 'primitive'){ 
            dims.xDim = dims.zDim = LL;
            dims.yDim = 1.3 * LL ;
          }
          else if(_this.latticeType === 'body'){
            dims.xDim = dims.zDim = dims.zDim = 2 * LL;
            dims.yDim = 1.3 * 2 * LL;
          } 
        } 
      break;

      case "orthorhombic": 
        if(_this.motifsAtoms.length === 0){
          if(_this.latticeType === 'primitive'){ 
            dims.zDim = LL ;
            dims.xDim = 1.1 * LL;
            dims.yDim = 1.2 * LL;
          }
          else if(_this.latticeType === 'face'){  
            dims.xDim = Math.sqrt(2) * dimensions.xDim * 1.1 ;
            dims.yDim = Math.sqrt(2) * dimensions.yDim * 1.2 ;
            dims.zDim = Math.sqrt(2) * dimensions.zDim   ;
          }
          else if(_this.latticeType === 'body'){ 
            dims.zDim = (2/Math.sqrt(3)) * dimensions.zDim 
            dims.xDim = (2/Math.sqrt(3)) * dimensions.xDim * 1.1 ;
            dims.yDim = (2/Math.sqrt(3)) * dimensions.yDim * 1.2 ;
          } 
          else if(_this.latticeType === 'base'){ 
            dims.zDim = Math.sqrt(2) * dims.zDim ;
            dims.xDim = Math.sqrt(2) * dims.xDim * 1.1;
            dims.yDim = Math.sqrt(2) * dims.yDim * 1.2 ;
          } 
        }
        else if(_this.motifsAtoms.length >= 1){ 
          dims.zDim = 2 * 1.2 * LL;
          dims.xDim = 2 * 1.1 * LL;
          dims.yDim = 2 * 1.3 * LL;  
        }  
      break;
  
      case "hexagonal": 
        if( this.latticeType === 'primitive'){
          if(this.motifsAtoms.length === 0){ 
            dims.xDim = dims.yDim = dims.zDim = LL ; 
          }
          else if(_this.motifsAtoms.length >= 1){
            dims.xDim = dims.yDim = dims.zDim = LL*1.5 ;  
          } 
        }
        else if( this.latticeType === 'hexagonal'){  
          if(this.motifsAtoms.length === 1){ 
           
            //dims.xDim = dims.zDim = this.findHexTangentLengths(dims); 

            var r0 = this.motifsAtoms[0].getRadius();
            var r1 = (this.motifsAtoms[1]) ? this.motifsAtoms[1].getRadius() : this.newSphere.getRadius();
              
            dims.xDim =  dims.zDim = r0 + r1; 
            dims.yDim = (r0 + r1) * Math.sqrt(8/3);
            
          }
          else if(this.motifsAtoms.length === 2){ 
           
            var r0 = this.motifsAtoms[0].getRadius();
            var r1 = this.motifsAtoms[1].getRadius(); 
            var r2 = 0;
            var lastAtomY = 0;

            if(this.motifsAtoms[2]) {
              this.motifsAtoms[2].getRadius() ;
              lastAtomY = this.motifsAtoms[2].object3d.position.y;
            }
            else if(this.newSphere !== undefined){  
              this.newSphere.getRadius();
              lastAtomY = this.newSphere.object3d.position.y;
            }
 
            var r = _.max([ r0, r1, r2 ]);
            dims.xDim =  dims.zDim = r*2; 
            dims.yDim = lastAtomY + r*2;
       
          }
        }
      break;

      case "rhombohedral": 
        if(_this.motifsAtoms.length === 0){ 
          dims.xDim = dims.yDim = dims.zDim = LL ; 
        }
        else if(_this.motifsAtoms.length >= 1){
          dims.xDim = dims.yDim = dims.zDim = LL*1.5 ;  
        } 
      break;

      case "monoclinic": 
        if(_this.motifsAtoms.length === 0){ 
          if(_this.latticeType === 'primitive'){ 
            dims.zDim = LL;
            dims.xDim = 1.1 * LL;
            dims.yDim = 1.2 * LL; 
          }
          else if(_this.latticeType === 'base'){ 
            dims.zDim = Math.sqrt(2) * dims.zDim ;
            dims.xDim = Math.sqrt(2) * dims.xDim * 1.1;
            dims.yDim = Math.sqrt(2) * dims.yDim * 1.2 ;
          }
        }
        else if(_this.motifsAtoms.length >= 1){
          if(_this.latticeType === 'primitive'){
            dims.zDim = LL;
            dims.xDim = 1.1 * LL;
            dims.yDim = 1.2 * LL; 
          }  
          else if(_this.latticeType === 'base'){ 
            dims.zDim = 2 * 1.1 * LL;
            dims.xDim = 2 * LL;
            dims.yDim = LL;
          } 
        } 
      break;

      case "triclinic": 
        if(_this.motifsAtoms.length === 0){ 
          dims.zDim = LL;
          dims.xDim = 1.1 * LL;
          dims.yDim = 1.2 * LL; 

        }
        else if(_this.motifsAtoms.length >= 1){ 
          dims.zDim = LL;
          dims.xDim = 1.1 * LL;
          dims.yDim = 1.2 * LL;  
        } 
      break;
  
    } 
        
    return dims;
  };

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Angle Handling - lattice.js code
  Motifeditor.prototype.cellPointsWithScaling = function(_dimensions, recreate, _manual){ 
    var _this = this; 

    var dimensions;

    if( (!this.padlock && !this.globalTangency ) || _manual !== undefined){
      dimensions = _dimensions ;   
    }
    else{  
      dimensions = this.calcABCforParticularCases(_dimensions); 
     
      // store initial values for reduce volume feature
      if(!(_dimensions.xDim === 1 && _dimensions.xDim && _dimensions.xDim) ){  
        this.cellVolume.xInitVal = dimensions.xDim;
        this.cellVolume.yInitVal = dimensions.yDim;
        this.cellVolume.zInitVal = dimensions.zDim;  
      } 
    } 
     
    this.cellParameters.scaleX = dimensions.xDim;
    this.cellParameters.scaleY = dimensions.yDim;
    this.cellParameters.scaleZ = dimensions.zDim;

    if( (this.latticeName === 'hexagonal' )){

      var a = this.cellParameters.scaleZ ;
      var c = this.cellParameters.scaleY ; 
       
      var vertDist = a * Math.sqrt(3);

      _.times(2, function(_y) {
        _.times(1 , function(_x) {
          _.times(1 , function(_z) { 
            _.times(6 , function(_r) {
              for (var i = _this.unitCellAtoms.length - 1; i >= 0; i--) {  
                var v = new THREE.Vector3( a, 0, 0 );

                var axis = new THREE.Vector3( 0, 1, 0 );
                var angle = (Math.PI / 3) * _r ; 
                v.applyAxisAngle( axis, angle );

                var z = (_x % 2==0) ? (v.z + _z*vertDist) : ((v.z + _z*vertDist + vertDist/2));
                var y =  v.y + _y*c ;
                var x = v.x + _x*a*1.5 ;
                var zC = (_x % 2==0) ? (_z*vertDist) : (( _z*vertDist + vertDist/2));
                var yC =  _y*c ;
                var xC =  _x*a*1.5 ;
                var position = new THREE.Vector3( x, y, z);  
                var positionC = new THREE.Vector3( xC, yC, zC);  

                var reference = 'h_'+_x+_y+_z+_r ;
                var referenceC = 'hc_'+_x+_y+_z ;

                if(recreate){
                  _this.unitCellPositions[reference] = {"position" : new THREE.Vector3( position.x, position.y, position.z), "latticeIndex" : reference} ;  
                  _this.unitCellPositions[referenceC] = {"position" : new THREE.Vector3( positionC.x, positionC.y, positionC.z), "latticeIndex" : referenceC} ;  
                }
                else{
                 // _this.unitCellPositions[reference].position = new THREE.Vector3( position.x, position.y, position.z) ;
                  //_this.unitCellPositions[referenceC].position = new THREE.Vector3( positionC.x, positionC.y, positionC.z) ;
                } 
              }    
            });
          });
        });
      }); 
    }
    else{  
      switch(_this.latticeType) {
        case "primitive":    
          _.times(2 , function(_x) {
            _.times(2 , function(_y) {
              _.times(2 , function(_z) {
                if(recreate){
                  _this.unitCellPositions["_"+_x+_y+_z] = {
                    "position" : new THREE.Vector3( dimensions.xDim *_x, dimensions.yDim *_y, dimensions.zDim *_z), 
                    "latticeIndex" : "_"+_x+_y+_z 
                  } ;  
                }
                else{
                  _this.unitCellPositions["_"+_x+_y+_z].position = new THREE.Vector3( 
                    dimensions.xDim *_x, dimensions.yDim *_y, dimensions.zDim *_z
                  ) ;
                }
              });
            });
          }); 
          break;
        case "face":   
          _.times(2 , function(_x) {
            _.times(2 , function(_y) {
              _.times(2 , function(_z) {
                if(recreate){
                  _this.unitCellPositions["_"+_x+_y+_z] = {"position" : new THREE.Vector3( dimensions.xDim *_x, dimensions.yDim *_y, dimensions.zDim *_z), "latticeIndex" : "_"+_x+_y+_z } ;  
                }
                else{
                  _this.unitCellPositions["_"+_x+_y+_z].position = new THREE.Vector3( dimensions.xDim *_x, dimensions.yDim *_y, dimensions.zDim *_z) ;
                }
              });
            });
          }); 
          for (var i = 0; i <= 1; i ++) {
            if(recreate){
              _this.unitCellPositions["_"+i] = {"position" : new THREE.Vector3( dimensions.xDim *i, dimensions.yDim *0.5, dimensions.zDim *0.5), "latticeIndex" : "_"+i } ;  
              _this.unitCellPositions["__"+i] = {"position" : new THREE.Vector3( dimensions.xDim *0.5, dimensions.yDim *i, dimensions.zDim *0.5), "latticeIndex" : "__"+i } ;  
              _this.unitCellPositions["___"+i] = {"position" : new THREE.Vector3( dimensions.xDim *0.5, dimensions.yDim *0.5, dimensions.zDim *i), "latticeIndex" : "___"+i } ;  
            }
            else{
              _this.unitCellPositions["_"+i].position = new THREE.Vector3( dimensions.xDim *i, dimensions.yDim *0.5, dimensions.zDim *0.5) ;
              _this.unitCellPositions["__"+i].position = new THREE.Vector3( dimensions.xDim *0.5, dimensions.yDim *i,  dimensions.zDim *0.5) ;
              _this.unitCellPositions["___"+i].position = new THREE.Vector3( dimensions.xDim *0.5,  dimensions.yDim *0.5,  dimensions.zDim *i) ;
            }
          };
          break;
        case "body":   
          _.times(2 , function(_x) {
            _.times(2 , function(_y) {
              _.times(2 , function(_z) {
                if(recreate){
                  _this.unitCellPositions["_"+_x+_y+_z] = {"position" : new THREE.Vector3(  dimensions.xDim *_x, dimensions.yDim *_y, dimensions.zDim *_z), "latticeIndex" : "_"+_x+_y+_z } ;  
                }
                else{
                  _this.unitCellPositions["_"+_x+_y+_z].position = new THREE.Vector3(  dimensions.xDim *_x, dimensions.yDim *_y, dimensions.zDim *_z) ;
                }
              });
            });
          }); 
          if(recreate){
            _this.unitCellPositions["_c"] = {"position" : new THREE.Vector3( (1/2) * dimensions.xDim , (1/2) * dimensions.yDim , (1/2) * dimensions.zDim ), "latticeIndex" : '_c' } ;  
          }
          else{
            _this.unitCellPositions["_c"].position = new THREE.Vector3( (1/2) * dimensions.xDim , (1/2) * dimensions.yDim , (1/2) * dimensions.zDim ) ;
          }
          break;
        case "base":   
          _.times(2 , function(_x) {
            _.times(2 , function(_y) {
              _.times(2 , function(_z) {
                if(recreate){
                  _this.unitCellPositions["_"+_x+_y+_z] = {"position" : new THREE.Vector3( dimensions.xDim *_x,  dimensions.yDim *_y, dimensions.zDim *_z), "latticeIndex" : "_"+_x+_y+_z } ;  
                }
                else{
                  _this.unitCellPositions["_"+_x+_y+_z].position = new THREE.Vector3( dimensions.xDim *_x,  dimensions.yDim *_y, dimensions.zDim *_z) ;
                }
              });
            });
          });  
          if(recreate){
            _this.unitCellPositions["_up"] = {"position" : new THREE.Vector3( dimensions.xDim /2 ,  dimensions.yDim , dimensions.zDim /2 ), "latticeIndex" : "_up" } ;  
            _this.unitCellPositions["_down"] = {"position" : new THREE.Vector3( dimensions.xDim /2, 0 ,  dimensions.zDim /2), "latticeIndex" : "_down" } ;  
          }
          else{
            _this.unitCellPositions["_up"].position = new THREE.Vector3( dimensions.xDim /2, dimensions.yDim , dimensions.zDim /2) ;
            _this.unitCellPositions["_down"].position = new THREE.Vector3( dimensions.xDim /2,  0, dimensions.zDim /2) ;
          }  

          break; 
      } 
      this.offsetMotifsPointsScaling(recreate); 
    }
  };  
  Motifeditor.prototype.initialCellPositions = function(latticeIndex){ 
    var _this = this; 
    var unitCellPositions = {};
    var dimensions = { xDim : this.cellParameters.scaleX,  yDim : this.cellParameters.scaleY,  zDim : this.cellParameters.scaleZ};

    switch(this.latticeType) {
      case "primitive":    
        _.times(2 , function(_x) {
          _.times(2 , function(_y) {
            _.times(2 , function(_z) { 
              unitCellPositions["_"+_x+_y+_z] = {
                "position" : new THREE.Vector3( dimensions.xDim *_x, dimensions.yDim *_y, dimensions.zDim *_z), 
                "latticeIndex" : "_"+_x+_y+_z 
              } ;  
               
            });
          });
        }); 
        break;
      case "face":   
        _.times(2 , function(_x) {
          _.times(2 , function(_y) {
            _.times(2 , function(_z) { 
              unitCellPositions["_"+_x+_y+_z] = {"position" : new THREE.Vector3( dimensions.xDim *_x, dimensions.yDim *_y, dimensions.zDim *_z), "latticeIndex" : "_"+_x+_y+_z } ;  
            });
          });
        }); 
        for (var i = 0; i <= 1; i ++) { 
          unitCellPositions["_"+i] = {"position" : new THREE.Vector3( dimensions.xDim *i, dimensions.yDim *0.5, dimensions.zDim *0.5), "latticeIndex" : "_"+i } ;  
          unitCellPositions["__"+i] = {"position" : new THREE.Vector3( dimensions.xDim *0.5, dimensions.yDim *i, dimensions.zDim *0.5), "latticeIndex" : "__"+i } ;  
          unitCellPositions["___"+i] = {"position" : new THREE.Vector3( dimensions.xDim *0.5, dimensions.yDim *0.5, dimensions.zDim *i), "latticeIndex" : "___"+i } ;   
        };
        break;
      case "body":   
        _.times(2 , function(_x) {
          _.times(2 , function(_y) {
            _.times(2 , function(_z) { 
              unitCellPositions["_"+_x+_y+_z] = {"position" : new THREE.Vector3(  dimensions.xDim *_x, dimensions.yDim *_y, dimensions.zDim *_z), "latticeIndex" : "_"+_x+_y+_z } ;   
            });
          });
        }); 
        
        unitCellPositions["_c"] = {"position" : new THREE.Vector3( (1/2) * dimensions.xDim , (1/2) * dimensions.yDim , (1/2) * dimensions.zDim ), "latticeIndex" : '_c' } ;  
        break;
      case "base":   
        _.times(2 , function(_x) {
          _.times(2 , function(_y) {
            _.times(2 , function(_z) { 
              unitCellPositions["_"+_x+_y+_z] = {"position" : new THREE.Vector3( dimensions.xDim *_x,  dimensions.yDim *_y, dimensions.zDim *_z), "latticeIndex" : "_"+_x+_y+_z } ;  
            });
          });
        });   

        unitCellPositions["_up"] = {"position" : new THREE.Vector3( dimensions.xDim /2 ,  dimensions.yDim , dimensions.zDim /2 ), "latticeIndex" : "_up" } ;  
        unitCellPositions["_down"] = {"position" : new THREE.Vector3( dimensions.xDim /2, 0 ,  dimensions.zDim /2), "latticeIndex" : "_down" } ;  
        break; 
    } 
    
    var returnVec = _.findWhere(unitCellPositions, {latticeIndex: latticeIndex});

    return returnVec.position;
  };
  Motifeditor.prototype.revertShearing = function() {
    this.transform(reverseShearing, function(value) {  
      return -value;
    });
  }; 
 
  Motifeditor.prototype.transformMeGeneric = function(parameterKeys, vector, operation) {
    var matrix, _this = this;
    var argument; 
    var parameters = this.cellParameters;  
    _.each(parameterKeys, function(k) {   
      if (_.isUndefined(parameters[k]) === false) { 
        argument = {};
        argument[k] = operation(parseFloat(parameters[k]));
        matrix = transformationMatrix(argument);  
        vector.applyMatrix4(matrix);
      }
    });

    return vector;
  };
  Motifeditor.prototype.transformGeneric = function(vector, actions) {

    var vec;

    if(actions['revertShearing'] !== undefined){ 
      vec = this.transformMeGeneric(reverseShearing,vector, function(value) {  
        return -value;
      });
    }

    if(actions['revertScaling'] !== undefined){  
      if(vec === undefined){
        vec = vector;
      }
      vec = this.transformMeGeneric(reverseScaling, vec, function(value) { 
        return (value === 0 ? 0 : 1 / value);
      }); 
    }

    if(actions['transform'] !== undefined){
      if(vec === undefined){
        vec = vector;
      }
      vec = this.transformMeGeneric(_.union(scaling, shearing), vec, function(value) {
        return value;
      }); 
    }
    
    return vec;
  };     
  Motifeditor.prototype.cellPointsWithAngles = function() {  
    //this.transform(reverseShearing, function(value) {  return -value; }); 

    this.transform( shearing, function(value) {  return value; }  ); 
    //this.transform( reverseScaling,             function(value) { return (value === 0 ? 0 : 1 / value); } );       
    //this.transform( _.union(scaling, shearing), function(value) { return value; }                         );  
  };   
  var shearing = [ 'alpha', 'beta', 'gamma' ];
  var reverseShearing = shearing.slice(0).reverse();
  var scaling = [ 'scaleX', 'scaleY', 'scaleZ' ];
  var reverseScaling = scaling.slice(0).reverse();

  Motifeditor.prototype.transform = function( parameterKeys, operation ) {
    var matrix, _this = this;
    var argument; 
    var parameters = this.cellParameters;  
    _.each(parameterKeys, function(k) {   
      if (_.isUndefined(parameters[k]) === false) { 
        argument = {};
        argument[k] = operation(parseFloat(parameters[k])); 
        matrix = transformationMatrix(argument); 
        _.each(_this.unitCellPositions, function(pos, reference) {
          if(pos.position.applyMatrix4 === undefined){
            pos.position = new THREE.Vector3(pos.position.x, pos.position.y, pos.position.z);
          }  
          pos.position.applyMatrix4(matrix); 
        });
        _.each(_this.cachedAtomsPositions, function(pos, reference) {
          if(pos.position.applyMatrix4 === undefined){
            pos.position = new THREE.Vector3(pos.position.x, pos.position.y, pos.position.z);
          }  
          pos.position.applyMatrix4(matrix); 
        });
      }
    });
  };

  var transformationMatrix = function(parameter) {

    // According to wikipedia model
    var ab = Math.tan((90 - ((parameter.beta) || 90)) * Math.PI / 180);
    var ac = Math.tan((90 - ((parameter.gamma) || 90)) * Math.PI / 180); 
    var bc = Math.tan((90 - ((parameter.alpha) || 90)) * Math.PI / 180);

    var xy = 0;
    var zy = 0;
    var xz = 0;

    var sa = parameter.scaleX || 1; 
    var sb = parameter.scaleZ || 1;
    var sc = parameter.scaleY || 1; 
     
    var m = new THREE.Matrix4();
    m.set(
      sa, ab, ac,  0,
      xy, sb, zy,  0,
      xz, bc, sc,  0,
       0,  0,  0,  1
    );
    
    return m;
  };

  var uuid = 0;

  Motifeditor.prototype.produceUuid = function(reset) {
    if(reset !== undefined){
      uuid = 0;
      return;
    }
    return uuid++;
  }

  THREE.ShaderTypes = { 
    'phongDiffuse' : {

        uniforms: {

            "uDirLightPos": { type: "v3", value: new THREE.Vector3() },
            "uDirLightColor": { type: "c", value: new THREE.Color( 0xffffff ) },

            "uMaterialColor":  { type: "c", value: new THREE.Color( 0xffffff ) },

            uKd: {
                type: "f",
                value: 0.7
            },
            uBorder: {
                type: "f",
                value: 0.4
            }
        },

        vertexShader: [

            "varying vec3 vNormal;",
            "varying vec3 vViewPosition;",

            "void main() {",

                "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
                "vNormal = normalize( normalMatrix * normal );",
                "vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
                "vViewPosition = -mvPosition.xyz;",

            "}"

        ].join("\n"),

        fragmentShader: [

            "uniform vec3 uMaterialColor;",

            "uniform vec3 uDirLightPos;",
            "uniform vec3 uDirLightColor;",

            "uniform float uKd;",
            "uniform float uBorder;",

            "varying vec3 vNormal;",
            "varying vec3 vViewPosition;",

            "void main() {",

                // compute direction to light
                "vec4 lDirection = viewMatrix * vec4( uDirLightPos, 0.0 );",
                "vec3 lVector = normalize( lDirection.xyz );",

                // diffuse: N * L. Normal must be normalized, since it's interpolated.
                "vec3 normal = normalize( vNormal );",
                //was: "float diffuse = max( dot( normal, lVector ), 0.0);",
                // solution
                "float diffuse = dot( normal, lVector );",
                "if ( diffuse > 0.6 ) { diffuse = 1.0; }",
                "else if ( diffuse > -0.2 ) { diffuse = 0.7; }",
                "else { diffuse = 0.3; }",

                "gl_FragColor = vec4( uKd * uMaterialColor * uDirLightColor * diffuse, 1.0 );",

            "}"

        ].join("\n") 
    } 
  };
  function createShaderMaterial(id) {

      var shader = THREE.ShaderTypes[id];

      var u = THREE.UniformsUtils.clone(shader.uniforms);

      var vs = shader.vertexShader;
      var fs = shader.fragmentShader;

      var material = new THREE.ShaderMaterial({ uniforms: u, vertexShader: vs, fragmentShader: fs });

      material.uniforms.uDirLightPos.value = new THREE.Vector3(300, 300, 60);
      material.uniforms.uDirLightColor.value = new THREE.Color( 0xFFFFFF );
      
      return material;

  };
  return Motifeditor;
});
