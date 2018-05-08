
/*global define*/
'use strict';

define([
  'three', 
  'pubsub',
  'underscore' 
], function(
  THREE, 
  PubSub,
  _  
) { 

  var instance;
  var storedTextures = {};

  function AtomMaterialManager( lattice, motifEditor) {

    this.lattice = lattice;
    this.motifEditor = motifEditor;
     
  } 
  AtomMaterialManager.prototype.setLabels = function(arg){
    
    var bool = arg.labelToggle;

    this.motifEditor.labeling = bool;
    this.lattice.labeling = bool;

    for (var i = this.motifEditor.unitCellAtoms.length - 1; i >= 0; i--) { 
      this.motifEditor.unitCellAtoms[i].setLabeling(bool);
    };

    for (var i = this.lattice.actualAtoms.length - 1; i >= 0; i--) {
      this.lattice.actualAtoms[i].setLabeling(bool);
    };

    for (var i = this.lattice.cachedAtoms.length - 1; i >= 0; i--) {
      this.lattice.cachedAtoms[i].setLabeling(bool);
    };

    for (var i = this.motifEditor.motifsAtoms.length - 1; i >= 0; i--) {
      this.motifEditor.motifsAtoms[i].setLabeling(bool);
    };
    
    if(this.motifEditor.newSphere !== undefined){
      this.motifEditor.newSphere.setLabeling(bool);
    }
  }
  function createLabel(element, ionic, x, y, z, size, color, backGroundColor, backgroundMargin) {
     
    var canvas = document.createElement("canvas");
    var context = canvas.getContext("2d");
    context.font = size + "pt Arial";
    var textWidth = context.measureText(element).width;
    canvas.width = (textWidth + backgroundMargin) * 1.5 ;
    canvas.height = size + backgroundMargin; 
    context.font = size + "pt Arial";
    context = canvas.getContext("2d");

    if(backGroundColor) {
      context.fillStyle = backGroundColor;
      context.fillRect(
        canvas.width / 2 - textWidth / 2 - backgroundMargin / 2, 
        canvas.height / 2 - size / 2 - +backgroundMargin / 2, 
        textWidth + backgroundMargin, 
        size + backgroundMargin
      );
    }

    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = color;

    context.fillText( element , canvas.width / 2.5, canvas.height / 2.5);
   
    if(ionic !== '0'){
      context.font = (size/2) + "pt Arial";
      context.fillText( ionic , canvas.width / 2.5 + context.measureText(element).width + context.measureText(ionic).width/2 , canvas.height / 2.8); 
    }
      
    var texture = new THREE.Texture( canvas  );
    texture.needsUpdate = true; 
    //texture.mapping = THREE.SphericalReflectionMapping; 
    texture.minFilter = THREE.NearestFilter ;
    texture.offset.x = -0.5;

    return texture;
  }
  return {
    getInstance: function(lattice, motifEditor) {
      return (instance = instance || new AtomMaterialManager(lattice, motifEditor));
    }, 
    getTexture : function(elementName, ionic){
 
      var texture = createLabel(elementName, ionic, 0, 0, 0, 32, "black", undefined, 256); 

      storedTextures[elementName] = texture; // to be used

      return texture;
   
    }
  };
});  
