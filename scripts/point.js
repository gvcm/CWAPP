'use strict';

define([
  'three',
  'explorer' 
], function(
  THREE,
  Explorer 
) {
  //var globGeometry = new THREE.SphereGeometry(0.04, 16, 16);
  var globGeometry = new THREE.OctahedronGeometry(0.04,2);
  var material = new THREE.MeshPhongMaterial({transparent : true, opacity : 1, shininess : 100,  color : 0xffffff }) ;     

  function Point(visible, position) {
     
    this.object3d = new THREE.Mesh(globGeometry,material); 
    this.object3d.name = 'point'; 
    this.object3d.visible = visible; 
    this.visible = visible;
    this.notStates = {};
    this.object3d.position.fromArray(position.toArray());
    Explorer.add(this);
  }
  Point.prototype.setNoteState = function( noteID, arg) {
    
    this.notStates[noteID] = arg;
    
  };
  Point.prototype.deleteNoteState = function( noteID ) {
    if(this.notStates[noteID] === undefined){
      return;
    }
    else{
      this.notStates[noteID] === undefined;
    }
     
  };
  Point.prototype.applyNoteState = function( noteID ) {

    if(this.notStates[noteID] === undefined){
      return;
    }
     
    this.setVisible(this.notStates[noteID].visible);  
  };
  Point.prototype.setVisible = function(bool) {
       
    this.object3d.visible = bool ;
    this.visible = bool ; 

  };
  Point.prototype.destroy = function() {
    Explorer.remove(this);
  };

  return Point;
});
