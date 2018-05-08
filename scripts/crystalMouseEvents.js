'use strict';
define([
  'jquery', 
  'three', 
  'pubsub',
  'underscore',
  'motifExplorer',
  'explorer'
], function(
  jQuery, 
  THREE, 
  PubSub,
  _,
  MotifExplorer,
  Explorer
) { 
  var raycaster = new THREE.Raycaster(); 
  var mouse = new THREE.Vector2();
 

  function CrystalMouseEvents( client, _camera, domElement, state, dollEditor, atomCustomizer, keyboard ) {
    
    var _this =this ;
    
    this.camera = _camera;
    this.container = domElement; 
    this.motifEditorAtms = [] ; 
    this.client = client ;
    this.state = state ;
    
    this.dollEditor = dollEditor;
    this.atomCustomizer = atomCustomizer;
    this.offset = new THREE.Vector3(); 
    this.coloredAtomsExist = false;
    this.keyboard = keyboard; 
    this.coloredPlanesExist = false; 

    var mMoove = this.onDocumentMouseMove.bind(this) ; 
    document.getElementById(this.container).addEventListener("mousemove", mMoove, false); 

    var mDown = this.onDocumentMouseDown.bind(this) ;
    document.getElementById(this.container).addEventListener("mousedown",  mDown, false);

    var mUp = this.onDocumentMouseUp.bind(this) ;
    document.getElementById(this.container).addEventListener("mouseup"  ,    mUp, false);
     
  }; 

  CrystalMouseEvents.prototype.onDocumentMouseDown = function(event){ 
    
    event.preventDefault();
    var _this = this;
    
    if(this.state === 'default'){
      mouse.x = ( event.clientX / $('#'+this.container).width() ) * 2 - 1;
      mouse.y = - ( event.clientY / $('#'+this.container).height() ) * 2 + 1;
    }
    else if(_this.state === 'motifScreen'){
      mouse.x = ( event.clientX / $('#'+this.container).width() ) * 2 - 3;
      mouse.y = - ( event.clientY / $('#'+this.container).height() ) * 2 + 1; 
    }
     
    raycaster.setFromCamera( mouse, this.camera ); 

    var crystalobjsIntersects = raycaster.intersectObjects( this.getCrystalObjects() );
     

    if ( crystalobjsIntersects.length > 0 ) {   
      if(crystalobjsIntersects[0].object.parent.name === 'atom'){
 
        var obj = crystalobjsIntersects[0].object ; 
        var filteredAtom = _.findWhere(_this.client.actualAtoms, {uniqueID : obj.parent.uniqueID});   
        if(filteredAtom === undefined){
          filteredAtom = _.findWhere(_this.client.cachedAtoms, {uniqueID : obj.parent.uniqueID}); 
        } 

        if(filteredAtom !== undefined){ 
          this.atomCustomizer.atomJustClicekd(filteredAtom, this.keyboard.pressed("ctrl"));
        } 
      } 
    }  
  };
  CrystalMouseEvents.prototype.onDocumentMouseUp = function(event){ 

  };
  CrystalMouseEvents.prototype.onDocumentMouseMove = function(event){ 
    var _this = this;
 
    event.preventDefault();
    
    if(_this.state === 'default'){
      mouse.x = ( event.clientX / $('#'+_this.container).width() ) * 2 - 1;
      mouse.y = - ( event.clientY / $('#'+_this.container).height() ) * 2 + 1;
    }
    else if(_this.state === 'motifScreen'){
      mouse.x = ( event.clientX / $('#'+_this.container).width() ) * 2 - 3;
      mouse.y = - ( event.clientY / $('#'+_this.container).height() ) * 2 + 1; 
    }
  
    raycaster.setFromCamera( mouse, this.camera ); 
   
    var crystalPlanesIntersects = raycaster.intersectObjects( this.getCrystalPlanes() );
   
    if ( crystalPlanesIntersects.length > 0 ) {   
      this.coloredPlanesExist = true;
      if(crystalPlanesIntersects[0].object.name === 'plane'){
        for (var i = this.client.millerPlanes.length - 1; i >= 0; i--) {
          this.client.millerPlanes[i].plane.setColor();
        };
        for (var i = this.client.tempPlanes.length - 1; i >= 0; i--) {
          this.client.tempPlanes[i].plane.setColor();
        };
        crystalPlanesIntersects[0].object.material.color.setHex( 0xCC2EFA );
        document.getElementById(this.container).style.cursor = 'pointer';   
      } 
    }
    else{ 

      if(this.coloredPlanesExist === true){ 
        for (var i = this.client.millerPlanes.length - 1; i >= 0; i--) {  
          this.client.millerPlanes[i].plane.setColor();
        };
        for (var i = this.client.tempPlanes.length - 1; i >= 0; i--) {
          this.client.tempPlanes[i].plane.setColor();
        };
        this.coloredPlanesExist = false;
      }
    }

    var crystalobjsIntersects = raycaster.intersectObjects( this.getCrystalObjects() );
      
    if ( crystalobjsIntersects.length > 0 ) {  
  
      for (var i = this.client.actualAtoms.length - 1; i >= 0; i--) {
        this.client.actualAtoms[i].setColorMaterial(); 
        this.client.actualAtoms[i].object3d.visible = this.client.actualAtoms[i].visibility;
      }; 
        
      this.dollEditor.setAtomUnderDoll(crystalobjsIntersects[0].object.parent);
       
      var obj = crystalobjsIntersects[0].object ; 
      //console.log(obj.parent.uniqueID);
      var filteredAtom = _.findWhere(_this.client.actualAtoms, {uniqueID : obj.parent.uniqueID});
         

      if(filteredAtom === undefined){
        filteredAtom = _.findWhere(this.client.cachedAtoms, {uniqueID : obj.parent.uniqueID}); 
        if(filteredAtom === undefined){
          return;
        }
      }
      
      if(filteredAtom.object3d.visible === false){
        filteredAtom.object3d.visible = true ;
      }

      filteredAtom.setColorMaterial(0xCC2EFA, true);
      this.coloredAtomsExist = true; 
      document.getElementById(this.container).style.cursor = 'pointer';
    } 
    else{  
      this.dollEditor.setAtomUnderDoll(undefined);
      
      if(this.coloredAtomsExist === true){ 

        for (var i = this.client.actualAtoms.length - 1; i >= 0; i--) {
          this.client.actualAtoms[i].setColorMaterial();
          this.client.actualAtoms[i].object3d.visible = this.client.actualAtoms[i].visibility;
        };
        for (var i = this.client.cachedAtoms.length - 1; i >= 0; i--) {
          this.client.cachedAtoms[i].setColorMaterial();
          this.client.cachedAtoms[i].object3d.visible = this.client.cachedAtoms[i].visibility;
        };
        this.coloredAtomsExist = false;
        document.getElementById(this.container).style.cursor = 'default';
      }  
    }
  }
  
  CrystalMouseEvents.prototype.getCrystalPlanesTODELETE = function() {  
    var _this = this;
    var crystalPlanes = [] ;

    Explorer.getInstance().object3d.traverse (function (object) {
 
       if (object.name === 'face' && object.visible === true){ 
        crystalPlanes.push(object); 
      }
      
    });

    return crystalPlanes;
  };

  CrystalMouseEvents.prototype.getCrystalPlanes = function() {  
    var _this = this;
    var crystalPlanes = [] ;

    Explorer.getInstance().object3d.traverse (function (object) {

      if (object.name === 'plane' && object.visible === true){ 
        crystalPlanes.push(object); 
      }
    });

    return crystalPlanes;
  };
  CrystalMouseEvents.prototype.getCrystalObjects = function() {  
    var _this = this;
    var crystalObjs = [] ;

    Explorer.getInstance().object3d.traverse (function (object) {

      if (
        (object.name === 'plane' ) || 
        (object.name === 'atom' && object.latticeIndex !== '-') || 
        ( object.name === 'atom' && 
          object.latticeIndex === '-' && 
          object.visible === true ) 
        ||
        object.name === 'miller'
      ) {   
        for (var i = 0; i < object.children.length; i++) {  
          crystalObjs.push(object.children[i]);
        };  
      }
    });

    return crystalObjs;
  };

  return CrystalMouseEvents;
  
});  
