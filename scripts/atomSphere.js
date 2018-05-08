 
'use strict';

define([
  'three',
  'motifExplorer',
  'underscore',
  'atomMaterialManager'
], function(
  THREE,
  MotifExplorer,
  _,
  AtomMaterialManager
) {
  //var globGeometry = new THREE.SphereGeometry(1,32, 32);
  var globGeometries = [new THREE.OctahedronGeometry(1,0), new THREE.OctahedronGeometry(1,1), new THREE.OctahedronGeometry(1,2), new THREE.OctahedronGeometry(1,3), new THREE.OctahedronGeometry(1,4), new THREE.OctahedronGeometry(1,5) ];
   
  function AtomSphere(visible, position, radius, color, lod, elementName, id, opacity, wireframe, ionicIndex, labeling, uiRelPosition) {

    var _this = this; 
    
    this.radius = radius;  
    this.ionicIndex = ionicIndex;  
    this.fresh = true;  
    this.material; 
    this.materials;
    this.lod = lod; 
    this.color = color; 
    this.myID = id; 
    this.blinking;
    this.blinkingMode = false;
    this.visible = visible; 
    this.elementName = elementName;
    this.wireframe = wireframe ;
    this.opacity = opacity; 
    this.position = position;  
    this.materialLetter;
    this.labeling = labeling;
    this.uiRelPosition = (uiRelPosition) ? uiRelPosition : position.clone();
 
    this.addMaterial(color, position, AtomMaterialManager.getTexture(this.elementName, this.ionicIndex)) ;
      
    // private vars
    var originalColor = color;
    this.getOriginalColor = function(){
      return originalColor;
    }
    this.setOriginalColor = function(color){
      originalColor = color;
    }
  }
  AtomSphere.prototype.addMaterial = function(color, position, image) {
    var _this = this ;
    
    this.color = color ; 

    this.colorMaterial = new THREE.MeshBasicMaterial({ color: color, transparent:true, opacity : 0.7 }) ; 
    var labelOp = (this.labeling === true) ? this.opacity : 0 ;
    
    this.materialLetter = new THREE.MeshBasicMaterial({  map : image, transparent:true, opacity : labelOp }) ;

    if(this.wireframe == true){
      this.materials =  [  
        this.colorMaterial,  
        this.materialLetter
      ];
    }
    else{
      this.materials =  [  
        this.colorMaterial,  
         this.materialLetter
      ]; 
    }
  
    var sphere = THREE.SceneUtils.createMultiMaterialObject( globGeometries[this.lod], this.materials);
    sphere.name = 'atom';
    sphere.scale.set(this.radius, this.radius, this.radius);

    this.object3d = sphere;
    this.object3d.position.fromArray(position.toArray());
    MotifExplorer.add(this); 

  }; 
  AtomSphere.prototype.setNewLodGeometry = function(){

    var chs = this.object3d.children; 
    for (var j = 0, k = chs.length; j < k; j++) {
      chs[j].geometry.dispose();
      chs[j].geometry = globGeometries[this.lod] ;
    }
  };
  AtomSphere.prototype.setLabeling = function(bool){
 
    this.labeling = bool;

    if(this.labeling === true){
      this.object3d.children[1].material.opacity = this.opacity ;  
      this.object3d.children[1].material.needsUpdate = true; 
    }
    else if(this.labeling === false){
      this.object3d.children[1].material.opacity = 0 ;  
      this.object3d.children[1].material.needsUpdate = true; 
    }
  };
  AtomSphere.prototype.setOpacity = function( opacity) {
    
    if(_.isUndefined(opacity)) return;
    this.opacity = opacity/10 ;
    this.object3d.children[0].material.opacity = 0.7 ;
    this.object3d.children[0].material.needsUpdate = true;
  };  
  AtomSphere.prototype.getID = function() {
    var _this = this ;
    return _this.myID ;
  };  
  AtomSphere.prototype.getName = function() {
    var _this = this ;
    return _this.elementName ;
  };
  AtomSphere.prototype.setName = function(name) {
    var _this = this ;
    _this.elementName = name ;
  };
  AtomSphere.prototype.getRadius = function() {
    var _this = this ;
    return _this.radius ;
  }; 
  AtomSphere.prototype.setColorMaterial = function(color) {

    if(this.object3d  === undefined){
      return;
    }
    var _this = this;
    this.color = color ; 
    
    this.object3d.children[0].material.color = new THREE.Color( this.color );

  };   
  AtomSphere.prototype.changeColor = function(color, forTime) { 
    var _this = this; 

    this.object3d.children[0].material.color = new THREE.Color( color );

    setTimeout(function() { 
      _this.object3d.children[0].material.color = new THREE.Color( _this.color );
    }, 250);
  }; 
  AtomSphere.prototype.destroy = function() {
    MotifExplorer.remove(this);
  };
  AtomSphere.prototype.blinkMode = function(bool, color) {
    var _this = this; 
    this.blinkingMode = bool;
 
    if(bool){
      this.blinking = setInterval(function() { 
        _this.changeColor(color);
      }, 500);
    }
    else{
      clearInterval(this.blinking);
      this.object3d.children[0].material.color = new THREE.Color( this.color );
    } 
  };
  return AtomSphere;
});
