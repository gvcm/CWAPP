'use strict';

define([
  'three',
  'explorer',
  'underscore',
  'tween'
], function(
  THREE,
  Explorer,
  _,
  TWEEN
) { 

  var animationTime = 2500;

  function Narrative_system( lattice, orbit, animationMachine, crystalScene ) { 
    
    this.orbit = orbit ; 
    this.lattice = lattice ; 
    this.cameraData = {};
    this.planeData = {};
    this.dirData = {};
    this.animationMachine = animationMachine; 
    this.crystalScene = crystalScene; 

  };
   
  Narrative_system.prototype.saveNoteState = function(arg){
    
    var _this = this;
    var id = arg.id;
    var cameraToggle = arg.cameraToggle;
    var sceneObjsToggle = arg.sceneObjsToggle;
  
    if( cameraToggle === true){

      var p = this.orbit.camera.position.clone();
      var t = this.orbit.control.target.clone();
  
      this.cameraData[id] = {
        position : {
          x:p.x,
          y:p.y,
          z:p.z
        },
        target : {
          x : t.x,
          y : t.y,
          z : t.z
        }
      }
    }

    if( sceneObjsToggle === true){
       
      var l = this.lattice, _this = this; 
      var indexes;
    
      l.actualAtoms.forEach(function(atom, i) { 
        
        var noteState = {
          visible : atom.visibility,
          opacity : atom.opacity,
          color : {r : atom.object3d.children[0].material.color.r, g : atom.object3d.children[0].material.color.g, b : atom.object3d.children[0].material.color.b}
        } 

        atom.setNoteState(id, noteState); 
        
      });
 
      for (var prop in l.points) {
        if (l.points.hasOwnProperty(prop)) { 
          var noteState = {
            visible : l.points[prop].object3d.visible 
          }
          l.points[prop].setNoteState(id, noteState);

        }
      }

      _.each(l.grids, function(grid, reference) {
         
        var noteState = {
          visible : grid.grid.object3d.visible, 
          color : grid.grid.color,
          scale : grid.grid.scale
        }
        grid.grid.setNoteState(id, noteState); 
      });

       _.each(l.faces, function(face, reference) {
         
        var noteState = {
          visible : face.object3d.visible, 
          color : face.color,
          opacity : face.opacity
        }
        face.setNoteState(id, noteState); 
      });


      //////
      _this.planeData[id] = {};

      l.millerPlanes.forEach(function(plane) {

        if(plane.parallelIndex === 1){ 
          _this.planeData[id][plane.id] = {
            visible : plane.plane.visible,
            opacity : plane.plane.opacity,
            color : plane.plane.color

          } 
        }
      });

      _this.dirData[id] = {};

      l.millerDirections.forEach(function(dir) { 
        
        var r = (dir.direction.radius === NaN) ? 2 : dir.direction.radius;
        _this.dirData[id][dir.id] = {
          visible : dir.direction.object3d.visible, 
          radius : r, 
          color :  dir.direction.color  
        } 
          
      });
 
    }
    
  };   
  Narrative_system.prototype.enableNoteState = function(arg){
    
    var _this = this;
    var camera = this.orbit.camera ;
    var t = this.orbit.control.target ;
    var control = this.orbit.control ;

    if(arg.id !== undefined && this.cameraData[arg.id] !== undefined ){ 
        
      var finalPos = new THREE.Vector3(this.cameraData[arg.id].position.x,this.cameraData[arg.id].position.y,this.cameraData[arg.id].position.z);
      var finalTarget = new THREE.Vector3(this.cameraData[arg.id].target.x,this.cameraData[arg.id].target.y,this.cameraData[arg.id].target.z);
      
      var from = {
          x: camera.position.x,
          y: camera.position.y,
          z: camera.position.z
      };

      var to = {
          x: finalPos.x,
          y: finalPos.y,
          z: finalPos.z
      };
     
      var factor = 0;

      var tween = new TWEEN.Tween({x : from.x, y : from.y, z : from.z, par : 0 })
        .to({x : to.x, y : to.y, z : to.z, par : 1}, animationTime)
        .easing(TWEEN.Easing.Exponential.InOut)
        .onUpdate(function () {
          var v = new THREE.Vector3(this.x, this.y, this.z);
          var newP = v.setLength(v.length()*(1+factor)); 
          camera.position.copy(newP); 
          camera.lookAt(t);    
          factor = 2*Math.sin(this.par*3.14);
          
        })
        .onComplete(function () { 
          camera.position.copy(new THREE.Vector3(this.x, this.y, this.z)); 
        })
        .start();
      
      var tweenT = new TWEEN.Tween(t)
        .to(finalTarget, animationTime)
        .easing(TWEEN.Easing.Quintic.InOut)
        .onUpdate(function () {  
        })
        .onComplete(function () {   
        })
        .start();
 

    }

    //////////
 
    var l = this.lattice, _this = this; 
    var indexes;
  
    l.actualAtoms.forEach(function(atom, i) { 
      
      atom.applyNoteState(arg.id);
      
    });
  
    for (var prop in this.dirData[arg.id]) {
      l.millerDirections.forEach(function(dir, i) { 
        if(dir.id === prop  ){  

          if(_this.dirData[arg.id][prop].visible !== dir.direction.visible ){ 
      
            var sign;

            if(dir.direction.visible === true){
              // animate towards invisibility
              sign = -1;
              dir.direction.setOpacity(1);
              
            }
            else{
              // animate towards visibility
              sign = 1; 
              dir.direction.setOpacity(0); 
              dir.direction.setVisible(true);
            }
             
            var tweenO = new TWEEN.Tween({opacity : 0})
              .to({opacity : 1}, animationTime)
              .easing(TWEEN.Easing.Linear.None)
              .onUpdate(function () { 
                
                if(sign === -1) { 
                  dir.direction.setOpacity(1-this.opacity);
                }
                else{ 
                  dir.direction.setOpacity(this.opacity);
                }
              })
              .onComplete(function () { 
                if(_this.dirData[arg.id][prop]){
                  dir.direction.setVisible(_this.dirData[arg.id][prop].visible);
                }
                   
              })
              .start();
              
          }
 

          if(_this.dirData[arg.id][prop].color !== dir.direction.color ){ 

            

            var newColor =  _this.dirData[arg.id][prop].color  ;  
            
            var tweenC = new TWEEN.Tween(  dir.direction.tubeMesh.object3d.material.color )
              .to({r : newColor.r , g : newColor.g , b : newColor.b } , animationTime)
              .easing(TWEEN.Easing.Linear.None)
              .onUpdate(
                  function(){
                  dir.direction.object3d.children[0].material.color.setRGB(this.r, this.g, this.b);
                  dir.direction.object3d.children[1].material.color.setRGB(this.r, this.g, this.b);
                }
              )
              .onComplete(function () { 
                dir.direction.setColor( (new THREE.Color( newColor.r, newColor.g, newColor.b )).getHex());   
              })
              .start();
 
          }

          

          if(_this.dirData[arg.id][prop].radius !== dir.direction.radius ){ 

            var newRadius = _this.dirData[arg.id][prop].radius ;  
            
            var sign;

            if(dir.direction.radius >= newRadius){ 
              sign = -1; 
            }
            else{ 
              sign = 1;  
            }


            var tweenC = new TWEEN.Tween(  {scale : dir.direction.tubeMesh.object3d.scale.x} )
              .to({ scale : newRadius*2.5 } , animationTime)
              .easing(TWEEN.Easing.Linear.None)
              .onUpdate(
                  function(){  
                    dir.direction.tubeMesh.object3d.scale.z = this.scale;
                    dir.direction.tubeMesh.object3d.scale.x = this.scale;
                }
              )
              .onComplete(function () { 
                dir.direction.updateTubeRadius(newRadius );  
              })
              .start();
 
          }
        }
        
      }); 
    }

    for (var prop2 in this.planeData[arg.id]) {

      l.millerPlanes.forEach(function(plane, i) { 
        var that = _this;
        if(plane.id === prop2 && plane.parallelIndex === 1){ 
 
          if(_this.planeData[arg.id][prop2].visible !== plane.plane.visible ){ 
      
            var sign;

            if(plane.plane.visible === true){
              // animate towards invisibility
              sign = -1;
              plane.plane.setOpacity(10);
              
            }
            else{
              // animate towards visibility
              sign = 1; 
              plane.plane.setOpacity(0); 
              plane.plane.setVisible(true);
            }
             
            var tweenO = new TWEEN.Tween({opacity : 0})
              .to({opacity : 10}, animationTime)
              .easing(TWEEN.Easing.Linear.None)
              .onUpdate(function () { 
          
                if(sign === -1) { 
                  plane.plane.setOpacity(10-this.opacity);
                }
                else{ 
                  plane.plane.setOpacity(this.opacity);
                }
              })
              .onComplete(function () { 
                if(_this.planeData[arg.id][prop2]){
                  plane.plane.setVisible(that.planeData[arg.id][prop2].visible);  
                }
                 
              })
              .start();
              
          }

          if(_this.planeData[arg.id][prop2].opacity !== plane.plane.opacity ){ 
      
            var sign;
            var difference = Math.abs(plane.plane.opacity - _this.planeData[arg.id][prop2].opacity);
            var currentOp = plane.plane.opacity;

            if(plane.plane.opacity <= _this.planeData[arg.id][prop2].opacity){ 
              sign = 1; 
            }
            else{ 
              sign = -1;  
            }
          

            var tweenO = new TWEEN.Tween({opacity : 0})
              .to({opacity : difference}, animationTime)
              .easing(TWEEN.Easing.Linear.None)
              .onUpdate(function () { 
                if(sign === -1) { 
                   plane.plane.setOpacity(currentOp-this.opacity);
                }
                else{ 
                   plane.plane.setOpacity(currentOp+this.opacity);
                }
              })
              .onComplete(function () {  
              })
              .start();
 
          }

          if(_this.planeData[arg.id][prop2].color !== plane.plane.color ){ 
             console.log(_this.planeData[arg.id][prop2].color);
            var newColor = THREE.hexToRgb(_this.planeData[arg.id][prop2].color);  
            var tweenC = new TWEEN.Tween(plane.plane.object3d.material.color)
              .to({r : newColor.r/255, g : newColor.g/255, b : newColor.b/255} , animationTime)
              .easing(TWEEN.Easing.Linear.None)
              .onUpdate(
                  function(){}
              )
              .onComplete(function () {
                if(_this.planeData[arg.id][prop2]){
                  plane.plane.setColor(_this.planeData[arg.id][prop2].color);  
                }
                 
              })
              .start();
 
          }
 
        } 
         
      }); 
    }

    for (var prop3 in l.points) {
      if (l.points.hasOwnProperty(prop3)) {  

        l.points[prop3].applyNoteState(arg.id);

      }
    }

    _.each(l.grids, function(grid, reference) { 
      grid.grid.applyNoteState(arg.id); 
    });

    _.each(l.faces, function(face, reference) { 
      face.applyNoteState(arg.id); 
    });

  }
    
  Narrative_system.prototype.deleteNoteState = function(arg){
  
    var l = this.lattice, _this = this; 
    var indexes;
  
    l.actualAtoms.forEach(function(atom, i) { 
      
      atom.deleteNoteState(arg.id);
      
    }); 

    for (var prop in l.points) {

      l.points[prop].deleteNoteState(arg.id); 
    }

    _.each(l.grids, function(grid, reference) {
        
      grid.grid.deleteNoteState(arg.id);  
    });

     _.each(l.faces, function(face, reference) { 
      face.deleteNoteState(arg.id); 
    });


    //////
    _this.planeData[arg.id] = {};

    
    _this.dirData[arg.id] = {};

     

  }; 
  return Narrative_system;

});
