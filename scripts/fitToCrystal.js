'use strict';

define([
  'three', 
  'underscore'
], function(
  THREE, 
  _
) { 
 
  function FitToCrystal(orbitControl, lattice, renderer, scene) { 
    
    this.orbitControl = orbitControl ; 
    this.lattice = lattice ; 
    this.renderer = renderer ; 
    this.scene = scene;
    this.lastCameState = {
      position : this.orbitControl.camera.position.clone(), 
      target : this.orbitControl.control.target.clone()
    };

  };
  FitToCrystal.prototype.revertCamera = function(arg){
    var camera = this.orbitControl.camera;

    if(arg.position === undefined){
      camera.position.copy(this.lastCameState.position);
    }

    if(arg.target === undefined){
      this.orbitControl.control.target.copy(this.lastCameState.target); 
    }
      
  };
  FitToCrystal.prototype.fit = function(arg){
    
    var  sign = -1; // direction
    var camera = this.orbitControl.camera;

    this.lastCameState.position = camera.position.clone();
    this.lastCameState.target = this.orbitControl.control.target.clone();
  
    // find centroid
    var g = this.lattice.customBox(this.lattice.viewBox);
    var centroid = new THREE.Vector3(0,0,0);

    if(g !== undefined){ 
      centroid = new THREE.Vector3(); 
      for ( var z = 0, l = g.vertices.length; z < l; z ++ ) {
        centroid.add( g.vertices[ z ] ); 
      }  
      centroid.divideScalar( g.vertices.length );
    }
    //
    
    var camLookingAt = (arg && arg.target) ? arg.target : centroid, counter = 0 ;
    this.orbitControl.control.target.copy(camLookingAt); 
    this.orbitControl.update();

    camera.updateMatrix(); // make sure camera's local matrix is updated
    camera.updateMatrixWorld(); // make sure camera's world matrix is updated
    camera.matrixWorldInverse.getInverse( camera.matrixWorld );

    var frustum = new THREE.Frustum();
    frustum.setFromMatrix( new THREE.Matrix4().multiplyMatrices( camera.projectionMatrix, camera.matrixWorldInverse ) );
    
    for (var j = frustum.planes.length - 1; j >= 0; j--) {  
      var p = frustum.planes[j];  
      _.each(this.lattice.points, function(point, reference) { 
        var sphere = new THREE.Sphere(point.object3d.position.clone(), point.radius); 
        if(p.distanceToSphere(sphere) < 0.1 ){
          sign = 1;
        } 
      }); 
    };

    var finished = false;
  
    while( finished === false && camera.position.length() > 2 && counter < 1000 ){ /* counter is bug handler */
     
      var camToTargetVec = camLookingAt.clone().sub(camera.position.clone());
       
      var newPos = new THREE.Vector3(-1*camToTargetVec.x, -1*camToTargetVec.y, -1*camToTargetVec.z);
       
      newPos.setLength(newPos.length()+1*sign);
 
      camera.position.copy(newPos.add(camLookingAt));

      camera.updateMatrix(); // make sure camera's local matrix is updated
      camera.updateMatrixWorld(); // make sure camera's world matrix is updated
      camera.matrixWorldInverse.getInverse( camera.matrixWorld );
  
      var frustum = new THREE.Frustum();
      frustum.setFromMatrix( new THREE.Matrix4().multiplyMatrices( camera.projectionMatrix, camera.matrixWorldInverse ) );
      
      finished = (sign === -1) ? finished : true ;

      for (var j = frustum.planes.length - 1; j >= 0; j--) {  
        
        var p = frustum.planes[j];  
        
        for (var i = this.lattice.actualAtoms.length - 1; i >= 0; i--) { 
          finished = checkCollision(p, camera,this.lattice.actualAtoms[i].object3d.position.clone(), this.lattice.actualAtoms[i].radius, this.lattice.actualAtoms[i].visibility, sign, finished);
        };

        for (var i = this.lattice.cachedAtoms.length - 1; i >= 0; i--) { 
          finished = checkCollision(p, camera,this.lattice.cachedAtoms[i].object3d.position.clone(), this.lattice.cachedAtoms[i].radius, this.lattice.cachedAtoms[i].visibility, sign, finished);
        };

        _.each(this.lattice.points, function(point, reference) { 
          finished = checkCollision(p, camera,point.object3d.position.clone(), 0.04, true, sign, finished);
        }); 
 
      };
      
      counter++;
    }   
  }; 

  function checkCollision(p, camera, position, radius, visibility, sign, bool){

    if(visibility === false){
      //return bool;
    }

    var sphere = new THREE.Sphere(position, radius); 
           
    if( sign === 1 && p.distanceToSphere(sphere) < 0.5 ){ 
      bool = false;
    }

    if( sign === -1 && p.distanceToSphere(sphere) < 1 ){ 
      bool = true; 
    }

    return bool;

  }

  return FitToCrystal;

});
