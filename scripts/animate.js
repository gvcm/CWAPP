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
  
  var wavesNames = ['crystalCenter', 'cellCollision', 'atomCollision'];
  function Animate(scene, soundMachine) { 
    
    this.scene = scene ;
    this.soundMachine = soundMachine ; 
    this.waves = [] ;
    this.wavesTrigger = [] ;
    this.keyboard ;
    this.cameraAnimation = undefined;

    for (var i = wavesNames.length - 1; i >= 0; i--) {
      this.wavesTrigger[wavesNames[i]] = false;
      this.waves[wavesNames[i]] = new THREE.Mesh( new THREE.SphereGeometry( 0.1, 32, 32 ) , new THREE.MeshBasicMaterial( { blending: THREE.AdditiveBlending, color: '#0066CC', side: THREE.DoubleSide, transparent:true, opacity:0.125 ,depthWrite:false} ) );
      this.waves[wavesNames[i]].visible = false ;
      scene.add({'object3d' : this.waves[wavesNames[i]]}); 
    }; 
  };

  Animate.prototype.produceWave = function(sourcePos, which){

    this.wavesTrigger[which] = true ;
    this.waves[which].visible = true ;
    this.waves[which].position.set(sourcePos.x, sourcePos.y, sourcePos.z); 
    this.waves[which].scale.set(0.1,0.1,0.1); 

  };

  var lastTime = 0;


  Animate.prototype.animation = function(){
    var timeNow = new Date().getTime();

    if (lastTime != 0) {
      var elapsed = timeNow - lastTime ;
       
      var offset = elapsed/20 ;
        
      //soundwaves
      for (var i = wavesNames.length - 1; i >= 0; i--) {
        if(this.wavesTrigger[wavesNames[i]]){
          var a = this.waves[wavesNames[i]].scale.x ; 
          a += offset ;
          this.waves[wavesNames[i]].scale.set(a,a,a); 
          this.waves[wavesNames[i]].material.opacity -= offset/900;
          if(this.waves[wavesNames[i]].scale.x > 100){ 
            this.waves[wavesNames[i]].material.opacity = 0.125;
            this.waves[wavesNames[i]].visible = false ;
            this.wavesTrigger[wavesNames[i]] = false ;
          }  
        } 
      } 

      // camera doll movement
      if( this.cameraAnimation !== undefined && (this.cameraAnimation.targetTrigger === true || this.cameraAnimation.positionTrigger === true)){
           
        var offset2 = elapsed/30, 
            newTarget,
            targConnectVector = this.cameraAnimation.targConnectVector.clone(),
            distanceToMakeBetweenTargets = this.cameraAnimation.targConnectVector.length() ,
            distanceVec,
            lpos, 
            posConnectVector = this.cameraAnimation.posConnectVector.clone();

        // calcs for target
        if(this.cameraAnimation.targetTrigger){ 
            
          this.cameraAnimation.movingTargetFactor += (0.1*this.cameraAnimation.movingTargetFactor  + offset2/10) ;
  
          if(this.cameraAnimation.movingTargetFactor > distanceToMakeBetweenTargets){ 

            // animation has finished

            this.cameraAnimation.movingTargetFactor = distanceToMakeBetweenTargets ;
            this.cameraAnimation.targetTrigger = false; 

            if(this.cameraAnimation.positionTrigger === false){

              // check for other animations if have finished

              this.cameraAnimation.orbitControl.control.target = new THREE.Vector3(
                this.cameraAnimation.newTarget.x,
                this.cameraAnimation.newTarget.y,
                this.cameraAnimation.newTarget.z 
              );

              this.scene.movingCube.position.set(this.cameraAnimation.newTarget.x, this.cameraAnimation.newTarget.y, this.cameraAnimation.newTarget.z);
               
              this.soundMachine.stopStoredPlay('atomUnderDoll');
              this.keyboard.dollmode = true;

              this.cameraAnimation.callback();
            }
          }

          targConnectVector.setLength(this.cameraAnimation.movingTargetFactor);

          this.cameraAnimation.orbitControl.control.target.set(
            this.cameraAnimation.oldTarget.x + targConnectVector.x, 
            this.cameraAnimation.oldTarget.y + targConnectVector.y, 
            this.cameraAnimation.oldTarget.z + targConnectVector.z
          ); 
        }

        // calcs for position
        if(this.cameraAnimation.positionTrigger){
          
          lpos = posConnectVector.length() ;

          this.cameraAnimation.posFactor += ((lpos * offset2) / (100) ); 
 
          if(this.cameraAnimation.posFactor > lpos){  

            // animation has finished

            this.cameraAnimation.posFactor = lpos ;
            this.cameraAnimation.positionTrigger = false; 

            this.cameraAnimation.orbitControl.camera.position.set(
              this.cameraAnimation.oldPos.x + posConnectVector.x, 
              this.cameraAnimation.oldPos.y + posConnectVector.y, 
              this.cameraAnimation.oldPos.z + posConnectVector.z
            );

            if(this.cameraAnimation.targetTrigger === false){

              // check for other animations if have finished

              this.cameraAnimation.orbitControl.control.target = new THREE.Vector3(
                this.cameraAnimation.newTarget.x,
                this.cameraAnimation.newTarget.y,
                this.cameraAnimation.newTarget.z 
              );
              this.scene.movingCube.position.set(this.cameraAnimation.newTarget.x, this.cameraAnimation.newTarget.y, this.cameraAnimation.newTarget.z);
               
              this.soundMachine.stopStoredPlay('atomUnderDoll');
              this.keyboard.dollmode = true;

              this.cameraAnimation.callback();
            } 
          }
          else{  
            posConnectVector.setLength(this.cameraAnimation.posFactor);
             
            this.cameraAnimation.orbitControl.camera.position.set(
              this.cameraAnimation.oldPos.x + posConnectVector.x, 
              this.cameraAnimation.oldPos.y + posConnectVector.y, 
              this.cameraAnimation.oldPos.z + posConnectVector.z
            );
          }

        }
      }

      if(this.focalReposition === true){

      }
    }
    lastTime = timeNow;
  };
    
  return Animate;

});
