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
  
  var mp3names = ['crystalCenter', 'cellCollision', 'atomCollision', 'popOutOfAtom', 'dollHolder', 'atomUnderDoll', 'navCube', 'dollArrived', 'leapGrab', 'leapNoGrab'];

  function Sound(animationMachine) {

    this.procced = true, this.context ;
    this.animationMachine = animationMachine ;
    this.mute = true ;
    this.buffers = [] ; 
    this.crystalHold ; 
    this.crystalCameraOrbit  ;
    this.crysCentrSource = {panner: undefined , dryGain: undefined , panX : 0, panZ : 0, gain : 0 };
    this.steredLoops = {};
    this.lattice;
    this.volume = 0.75 ;
    this.atomSourcePos = undefined;

    var _this = this ;

    try {
      this.context = new (window.AudioContext || window.webkitAudioContext)();
    } 
    catch(e) { 
        this.procced = false;
        alert('Web Audio API not supported in this browser.'); 
    }
    
    if(this.procced === true){
      this.universalGainNode = this.context.createGain();
      this.universalGainNode.gain.value = 0.75;
      this.universalGainNode.connect(this.context.destination);
    } 
  };

  Sound.prototype.changeVolume = function(arg){  
    if(arg.sound){
      this.universalGainNode.gain.value = parseFloat(arg.sound)/100;
    }
  };
  Sound.prototype.loadSamples = function(url){
    var _this = this ;
    var request = new XMLHttpRequest();

    request.open('GET', 'sounds/'+url+'.mp3', true);
    request.setRequestHeader ("Accept", "Access-Control-Allow-Origin: *'"); // to access locally the Mp3s
    request.responseType = 'arraybuffer';

    request.onload = function() {
      var audioData = request.response;

      _this.context.decodeAudioData(
        audioData, 
        function(buffer) {   _this.buffers[url] = buffer; }, 
        function(e){"Error with decoding audio data" + e.err});

    }

    request.send();

  }  
 
  Sound.prototype.crystalCenterStop = function() {
    if(this.crystalHold) {
      clearInterval(this.crystalHold);
    }
  }; 
  Sound.prototype.calculateAngle = function(x,z){
     
    var vec1 = new THREE.Vector2(this.crystalCameraOrbit.control.target.x-this.crystalCameraOrbit.camera.position.x,this.crystalCameraOrbit.control.target.z-this.crystalCameraOrbit.camera.position.z);
    var vec2 = new THREE.Vector2(x-this.crystalCameraOrbit.camera.position.x,z-this.crystalCameraOrbit.camera.position.z);
    vec1.normalize();
    vec2.normalize();
      
    var angle = Math.atan2( vec2.y,vec2.x) -  Math.atan2(vec1.y,vec1.x);
       
    var f =angle* (180/Math.PI);
    if(f > 180 ) f = f - 360;
    if(f < -180 ) f = f + 360;

    return f;       
     
  };

  Sound.prototype.soundSourcePos = function() {

    if(this.lattice === undefined){
      return;
    }

    var centroid = new THREE.Vector3(0,0,0);

    if(this.atomSourcePos !== undefined){
      centroid = this.atomSourcePos.clone();
    }
    else{ 
      var g = this.lattice.customBox(this.lattice.viewBox);
       
      if(g !== undefined){ 
        centroid = new THREE.Vector3(); 
        for ( var z = 0, l = g.vertices.length; z < l; z ++ ) {
          centroid.add( g.vertices[ z ] ); 
        }  
        centroid.divideScalar( g.vertices.length );
      }
    }

    return centroid ;
  };
  Sound.prototype.switcher = function(start) {
    
    if(this.procced && this.buffers.length === 0 && start === true){  
      for (var i = mp3names.length - 1; i >= 0; i--) {
        this.loadSamples(mp3names[i]);
      }; 
    }

    var _this = this ;

    if(start === true){
      this.mute = false ; 
      this.crystalHold = setInterval( function() { 
        var centroid = _this.soundSourcePos(); 
        _this.animationMachine.produceWave(centroid, 'crystalCenter'); 
        _this.play('crystalCenter', centroid, true);
      },2000);

    }
    else{
      if(this.crystalHold) clearInterval(this.crystalHold);
      this.mute = true ; 
    }

  };
  Sound.prototype.stopStoredPlay = function(sampleName) {
    if(this.steredLoops[sampleName] !== undefined){
      this.steredLoops[sampleName].stop();
    }
  };
  Sound.prototype.storePlay = function(sampleName) {
    var _this = this, voice;

    if(!this.mute){  
      voice = this.context.createBufferSource();
      voice.buffer = this.buffers[sampleName] ; 
      voice.connect(this.universalGainNode);
      this.steredLoops[sampleName] = voice ;
      voice.start(0); 
    }
  };
  Sound.prototype.play = function(sampleName, sourcePos, calcPanning) { 
    if(!this.mute && mp3names.length === Object.keys(this.buffers).length){ 

      var data;
      var voice = this.context.createBufferSource();
      voice.buffer = this.buffers[sampleName] ;

      if(calcPanning){
        data = this.calculatePanning(sourcePos); 
        var dryGain = this.context.createGain();
        var panner = this.context.createPanner();  
        panner.setPosition(data.panX, data.panY, data.panZ);
        dryGain.gain.value = data.gain;
         
        voice.connect(dryGain);
        dryGain.connect(panner); 
        panner.connect(this.universalGainNode);
             
      }
      else{
        voice.connect(this.universalGainNode);
      }
      voice.start(0);
    }

  };
 
  // panning vars go from -1 to 1
  var ttt = false;
  Sound.prototype.calculatePanning = function(objPos){  
    var _this = this ;
 
    var c = this.crystalCameraOrbit.camera.position.clone();
    
    // custom panning method. panX goes sinusoidal and panZ is set according to panX so panX + panZ = 1 
   
    var panX = Math.sin( this.calculateAngle(objPos.x,objPos.z) *  (Math.PI/180) ) ; 
    var panZ = (panX <= 0 ? (1 + panX) : ( 1 - panX) ); 
    var panY = 0;
      
    var distance = objPos.distanceTo(this.crystalCameraOrbit.camera.position ); 
    var gain = (distance < 20 ? 1 : (1 - distance/700)) ; 
    gain = gain * 1 ;
    if(gain < 0.1) gain = 0.1 ;  

    return {'gain' : gain, 'panX' : panX, 'panY' : panY, 'panZ' : panZ };

  }

  return Sound;
});
