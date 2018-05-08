
/*global define*/
//'use strict';

define([
  'three', 
  'pubsub',
  'underscore', 
  'dollExplorer'
], function(
  THREE, 
  PubSub,
  _, 
  DollExplorer 
  
) {  
  function AtomRelationshipManager(lattice, motifEditor) {
 
    var _this = this;
    
    this.lattice = lattice;
    this.motifEditor = motifEditor;
    this.highlightOverlapState = false;
  };    
  AtomRelationshipManager.prototype.checkForOverlap = function(arg){
 

    if(arg !== undefined){  
      this.highlightOverlapState = arg.highlightTangency;
    }

    if(this.highlightOverlapState === true){
      this.highlightOverlapState = false; 
      this.checkCrystalforOverlap();
      this.checkMotiforOverlap();
      this.checkCellforOverlap(); 
      this.highlightOverlapState = true; 
    }
    this.checkCrystalforOverlap();
    this.checkMotiforOverlap();
    this.checkCellforOverlap();
  }
  AtomRelationshipManager.prototype.checkMotiforOverlap = function(arg){
     
    if(this.highlightOverlapState === true){
 
      for (var i = this.motifEditor.motifsAtoms.length - 1; i >= 0; i--) {

        var ri = this.motifEditor.motifsAtoms[i].radius;
        var posi = this.motifEditor.motifsAtoms[i].object3d.position.clone();

        for (var j = this.motifEditor.motifsAtoms.length - 1; j >= 0; j--) {
          
          var rj = this.motifEditor.motifsAtoms[j].radius;

          var tangentDist = ri + rj;

          var posj = this.motifEditor.motifsAtoms[j].object3d.position.clone();
           
          var realDist = (posi).distanceTo(posj);
 
          if(realDist !== 0 && (realDist + 0.0001 < tangentDist )){   
            this.motifEditor.motifsAtoms[j].setColorMaterial('#ff0000'); 
            this.motifEditor.motifsAtoms[i].setColorMaterial('#ff0000');  

          } 
        };

        if(this.motifEditor.newSphere !== undefined){ 
         
          var realDist = (posi).distanceTo(this.motifEditor.newSphere.object3d.position);
          var tangentDist = this.motifEditor.newSphere.radius + ri;
          if(realDist !== 0 && (realDist + 0.0001 < tangentDist )){   
            this.motifEditor.newSphere.setColorMaterial('#ff0000'); 
            this.motifEditor.motifsAtoms[i].setColorMaterial('#ff0000');  
          } 
        }  
      };
    }
    else if(this.highlightOverlapState === false){
      for (var i = this.motifEditor.motifsAtoms.length - 1; i >= 0; i--) { 
        
        if(this.motifEditor.motifsAtoms[i].getOriginalColor !== undefined){ 
          this.motifEditor.motifsAtoms[i].setColorMaterial(this.motifEditor.motifsAtoms[i].getOriginalColor());
        } 
      };
      if(this.motifEditor.newSphere !== undefined){ 
           
        this.motifEditor.newSphere.setColorMaterial(this.motifEditor.newSphere.getOriginalColor()); 
    
      }  
    } 
  };
  AtomRelationshipManager.prototype.checkCellforOverlap = function(arg){
 
    if(this.highlightOverlapState === true){
      for (var i = this.motifEditor.unitCellAtoms.length - 1; i >= 0; i--) {
        for (var j = this.motifEditor.unitCellAtoms.length - 1; j >= 0; j--) {
          var ri = this.motifEditor.unitCellAtoms[i].radius;
          var rj = this.motifEditor.unitCellAtoms[j].radius;

          var tangentDist = ri + rj;

          var realDist = (this.motifEditor.unitCellAtoms[j].object3d.position).distanceTo(this.motifEditor.unitCellAtoms[i].object3d.position);
          
          if(realDist !== 0 && realDist + 0.0001< tangentDist ){ 

            this.motifEditor.unitCellAtoms[j].setColorMaterial('#ff0000'); 
            this.motifEditor.unitCellAtoms[i].setColorMaterial('#ff0000'); 

          } 
        };
      };
    }
    else if(this.highlightOverlapState === false){
      for (var i = this.motifEditor.unitCellAtoms.length - 1; i >= 0; i--) { 
        
        if(this.motifEditor.unitCellAtoms[i].setColorMaterial !== undefined){
          this.motifEditor.unitCellAtoms[i].setColorMaterial(this.motifEditor.unitCellAtoms[i].getOriginalColor()); 
        }
         
      };
    }
  }; 
  AtomRelationshipManager.prototype.checkCrystalforOverlap = function(arg){
     
    if(this.highlightOverlapState === true){
      for (var i = this.lattice.actualAtoms.length - 1; i >= 0; i--) {
        for (var j = this.lattice.actualAtoms.length - 1; j >= 0; j--) {
          var ri = this.lattice.actualAtoms[i].radius;
          var rj = this.lattice.actualAtoms[j].radius;

          var tangentDist = ri + rj;

          var realDist = (this.lattice.actualAtoms[j].object3d.position).distanceTo(this.lattice.actualAtoms[i].object3d.position);
 
          if(realDist !== 0 && realDist + 0.0001< tangentDist ){
                
            this.lattice.actualAtoms[j].setColorMaterial('#ff0000'); 
            this.lattice.actualAtoms[i].setColorMaterial('#ff0000'); 

          }
        };
      };
    }
    else if(this.highlightOverlapState === false){
      for (var i = this.lattice.actualAtoms.length - 1; i >= 0; i--) { 
          
        this.lattice.actualAtoms[i].setColorMaterial(this.lattice.actualAtoms[i].getOriginalColor()); 
        
      };
    }
  }
  return AtomRelationshipManager;
  
});  
