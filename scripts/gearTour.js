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
  var stateNames = ['Lattice Points', 'The motif', 'The cropped unit cell', 'Whole unit cell', 'the crystal' ];
  function GearTour(crystalScene, motifEditor, lattice, menu) { 
    
    this.crystalScene = crystalScene ;
    this.motifEditor = motifEditor ; 
    this.lattice = lattice ;
    this.crystalHasChanged = true ;
    this.menu = menu;
    this.state = 1;
  };
 
  GearTour.prototype.setState = function(state, init){

    if(this.lattice.actualAtoms.length === 0 && init === undefined) {
      return;
    } 

    this.state = state; 

    switch(state){ 

      case 1:  
        this.hideCachedAtoms();
        this.setActualAtoms(false, 1);
        this.setMillers(false); 
        this.hideSubtractedCell();  
      break;
 
      case 2:  
        this.hideCachedAtoms();
        this.setActualAtoms(false,2);
        this.setMillers(false); 
        this.hideSubtractedCell();  
      break;

      case 3:  
        this.hideCachedAtoms();
        this.setActualAtoms(false, 3);
        this.setMillers(true); 
        this.hideSubtractedCell();  
      break;

      case 4:   
        this.hideCachedAtoms();
        this.setActualAtoms(false, 4);
        this.setMillers(true); 
        this.setCSGforCrystal('crystalGradeLimited');
      break; 

      case 5:  
        this.hideCachedAtoms();
        this.setActualAtoms(false,5); 
        this.setMillers(true);
        this.setCSGforCrystal('crystalSubstracted');  
      break; 
       
      case 6:    
        this.hideCachedAtoms();
        this.setActualAtoms(true, 6);
        this.setMillers(true); 
        this.hideSubtractedCell();
        
      break; 
    } 

  }; 

  GearTour.prototype.setActualAtoms = function(bool, state){
 
    var l = this.lattice, _this = this; 
    var indexes;

    if(state === 3 && bool === false) {
      indexes = this.findCellIndexes() ;
    }

    l.actualAtoms.forEach(function(atom, i) { 
      var visible = false ;
      if(state === 1 && bool === false){
        atom.setVisibility(visible); 
      }
      else if(state === 2 && bool === false ){
        visible = (atom.centerOfMotif.x === 0 && atom.centerOfMotif.y === 0 && atom.centerOfMotif.z === 0 ) ? true : false ;
        atom.setVisibility(visible); 
      } 
      else if(state === 3 && bool === false){
        visible = indexes.hasOwnProperty(atom.latticeIndex);
        atom.setVisibility(visible); 
      } 
      else if(state === 4 && bool === false){
        atom.setVisibility(visible); 
      }
      else if(state === 6 && bool === true){
        atom.setVisibility(bool); 
      }
    });
 
  };   
  GearTour.prototype.hideCachedAtoms = function(){
    var i =0;

    while(i < this.lattice.cachedAtoms.length ){ 
      this.lattice.cachedAtoms[i].setVisibility(false); 
      if(this.lattice.cachedAtoms[i].subtractedForCache.object3d !== undefined){
        this.lattice.cachedAtoms[i].subtractedForCache.object3d.visible = false;    
      } 
      i++;
    }
  }
  GearTour.prototype.hideSubtractedCell = function(){
    var j=0;
    while(j < this.lattice.actualAtoms.length ) {  
      if(this.lattice.actualAtoms[j].subtractedForCache.object3d !== undefined) {
        this.lattice.actualAtoms[j].subtractedForCache.object3d.visible = false;   
      };
      j++;
    }

    j = 0;

    while(j < this.lattice.cachedAtoms.length ) {  
      if(this.lattice.cachedAtoms[j].subtractedForCache.object3d !== undefined) {
        this.lattice.cachedAtoms[j].subtractedForCache.object3d.visible = false;   
      };
      j++;
    }  

  };
  GearTour.prototype.setCSGforCrystal = function(mode){
 
    var geometry = new THREE.Geometry(), i=0;  
    var scene = this.crystalScene.object3d;
    var indexes = this.findCellIndexes();
    var viewBox = [] ;
    var box;
    var j = 0 ;
   
    box = new THREE.Mesh(this.motifEditor.customBox(this.motifEditor.unitCellPositions, this.motifEditor.latticeName), new THREE.MeshLambertMaterial({side: THREE.DoubleSide, opacity : 0.5, transparent : true, color:"#FF0000" }) );
      
    if(mode === 'crystalSubstracted'){
      this.lattice.setCSGmode({mode : 'crystalSubstracted'}, undefined, box);
      this.crystalHasChanged = false;
    }
    else if('crystalGradeLimited'){
      this.lattice.setCSGmode({mode : 'crystalGradeLimited'}, undefined, box);
    }
     
  }; 
  GearTour.prototype.findCellIndexes = function(){
    
    var indexes = {}, _this = this ;

    if(this.motifEditor.latticeType === 'hexagonal'){
      var a = this.lattice.parameters.scaleZ ;
      var c = this.lattice.parameters.scaleY ;
      var co = 0 ;

      var vertDist = a * Math.sqrt(3);
 
      _.times(2, function(_y) {
        _.times(1   , function(_x) {
          _.times(1  , function(_z) {
            
            // point in the middle
            var z = (_x % 2==0) ? (_z*vertDist) : ((_z*vertDist + vertDist/2));
            var y =  _y*c ;
            var x = _x*a*1.5 ;
            var reference = 'h_'+(x).toFixed(2)+(y).toFixed(2)+(z).toFixed(2) ; 
            indexes[reference] = true; 
            // point in the middle 

            _.times(6 , function(_r) {

              var v = new THREE.Vector3( a, 0, 0 ); 
              var axis = new THREE.Vector3( 0, 1, 0 );
              var angle = (Math.PI / 3) * _r ; 
              v.applyAxisAngle( axis, angle );

              var z = (_x % 2==0) ? (v.z + _z*vertDist) : ((v.z + _z*vertDist + vertDist/2));
              var y =  v.y + _y*c ;
              var x = v.x + _x*a*1.5 ;
              
              var position = new THREE.Vector3( x, y, z);
              z = z.toFixed(2) ;
              if(z==0) z = '0.00'; // check for negative zeros  

              var reference = 'h_'+(x).toFixed(2)+(y).toFixed(2)+z ;
               
              if (_.isUndefined( indexes[reference])) { 
                
                indexes[reference] = true ;   
                 
              }  
            }); 
          });
        });
      }); 

    }
    else{  
      var origin = this.lattice.lattice.originArray[0];
      var vector = this.lattice.lattice.vector;
      var originLength = this.lattice.lattice.originArray.length ;
      var originArray = this.lattice.lattice.originArray, position, reference ;
      var limit = new THREE.Vector3(
        vector.x + origin.x,
        vector.y + origin.y,
        vector.z + origin.z
      );

      _.times(2, function(_x) {
        _.times(2, function(_y) {
          _.times(2, function(_z) {  
            for (var index = 0; index < originLength; index++) {
              origin = originArray[index];
              position = new THREE.Vector3(
                _x * vector.x + origin.x,
                _y * vector.y + origin.y,
                _z * vector.z + origin.z
              ); 
              if (position.x <= limit.x && position.y <= limit.y && position.z <= limit.z) 
              {     
                reference = 'r_' + _x + '_' + _y + '_' + _z + '_' + index;
                 
                if (_.isUndefined(indexes[reference])) {
                  indexes[reference] = true ;   
                }
              }                   
            }
          });  
        });  
      });
    }

    return indexes;
  };
  GearTour.prototype.setMillers = function(bool){
 
    var l = this.lattice; 

    l.millerPlanes.forEach(function(plane) {
      plane.plane.object3d.visible = bool ;
    });
    l.millerDirections.forEach(function(dir) {
      dir.direction.setVisible(bool);  
    });

  }; 
  return GearTour;

});
