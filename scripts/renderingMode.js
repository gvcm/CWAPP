"use strict";

define([
  "three", 
  "underscore" 
], function(
  THREE, 
  _ 
) {
 
  function RenderingMode(crystalScene, unitCellScene, motifScene) { 
    this.crystalScene = crystalScene; 
    this.unitCellScene = unitCellScene; 
    this.motifScene = motifScene; 
  };

  RenderingMode.prototype.setMode = function(arg)  {

    this.mode = arg.mode;

    // flat
    if(arg.mode === 'SolidVoid'){ 
      this.crystalScene.AmbLight.color.setHex( 0x33332D );
      this.unitCellScene.AmbLight.color.setHex( 0x33332D );
    }
    else if(arg.mode === 'gradeLimited'){ 
      this.crystalScene.AmbLight.color.setHex( 0x4D4D4C );
      this.unitCellScene.AmbLight.color.setHex( 0x4D4D4C );
    }
  };

  return RenderingMode;
});
