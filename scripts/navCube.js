'use strict';
define([
  'jquery', 
  'three', 
  'pubsub',
  'underscore'
], function(
  jQuery, 
  THREE, 
  PubSub,
  _
) { 
var counter = 0;

function NavCube( scene, latticeParams, visible) {
    var width = jQuery('#app-container').width() ;
    var height = jQuery(window).height() ; 
    this.length =  10.5;//(height + width)/250; 
   
    this.scene = scene ;
    this.angles = {'alpha':90, 'beta':90, 'gamma':90 }; 
    this.cubeMats;
    this.texts = [];
    var _this = this;

    this.cube;

    this.materialArray = [];

    var textureLoader = new THREE.TextureLoader(); 
    textureLoader.load("Images/0.png",
      function(tex){  
        _this.addMaterial(tex,0, visible) ;
      }
    );
    textureLoader.load("Images/1.png",
      function(tex){  
        _this.addMaterial(tex,1, visible) ;
      }
    );
    textureLoader.load("Images/2.png",
      function(tex){  
        _this.addMaterial(tex,2, visible) ;
      }
    );
    textureLoader.load("Images/3.png",
      function(tex){  
        _this.addMaterial(tex,3, visible) ;
      }
    );
    textureLoader.load("Images/4.png",
      function(tex){  
        _this.addMaterial(tex,4, visible) ;
      }
    );
    textureLoader.load("Images/5.png",
      function(tex){  
        _this.addMaterial(tex,5, visible) ;
      }
    );
 
    var geom =  new THREE.Geometry();
    var v1   =  new THREE.Vector3(2.45,-8.85,0);
    var v2   =  new THREE.Vector3(2.8,-7.1,0);
    var v3   =  new THREE.Vector3(0.8,-7.3, 0);
 
    geom.vertices.push(v1);
    geom.vertices.push(v2);
    geom.vertices.push(v3);
  
    geom.faces.push( new THREE.Face3( 0, 1, 2 ) );
     
    geom.computeFaceNormals();

    this.arHead = new THREE.Mesh( geom, new THREE.MeshBasicMaterial({color : 0xBDBDBD }));
    this.arHead.name = 'arrowHead';
      
    var CustomSinCurve = THREE.Curve.create(
      function ( scale ) {  
        this.scale = (scale === undefined) ? 1 : scale ;
      },
      
      function ( t ) {  
        var tx = 2*(t-0.5/3) * 2.7 - 2, ty = -7.8 + Math.sin( 1*Math.PI/0.2 + Math.PI * t/0.9 )  ; 
          
        return new THREE.Vector3(tx, ty, 0).multiplyScalar(this.scale);
      }
    );

    var path = new CustomSinCurve( 1 );

    var geometry = new THREE.TubeGeometry(
        path,  //path
        20,    //segments
        0.4,     //radius
        8,     //radiusSegments
        false  //closed
    );
    this.arLine = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial({color : 0xBDBDBD }));
    this.arLine.name = 'arrowLine' ;
 
    this.arHead.visible = visible;
    this.arLine.visible = visible;

    scene.add(this.arHead);
    scene.add(this.arLine);

};
NavCube.prototype.setVisibility = function(bool){
  if(this.cube !== undefined){ 

    this.cube.visible = bool;
    this.arHead.visible = bool;
    this.arLine.visible = bool; 
  }
};  
NavCube.prototype.addMaterial = function(text, index, visible) {
  var _this = this ; 
  this.texts[index] = text;
  this.materialArray[index] = new THREE.MeshBasicMaterial( { map: text });  
  
  if(
    this.materialArray[0] !== undefined &&
    this.materialArray[1] !== undefined &&
    this.materialArray[2] !== undefined &&
    this.materialArray[3] !== undefined &&
    this.materialArray[4] !== undefined &&
    this.materialArray[5] !== undefined
    ){ 
      this.cubeMats = new THREE.MeshFaceMaterial(this.materialArray);
      var cubeG = new THREE.BoxGeometry( this.length-1, this.length-1, this.length-1, 3,3,3 );
      this.cube = new THREE.Mesh( cubeG, this.cubeMats );
      this.cube.name = 'cube' ;  
      this.cube.visible = visible;  
      
      this.scene.add(this.cube);
      counter = undefined;
    }   
};
NavCube.prototype.resetMat = function() {
  
  for (var i = 0; i<6; i++) {
    this.cube.material.materials[i] = new THREE.MeshBasicMaterial( { map: this.texts[i] });
  };  
}
function getTexture() {
  var texture = new THREE.TextureLoader("Images/rotationArrow.png");
  
  return texture;
}

NavCube.prototype.updateAngles = function(angle) {
    var l = this.arrowLength ;
    var _this = this; 
    var matrix;
 
    if(angle.alpha !== undefined) _this.angles.alpha = parseInt(angle.alpha);  
    if(angle.beta  !== undefined) _this.angles.beta  = parseInt(angle.beta);  
    if(angle.gamma !== undefined) _this.angles.gamma = parseInt(angle.gamma);  
   

}; 
var transformationMatrix = function(parameter) {
      
    // According to wikipedia model
    var ab = Math.tan((90 - ((parameter.beta) || 90)) * Math.PI / 180);
    var ac = Math.tan((90 - (parameter.gamma || 90)) * Math.PI / 180);
    var xy = 0;
    var zy = 0;
    var xz = 0;
    var bc = Math.tan((90 - (( parameter.alpha) || 90)) * Math.PI / 180);

    var sa = parameter.scaleX || 1; 
    var sb = parameter.scaleY || 1;
    var sc = parameter.scaleZ || 1; 
    
    var m = new THREE.Matrix4();
    m.set(
      sa, ab, ac,  0,
      xy, sb, zy,  0,
      xz, bc, sc,  0,
       0,  0,  0,  1
    );
    return m;
  };
   
  return NavCube;
  
});
