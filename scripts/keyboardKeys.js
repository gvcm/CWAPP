'use strict';
define([
  'jquery', 
  'three',
  'explorer',
  'underscore' 
], function(
  jQuery,
  THREE,
  Explorer,
  _ 
) {
  
  var clocks = { 
    rotUp : new THREE.Clock(),  
    rotDown : new THREE.Clock(), 
    rotLeft : new THREE.Clock(),  
    rotRight : new THREE.Clock(), 
    up : new THREE.Clock(),  
    down : new THREE.Clock(),  
    forth : new THREE.Clock(),  
    back : new THREE.Clock(),  
    left : new THREE.Clock(),  
    right : new THREE.Clock(), 
    orbitRreduce : new THREE.Clock(),
    orbitRincrease : new THREE.Clock() 
  };
  var clock = new THREE.Clock();

  function KeyboardKeys(keyboard, crystalScene, orbitCrystal, meTemporal, crystalRendererTemporal, lattice) { 

    this.keyboard = keyboard;  
    this.crystalScene = crystalScene;  
    this.orbitCrystal = orbitCrystal;  
    this.dollmode = false;  
    this.mutex = false;
    this.hidden = true;
    this.meTemporal = meTemporal;
    this.lastCameraPosition = {cam : new THREE.Vector3(), cube : new THREE.Vector3()};
    this.crystalRendererTemporal = crystalRendererTemporal; 
    this.atomCustomizer ; 
    this.lattice = lattice; 
  };

  KeyboardKeys.prototype.handleKeys = function(leapArg, speed, passport){  
    var _this = this;
     
    if(this.dollmode === true || passport !== undefined){ 
      
      // set limits of world
      var distToCenter = (this.orbitCrystal.camera.position).distanceTo(new THREE.Vector3(0,0,0)) ; 
      if(distToCenter > 2500){ 
        this.orbitCrystal.camera.position.copy(this.lastCameraPosition.cam);
        this.crystalScene.movingCube.position.copy(this.lastCameraPosition.cube);
        return;
      }  
      this.lastCameraPosition.cam = this.orbitCrystal.camera.position.clone();
      this.lastCameraPosition.cube = this.crystalScene.movingCube.position.clone();

      speed = (speed === undefined) ? 1 : speed ;
 
      var delta = (leapArg === undefined) ? clock.getDelta() : clocks[Object.keys(leapArg)[0]].getDelta(), helperVec;  
      if(delta > 0.1) {
        delta = 0.1;
      }

      var camPos = this.orbitCrystal.camera.position ;
      var cubePos = this.crystalScene.movingCube.position;
      var rotationDistance = 0.2 * delta * speed ;

      // algorithm to smoothly move camera
      var par = Math.exp(distToCenter/50);
      var distFactor = par  ; 
      
      if(leapArg === undefined){ 
        if(distFactor > 30 && distFactor < 50){
          distFactor = 30 + (distFactor - 20)/2 ;
        }
        else if(distFactor > 50 && distFactor < 70){
          distFactor = 40 + (distFactor - 40)/3 ;
        }
        else if(distFactor > 70 && distFactor < 80){
          distFactor = 45 + (distFactor - 60)/5 ;
        }    
        if(distFactor > 80){
          distFactor = 50 ;
        }
      }
      else{
        if(distFactor > 10){
          distFactor = 10;
        }
      }
      //

      leapArg = (leapArg === undefined) ? {} : leapArg ;
         
      var timeInputDistFactor = (leapArg === undefined) ? ( delta * speed * distFactor) : (5 * delta * speed * distFactor);
       
      var camToCubeDistance = (cubePos.clone()).sub(camPos).length() * speed ;

      var camToCubeVec = (cubePos.clone()).sub(camPos) ;
       
      camToCubeVec.setLength(timeInputDistFactor);
         
      if ( this.keyboard.pressed("A") || (leapArg.left !== undefined)){
        
        helperVec = (new THREE.Vector3(cubePos.x, camPos.y, cubePos.z)).sub(camPos);
        helperVec.applyAxisAngle( new THREE.Vector3( 0, 1, 0 ), Math.PI / 2 ); 
        
        ///
        helperVec.setLength(camToCubeVec.length()/2);
        ///

        camPos.add(helperVec);
        cubePos.add(helperVec); 
      }
      if ( this.keyboard.pressed("D") || (leapArg.right !== undefined)){
        helperVec = (new THREE.Vector3(cubePos.x, camPos.y, cubePos.z)).sub(camPos);
        helperVec.applyAxisAngle( new THREE.Vector3( 0, 1, 0 ), Math.PI / -2 ); 
        
        ///
        helperVec.setLength(camToCubeVec.length()/2);
        ///

        camPos.add(helperVec);
        cubePos.add(helperVec); 
      }
      if ( this.keyboard.pressed("W") || (leapArg.forth !== undefined) ){ 
        camPos.add(camToCubeVec);
        cubePos.add(camToCubeVec);    
      }
      if ( this.keyboard.pressed("S") || (leapArg.back !== undefined)){
        camToCubeVec.negate();
        camPos.add(camToCubeVec);
        cubePos.add(camToCubeVec);  
      } 
      if ( this.keyboard.pressed("shift") || (leapArg.down !== undefined)){
        camPos.y -= timeInputDistFactor/2 ;
        cubePos.y -= timeInputDistFactor/2 ;  
      }
      if ( this.keyboard.pressed("space") || (leapArg.up !== undefined)){
        camPos.y += timeInputDistFactor/2 ;
        cubePos.y += timeInputDistFactor/2 ;  
      }
      
      //console.log(this.keyboard.pressed("numPad5"));
      // rotations
      if ( this.keyboard.pressed("numPad5") || (leapArg.rotUp !== undefined)){ 
        this.orbitCrystal.control.rotateUp(rotationDistance);   
      } 
      if ( this.keyboard.pressed("numPad8") || (leapArg.rotDown !== undefined)){
        this.orbitCrystal.control.rotateUp(-1 *rotationDistance);  
      }
      if ( this.keyboard.pressed("numPad4") || (leapArg.rotLeft !== undefined)){  
        this.orbitCrystal.control.rotateLeft(-1 * rotationDistance);  
      } 
      if ( this.keyboard.pressed("numPad6") || (leapArg.rotRight !== undefined)){ 
        this.orbitCrystal.control.rotateLeft(  rotationDistance);  
      } 


      if ( leapArg.orbitRreduce !== undefined && camToCubeDistance > 0.9){   
        var camToCubeFact = delta * (1 + camToCubeDistance ) ;
     
        camToCubeVec.setLength(camToCubeFact);
        camPos.add(camToCubeVec);  
      } 
      else if ( leapArg.orbitRincrease !== undefined && camToCubeDistance >0.9){ 
        camToCubeVec.negate();
        var camToCubeFact = delta*(1 + camToCubeDistance ) ;
        camToCubeVec.setLength(camToCubeFact);
        camPos.add(camToCubeVec);
      }  

      if((cubePos.clone()).sub(camPos).length() <= 0.9){
        // to avoid stucking for ever
        camToCubeVec.negate();
        camPos.add(camToCubeVec);
      }

      this.orbitCrystal.control.target =  cubePos;  
      this.orbitCrystal.control.rotateSpeed =  0.2;  
    } 

    ///// Secret Features
    
    if ( this.keyboard.pressed("A") && this.keyboard.pressed("ctrl") ){
      if(this.mutex === false){ 
        this.mutex = true;
        this.atomCustomizer.menuIsOpen = false;
        for (var i = this.lattice.actualAtoms.length - 1; i >= 0; i--) {
          this.atomCustomizer.atomJustClicekd(this.lattice.actualAtoms[i], true);
        };
        setTimeout(function(){ _this.mutex = false;}, 400 );

      }
    }

    if ( this.keyboard.pressed("C") && this.keyboard.pressed("alt") && this.keyboard.pressed("ctrl") ){
      //delete cookie 
      document.cookie = "hasVisited=; expires=Thu, 01 Jan 1970 00:00:00 UTC";  
    }
    if ( this.keyboard.pressed("O") && this.keyboard.pressed("alt") && this.keyboard.pressed("ctrl") ){
      if(this.mutex === false){ 
        this.mutex = true;
        if( this.hidden === true){
          $('#secretMenu').show(); 
          this.hidden = false; 
        }
        else{  
          $('#secretMenu').hide();
          this.hidden = true; 
          this.crystalRendererTemporal.stereoscopicEffect.setNewMaterial({'blue' :3 , 'red' : 3});
        }
        setTimeout(function(){ _this.mutex = false;}, 200 );
      } 
    }
    if ( this.keyboard.pressed("P") && this.keyboard.pressed("alt") && this.keyboard.pressed("ctrl") ){
         
      if(this.mutex === false){ 
        this.mutex = true;
        if( this.hidden === true){
          $('#grainStats').show(); 
          this.hidden = false;
          this.crystalRendererTemporal.rstatsON = true;
        }
        else{  
          $('#grainStats').hide();
          this.hidden = true;
          this.crystalRendererTemporal.rstatsON = false;
        }
        setTimeout(function(){ _this.mutex = false;}, 200 );
      } 
    }
    if ( this.keyboard.pressed("B") && false){
         
      if(this.mutex === false){ 
        this.mutex = true;
        if( this.meTemporal.box3.bool === true){ 
          this.meTemporal.box3.bool = false;
        }
        else{   
          this.meTemporal.box3.bool = true;
        }
        setTimeout(function(){ _this.mutex = false;}, 200 );
      } 
    }
 
  };
  
  return KeyboardKeys;

});
