"use strict";

define([
  "three", 
  "underscore", 
  "leapMotion"
], function(
  THREE, 
  _ 
) {
  
  var zoomSpeed = 0.5 ;
  var stillHandFactor = 100 ; // increasing it results to more stability in hand
  var rotSpeed = 0.005 ; // increasing it results to quicker rotation

  function LeapMotionHandler( lattice, motifeditor, crystalOrbit, soundMachine, dollEditor, keyboard ,crystalScene, camera, animationMachine) { 
    
    this.lattice = lattice;
    this.motifeditor = motifeditor; 
    this.keyboard = keyboard; 
    this.controller;
    this.crystalOrbit = crystalOrbit;
    this.soundMachine = soundMachine;
    this.active = false;
    this.crystalScene = crystalScene;
    this.camera = camera;
    this.dollEditor = dollEditor;
    this.trackingSystem = 'grab';
    this.leapVars = {
      rightGrab : false, 
      initCameraDist : undefined, 
      initHandPos : undefined, 
      bothGrab : undefined, 
      bothHandsInitPos : new THREE.Vector3(), 
      initCamTheta : undefined, 
      initCamPhi : undefined};
    this.toggle(false);
    this.freezeGestures = { openPalm : false, grab : false };
    this.animationMachine = animationMachine;
  };

  LeapMotionHandler.prototype.selectTS = function(arg) {
    this.trackingSystem = arg ;
  };
  LeapMotionHandler.prototype.toggle = function(bool) {
     
    var _this = this;
   
    this.active = bool ;
    //this.crystalOrbit.control.enabled = !this.active;

    if(bool === true){ 
      
      // reposition movingCube
   
      var pos = this.crystalOrbit.camera.position.clone();
      pos.setLength(pos.length() - 1);
      this.crystalScene.movingCube.position.set(pos.x, pos.y, pos.z);
      
      if( this.controller === undefined){
        
        var frameString = "", handString = "", fingerString = "";
        var hand, finger, isAlreadyGrabing = false;
        
        // Leap.loop uses browser's requestAnimationFrame
        var options = { 
          enableGestures: false,
          loopWhileDisconnected: false 
        };
        
        // Main Leap Loop
        this.controller = Leap.loop(options, function(frame) { 
         
          var leftHand, rightHand; 
          var numOfHands = frame.hands.length ;
           
          if(numOfHands === 1){ 
 
            _this.leapVars.bothGrab = false; // deactivate
            var hand = frame.hands[0];
            var palmNormal = new THREE.Vector3(hand.palmNormal[0], hand.palmNormal[1], hand.palmNormal[2]);
            var pos = new THREE.Vector3(hand.palmPosition[0],hand.palmPosition[1],hand.palmPosition[2] );


            // palm position workable limits : 
            //    -250 < x < 250
            //      40 < y < 400
            //    -200 < z < 200
            

            // WASD using open palm
            if( hand.grabStrength >= 0.7 && _this.freezeGestures.grab === false){

              // ORBITAL mode

              if(isAlreadyGrabing === false){

                // change focal point

                // 3-way strategy : select the atom the camera is looking at (green dot), 
                // if camera is not looking at anyone, select the neares, 
                // if camera is looking too much far away from crystal, select the center of crystal

                var focalPoint = _this.crystalScene.movingCube.position.clone(); 
                var ray = new THREE.Ray(_this.camera.position.clone(), focalPoint.sub((_this.camera.position.clone())).normalize());
                var closestDist = 10000000000;
                var closestAtom = undefined;
                var closestAtomPos =  getCentroidOfCrystal(_this.lattice);
                var distanceLimitToGrab =  2 * closestAtomPos.length();
                var intersectedAtoms =  [];
                var raycaster = new THREE.Raycaster();  
                raycaster.setFromCamera( { x : 0 , y : 0 }, _this.camera ); 

                var crystalobjsIntersects = raycaster.intersectObjects( getCrystalAtoms(_this.crystalScene.object3d) );

                if(crystalobjsIntersects.length > 0){ 
               
                  closestAtom = _.find(_this.lattice.actualAtoms, function(atom){ 
                    if( atom.identity === crystalobjsIntersects[0].object.parent.identity && atom.latticeIndex === crystalobjsIntersects[0].object.parent.latticeIndex) {
                      return atom;
                    }
                    else{
                      return undefined;
                    } 
                  });

                  if(closestAtom) closestAtomPos = closestAtom.object3d.position.clone();
                }
                else{
                  for (var i = _this.lattice.actualAtoms.length - 1; i >= 0; i--) { 
                    var atom = _this.lattice.actualAtoms[i];
                    var d = ray.distanceToPoint(atom.object3d.position.clone());
                    if( d < closestDist && d < distanceLimitToGrab){
                      closestDist = d;
                      closestAtom = atom;
                      closestAtomPos = atom.object3d.position.clone();
                    }
                  };

                  if(_this.lattice.actualAtoms.length === 0){
                    _.each(_this.lattice.points, function(point, reference) {
                      var d = ray.distanceToPoint(point.object3d.position.clone()); 
                      if( d < closestDist && d < distanceLimitToGrab){
                        closestDist = d;
                        closestAtomPos = point.object3d.position.clone();
                      }
                    });  
                  }  
                }
                
 
                // make it clored 
                if(closestAtom) closestAtom.setColorMaterial(0xCC2EFA, true);

                _this.freezeGestures.grab = true;

                _this.animationMachine.cameraAnimation = { 
                  positionTrigger : false, 
                  targetTrigger : true, 
                  orbitControl : _this.crystalOrbit, 
                  oldTarget : _this.crystalScene.movingCube.position.clone(), 
                  oldPos : _this.crystalOrbit.camera.position.clone(), 
                  newTarget : closestAtomPos.clone(), 
                  movingTargetFactor : 0,
                  posFactor : 0,
                  posFactor : 0,
                  callback: function(){
                    if(closestAtom) closestAtom.setColorMaterial(0xDF73FF, true);
                    _this.freezeGestures.grab = false;
                  },
                  targConnectVector : (closestAtomPos.clone()).sub(_this.crystalScene.movingCube.position.clone()),
                  posConnectVector : new THREE.Vector3( )
                }; 

                isAlreadyGrabing = true;
              }
              

              if(pos.y < 180){
                var rFact = Math.abs((pos.y-210)*(pos.y-210)/30000);
                 
                _this.keyboard.handleKeys({orbitRreduce : rFact}, rFact, true);
              }
              else if(pos.y > 260){
                var rFact = Math.abs((pos.y-250)*(pos.y-250)/50000);
               
                _this.keyboard.handleKeys({orbitRincrease : rFact}, rFact, true);
              } 

              var rotFact = Math.abs(pos.z/100); 
              if(pos.z < -55){ 
                _this.keyboard.handleKeys({rotUp : rotFact}, rotFact, true);
              }
              else if(pos.z > 55){ 
                _this.keyboard.handleKeys({rotDown : rotFact}, rotFact, true);
              } 

              var rotFact = Math.abs(pos.x/100); 
              if(pos.x < -65){ 
                _this.keyboard.handleKeys({rotRight : rotFact}, rotFact, true);
              }
              else if(pos.x > 65){ 
                _this.keyboard.handleKeys({rotLeft : rotFact}, rotFact, true);
              }  

            }
            else if( hand.grabStrength < 0.7 && _this.freezeGestures.openPalm === false){  
                
              if(isAlreadyGrabing === true){

                // end animation and unlock grab
                _this.animationMachine.cameraAnimation = undefined;  
                 _this.freezeGestures.grab = false;

                // revert all atom colors
                for (var i = _this.lattice.actualAtoms.length - 1; i >= 0; i--) { 
                  _this.lattice.actualAtoms[i].setColorMaterial(); 
                }

                // put movingCube back in front of camera
                var newPosOfFP = (_this.crystalScene.movingCube.position.clone()).sub(_this.camera.position.clone() );
                newPosOfFP.setLength(1); 
                _this.crystalScene.movingCube.position.copy(newPosOfFP.add(_this.camera.position.clone()));
           
                isAlreadyGrabing = false;
              }
              

              // WASD mode

              // camera rotations 

              var xFact = palmNormal.x*palmNormal.x*palmNormal.x/0.75;
              var zFact = palmNormal.z*palmNormal.z*palmNormal.z/0.75;

              if(palmNormal.x <-0.2){
                _this.keyboard.handleKeys({rotLeft : true}, xFact*-1, true);
              } 
              else if(palmNormal.x >0.2){
                _this.keyboard.handleKeys({rotRight : true}, xFact, true);
              }
              if(palmNormal.z <-0.2){
                _this.keyboard.handleKeys({ rotDown : true}, zFact*-1, true);
              } 
              else if(palmNormal.z >0.2){
                _this.keyboard.handleKeys({ rotUp : true}, zFact, true);
              }

              // camera translations 

              if( hand.grabStrength < 0.4 && Math.abs(palmNormal.x) < 0.4 && palmNormal.y < -0.6 && Math.abs(palmNormal.z) < 0.4 ){
      
                // forth and back
                var fbSpeed =  Math.abs(pos.z*pos.z/3000);
                if(fbSpeed > 4){
                  fbSpeed = 4;
                }
               
                if(pos.z < -45){
                  _this.keyboard.handleKeys({ forth: true}, fbSpeed, true);
                } 
                else if(pos.z > 45){
                  _this.keyboard.handleKeys({ back : true}, fbSpeed, true);
                } 

                // right left 
                var rlFactor =  Math.abs(pos.x*pos.x/10000);
                if(pos.x < -40){
                  _this.keyboard.handleKeys({ left: true}, rlFactor, true);
                } 
                else if(pos.x > 40){
                  _this.keyboard.handleKeys({ right : true}, rlFactor, true);
                }
   
                // up down 
                var udFactor;
                if(pos.y < 180){
                  udFactor = Math.abs((pos.y - 180)/100);
                  _this.keyboard.handleKeys({ down: true}, udFactor, true);
                } 
                else if(pos.y > 240){
                  udFactor = (pos.y - 240)/100;
                  _this.keyboard.handleKeys({ up : true}, udFactor, true);
                } 
              }
            } 
            
          } 
          else{
            _this.leapVars.rightGrab = false;
            _this.leapVars.bothGrab = false;
          }
          
        }); 
        this.controller.loopWhileDisconnected = false;
      }
      this.controller.connect(); 
    }
    else{
  
      if(this.controller !== undefined){
        this.controller.disconnect();
      } 
      this.crystalOrbit.control.target = new THREE.Vector3( 0, 0, 0 );
    }
     
  }; 

  function getCentroidOfCrystal(lattice) {

    var g = lattice.customBox(lattice.viewBox);
    var centroid = new THREE.Vector3(0,0,0);

    if(g !== undefined){ 
      centroid = new THREE.Vector3(); 
      for ( var z = 0, l = g.vertices.length; z < l; z ++ ) {
        centroid.add( g.vertices[ z ] ); 
      }  
      centroid.divideScalar( g.vertices.length );
    }

    return centroid;
  }
  function concatData(id, data) {
    return id + ": " + data + "<br>";
  }
  function getCrystalAtoms(scene) {  
    var _this = this;
    var crystalObjs = [] ;

    scene.traverse(function (object) {

      if ( 
        (object.name === 'point' ) || 
        (object.name === 'atom' && object.latticeIndex !== '-') || 
        ( object.name === 'atom' && 
          object.latticeIndex === '-' && 
          object.visible === true )  
      ) {   
        for (var i = 0; i < object.children.length; i++) {  
          crystalObjs.push(object.children[i]);
        };  
      }
    });

    return crystalObjs;
  };
  function getFingerName(fingerType) {
    switch(fingerType) {
      case 0:
        return 'Thumb';
      break;
  
      case 1:
        return 'Index';
      break;
  
      case 2:
        return 'Middle';
      break;
  
      case 3:
        return 'Ring';
      break;
  
      case 4:
        return 'Pinky';
      break;
    }
  }
  
  function concatJointPosition(id, position) {
    return id + ": " + position[0] + ", " + position[1] + ", " + position[2] + "<br>";
  }
  return LeapMotionHandler;
});
