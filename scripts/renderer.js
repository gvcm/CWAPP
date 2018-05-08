'use strict';
define([
  'jquery', 
  'three', 
  'pubsub',
  'underscore',
  'OculusRiftEffect'
], function(
  jQuery, 
  THREE, 
  PubSub,
  _,
  OculusRiftEffect
) {
  var events = {
    ANIMATION_UPDATE: 'renderer.animation_update'
  };

  function Renderer(scene, container, type) {
     
    var width = (type === 'crystal') ? jQuery('#app-container').width() : 0;
    var height = (type === 'crystal') ? jQuery(window).height() : 0; 

    this.rType = type;
    this.rstatsON = false;
    this.containerWidth = width ;
    this.containerHeight = height ;
    this.explorer = scene;
    this.doll;
    this.viewportColors = ['#0B0800', '#000600', '#08000A'];
    this.cameras = [];
    this.motifView = false;
    this.ucViewport = false;
    this.hudCamera;
    this.hudCameraCube;  
    this.animateAtom = false;
    this.atom;

    this.renderer = new THREE.WebGLRenderer({ alpha:true, antialias: true, preserveDrawingBuffer: true }); 
    this.backgroundColor =  '#000000' ; 
    this.renderer.setSize( width, height);
    this.renderer.setPixelRatio( window.devicePixelRatio );

    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;  // options are THREE.BasicShadowMap | THREE.PCFShadowMap | THREE.PCFSoftShadowMap
    this.renderer.physicallyBasedShading = true; 
    this.renderer.shadowMapSoft = true; 
    this.renderer.shadowCameraNear = 0.1;
    this.renderer.shadowCameraFar = 1000;
    this.renderer.shadowCameraFov = 50;
    this.renderer.shadowMapBias = 0.0039;
    this.renderer.shadowMapDarkness = 0.4;
    this.renderer.shadowMapWidth = 1024;
    this.renderer.shadowMapHeight = 1024; 
    this.renderer.autoClear = false; // 2 scenes render 
    this.animationIsActive = false;
    this.enabledRenders = { 'navCube' : true, 'compass' : true, 'doll' : true};
    this.depthTarget;  
    this.depthMaterial;
    this.ssao = false;
    this.composer;
    this.ssaoPass;
 
    this.container = container;
    this.externalFunctions = [];

    this.dollScene;
    this.dollCamera;

    // stats
    this.glS;
    this.rS;

    // VR
    this.stereoscopicEffect = new THREE.AnaglyphEffect( this.renderer  );  
    this.anaglyphEffectActive = false;
    this.oculusEffect;
    this.stereoEffectActive = false;
    this.stereoEffect = new THREE.StereoEffect( this.renderer );
    this.oculusEffectActive = false;
    this.cardBoardRender;

    jQuery('#'+container).append(this.renderer.domElement);
 
  }; 
  Renderer.prototype.initAnaglyph = function(arg){  
    this.oculusEffectActive = false; 
    this.stereoEffectActive = false; 
    this.anaglyphEffectActive = arg.anaglyph ;
  };
  Renderer.prototype.createPerspectiveCamera = function(lookAt,xPos, yPos, zPos, fov){  
    var camera = new THREE.PerspectiveCamera(fov, 1, 0.1 , 5000);
    camera.lookAt(lookAt);
    camera.position.set(xPos, yPos, zPos); 
    this.cameras.push(camera);
    
  };
  Renderer.prototype.shadowing = function(arg){  
  
    if(arg.shadows === false){
      this.renderer.shadowMapAutoUpdate = false;
      this.explorer.light.castShadow = false; 
      this.renderer.clearTarget( this.explorer.light.shadowMap );
 
    }
    else{
      this.explorer.light.castShadow = true; 
      this.renderer.shadowMapAutoUpdate = true;
    }

    this.explorer.object3d.traverse (function (object) {
      if (object instanceof THREE.Mesh)
      {  
        object.receiveShadow = arg.shadows;
        object.castShadow = arg.shadows;
        object.material.needsUpdate = true;
      }
    });
    
  };
  Renderer.prototype.ssaoEffect = function(arg){  

    this.ssao = arg.ssao;

    if(this.ssao === false){ 
      return;
    }
    // depth
        
    var depthShader = THREE.ShaderLib[ "depthRGBA" ];
    var depthUniforms = THREE.UniformsUtils.clone( depthShader.uniforms );
    
    this.depthMaterial = new THREE.ShaderMaterial( { fragmentShader: depthShader.fragmentShader, vertexShader: depthShader.vertexShader, uniforms: depthUniforms, blending: THREE.NoBlending } );
  
    // postprocessing
    
    this.composer = new THREE.EffectComposer( this.renderer );
    
    this.composer.addPass( new THREE.RenderPass( this.explorer.object3d, this.cameras[0] ) );

    this.depthTarget = new THREE.WebGLRenderTarget( this.containerWidth, this.containerHeight, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter } );
    
    this.ssaoPass = new THREE.ShaderPass( THREE.SSAOShader );
    this.ssaoPass.uniforms[ 'tDepth' ].value = this.depthTarget ;
    this.ssaoPass.uniforms[ 'size' ].value.set( this.containerWidth, this.containerHeight );
    this.ssaoPass.uniforms[ 'cameraNear' ].value = this.cameras[0].near ;
    this.ssaoPass.uniforms[ 'cameraFar' ].value = this.cameras[0].far ;
    this.ssaoPass.uniforms[ 'aoClamp' ].value = 0.1;
    this.ssaoPass.uniforms[ 'lumInfluence' ].value = 0.1;
    this.ssaoPass.renderToScreen = true;

    this.composer.addPass( this.ssaoPass );

    this.changeContainerDimensions(this.containerWidth, this.containerHeight);
  }; 
  Renderer.prototype.changeContainerDimensions = function(width, height) { 

    this.containerWidth = width ;
    this.containerHeight = height ; 
     
    this.stereoscopicEffect.setSize( this.containerWidth, this.containerHeight ); 

    if(this.oculusEffect !== undefined){
      this.oculusEffect.setSize(this.containerWidth, this.containerHeight);
      return;
    }
    if(this.stereoEffect !== undefined){
      this.stereoEffect.setSize( this.containerWidth, this.containerHeight ); 
    }
    
    this.renderer.setSize(this.containerWidth, this.containerHeight); 

    if(this.depthTarget !== undefined){  

      this.depthTarget = new THREE.WebGLRenderTarget(this.containerWidth, this.containerHeight, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter } );

      this.ssaoPass.uniforms[ 'size' ].value.set( this.containerWidth, this.containerHeight ); 
      this.composer.reset( this.depthTarget );
      this.composer.setSize( this.containerWidth, this.containerHeight );
    }
    
  };
  Renderer.prototype.createOrthographicCamera = function(width, height, near, far, x, y, z){  
    var viewSize = 50 ;
    var aspectRatio = width/height;
    var camera = new THREE.OrthographicCamera( viewSize*aspectRatio / - 2, viewSize*aspectRatio / 2, viewSize / 2, viewSize / - 2, near, far );
    camera.position.set(x,y,z);
    camera.lookAt(new THREE.Vector3(0,0,0) );
    this.cameras.push(camera); 
  };
  Renderer.prototype.atomAnimation = function(atom) {
    this.atom = atom;
    this.animateAtom = true;
  };
  Renderer.prototype.startAtomAnimation = function() { 
    this.animateAtom = true;
  };
  Renderer.prototype.stopAtomAnimation = function() {
    this.animateAtom = false;
  }; 
  Renderer.prototype.getRenderer = function() {
    return this.renderer;
  };
  Renderer.prototype.startAnimation = function() {
    if (this.animationIsActive === false) {
      this.animationIsActive = true;
      this.animate(); 
    } 
  }; 
  Renderer.prototype.initStereoEffect = function(arg) { 
    this.anaglyphEffectActive = false ;  
    this.oculusEffectActive = false ;  
    this.stereoEffectActive = arg.sideBySide ; 
  };
  Renderer.prototype.initCardBoard = function(arg) {  
    this.anaglyphEffectActive = false ;  
    this.oculusEffectActive = false ;  
    this.stereoEffectActive = arg.onTop ; 
  };
  Renderer.prototype.initOculusEffect = function(arg) { 
    this.stereoEffectActive =  false ;
    this.anaglyphEffectActive = false ;

    this.oculusEffectActive = arg.oculus ;

    if(this.oculusEffectActive === true){ 
      this.renderer.sortObjects = false;
      this.renderer.setSize( this.containerWidth, this.containerHeight );
      this.oculusEffect = new THREE.OculusRiftEffect( this.renderer );
      this.oculusEffect.setSize( this.containerWidth, this.containerHeight  );

      // Right Oculus Parameters are yet to be determined
      // this.oculusEffect.separation = 20;
      // this.oculusEffect.distortion = 0.1;
      // this.oculusEffect.fov = 60;
    } 
  };
  Renderer.prototype.stopAnimation = function() {
    this.animationIsActive = false;
  }; 
  Renderer.prototype.animate = function() {
 
    if (this.animationIsActive === false) {
      return;
    }
    for (var i = 0; i < this.externalFunctions.length ; i++) {
      this.externalFunctions[i]();
    };
 
    window.requestAnimationFrame(this.animate.bind(this));
    PubSub.publish(events.ANIMATION_UPDATE + '_' + this.rType, true);

    //////////
    if(this.rS !== undefined && this.rstatsON === true){  
      this.rS( 'frame' ).start();
      this.glS.start();
      
      this.rS( 'rAF' ).tick();
      this.rS( 'FPS' ).frame();

      this.rS( 'texture' ).start();
        
      this.rS( 'texture' ).end();

      this.rS( 'setup' ).start();
    
      this.rS( 'setup' ).end();
    
      this.rS( 'render' ).start();
    }
    ////////////////

    if(this.cameras.length === 1){ 
      if(this.container === 'unitCellRenderer') {
        this.renderer.clear();
      }
      this.renderer.setClearColor( this.backgroundColor );
      this.cameras[0].aspect = this.containerWidth/this.containerHeight;
      this.renderer.setViewport(0, 0, this.containerWidth, this.containerHeight); 
      this.renderer.setScissor(0, 0, this.containerWidth, this.containerHeight); 
      this.renderer.enableScissorTest ( true );   
      this.cameras[0].updateProjectionMatrix();  
       
      if(this.anaglyphEffectActive){  
        this.stereoscopicEffect.render( this.explorer.object3d, this.cameras[0] );
      }
      else if(this.stereoEffectActive){  
        this.stereoEffect.render( this.explorer.object3d, this.cameras[0] );

      }
      else{  
        if(this.container === 'crystalRenderer') { 
          
          if(this.ssao === true && this.composer !== undefined){  
  
            this.explorer.object3d.overrideMaterial = this.depthMaterial;

            this.renderer.render( this.explorer.object3d, this.cameras[0], this.depthTarget, true ); 
            this.explorer.object3d.overrideMaterial = null;
            
            this.composer.render();
          }
          else if(this.oculusEffectActive === true && this.oculusEffect !== undefined){ 
            
            this.oculusEffect.render( this.explorer.object3d, this.cameras[0] );
          }
          else{
            this.renderer.render( this.explorer.object3d, this.cameras[0], undefined, true);
          } 
        }
        else if(this.container === 'unitCellRenderer') {  
          if(this.ssao === true && this.composer !== undefined){  
  
            this.explorer.object3d.overrideMaterial = this.depthMaterial;

            this.renderer.render( this.explorer.object3d, this.cameras[0], this.depthTarget, true ); 
            this.explorer.object3d.overrideMaterial = null;
            
            this.composer.render();
          }
          else if(this.oculusEffectActive === true && this.oculusEffect !== undefined){  
            
            this.oculusEffect.render( this.explorer.object3d, this.cameras[0] );
          }
          else{
            this.renderer.render( this.explorer.object3d, this.cameras[0] );
          } 
        }
      } 

      if(this.doll !== undefined && this.enabledRenders['doll'] === true){  
        this.renderer.clearDepth(); // clear depth buffer to have gear bar and doll on top
        this.dollCamera.aspect = this.containerWidth/this.containerHeight;   
        this.renderer.setViewport(0, 0, this.containerWidth, this.containerHeight); 
        this.renderer.setScissor(0, 0, this.containerWidth, this.containerHeight); 
        this.dollCamera.updateProjectionMatrix();  
        this.renderer.render( this.dollScene, this.dollCamera);        
      }
          
      // hud arrows
      if(this.hudCamera !== undefined && this.enabledRenders['compass'] === true ){  
        this.renderer.clearDepth(); 
         
        var tempW8 = 1.3 * this.containerWidth/this.displayFactor ;
        var tempH8 = 1.3 * this.containerHeight/this.displayFactor ;

        this.hudCamera.aspect = (this.containerWidth) / (this.containerHeight ); 
        this.renderer.setViewport(
          this.containerWidth-tempW8, 
          0, 
          tempW8, 
          tempH8  
        );

        this.renderer.setScissor(  
          this.containerWidth-tempW8, 
          0, 
          tempW8, 
          tempH8  
        ); 
          
        this.renderer.enableScissorTest ( true );  
         
        this.hudCamera.updateProjectionMatrix();

        this.renderer.setClearColor( this.backgroundColor );
        this.renderer.render( this.hudScene, this.hudCamera); 
      }
      // hud cube
      if(this.hudCameraCube !== undefined && this.enabledRenders['navCube'] === true ){  
         
        this.hudCameraCube.aspect = (this.containerWidth) / (this.containerHeight  ); 
        this.renderer.setViewport(
          0, 
          this.containerHeight - this.containerHeight/this.displayFactor,  
          this.containerWidth/this.displayFactor, 
          this.containerHeight/this.displayFactor  
        );

        this.renderer.setScissor( 
          0, 
          this.containerHeight - this.containerHeight/this.displayFactor,  
          this.containerWidth/this.displayFactor, 
          this.containerHeight/this.displayFactor  
        ); 
  
        this.hudCameraCube.updateProjectionMatrix();

        this.renderer.enableScissorTest ( true ); 

        this.renderer.setClearColor( this.backgroundColor ); 
         
        this.renderer.render( this.hudSceneCube, this.hudCameraCube);
        
        var arrowL = this.hudSceneCube.getObjectByName( "arrowLine" );
        var arrowH = this.hudSceneCube.getObjectByName( "arrowHead" );
        arrowL.lookAt(this.hudCameraCube.position);
        arrowH.lookAt(this.hudCameraCube.position); 
      } 
    }
    else if( this.cameras.length > 1 ){
      for ( var i = 0; i < this.cameras.length; ++i ) {
        var camera = this.cameras[i]; 
        camera.aspect =this.containerWidth/(3*this.containerHeight); 

        if(this.anaglyphEffectActive){  
          this.stereoscopicEffect.render( this.explorer.object3d, camera, i , this.containerWidth , this.containerHeight, this.viewportColors[i]);
        }
        else if(this.stereoEffectActive){  
          this.stereoEffect.render( this.explorer.object3d, this.cameras[0] );
        }
        else{ 
          this.renderer.setViewport( 1/3 *i * this.containerWidth, 0,  this.containerWidth/3, this.containerHeight );
          this.renderer.setScissor(  1/3 *i * this.containerWidth, 0,  this.containerWidth/3, this.containerHeight );
          this.renderer.enableScissorTest ( true );

          this.renderer.setClearColor( this.viewportColors[i] );
 
          camera.updateProjectionMatrix();

          this.renderer.clear(); 
          this.renderer.render( this.explorer.object3d, camera);
        }
      }
    }  
    
    if(this.rS !== undefined && this.rstatsON === true ){ 

      this.rS( 'render' ).end();

      this.rS( 'frame' ).end();

      this.rS( 'memory.limit' ).set( performance.memory.jsHeapSizeLimit );
      this.rS( 'memory.used' ).set( performance.memory.usedJSHeapSize );
      this.rS( 'memory.total' ).set( performance.memory.totalJSHeapSize );

      //this.rS( 'mouse' ).set( mouseOps );
      this.rS( 'rStats' ).start();
      this.rS().update();
      this.rS( 'rStats' ).end();
    } 
  };
  Renderer.prototype.setUCviewport = function(bool) { 
    this.ucViewport = bool;
  }; 
  Renderer.prototype.setGamma = function(bool) {  
    this.renderer.gammaOutput = bool;
    this.renderer.gammaInput = bool;
  };
  Renderer.prototype.setDoll = function(scene, doll) { 
    if( doll !== undefined) {
      this.doll = doll;
    } 
    else { 
      this.dollScene = scene;
      this.dollCamera = new THREE.PerspectiveCamera(90, 1, 0.1 , 1000); 
      this.dollCamera.lookAt(new THREE.Vector3(0,0,0));
      this.dollCamera.position.set(0,0,20); 
      this.dollCamera.aspect = this.containerWidth/this.containerHeight;  

      this.dollScene.add(this.dollCamera);
    }

    if(this.doll !== undefined){  
      this.dollCamera.aspect = this.containerWidth/this.containerHeight;   
      this.renderer.setViewport(0, 0, this.containerWidth, this.containerHeight); 
      this.renderer.setScissor(0, 0, this.containerWidth, this.containerHeight); 
      this.dollCamera.updateProjectionMatrix();  
      this.renderer.render( this.dollScene, this.dollCamera);        
    }

  };
  Renderer.prototype.initHud = function(scene1, scene2, displayFactor) {  
    this.hudScene = scene1; 
    this.hudCamera = new THREE.PerspectiveCamera(15, 1, 0.01 , 500);
    this.hudCamera.lookAt(new THREE.Vector3(0,0,0)); 
    this.hudCamera.position.set(30, 30, 60); 
    this.hudCamera.aspect = this.containerWidth/this.containerHeight;  
    this.hudScene.add(this.hudCamera);

    this.hudSceneCube = scene2; 
    this.hudCameraCube = new THREE.PerspectiveCamera(15, 1, 0.01 , 500);
    this.hudCameraCube.lookAt(new THREE.Vector3(0,0,0)); 
    this.hudCameraCube.position.set(30, 30, 60); 
    this.hudCameraCube.aspect = this.containerWidth/this.containerHeight;  
    this.hudSceneCube.add(this.hudCameraCube);

    this.displayFactor = displayFactor;
  }; 
  Renderer.prototype.setMainCamerasProperties = function(arg) {

    var currentLookAt = this.cameras[0].getWorldDirection();
    var currentPosition = this.cameras[0].position.clone();
 

  };
  Renderer.prototype.getHudCameraCube = function() {
     
    return this.hudCameraCube;
  };
  Renderer.prototype.getHudCamera = function() {
     
    return this.hudCamera;
  };
  Renderer.prototype.getMainCamera = function() {
     return this.cameras[0];
  };
  Renderer.prototype.getSpecificCamera = function(x) {
     return this.cameras[x];
  };
  Renderer.prototype.onAnimationUpdate = function(callback) { 
    PubSub.subscribe(events.ANIMATION_UPDATE + '_' + this.rType, callback);
  }; 
  Renderer.prototype.renderHud = function(mode) {   // preserveDrawingBuffer: true
    //this.renderer.render( this.hudScene, this.hudCamera);
  };

  return Renderer;
  
});
