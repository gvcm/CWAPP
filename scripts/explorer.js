'use strict';

define([
  'three',
  'pubsub',
  'underscore'
], function(
  THREE,
  PubSub,
  _
) {
  // singleton
  var instance;

  var events = {
    ADD: 'explorer.add',
    REMOVE: 'explorer.remove'
  };

  function Explorer(options) {
    options = options || {};
    var width = jQuery('#app-container').width() ;
    var height = jQuery(window).height() ; 
    this.object3d = new THREE.Scene();
    this.fogActive = false ;
    this.fogDensity = 0 ;
    this.object3d.fog = new THREE.FogExp2( '#000000', 0); //0.0125 );
    this.angles = {'alpha':90, 'beta':90, 'gamma':90 }; 
    
    this.lastFrustumPlane = 0;
    this.menu ;

    this.movingCube = new THREE.Mesh(new THREE.OctahedronGeometry(0.0025,3), new THREE.MeshBasicMaterial( { color: 0x00ff00} ) );  
    this.movingCube.name = 'movingCube'; 
    this.movingCube.visible = false; 
    this.movingCube.position.set(29.9, 29.9, 59.9);
    this.object3d.add(this.movingCube);

    this.labelSize = 120 ; //reversed

    var _this = this;
     
    this.light = new THREE.DirectionalLight( 0xFFFFFF, 1 );
    this.light.position.set( 4, 6, 4 );  
   
    this.light.castShadow = true;
    this.light.shadowMapSoft = true;
    //this.light.shadowCameraVisible = true;
    this.light.shadowCameraNear = 1;
    this.light.shadowCameraFar = 10; 
    this.light.shadowBias = -0.0009;
    this.light.shadowDarkness = 0.2;
    this.light.shadowMapWidth = 1024;
    this.light.shadowMapHeight = 1024;
    this.light.shadowCameraLeft = -10;
    this.light.shadowCameraRight = 10;
    this.light.shadowCameraTop = 10;
    this.light.shadowCameraBottom = -10;

    this.AmbLight = new THREE.AmbientLight( 0x4D4D4C );
 
    this.object3d.add(this.light);
    this.object3d.add(this.AmbLight);

    // xyz axes
    var xAxis = new THREE.Geometry();
    xAxis.vertices.push(
      new THREE.Vector3( 1000,0,0 ),
      new THREE.Vector3(-1000,0,0)
    );
   
    var yAxis = new THREE.Geometry();
    yAxis.vertices.push(
      new THREE.Vector3( 0,1000,0 ),
      new THREE.Vector3(0,-1000,0)
    );

    var zAxis = new THREE.Geometry();
    zAxis.vertices.push(
      new THREE.Vector3( 0,0,1000 ),
      new THREE.Vector3( 0,0,-1000 )
    );
     
    this.xAxisLine = new THREE.Line( xAxis, new THREE.LineBasicMaterial({ color: "#6F6299" }) );
    this.yAxisLine = new THREE.Line( yAxis, new THREE.LineBasicMaterial({ color: "#6F6299" }) );
    this.zAxisLine = new THREE.Line( zAxis, new THREE.LineBasicMaterial({ color: "#6F6299" }) ); 
    
    this.xAxisLine.visible = false;
    this.yAxisLine.visible = false;
    this.zAxisLine.visible = false;

    this.object3d.add(this.xAxisLine);
    this.object3d.add(this.yAxisLine);
    this.object3d.add(this.zAxisLine);

    //abc axis
    var bAxis = new THREE.Geometry();
    bAxis.vertices.push(
      new THREE.Vector3( 1000,0,0 ),
      new THREE.Vector3(-1000,0,0) 
    );
   
    var cAxis = new THREE.Geometry();
    cAxis.vertices.push(
      new THREE.Vector3( 0,1000,0 ),
      new THREE.Vector3(0,-1000,0)
    );

    var aAxis = new THREE.Geometry();
    aAxis.vertices.push(
      new THREE.Vector3( 0,0,1000 ),
      new THREE.Vector3( 0,0,-1000 )
    );
     
    this.bAxisLine = new THREE.Line( bAxis, new THREE.LineBasicMaterial({ color: "#6F6299" }) );
    this.cAxisLine = new THREE.Line( cAxis, new THREE.LineBasicMaterial({ color: "#6F6299" }) );
    this.aAxisLine = new THREE.Line( aAxis, new THREE.LineBasicMaterial({ color: "#6F6299" }) ); 

    this.object3d.add(this.bAxisLine);
    this.object3d.add(this.cAxisLine);
    this.object3d.add(this.aAxisLine);

    this.cAxisLine.visible = true;
    this.bAxisLine.visible = true;
    this.aAxisLine.visible = true;
  
    this.helper = new THREE.Mesh(new THREE.BoxGeometry( 0.1, 0.1, 0.1 ), new THREE.MeshBasicMaterial( { color: 0x000000}));
    this.helper.visible = false;
    this.object3d.add( this.helper );
    
    this.plane = {object3d : undefined};
    this.plane.object3d = new THREE.Mesh(
      new THREE.PlaneBufferGeometry( 10000, 10000, 2, 2 ),
      new THREE.MeshBasicMaterial( { transparent: true, opacity : 0.1 } )
    ); 
    this.plane.object3d.visible = false;  
 
    this.object3d.add(this.plane.object3d);

    PubSub.subscribe(events.ADD, function(message, object) {
      _this.add(object);
    });
    PubSub.subscribe(events.REMOVE, function(message, object) {
      _this.remove(object);
    });
  }; 
  Explorer.prototype.setLightProperties = function(arg){ 
    if(arg.lights){
      this.AmbLight.color.setHex( 0x4D4D4C ); 
      this.light.intensity = 1.0 ;
      this.light.castShadow = true;   
    }
    else{
      this.AmbLight.color.setHex( 0xffffff ); 
      this.light.intensity = 0.0 ;
      this.light.castShadow = false;   
    }  
  };
  Explorer.prototype.setFogProperties = function(arg){ 

    if(arg.fogDensity !== undefined){
      var val = parseInt(arg.fogDensity)/2000 ;
      this.fogDensity = val; 
      if(this.fogActive === true){
        this.object3d.fog.density = parseInt(arg.fogDensity)/2000 ;
      }
    }

    if(arg.fogColor !== undefined){
      this.object3d.fog.color.setHex( "0x"+arg.fogColor ); 
    }

    if(arg.fog !== undefined){
      this.fogActive = arg.fog ;
      if(arg.fog === true){
        this.object3d.fog.density = this.fogDensity ;
      } 
      else{
        this.object3d.fog.density = 0 ;
      }
    }

  };
  Explorer.prototype.updateShadowCameraProperties = function(params){ 

    var _this = this;
     
    var posV = new THREE.Vector3(4, 6, 4);  

    var xVal = params.scaleX * params.repeatX ;
    var yVal = params.scaleY * params.repeatY ;
    var zVal = params.scaleZ * params.repeatZ ;
    
    var max = _.max([xVal, yVal, zVal]);
    posV.setLength(max * 4.5);
    
    this.light.position.set( posV.x, posV.y, posV.z); 
     
    this.light.shadowCamera.far = max * 6;
    this.light.shadowCamera.left = -max * 3;
    this.light.shadowCamera.right = max * 3 ;
    this.light.shadowCamera.bottom = -max * 4;
    this.light.shadowCamera.top = max * 4;  
   
    this.light.shadowCamera.updateProjectionMatrix();

  };
  Explorer.prototype.toScreenPosition = function(obj, camera){ 
    var vector = new THREE.Vector3();
    var width = jQuery('#app-container').width() ;
    var height = jQuery(window).height() ; 

    // TODO: need to update this when resize window
    var widthHalf = 0.5*width;
    var heightHalf = 0.5*height;
    
    obj.updateMatrixWorld();
    vector.setFromMatrixPosition(obj.matrixWorld);
    vector.project(camera);
    
    vector.x = ( vector.x * widthHalf ) + widthHalf;
    vector.y = - ( vector.y * heightHalf ) + heightHalf;
    
    return { 
        x: vector.x,
        y: vector.y
    };

  };
  Explorer.prototype.updateXYZlabelPos = function(camera, manuallyUpdate){

    // positioning
     
    var frustum = new THREE.Frustum();
    frustum.setFromMatrix( new THREE.Matrix4().multiplyMatrices( camera.projectionMatrix, camera.matrixWorldInverse ) );
    
    if(frustum.planes[0].constant === this.lastFrustumPlane && manuallyUpdate === undefined){
      return; // no need to run always
    }

    this.lastFrustumPlane = frustum.planes[0].constant;
  
    var yValue, xValue, zValue, tempX = 100000000000, tempY = 100000000000, tempZ = 100000000000; 
    var aValue, bValue, cValue, tempA = 100000000000, tempB = 100000000000, tempC = 100000000000; 
    
    // xyz axis
      
    for (var i = frustum.planes.length - 1; i >= 0; i--) { 
      
      // x real
      var asa = frustum.planes[i].normal.x;

      //document.getElementById('logg').innerHTML =  asa ;
      // y
      var py = frustum.planes[i].intersectLine( new THREE.Line3( new THREE.Vector3(0,0,0), new THREE.Vector3(100000,0,0)));
       
      if(py !== undefined && tempX > py.distanceTo(new THREE.Vector3(0,0,0))) {  
        tempX = py.distanceTo(new THREE.Vector3(0,0,0));
        xValue = py.clone(); 
      }

      // b
      py = frustum.planes[i].intersectLine( new THREE.Line3( new THREE.Vector3(0,0,0), new THREE.Vector3(this.bAxisLine.geometry.vertices[0].x,this.bAxisLine.geometry.vertices[0].y,this.bAxisLine.geometry.vertices[0].z) ) ) ; 
       
      if(py !== undefined && tempB > py.distanceTo(new THREE.Vector3(0,0,0))) {  
        tempB = py.distanceTo(new THREE.Vector3(0,0,0));
        bValue = py.clone(); 
      }
 

      // z real 

      // x
      var px = frustum.planes[i].intersectLine( new THREE.Line3( new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,100000))) ;       
      if(px !== undefined && tempZ > px.distanceTo(new THREE.Vector3(0,0,0))) {  
        tempZ = px.distanceTo(new THREE.Vector3(0,0,0));
        zValue = px.clone(); 
      }
      
      // a
      px = frustum.planes[i].intersectLine( new THREE.Line3( new THREE.Vector3(0,0,0), new THREE.Vector3(this.aAxisLine.geometry.vertices[0].x,this.aAxisLine.geometry.vertices[0].y,this.aAxisLine.geometry.vertices[0].z) ) ) ;  
       
      if(px !== undefined && tempA > px.distanceTo(new THREE.Vector3(0,0,0))) {  
        tempA = px.distanceTo(new THREE.Vector3(0,0,0));
        aValue = px.clone(); 
      }

      // y real

      // z
      var pz = frustum.planes[i].intersectLine( new THREE.Line3( new THREE.Vector3(0,0,0), new THREE.Vector3(0,100000,0))) ;       
      if(pz !== undefined && tempY > pz.distanceTo(new THREE.Vector3(0,0,0))) {  
        tempY = pz.distanceTo(new THREE.Vector3(0,0,0));
        yValue = pz.clone(); 
      }
      
      // c
      pz = frustum.planes[i].intersectLine( new THREE.Line3( new THREE.Vector3(0,0,0), new THREE.Vector3(this.cAxisLine.geometry.vertices[0].x,this.cAxisLine.geometry.vertices[0].y,this.cAxisLine.geometry.vertices[0].z) ) ) ;  
       
      if(pz !== undefined && tempC > pz.distanceTo(new THREE.Vector3(0,0,0))) {  
        tempC = pz.distanceTo(new THREE.Vector3(0,0,0));
        cValue = pz.clone(); 
      }
    };

    if(xValue !== undefined){ 
      this.helper.position.set(xValue.x,0,0); 
      var screenPosY = this.toScreenPosition(this.helper, camera);
      screenPosY = this.beautifyPosition(screenPosY) ;  
      this.menu.moveLabel({
        'label':'y',
        'xCoord':screenPosY.x,
        'yCoord':screenPosY.y
      }); 
    }

    if(bValue !== undefined){
      this.helper.position.set(bValue.x,bValue.y,bValue.z); 
      var screenPosB = this.toScreenPosition(this.helper, camera); 
      screenPosB = this.beautifyPosition(screenPosB) ; 
      this.menu.moveLabel({
        'label':'b',
        'xCoord':screenPosB.x,
        'yCoord':screenPosB.y
      });
    }

    //

    if(zValue !== undefined){
      this.helper.position.set(0,0,zValue.z);
      var screenPosX = this.toScreenPosition(this.helper, camera);  
      screenPosX = this.beautifyPosition(screenPosX) ;
      this.menu.moveLabel({
        'label':'x',
        'xCoord':screenPosX.x,
        'yCoord':screenPosX.y
      });
    }

    if(aValue !== undefined){
      this.helper.position.set(aValue.x,aValue.y,aValue.z); 
      var screenPosA = this.toScreenPosition(this.helper, camera);
      screenPosA = this.beautifyPosition(screenPosA) ;  
      this.menu.moveLabel({
        'label':'a',
        'xCoord':screenPosA.x,
        'yCoord':screenPosA.y
      });
    }

    //

    if(yValue !== undefined){
      this.helper.position.set(0,yValue.y,0);
      var screenPosY = this.toScreenPosition(this.helper, camera); 
      screenPosY = this.beautifyPosition(screenPosY) ;
      this.menu.moveLabel({
        'label':'z',
        'xCoord':screenPosY.x,
        'yCoord':screenPosY.y
      });
    }
    
    if(cValue !== undefined){
      this.helper.position.set(cValue.x,cValue.y,cValue.z); 
      var screenPosC = this.toScreenPosition(this.helper, camera);  
      screenPosC = this.beautifyPosition(screenPosC);
      this.menu.moveLabel({
        'label':'c',
        'xCoord':screenPosC.x,
        'yCoord':screenPosC.y
      });
    }
  };

  Explorer.prototype.beautifyPosition = function(p){
   
    var width = jQuery('#app-container').width() ;
    var height = jQuery(window).height() ; 

    if(p.x <20){
      p.x +=10;
      p.y -=20;
    }
    else if(p.x > width - 20 ){
      p.x -=10;
      p.y -=20;
    }
    else if(p.y <20 ){
      if(p.x > width/2.01){
        p.x +=10;
        p.y +=15;
      }
      else{
        p.x -=10;
        p.y +=15;
      } 
    }
    else if(p.y > height - 20 ){
      if(p.x > width/2){
        p.x +=15;
        p.y -=15;
      }
      else{
        p.x -=15;
        p.y -=15;
      } 
    }
    else{
      p.x =10000000000000;
      p.y =10000000000000;
    }
    return p;
  }
  Explorer.prototype.updateAbcAxes = function(params, camera){
    var _this = this; 

    var bStart =  new THREE.Vector3( 1000,0,0 );
    var bEnd =  new THREE.Vector3(-1000,0,0);

    var aStart =  new THREE.Vector3(0,0,1000 );
    var aEnd =  new THREE.Vector3(0,0,-1000);

    var cStart =  new THREE.Vector3( 0,1000,0 );
    var cEnd =  new THREE.Vector3(0,-1000,0);
      

    if(params.alpha !== undefined) this.angles.alpha = parseInt(params.alpha);  
    if(params.beta  !== undefined) this.angles.beta  = parseInt(params.beta);  
    if(params.gamma !== undefined) this.angles.gamma = parseInt(params.gamma); 

    _.each(_this.angles, function(angle, a ) {
        var argument ={};
        argument[a] = angle;
        var matrix = transformationMatrix(argument);
        aStart.applyMatrix4(matrix);
        aEnd.applyMatrix4(matrix);
        bStart.applyMatrix4(matrix);
        bEnd.applyMatrix4(matrix);
        cStart.applyMatrix4(matrix);
        cEnd.applyMatrix4(matrix); 
    });
  
    this.aAxisLine.geometry.vertices[0] = aStart ;
    this.aAxisLine.geometry.vertices[1] = aEnd ;
    this.bAxisLine.geometry.vertices[0] = bStart ;
    this.bAxisLine.geometry.vertices[1] = bEnd ;
    this.cAxisLine.geometry.vertices[0] = cStart ;
    this.cAxisLine.geometry.vertices[1] = cEnd ;

    this.aAxisLine.geometry.verticesNeedUpdate = true;
    this.bAxisLine.geometry.verticesNeedUpdate = true;
    this.cAxisLine.geometry.verticesNeedUpdate = true;
    
    this.updateXYZlabelPos(camera, true);

  }
  Explorer.prototype.axisMode = function(arg){
     
    var _this = this;
    
    if(arg.xyzAxes !== undefined){
      if(arg.xyzAxes){  
        this.zAxisLine.visible = true;
        this.yAxisLine.visible = true;
        this.xAxisLine.visible = true; 
      }
      else{ 
        this.zAxisLine.visible = false;
        this.yAxisLine.visible = false;
        this.xAxisLine.visible = false; 
      }
    }
    
    if(arg.abcAxes !== undefined){
      if(arg.abcAxes){ 
        this.aAxisLine.visible = true;
        this.bAxisLine.visible = true;
        this.cAxisLine.visible = true; 
      }
      else{
        this.cAxisLine.visible = false;
        this.bAxisLine.visible = false;
        this.aAxisLine.visible = false; 
      }
    }

  };
  var transformationMatrix = function(parameter) {
      
    // According to wikipedia model
    var ab = Math.tan((90 - ((parameter.beta) || 90)) * Math.PI / 180);
    var ac = Math.tan((90 - (parameter.gamma || 90)) * Math.PI / 180);
    var xy = 0;
    var zy = 0;
    var xz = 0;
    var bc = Math.tan((90 - (( parameter.alpha) || 90)) * Math.PI / 180);

    var sa = parameter.scaleX || 1; 
    var sb = parameter.scaleY || 1;
    var sc = parameter.scaleZ || 1; 
    
    var m = new THREE.Matrix4();
    m.set(
      sa, ab, ac,  0,
      xy, sb, zy,  0,
      xz, bc, sc,  0,
       0,  0,  0,  1
    );
    return m;
  };
  Explorer.prototype.add = function(object) {
    this.object3d.add(object.object3d);
  };

  Explorer.prototype.remove = function(object) {  
    this.object3d.remove(object.object3d);
  };
  function makeTextSprite( message, parameters )
  {
    if ( parameters === undefined ) parameters = {};
    
    var fontface = parameters.hasOwnProperty("fontface") ?  parameters["fontface"] : "Arial"; 
    var fontsize = parameters.hasOwnProperty("fontsize") ? parameters["fontsize"] : 18; 
    var borderThickness = parameters.hasOwnProperty("borderThickness") ?   parameters["borderThickness"] : 0; 
    var borderColor = parameters.hasOwnProperty("borderColor") ? parameters["borderColor"] : { r:0, g:0, b:0, a:1.0 }; 
    var backgroundColor = parameters.hasOwnProperty("backgroundColor") ? parameters["backgroundColor"] : { r:255, g:255, b:255, a:0};
  
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    context.font = "  " + fontsize + "px " + fontface;
      
    // get size data (height depends only on font size)
    var metrics = context.measureText( message );
    var textWidth = metrics.width;
    
    // background color
    context.fillStyle   = "rgba(" + backgroundColor.r + "," + backgroundColor.g + ","  + backgroundColor.b + "," + backgroundColor.a + ")";
    // border color
    context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + ","  + borderColor.b + "," + borderColor.a + ")";

    context.lineWidth = borderThickness;
    //roundRect(context, borderThickness/2, borderThickness/2, textWidth + borderThickness, fontsize * 1.4 + borderThickness, 6);
    // 1.4 is extra height factor for text below baseline: g,j,p,q.
    
    // text color 
    context.fillStyle = "rgba("+parameters.fontColor.r+", "+parameters.fontColor.g+", "+parameters.fontColor.b+", 1.0)";

    context.fillText( message, borderThickness, fontsize + borderThickness);
    
    // canvas contents will be used for a texture
    var texture = new THREE.Texture(canvas);
    texture.minFilter = THREE.NearestFilter;
    texture.needsUpdate = true;

    var spriteMaterial = new THREE.SpriteMaterial( 
      { map: texture,  transparent:true, opacity:1 } );
    var sprite = new THREE.Sprite( spriteMaterial );
    sprite.scale.set(10,5,1.0);
    return sprite;  
  }
  return {
    getInstance: function(options) {
      return (instance = instance || new Explorer(options));
    },
    add: function(object) {
      PubSub.publish(events.ADD, object);
    },
    remove: function(object) {
      PubSub.publish(events.REMOVE, object);
    }
  };
});
