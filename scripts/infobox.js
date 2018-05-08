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

  function CrystalMouseEvents( client, func, _camera, domElement, state ) {
    this.plane = {'object3d' : undefined} ;
    this.camera = _camera;
    this.container = domElement; 
    this.motifEditorAtms = [] ;
    this.getCrystalObjs = [] ;
    this.client = client ;
    this.state = state ;
    var _this =this ;

    this.offset = new THREE.Vector3(); 

    var mMoove = this.onDocumentMouseMove.bind(this) ; 
    document.getElementById(this.container).addEventListener("mousemove", mMoove, false); 
     
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
     
    raycaster.setFromCamera( mouse, _this.camera ); 
 
    var crystalobjsIntersects = raycaster.intersectObjects( _this.getCrystalObjects() );
     
    if ( crystalobjsIntersects.length > 0 ) {
      var obj = crystalobjsIntersects[0].object ;

      var filteredAtom = _.findWhere(_this.client.actualAtoms, {identity : obj.parent.identity}); 
      $('#infoBox').css('display', 'inline');
      $('#infoBox').text('This is an atom of '+filteredAtom.elementName+' and it has radius of '+filteredAtom.getRadius()+' angstroms.');
       
    } 
    else{
      $('#infoBox').css('display', 'none');
    }
  }
 
 
  CrystalMouseEvents.prototype.getCrystalObjects = function() {  
    var _this = this;
    _this.getCrystalObjs = [] ;

    Explorer.getInstance().object3d.traverse (function (object) {
      if (object.name === 'atom' || object.name === 'miller') { 
        for (var i = 0; i < object.children.length; i++) {  
          _this.getCrystalObjs.push(object.children[i]);
        };
      }
    });
    return _this.getCrystalObjs;
  };

  return CrystalMouseEvents;
  
});  
