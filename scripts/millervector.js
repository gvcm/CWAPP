/*global define*/
'use strict';

define([
  'three',
  'explorer',
  'underscore'
], function(
  THREE,
  Explorer,
  _
) {

  function MillerVector(visible, start , end, color, radius) {
  
    this.radius = radius ;
    this.color = ( color.charAt(0) !== '#' ) ? '#'+color : color ;
    this.tubeMesh = { 'object3d' : undefined } ; 
    this.notStates = {};
    this.distance = 1;

    var length =  start.distanceTo(end) ; 
    var direction = new THREE.Vector3().subVectors( end,  start).normalize();
    var arrow = new THREE.ArrowHelper( direction , start, length , this.color, length/8, length/20);
    arrow.children[0].material = new THREE.MeshPhongMaterial({ shininess : 100, transparent : true, opacity : 1, color : this.color }) ;
    arrow.children[1].material = new THREE.MeshPhongMaterial({ shininess : 100, transparent : true, opacity : 1, color : this.color }) ;
    arrow.name = 'direction' ;
    arrow.visible = (visible === undefined) ? true : visible ;
    this.opacity = (arrow.visible) ? 1 : 0 ;
    arrow.receiveShadow = true; 
    arrow.castShadow = true; 
    this.object3d = arrow;
    Explorer.add(this);
    this.visible = visible;
    this.addTube(start , end);

  }; 
  MillerVector.prototype.updateTubeRadius = function(radius ) { 
    this.radius = parseInt(radius)  ; 
    this.tubeMesh.object3d.scale.x = this.radius*2.5*(1+this.distance/10);  
    this.tubeMesh.object3d.scale.z = this.radius*2.5*(1+this.distance/10); 

  };
  MillerVector.prototype.updateDirectionPos = function(start, end) {   
     console.log(99);
    var length =  start.distanceTo(end) ; 
    var direction = new THREE.Vector3().subVectors( end, start).normalize();
 
    // this.object3d.position.set(start); 
    this.object3d.setLength(length , length/8, length/20);
    this.object3d.setDirection(direction.normalize());
     
    this.updateTube(start, end);

  };
  MillerVector.prototype.updateTube = function(start , end ) {      


    var pointA = start.clone(); 
    var pointB = getPointInBetweenByLen(end, start, start.distanceTo(end)/8);  
    var distance = pointA.distanceTo(pointB) ;
    
    this.distance = distance;

    var dir = pointB.clone().sub(pointA).normalize().multiplyScalar(distance/2);

    var newPoint =  pointA.clone().add(dir) ;  
    var direction = new THREE.Vector3().subVectors( pointB, newPoint );
    var direcNorm = direction;
    direcNorm.normalize(); 

    var arrow = new THREE.ArrowHelper( direcNorm ,newPoint );
 
    this.tubeMesh.object3d.rotation.set(arrow.rotation.x,arrow.rotation.y,arrow.rotation.z);
    this.tubeMesh.object3d.scale.y = distance/0.001;  
    this.tubeMesh.object3d.scale.z = this.radius*2.5*(1+distance/10);  
    this.tubeMesh.object3d.scale.x = this.radius*2.5*(1+distance/10);  
    this.tubeMesh.object3d.position.set(newPoint.x,newPoint.y,newPoint.z);
    
  }; 
  function getPointInBetweenByLen(pointA, pointB, length) {
      
    var dir = pointB.clone().sub(pointA).normalize().multiplyScalar(length);
    return pointA.clone().add(dir);
         
  };
  MillerVector.prototype.addTube = function(start , end) {     
 
    var color =  this.color ;
   
    var meshGeometry = new THREE.CylinderGeometry( 0.001, 0.001, 0.001, 4, 1 ); 
    var mesh = new THREE.Mesh( meshGeometry, new THREE.MeshPhongMaterial({specular: 0x050505, shininess : 100, transparent : true, opacity : 1, color : color })  );  

    var pointA = start.clone();  
    var pointB = getPointInBetweenByLen(end, start, start.distanceTo(end)/8); 
    var distance = pointA.distanceTo(pointB) ;
    
    this.distance = distance;

    var dir = pointB.clone().sub(pointA).normalize().multiplyScalar(distance/2);

    var newPoint =  pointA.clone().add(dir) ;  
    var direction = new THREE.Vector3().subVectors( pointB, newPoint );
    var direcNorm = direction;
    direcNorm.normalize(); 

    var arrow = new THREE.ArrowHelper( direcNorm ,newPoint );

    mesh.rotation.set(arrow.rotation.x,arrow.rotation.y,arrow.rotation.z);
    mesh.scale.y = distance /0.001;   
    mesh.position.set(newPoint.x,newPoint.y,newPoint.z);
    mesh.scale.x = this.radius*2.5*(1+distance/10);
    mesh.scale.z = this.radius*2.5*(1+distance/10);
    
    mesh.name = 'dirLine';
    mesh.receiveShadow = true; 
    mesh.castShadow = true; 
    this.tubeMesh.object3d = mesh ;
    
    Explorer.add(this.tubeMesh);

  };
  MillerVector.prototype.setVisible = function(bool) {  
    this.visible = bool;

    this.object3d.visible = bool ;
    this.tubeMesh.object3d.visible = bool ;
  };
 
  MillerVector.prototype.setColor = function(color) { 

    this.color = color;     
    this.object3d.children[0].material.color.setHex( color ); 
    this.object3d.children[1].material.color.setHex( color );  
    this.tubeMesh.object3d.material.color.setHex( color );
  };

  MillerVector.prototype.setOpacity = function(opacity) { 
   
    this.opacity = opacity;     
    this.object3d.children[0].material.opacity = opacity;  
    this.object3d.children[1].material.opacity = opacity;  
    this.tubeMesh.object3d.material.opacity = opacity;  
   
  };
  MillerVector.prototype.setNoteState = function( noteID, arg) {

    this.notStates[noteID] = arg;
    
  };
  MillerVector.prototype.deleteNoteState = function( noteID ) {
    if(this.notStates[noteID] === undefined){
      return;
    }
    else{
      this.notStates[noteID] === undefined;
    }
     
  };

  MillerVector.prototype.applyNoteState = function( noteID ) {
    if(this.notStates[noteID] === undefined){
      return;
    }
     
    this.setVisible(this.notStates[noteID].visible);
    this.setColor(this.notStates[noteID].color); 
  };
  MillerVector.prototype.destroy = function() { 
    Explorer.remove(this);
    Explorer.remove(this.tubeMesh);
  }; 
  function validateColor(color){

    var isOk  = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(color);
  
    if(isOk === true){
      if(color.charAt(0) === '#'){
        color = color.slice(1,7);
        color = '0x' + color;
      }
    
      return color; 
    }
    else{
      if(color.charAt(0) !== '#' && (color.charAt(0) !== '0' || color.charAt(1) !== 'x' )){
        return ('0x'+color); 
      } 
      else { 
        return 0xffffff;
      } 
    }
     
  }
  function hexToRgb(hex) {
     
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
  }
  return MillerVector;

}); 