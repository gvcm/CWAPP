'use strict';

define([
  'three',
  'pubsub'
], function(
  THREE,
  PubSub
) {
  // singleton
  var instance;

  var events = {
    ADD: 'motifExplorer.add',
    REMOVE: 'motifExplorer.remove'
  };

  function MotifExplorer(options) {
    options = options || {};

    this.object3d = new THREE.Scene();
    this.angles = {'alpha':90, 'beta':90, 'gamma':90 }; 
    var _this = this;
    PubSub.subscribe(events.ADD, function(message, object) {
      _this.add(object);
    });
    PubSub.subscribe(events.REMOVE, function(message, object) {
      _this.remove(object);
    });

    this.AmbLight = new THREE.AmbientLight( 0xffffff );
  
    this.object3d.add(this.AmbLight);

    var geometry1 = new THREE.Geometry();
    geometry1.vertices.push(
      new THREE.Vector3( 1000,0,0 ),
      new THREE.Vector3(-1000,0,0)
    );
   
    var geometry2 = new THREE.Geometry();
    geometry2.vertices.push(
      new THREE.Vector3( 0,1000,0 ),
      new THREE.Vector3(0,-1000,0)
    );

    var geometry3 = new THREE.Geometry();
    geometry3.vertices.push(
      new THREE.Vector3( 0,0,1000 ),
      new THREE.Vector3( 0,0,-1000 )
    );
     
    this.xAxisLine = new THREE.Line( geometry1, new THREE.LineBasicMaterial({ color: '#6F6299' }) );
    this.yAxisLine = new THREE.Line( geometry2, new THREE.LineBasicMaterial({ color: '#6F6299' }) );
    this.zAxisLine = new THREE.Line( geometry3, new THREE.LineBasicMaterial({ color: '#6F6299' }) ); 

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

  }
  MotifExplorer.prototype.updateAbcAxes = function(params, camera){
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
     

  }
  MotifExplorer.prototype.add = function(object) {
    this.object3d.add(object.object3d);
  };
  MotifExplorer.prototype.axisMode = function(arg){
    
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
  MotifExplorer.prototype.remove = function(object) {
    this.object3d.remove(object.object3d);
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
  return {
    getInstance: function(options) { 
      return (instance = instance || new MotifExplorer(options));
    },
    add: function(object) {
      PubSub.publish(events.ADD, object);
    },
    remove: function(object) {
      PubSub.publish(events.REMOVE, object);
    }
  };
});
