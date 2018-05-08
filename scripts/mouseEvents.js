'use strict';
define([
  'jquery', 
  'three', 
  'pubsub',
  'underscore',
  'motifExplorer',
  'navCubeHud'
], function(
  jQuery, 
  THREE, 
  PubSub,
  _,
  MotifExplorer,
  NavCubeHud
) { 
  var raycaster = new THREE.Raycaster(); 
  var mouse = new THREE.Vector2(); 

  function MouseEvents( motifEditor, func, _camera, domElement, orbitControls, soundMachine, navCube) {
    var _this = this;

    this.plane = {'object3d' : undefined} ;
    this.func = func ;
    this.soundMachine = soundMachine;
    this.container = domElement;   
    this.orbitControls = orbitControls; 
    this.objects = [] ;
    this.camera = _camera ;
    this.motifEditor = motifEditor ;  
    
    this.dirty = false;
    this.offset = new THREE.Vector3();
    this.navCube = navCube;
    this.INTERSECTED;
    this.SELECTED;
    this.enableCubeEvents = true;

    this.cubeMapsHit = []; 
    this.cubeMaps = []; 

    for (var i = 0; i < 6; i++) { 
      this.loadTexts('Images/'+i+'Hit.png', i, this.cubeMapsHit); 
      this.loadTexts('Images/'+i+'.png', i, this.cubeMaps);  
    };

    if(this.func === 'dragNdrop' ){
      
      this.plane.object3d = new THREE.Mesh(
        new THREE.PlaneBufferGeometry( 10000, 10000, 2, 2 ),
        new THREE.MeshBasicMaterial( { color: "#"+((1<<24)*Math.random()|0).toString(16)  } )
      );
      this.plane.object3d.visible = false;

      if(this.container === 'motifPosX' ) this.plane.object3d.position.z = -100;
      if(this.container === 'motifPosY' ) this.plane.object3d.position.x = -100;
      if(this.container === 'motifPosZ' ) this.plane.object3d.position.y = -100;
      
      this.plane.object3d.lookAt(this.camera.position);
      MotifExplorer.add(this.plane);
 
      var mMoove = this.onDocumentMouseMove.bind(this) ;
      var mDown  = this.onDocumentMouseDown.bind(this) ;
      var mUp    = this.onDocumentMouseUp.bind(this) ;
      
      document.getElementById(this.container).addEventListener("mousemove", mMoove, false);
      document.getElementById(this.container).addEventListener("mousedown", mDown, false);
      document.getElementById(this.container).addEventListener("mouseup",   mUp, false);
    }
    else if( this.func === 'navCubeDetect'){
       
      var mMoove = this.onDocumentMouseMove.bind(this) ;
      var mDown = this.onDocumentMouseDown.bind(this) ;
      var mUp = this.onDocumentMouseUp.bind(this) ;
      
      document.getElementById(this.container).addEventListener("mousemove", mMoove, false);
      document.getElementById(this.container).addEventListener("mousedown", mDown, false);
      document.getElementById(this.container).addEventListener("mouseup",   mUp, false);
    }

  }; 

  MouseEvents.prototype.loadTexts = function(url, i, arr){ 
    var loader = new THREE.TextureLoader();
    var _this = this;

    loader.load( 
      url , 
      function ( texture ) { 
        arr[i] = new THREE.MeshBasicMaterial( {
          map: texture
        } );
      } 
    );
  };
  MouseEvents.prototype.onDocumentMouseMove = function(event){ 
    var _this = this;
    
    event.preventDefault();

    if(this.container === 'hudRendererCube' && this.enableCubeEvents === false){
      return;
    }
 
    if(this.container === 'motifPosX' ){
      mouse.x = ( -1 + 2 * ( event.clientX / ( $('#'+_this.container).width() ) ) );
      mouse.y = (  3 - 2 * ( event.clientY / ( $('#'+_this.container).height() ) ) ); 
    }
    else if(this.container === 'motifPosY' ) {
      mouse.x = ( -3 + 2 * ( event.clientX / ( $('#'+_this.container).width() ) ) );
      mouse.y = (  3 - 2 * ( event.clientY / ( $('#'+_this.container).height() ) ) ); 
    }
    else if(this.container === 'motifPosZ' ) {
      mouse.x = ( -5 + 2 * ( event.clientX / ( $('#'+_this.container).width() ) ) );
      mouse.y = (  3 - 2 * ( event.clientY / ( $('#'+_this.container).height() ) ) );  
    } 
    else if(this.container === 'hudRendererCube' ) {
       
      var contWidth = $('#hudRendererCube').width() ;
      var contHeight = $('#hudRendererCube').height() ;
      var crCanvWidth = $('#crystalRenderer').width(); 

      if($('#motifPosZ').width() === 0){  
        mouse.x =  -1 + 2 * ( event.clientX / contWidth );
        mouse.y =   1 - 2 * (  event.clientY  / contHeight ); 
      }
      else{
        mouse.x =  -1 + 2 * ( (event.clientX - crCanvWidth)/ contWidth );
        mouse.y =   1 - 2 * ( event.clientY  / contHeight ); 
      }
             
      raycaster.setFromCamera( mouse, _this.camera );
       
      var intersects = raycaster.intersectObjects( _this.getAtoms() );
       
      if ( intersects.length > 0  ) {
        if(intersects[0].object.name === 'cube' ){  
           
          this.dirty = true;

          document.getElementById(_this.container).style.cursor = 'pointer';
          var index;
          if(intersects[0].face.normal.x==0 && intersects[0].face.normal.y==0 &&intersects[0].face.normal.z==-1){
            index = 5 ;
          }
          if(intersects[0].face.normal.x==0 && intersects[0].face.normal.y==0 &&intersects[0].face.normal.z==1){
            index = 4 ;
          }
          if(intersects[0].face.normal.x==1 && intersects[0].face.normal.y==0 &&intersects[0].face.normal.z==0){
            index = 0 ;
          }
          if(intersects[0].face.normal.x==0 && intersects[0].face.normal.y==-1 &&intersects[0].face.normal.z==0){
            index = 3 ;
          }
          if(intersects[0].face.normal.x==-1 && intersects[0].face.normal.y==0 &&intersects[0].face.normal.z==0){
            index = 1 ;
          }
          if(intersects[0].face.normal.x==0 && intersects[0].face.normal.y==1 &&intersects[0].face.normal.z==0){
            index = 2 ;
          }
             
          intersects[0].object.material.materials[intersects[0].face.materialIndex] = this.cubeMapsHit[index];
          
          for (var i = 0; i<6; i++) {
            if( i!= index) intersects[0].object.material.materials[i] = this.cubeMaps[i];
          };
        }
        else if( intersects[0].object.name === 'arrowHead' || intersects[0].object.name == 'arrowLine'){
          document.getElementById(_this.container).style.cursor = 'pointer';
        }
        else if(this.dirty === true){
          this.navCube.resetMat();
          document.getElementById(this.container).style.cursor = 'auto';
          this.dirty = false;
        }
      }
      else if(this.dirty === true){  
        this.navCube.resetMat();
        document.getElementById(_this.container).style.cursor = 'auto';
        
        this.dirty = false;
      }
      return ;
    } 
 
    raycaster.setFromCamera( mouse, this.camera );
     
    if ( this.SELECTED ) {
      
      var intersects = raycaster.intersectObject( this.plane.object3d );
      var pos = intersects[ 0 ].point.sub( this.offset ) ;
      this.SELECTED.position.copy( pos );
       
      if(pos.x>20 || pos.x<-20){  
        this.SELECTED.position.x = pos.x>0 ? 20 : -20 ;
        pos.x = pos.x>0 ? 20 : -20 ;
        this.plane.object3d.position.copy( this.INTERSECTED.position ); 
        document.getElementById(_this.container).style.cursor = 'auto';
      }
      if(pos.y>20 || pos.y<-20){ 
        this.SELECTED.position.y = pos.y>0 ? 20 : -20 ;
        pos.y = pos.y>0 ? 20 : -20 ;
        this.plane.object3d.position.copy( this.INTERSECTED.position );  
        document.getElementById(this.container).style.cursor = 'auto';
      }
      if(pos.z>20 || pos.z<-20){
        this.SELECTED.position.z = pos.z>0 ? 20 : -20 ;
        pos.z = pos.z>0 ? 20 : -20 ;
        this.plane.object3d.position.copy( this.INTERSECTED.position );    
        document.getElementById(this.container).style.cursor = 'auto';
      }
      if(this.container === 'motifPosX' ) {
        this.motifEditor.dragAtom('x', pos, this.SELECTED.id) ;
      }
      else if(this.container === 'motifPosY' ) {
        this.motifEditor.dragAtom('y', pos, this.SELECTED.id) ;
      }
      else if(this.container === 'motifPosZ' ) {
        this.motifEditor.dragAtom('z', pos, this.SELECTED.id) ;
      }
       
      return;

    }
     
    var intersects = raycaster.intersectObjects( this.getAtoms() );

    if ( intersects.length > 0 &&  intersects[0].object.parent.name ==='atom' ) {
      
      if ( this.INTERSECTED != intersects[0].object.parent ) {

        this.INTERSECTED = intersects[0].object.parent;

        this.plane.object3d.position.copy( this.INTERSECTED.position );
         
      }

      document.getElementById(this.container).style.cursor = 'pointer';

    } 
    else {

      this.INTERSECTED = undefined ;

      document.getElementById(this.container).style.cursor = 'auto';

    } 
  }
  MouseEvents.prototype.onDocumentMouseDown = function(event){  
    var _this =this;
    
    event.preventDefault();

    if(this.func === 'navCubeDetect' && this.enableCubeEvents === false){
      return;
    }

    this.SELECTED = undefined;
    if(this.func === 'dragNdrop'){  
      
      if( this.motifEditor.editorState.state !== 'initial' ) {
        raycaster.setFromCamera( mouse, _this.camera );
        
        var intersects = raycaster.intersectObjects( _this.getAtoms() );

        if ( intersects.length > 0 &&  intersects[0].object.parent.name === 'atom' && (intersects[0].object.parent.id === _this.motifEditor.newSphere.object3d.id) ) {
           
          this.SELECTED = intersects[0].object.parent; 
          var intersects = raycaster.intersectObject( this.plane.object3d ); 
          this.offset.copy( intersects[ 0 ].point ).sub( this.plane.object3d.position ); 
          document.getElementById(this.container).style.cursor = 'none';

        } 
      }
     }
     else if(this.func === 'navCubeDetect' ){
 
      var contWidth = $('#hudRendererCube').width() ;
      var contHeight = $('#hudRendererCube').height() ;
      var crCanvWidth = $('#crystalRenderer').width(); 

      if($('#motifPosZ').width() === 0){  
        mouse.x =  -1 + 2 * ( event.clientX / contWidth );
        mouse.y =   1 - 2 * (  event.clientY  / contHeight ); 
      }
      else{
        mouse.x =  -1 + 2 * ( (event.clientX - crCanvWidth)/ contWidth );
        mouse.y =   1 - 2 * ( event.clientY  / contHeight ); 
      }
       
      raycaster.setFromCamera( mouse, _this.camera );
     
      var intersects = raycaster.intersectObjects( _this.getAtoms() );
       
      if ( intersects.length > 0  ) {
        if(this.soundMachine.procced) this.soundMachine.play('navCube');
        if(intersects[0].object.name === 'cube' ){       
          var index;
          if(intersects[0].face.normal.x==0 && intersects[0].face.normal.y==0 &&intersects[0].face.normal.z==-1){
            index = 5 ;
          }
          else if(intersects[0].face.normal.x==0 && intersects[0].face.normal.y==0 &&intersects[0].face.normal.z==1){
            index = 4 ;
          }
          else if(intersects[0].face.normal.x==1 && intersects[0].face.normal.y==0 &&intersects[0].face.normal.z==0){
            index = 0 ; 
          }
          else if(intersects[0].face.normal.x==0 && intersects[0].face.normal.y==-1 &&intersects[0].face.normal.z==0){
            index = 3 ;
          }
          else if(intersects[0].face.normal.x==-1 && intersects[0].face.normal.y==0 &&intersects[0].face.normal.z==0){
            index = 1 ;
          }
          else if(intersects[0].face.normal.x==0 && intersects[0].face.normal.y==1 &&intersects[0].face.normal.z==0){
            index = 2 ;
          }
   
          for (var i = this.orbitControls.length - 1; i >= 0; i--) { 
    
            if( (this.orbitControls[i].getCamName() == 'cell') && $('#syncCameras').is(':checked') ){  
              this.orbitControls[i].setThetaPhi(angles[index].theta, angles[index].phi ); 
            }
            if(this.orbitControls[i].getCamName() == 'crystal'){
              this.orbitControls[i].setThetaPhi(angles[index].theta, angles[index].phi );
            } 
          };  
        } 
        else if( intersects[0].object.name === 'arrowHead' || intersects[0].object.name === 'arrowLine'){  
          for (var i = this.orbitControls.length - 1; i >= 0; i--) {  
            if(this.orbitControls[i].getCamName() == 'crystal'){
              var isRotating = this.orbitControls[i].getAutoRotate();  
              var arrowL = NavCubeHud.getInstance().object3d.getObjectByName( "arrowLine" );
              var arrowH = NavCubeHud.getInstance().object3d.getObjectByName( "arrowHead" );
              if(isRotating){
                this.orbitControls[i].autoRotate(false);
                arrowH.material.color.setHex(0xBDBDBD);   
                arrowL.material.color.setHex(0xBDBDBD);   
              }
              else{ 
                this.orbitControls[i].autoRotate(true);
                arrowH.material.color.setHex(0x6F6299);   
                arrowL.material.color.setHex(0x6F6299);   
              } 
            } 
          };  
        }
      } 
      else if(mouse.x < 0.21 && mouse.x > -0.11 && mouse.y < -0.65){ 
        for (var i = this.orbitControls.length - 1; i >= 0; i--) {  
          if(this.orbitControls[i].getCamName() == 'crystal'){
            var isRotating = this.orbitControls[i].getAutoRotate();  
            var arrowL = NavCubeHud.getInstance().object3d.getObjectByName( "arrowLine" );
            var arrowH = NavCubeHud.getInstance().object3d.getObjectByName( "arrowHead" );
            if(isRotating){
              this.orbitControls[i].autoRotate(false);
              arrowH.material.color.setHex(0xBDBDBD);   
              arrowL.material.color.setHex(0xBDBDBD);   
            }
            else{ 
              this.orbitControls[i].autoRotate(true);
              arrowH.material.color.setHex(0x6F6299);   
              arrowL.material.color.setHex(0x6F6299);   
            } 
          } 
        };  
      } 
    }
  };

  var angles = {
    '0' : {'theta' : 90*Math.PI/180, 'phi'  : 90*Math.PI/180},
    '1' : {'theta' : -90*Math.PI/180, 'phi' : 90*Math.PI/180},
    '2' : {'theta' : 0*Math.PI/180, 'phi'   : 0*Math.PI/180},
    '3' : {'theta' : 0*Math.PI/180, 'phi'   : 180*Math.PI/180},
    '4' : {'theta' : 0*Math.PI/180, 'phi'   : 90*Math.PI/180},
    '5' : {'theta' : 180*Math.PI/180, 'phi' : 90*Math.PI/180} 
  };
 

  MouseEvents.prototype.onDocumentMouseUp  = function(event){  
    var _this =this;
    event.preventDefault();

    if(this.func === 'dragNdrop'){ 

      if ( this.INTERSECTED !== undefined && this.motifEditor.editorState.state !== 'initial' ) {  
        this.plane.object3d.position.copy( this.INTERSECTED.position );
        this.motifEditor.rotateAroundAtom(undefined, this.INTERSECTED.id);
        this.SELECTED = null; 
      }

      document.getElementById(this.container).style.cursor = 'auto';
    }

  };

  MouseEvents.prototype.getAtoms = function() {  
    var _this = this;
    _this.objects = [] ;

    if(this.func === 'dragNdrop'){ 
      MotifExplorer.getInstance().object3d.traverse (function (object) {
        if (object.name === 'atom') { 
          for (var i = 0; i < object.children.length; i++) { 
            _this.objects.push(object.children[i]);
          };
        }
      });
    }
    else if(this.func === 'navCubeDetect'){ 
      NavCubeHud.getInstance().object3d.traverse (function (object) { 
        if (object.name === 'cube' || object.name === 'arrowLine' || object.name === 'arrowHead') { 
          _this.objects.push(object ); 
        }; 
      });
    }
    return _this.objects;
  };
   
  return MouseEvents;
  
});  
