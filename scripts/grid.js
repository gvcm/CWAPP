 
define([
  'three', 
  'underscore'
], function(
  THREE, 
  _
) {
  var meshGeometry = new THREE.CylinderGeometry( 0.01, 0.01, 0.001, 3, 1 ); 

  function Grid(scene, pointA, pointB, visibility) {
  
    var mesh = new THREE.Mesh( meshGeometry,new THREE.MeshPhongMaterial({transparent : true, opacity : 1, shininess : 100,  color : 0xA19EA1 })) ;     
    mesh.visible = visibility;
    mesh.name = 'grid';
    mesh.scale.x = 2;
    mesh.scale.z = 2;
    this.scene = scene; 
    this.object3d = mesh; 
    this.scene.add(this.object3d);
    this.scale = 2;
    this.color ='#ffffff';
    this.notStates = {};

  }

  Grid.prototype.destroy = function() {
    this.scene.remove(this.object3d);
  };
  Grid.prototype.setNoteState = function( noteID, arg) {

    this.notStates[noteID] = arg;
    
  };
  Grid.prototype.deleteNoteState = function( noteID ) {
    if(this.notStates[noteID] === undefined){
      return;
    }
    else{
      this.notStates[noteID] === undefined;
    }
     
  };
  Grid.prototype.applyNoteState = function( noteID ) {
    if(this.notStates[noteID] === undefined){
      return;
    }
     
    this.setVisible(this.notStates[noteID].visible);
    this.setColor(this.notStates[noteID].color); 
    this.setRadius(this.notStates[noteID].scale); 
  };
  Grid.prototype.setRadius = function( scale) {

    if(_.isUndefined(scale)) return;
    this.scale = scale; 
    this.object3d.scale.x = scale;
    this.object3d.scale.z = scale;

  };
  
  Grid.prototype.setVisible= function(x) { 
    this.object3d.visible = x; 
  };

  Grid.prototype.setColor = function(color) {

    if(_.isUndefined(color)) return;
    
    this.color = color;
 
    if(this.color[0] === '#'){
      this.object3d.material.color.set( this.color );
    }
    else if(this.color[0] === '0' && this.color[0] === 'x'){
      this.object3d.material.color.setHex( this.color );
    }
    else{
      this.color = '#'+this.color ;
      this.object3d.material.color.set( this.color );
    }
    this.object3d.material.needsUpdate = true;

    this.setRadius(this.scale);

  }; 
  
  return Grid;
});
