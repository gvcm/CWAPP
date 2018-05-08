'use strict';
define([
  'jquery', 
  'three', 
  'threejs-controls/OrbitControls', // no AMD module
  'threejs-controls/OrbitAndPanControls',
  'deviceOrientationControls'  
], function(
  jQuery,
  THREE 
) {
  var mutualCamPosParam = new THREE.Vector3();

  function Orbit(camera, domElement, type, deactivate, camName, syncedCamera, hudCameras, cardBoard ) {
    var $rendererContainer = jQuery(domElement);
    this.sync = false;
    this.camera = camera; 
    this.camName = camName; 
    this.hudCameras = hudCameras; 
    this.theta = 0; 
    this.phi = 0;   
    this.currPos = new THREE.Vector3(0,0,0); 
    this.disableUpdate = false;
    this.deviceOrientationControls;
    this.deviceOrientationControlsActive = false;
    this.externalFunctions = [];  

    if(type == "perspective" ) {
      if( camName === 'hud') { 
        this.control = new THREE.OrbitControls(camera, $rendererContainer[0], deactivate, 1, 'hud');
      } 
      else if( camName === 'motif'){
        this.control = new THREE.OrbitControls(camera, $rendererContainer[0], deactivate, undefined, 'motif' );
      }
      else{ 
       
        this.controlCardboard = new THREE.DeviceOrientationControls(camera); 
        this.control = new THREE.OrbitControls(camera, $rendererContainer[0], deactivate, undefined, 'crystal' );
        
      }
    }
    else if (type === "orthographic"){
      this.control = new THREE.OrbitAndPanControls(camera, $rendererContainer[0]);
    }  
  };
  Orbit.prototype.dollOnDocumentMouseDown = function(onDocumentMouseDown){ 
    if(this.control.dollOnDocumentMouseDown){
      this.control.dollOnDocumentMouseDown(onDocumentMouseDown);
    }
    
  }; 
  Orbit.prototype.setSyncedCamControl = function(control){ 
    this.control.syncedControl = control;
  };
  Orbit.prototype.getCamName = function(){
    return this.camName ;
  };
  Orbit.prototype.setThetaPhi = function(theta,phi) {
    // these are for constant rotate not direct values for setting the camera
    this.theta = theta;
    this.phi = phi;
    this.control.myTheta = this.theta ;
    this.control.myPhi = this.phi ;  
    this.control.makeMovement = true ;

  }
  Orbit.prototype.leap_zoom = function(distFromCenter){
    this.control.leap_zoom(distFromCenter);
  }
  Orbit.prototype.getAutoRotate = function(){
    return this.control.autoRotate ;
  };
  Orbit.prototype.autoRotate = function(bool){ 
    this.control.autoRotate = bool; 
  };
  Orbit.prototype.syncCams = function(bool){ 
    this.control.syncCams = bool; 
  };
  Orbit.prototype.getCamPosition = function(){
    return this.control.object.position ;
  };
  Orbit.prototype.getTarget = function(){
    return this.control.target ;
  };
  Orbit.prototype.setRotationManually = function(theta,phi){
    this.control.setRotationManually(theta,phi);
  };
  Orbit.prototype.update = function() {

    if(this.deviceOrientationControlsActive === true){
      this.controlCardboard.update(); 
      return;
    }

    if(this.disableUpdate === true){
      return;
    }
    

    this.control.update(); 
       
    if( this.camName === 'crystal'){
       
      var offset = this.getCamPosition().clone();  
 
      if(offset.equals(this.currPos)){
        return;
      }
      this.currPos.copy(offset);
 
      var targ = this.getTarget() ; 
      offset.sub( targ );

      var theta = Math.atan2( offset.x, offset.z );  
      var phi = Math.atan2( Math.sqrt( offset.x * offset.x + offset.z * offset.z ), offset.y );
      phi = Math.max( 0.01, Math.min( Math.PI - 0.01, phi ) );

      
      for (var i = this.hudCameras.length - 1; i >= 0; i--) { 
         
        var r = this.hudCameras[i].position.length() ;
        var newOffset = new THREE.Vector3();

        newOffset.x = r * Math.sin( phi ) * Math.sin( theta );
        newOffset.y = r * Math.cos( phi );
        newOffset.z = r * Math.sin( phi ) * Math.cos( theta );

        var quat = new THREE.Quaternion().setFromUnitVectors( this.hudCameras[i].up, new THREE.Vector3( 0, 1, 0 ) );
        var quatInverse = quat.clone().inverse();

        newOffset.applyQuaternion( quatInverse );
     
        this.hudCameras[i].position.copy( new THREE.Vector3(0,0,0) ).add( newOffset ); 

        this.hudCameras[i].lookAt( new THREE.Vector3(0,0,0) );

      }; 
   
    }
  }; 
  return Orbit;
});
