'use strict';

define([
  'three',
  'explorer'
], function(
  THREE,
  Explorer
) {

  function Face(a,b,c,d, _opacity, _color, visibility, e,f) {
    var opacity = _opacity;
    var color = _color; 
     
    var vertices = [];
    var faces = [];

    vertices.push(new THREE.Vector3(a.x,a.y,a.z));
    vertices.push(new THREE.Vector3(b.x,b.y,b.z));
    vertices.push(new THREE.Vector3(c.x,c.y,c.z));
    vertices.push(new THREE.Vector3(d.x,d.y,d.z));

    if(f !== undefined){
      vertices.push(new THREE.Vector3(e.x,e.y,e.z));
      vertices.push(new THREE.Vector3(f.x,f.y,f.z));     
      faces.push(new THREE.Face3(0,1,2));
      faces.push(new THREE.Face3(0,2,3));
      faces.push(new THREE.Face3(3,0,4));
      faces.push(new THREE.Face3(5,0,4));
    }
    else if(e !== undefined){  
      faces.push(new THREE.Face3(0,1,2));
      faces.push(new THREE.Face3(0,2,3));
    }
    else{
      faces.push(new THREE.Face3(0,2,1));
      faces.push(new THREE.Face3(2,3,1));
    }

    var geom = new THREE.Geometry();
    geom.vertices = vertices;
    geom.faces = faces;

    geom.mergeVertices(); 
        
    color = (( /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(color))) ? color : 0x927492;
 
    var mesh = new THREE.Mesh( geom, new THREE.MeshBasicMaterial( { side : THREE.DoubleSide, /* depthWrite: false, depthTest: false, */ color:  color , opacity:opacity/10,  transparent: true } ) );
    mesh.visible = visibility ;
    mesh.name = 'face' ;
    mesh.renderOrder = 2 ;  
    mesh.receiveShadow = true; 
    mesh.castShadow = true; 
    this.object3d = mesh;
    this.notStates = {};
     
    Explorer.add(this);
  }
  Face.prototype.setVisible = function( x) { 
    this.object3d.visible = x ; 
  };
  Face.prototype.setOpacity = function( opacity) { 
    if(_.isUndefined(opacity)) return;
    this.opacity = opacity;
    this.object3d.material.needsUpdate = true;
    this.object3d.material.opacity= opacity/10; 
  };
  Face.prototype.setNoteState = function( noteID, arg) {

    this.notStates[noteID] = arg;
    
  };
  Face.prototype.deleteNoteState = function( noteID ) {
    if(this.notStates[noteID] === undefined){
      return;
    }
    else{
      this.notStates[noteID] === undefined;
    }
     
  };
  Face.prototype.applyNoteState = function( noteID ) {
    if(this.notStates[noteID] === undefined){
      return;
    }
     
    this.setVisible(this.notStates[noteID].visible);
    this.setColor(this.notStates[noteID].color); 
    this.setOpacity(this.notStates[noteID].opacity); 
  };
  Face.prototype.setColor = function(color) {
    
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
    
  }; 
  Face.prototype.destroy = function() {
    Explorer.remove(this);
  }; 
  return Face;
});
