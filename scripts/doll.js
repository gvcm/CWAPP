 
define([
  'jquery', 
  'three', 
  'pubsub',
  'underscore', 
  'dollExplorer'
], function(
  jQuery,
  THREE, 
  PubSub,
  _, 
  DollExplorer 
  
) { 
  var raycaster = new THREE.Raycaster();
  var mouse = new THREE.Vector2();  
  var yPosGearSlider = [-7.05, -5.7 , -4.35 , -3 , -1.65 , -0.30];
  var levelNames = [ '1. Lattice Points', '2. Motif', '3. Constructive Unit Cell', '4. Unit cell', '5. Cropped unit cell', '6. Crystal' ];
  
  function Doll(camera, crystalScene, crystalOrbit, lattice, animationMachine , keyboard, soundMachine, gearTour, menu, visible) {

    this.plane = {'object3d' : undefined} ;
    var _this = this;
     
    this.soundMachine = soundMachine; 
    this.crystalScene = crystalScene; 
    this.keyboard = keyboard; 
    this.dollOn = false;
    this.camera = camera;
    this.lattice = lattice;
    this.animationMachine = animationMachine;
    this.gearTour = gearTour;
    this.container = 'crystalRendererMouse';
    this.INTERSECTED;
    this.SELECTED;
    this.offset = new THREE.Vector3();
    this.offset2 = new THREE.Vector3();
    this.crystalOrbit = crystalOrbit;
    this.atomUnderDoll ; 
    this.objsToIntersect = [];
    this.gearState = 1;
    this.levels = [];
    this.levelLabels = [];
    this.enablemouseEvents = true;
    this.menu = menu;
    this.wereOnMobile = !visible;

    this.plane.object3d = new THREE.Mesh(
      new THREE.PlaneBufferGeometry( 10000, 10000, 2, 2 ),
      new THREE.MeshBasicMaterial( { transparent: true, opacity : 0.1   } )
    ); 
    this.plane.object3d.visible = false; 
    this.plane.object3d.lookAt(this.camera.position);
 
    DollExplorer.add(this.plane);

    /// doll icon  
 
    this.dollHolder = createDollHolder();
    this.dollHolder.visible = visible;
    
    this.dollHolder.position.y = 4;  

    this.doll = createDoll();   
    this.doll.name = 'doll';
    this.doll.visible = false;
    this.doll.position.y =  4;  

    DollExplorer.add( { object3d : this.doll });
    this.objsToIntersect.push(this.doll);

    DollExplorer.add( { object3d :this.dollHolder });
    this.objsToIntersect.push(this.dollHolder);

    this.gearBar = createGearBar();  
    this.gearBar.visible = visible;

    this.gearBarSlider = createGearBarSlider(); 
    this.gearBarSlider.visible = visible;
    this.gearBarSlider.position.y = -7.05;

    this.gearBarSliderLevels = createLevels();  
    this.gearBarSliderLevels.visible = visible;  
    
    DollExplorer.add( { object3d :this.gearBarSliderLevels });

    DollExplorer.add( { object3d :this.gearBar });
    this.objsToIntersect.push(this.gearBar);

    DollExplorer.add( { object3d :this.gearBarSlider });
    this.objsToIntersect.push(this.gearBarSlider);

    for (var i = 0; i < yPosGearSlider.length ; i++) {
      var m = new THREE.Mesh( new THREE.PlaneBufferGeometry(1.2,0.6), new THREE.MeshBasicMaterial({ transparent: true, opacity : 0.4, color: 0xffffff}) );
      m.position.y = yPosGearSlider[i];
      m.name = i;
      m.visible = false;
      DollExplorer.add({object3d : m});
      this.levels[i] = m ;
      this.objsToIntersect.push(m);
    };  
     
    for (var g = 0; g < levelNames.length ; g++) {
      this.levelLabels[g] = {
        'position' : new THREE.Vector2(0,0),  
        'allowed' : false,
        'levelName' : levelNames[g] 
      };
      this.levelLabels[g].position.y = yPosGearSlider[g] - 2;   
    };
    this.levelLabels[0].allowed = true;

    this.helper = new THREE.Mesh(new THREE.BoxGeometry( 0.1, 0.1, 0.1 ), new THREE.MeshBasicMaterial( { color: 0x000000}));
    this.helper.visible = false;
    DollExplorer.add( {object3d : this.helper} );

    this.rePosition();
  
  };  
  function createGearBarSlider(){

    var obj = new THREE.Object3D();

    var sliderG = new THREE.Geometry();
    var v1 = new THREE.Vector3(-0.625 ,  0.3,  0);
    var v2 = new THREE.Vector3(-0.625 , -0.3,  0); 
    var v3 = new THREE.Vector3( 0.625 , -0.3,  0);  
    var v4 = new THREE.Vector3( 0.625 ,  0.3,  0);  
     
    sliderG.vertices.push(v1);
    sliderG.vertices.push(v2);
    sliderG.vertices.push(v3);
    sliderG.vertices.push(v4);
    
    sliderG.faces.push( new THREE.Face3( 0, 1, 2 ) );
    sliderG.faces.push( new THREE.Face3( 0, 2, 3 ) );

    sliderG.computeFaceNormals(); 
    
    var slider = new THREE.Mesh( sliderG, new THREE.MeshBasicMaterial({ color: 0x6F6299})); 
    
    var geometryL = new THREE.Geometry();
    geometryL.vertices.push(
      v1,
      v2,
      v3,
      v4,
      v1
    );

    var line = new THREE.Line( geometryL, new THREE.LineBasicMaterial({ color: 0x15002B}) );

    slider.name = 'gearBarSlider';      

    obj.add(line);
    obj.add(slider);
    return obj;
  };

  function createGearBar(){

    var obj = new THREE.Object3D();

    // line 
    var lineG = new THREE.Geometry();
    var Lv1 = new THREE.Vector3(-0.15,  0,  -0.000001);
    var Lv2 = new THREE.Vector3(-0.15, -7.4,  -0.000001); 
    var Lv3 = new THREE.Vector3( 0.15, -7.4,  -0.000001);  
    var Lv4 = new THREE.Vector3( 0.15,  0,  -0.000001);  
     
    lineG.vertices.push(Lv1);
    lineG.vertices.push(Lv2);
    lineG.vertices.push(Lv3);
    lineG.vertices.push(Lv4);
    
    lineG.faces.push( new THREE.Face3( 0, 1, 2 ) );
    lineG.faces.push( new THREE.Face3( 0, 2, 3 ) );

    lineG.computeFaceNormals(); 
    
    var line = new THREE.Mesh( lineG, new THREE.MeshBasicMaterial({ color: 0xA19EA1 }) );
    line.name = 'line'; 
 
    obj.add(line);
     
    // plus plane
    var plusSquareG = new THREE.Geometry();
    var Sv1 = new THREE.Vector3(-0.6 ,  0.6,  0);
    var Sv2 = new THREE.Vector3(-0.6 , -0.6,  0); 
    var Sv3 = new THREE.Vector3( 0.6 , -0.6,  0);  
    var Sv4 = new THREE.Vector3( 0.6 ,  0.6,  0);  
     
    plusSquareG.vertices.push(Sv1);
    plusSquareG.vertices.push(Sv2);
    plusSquareG.vertices.push(Sv3);
    plusSquareG.vertices.push(Sv4);
    
    plusSquareG.faces.push( new THREE.Face3( 0, 1, 2 ) );
    plusSquareG.faces.push( new THREE.Face3( 0, 2, 3 ) );

    plusSquareG.computeFaceNormals(); 
    
    var plusSquare = new THREE.Mesh( plusSquareG, new THREE.MeshBasicMaterial({ color: 0xA19EA1 }) );
    plusSquare.name = 'plus'; 
    plusSquare.position.y = 0.6; ; 

    // plus symbol
    var plusSquareGp = new THREE.Geometry(); 
    var Pv1 = new THREE.Vector3(-0.4 ,  0.1,  0);
    var Pv2 = new THREE.Vector3(-0.4 , -0.1,  0); 
    var Pv3 = new THREE.Vector3( 0.4 , -0.1,  0);  
    var Pv4 = new THREE.Vector3( 0.4 ,  0.1,  0);

    var Pv5 = new THREE.Vector3( -0.1 ,   0.4,  0);
    var Pv6 = new THREE.Vector3( -0.1 ,  -0.4,  0);
    var Pv7 = new THREE.Vector3(  0.1 ,  -0.4,  0);
    var Pv8 = new THREE.Vector3(  0.1 ,   0.4,  0);

    plusSquareGp.vertices.push(Pv1);
    plusSquareGp.vertices.push(Pv2);
    plusSquareGp.vertices.push(Pv3);
    plusSquareGp.vertices.push(Pv4);

    plusSquareGp.vertices.push(Pv5);
    plusSquareGp.vertices.push(Pv6);
    plusSquareGp.vertices.push(Pv7);
    plusSquareGp.vertices.push(Pv8);

    plusSquareGp.faces.push( new THREE.Face3( 0, 1, 2 ) );
    plusSquareGp.faces.push( new THREE.Face3( 0, 2, 3 ) );

    plusSquareGp.faces.push( new THREE.Face3( 4, 5, 6 ) );
    plusSquareGp.faces.push( new THREE.Face3( 4, 6, 7 ) );

    plusSquareGp.computeFaceNormals(); 
    
    var plusSquareP = new THREE.Mesh( plusSquareGp, new THREE.MeshBasicMaterial({ color: 0x2B262F }) );
    plusSquareP.name = 'plusSymbol'; 
    plusSquareP.position.y = 0.6; 
 
    obj.add(plusSquare);
    obj.add(plusSquareP); 

    // minus plane 
    var minusSquareG = plusSquareG.clone();

    var minusSquare = new THREE.Mesh( minusSquareG, new THREE.MeshBasicMaterial({ color: 0xA19EA1 }) );
    minusSquare.name = 'minus'; 
    minusSquare.position.y = -8;

    // plus symbol
    var minusSquareGp = new THREE.Geometry(); 
    var Pv1 = new THREE.Vector3(-0.4 ,  0.1,  0);
    var Pv2 = new THREE.Vector3(-0.4 , -0.1,  0); 
    var Pv3 = new THREE.Vector3( 0.4 , -0.1,  0);  
    var Pv4 = new THREE.Vector3( 0.4 ,  0.1,  0);
  
    minusSquareGp.vertices.push(Pv1);
    minusSquareGp.vertices.push(Pv2);
    minusSquareGp.vertices.push(Pv3);
    minusSquareGp.vertices.push(Pv4); 

    minusSquareGp.faces.push( new THREE.Face3( 0, 1, 2 ) );
    minusSquareGp.faces.push( new THREE.Face3( 0, 2, 3 ) );
  
    minusSquareGp.computeFaceNormals(); 
    
    var minusSquareM = new THREE.Mesh( minusSquareGp, new THREE.MeshBasicMaterial({ color: 0x2B262F }) );
    minusSquareM.name = 'minusSymbol'; 
    minusSquareM.position.y = -8 ;  

    obj.add(minusSquare);
    obj.add(minusSquareM);
 
    return obj;
  };
  function createLevels(){

    var obj = new THREE.Object3D();
     
    // levels 
    for (var i = 0; i < 6; i++) {
 
      var levelsGeom = new THREE.Geometry();
     
      var Sv1 = new THREE.Vector3(-0.35,  0.13 ,  0);
      var Sv2 = new THREE.Vector3(-0.35, -0.13 ,  0); 
      var Sv3 = new THREE.Vector3( 0.35, -0.13 ,  0);  
      var Sv4 = new THREE.Vector3( 0.35,  0.13 ,  0);  
       
      levelsGeom.vertices.push(Sv1);
      levelsGeom.vertices.push(Sv2);
      levelsGeom.vertices.push(Sv3);
      levelsGeom.vertices.push(Sv4);
      
      levelsGeom.faces.push( new THREE.Face3( 0, 1, 2 ) );
      levelsGeom.faces.push( new THREE.Face3( 0, 2, 3 ) );
       
      levelsGeom.computeFaceNormals();
      levelsGeom.computeVertexNormals();

      var color = (i === 0) ? 0xA19EA1 : 0x2E2E2E ;
      var levels = new THREE.Mesh( levelsGeom, new THREE.MeshBasicMaterial({ color: color }) );
      levels.name = 'level'+i;   
 
      levels.position.y = yPosGearSlider[i]  ;    
     
      obj.add(levels);
    };
    
    obj.name = 'lev';
    return obj;
  };
  function createDoll(){

    var geom = new THREE.Geometry();
    var v1 = new THREE.Vector3(0,-0.2,0);
    var v2 = new THREE.Vector3(-0.9,0,0);
    var v3 = new THREE.Vector3(0,-1.2,0);
    var v4 = new THREE.Vector3(0.9,0,0);
     
    geom.vertices.push(v1);
    geom.vertices.push(v2);
    geom.vertices.push(v3);
    geom.vertices.push(v4);
    
    geom.faces.push( new THREE.Face3( 0, 1, 2 ) );
    geom.faces.push( new THREE.Face3( 0, 2, 3 ) );

    geom.computeFaceNormals();
    
    var mesh = new THREE.Mesh( geom, new THREE.MeshBasicMaterial({ color: 0x6F6299 }) );
  
    return mesh;
  };
  function createDollHolder(){

    var obj = new THREE.Object3D();

    var obj1 = new THREE.Mesh( new THREE.CircleGeometry( 1, 32 ), new THREE.MeshBasicMaterial({ color: 0xA19EA1 }) );
    obj1.name = 'dollHolder'; 
    obj.add(obj1);

    var obj2 = new THREE.Mesh( new THREE.CircleGeometry( 0.85, 32 ), new THREE.MeshBasicMaterial({ color: 0x000000 }) );
    obj2.name = 'dollHolder';   
    obj.add(obj2);

    var obj3 = new THREE.Mesh( new THREE.CircleGeometry( 0.45, 32 ), new THREE.MeshBasicMaterial({ color: 0xA19EA1 }) );
    obj3.name = 'dollHolder';   
    obj.add(obj3);

    var obj4 = new THREE.Mesh( new THREE.CircleGeometry( 0.32, 32 ), new THREE.MeshBasicMaterial({ color: 0xA19EA1 }) );
    obj4.name = 'dollHolder';
    obj4.position.y = 0.9;  
    obj.add(obj4);

    return obj;
  };
 
  Doll.prototype.setVisibility = function(bool) {
 
    this.gearBar.visible = bool;
    this.gearBarSlider.visible = bool; 
    this.dollHolder.visible = bool;
    this.gearBarSliderLevels.visible = bool; 
    this.enablemouseEvents = bool;
  }; 
  Doll.prototype.findPlanePoint = function(pos){  
    
    raycaster.setFromCamera( pos, this.camera ); 
    var intersects = raycaster.intersectObject( this.plane.object3d );
    
    if(intersects.length > 0){ 
      var intPos = intersects[ 0 ].point.sub( this.offset2 ) ;
    }
    else{
      var intPos = new THREE.Vector2(0,0);
    }
     
    return intPos.x;
  }; 

  var oneTimeVar = 0;

  Doll.prototype.rePosition = function(){  
    var _this = this;
    
    var xFromCubeScaled = (($('#hudRendererCube').width()/2)/$('#app-container').width())*2 - 1;
    var newX = this.findPlanePoint(new THREE.Vector2(xFromCubeScaled, 0 ));
    this.dollHolder.position.x = newX;
 
    this.doll.position.x = newX + 4 ; 
    this.doll.position.y = 4; 
    this.dollHolder.position.x = newX ;  
    this.gearBar.position.x = newX ;  ; 
    this.gearBarSlider.position.x = newX ;  


    for (var j = 0; j < this.levels.length ; j++) {  
      this.levels[j].position.x = newX ;  
      this.helper.position.set(this.levels[j].position.x, this.levels[j].position.y, this.levels[j].position.z);
      this.levelLabels[j].position = this.toScreenPosition(this.helper, this.camera); 
      this.levelLabels[j].position.x += 15;
    };  
    
    this.gearBarSliderLevels.position.x = newX;

    oneTimeVar++;

    if(oneTimeVar === 2 && this.wereOnMobile === false){ 
      this.menu.canvasTooltip({
        'message':levelNames[0],
        'x': _this.levelLabels[0].position.x,
        'y':_this.levelLabels[0].position.y,
        'show':true
      }); 
    }
  } 
  Doll.prototype.toScreenPosition = function(obj, camera){ 
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
  Doll.prototype.setAtomUnderDoll = function(atom){  
    this.atomUnderDoll = atom ;  
  };
 
  Doll.prototype.dollMode  = function(atom){ 
 
    var cameraPos = this.crystalOrbit.camera.position.clone();
    var movCubePos = this.crystalScene.movingCube.position.clone();
    var camToAtomDist = atom.position.clone().sub(cameraPos.clone()).length();
    var oldTargetModified = ((((movCubePos.clone()).sub(cameraPos.clone())).setLength(camToAtomDist) ).add(cameraPos.clone()));

    var g = this.lattice.customBox(this.lattice.viewBox);
    var target;

    if(g !== undefined){

      target = new THREE.Vector3(0,0,0);

      if(g !== undefined){ 
        target = new THREE.Vector3(); 
        for ( var z = 0, l = g.vertices.length; z < l; z ++ ) {
          target.add( g.vertices[ z ] ); 
        }  
        target.divideScalar( g.vertices.length );
      }
    }
    else{
      var params = this.lattice.getParameters() ;
      var x = params.scaleX * params.repeatX/2 ;
      var y = params.scaleY * params.repeatY /2;
      var z = params.scaleZ * params.repeatZ/2 ;
      target = new THREE.Vector3(x,y,z) ; 
    }
 

    var t = target.clone();

    var newCamPos = new THREE.Vector3(atom.position.x - target.x, atom.position.y - target.y, atom.position.z - target.z);
    newCamPos.setLength(newCamPos.length()+0.001);
    newCamPos.x += target.x ;
    newCamPos.y += target.y ;
    newCamPos.z += target.z ;

    var newCubePos = (this.crystalOrbit.control.target.clone()).sub(cameraPos.clone());
    newCubePos.setLength(1);

    this.crystalScene.movingCube.position.copy( oldTargetModified );

    this.animationMachine.cameraAnimation = { 
      positionTrigger : true, 
      targetTrigger : true, 
      orbitControl : this.crystalOrbit, 
      oldTarget : oldTargetModified.clone(),  
      newTarget : new THREE.Vector3(atom.position.x, atom.position.y, atom.position.z), 
      oldPos : cameraPos.clone(),  
      movingTargetFactor : 0,
      posFactor : 0, 
      callback: function(){},
      targConnectVector : new THREE.Vector3(
        target.x - this.crystalOrbit.control.target.x, 
        target.y - this.crystalOrbit.control.target.y, 
        target.z - this.crystalOrbit.control.target.z 
      ),
      posConnectVector : new THREE.Vector3(
        newCamPos.x - cameraPos.x, 
        newCamPos.y - cameraPos.y, 
        newCamPos.z - cameraPos.z 
      )
    }; 

    $( document ).ready( 
      function(){
        this.rePosition();
      }
    );
    
  };
  function makeTextSprite( message, parameters ) { 
    if ( parameters === undefined ) parameters = {};
    
    var fontface = parameters.hasOwnProperty("fontface") ?  parameters["fontface"] : "Arial"; 
    var fontsize = parameters.hasOwnProperty("fontsize") ? parameters["fontsize"] : 18; 
    var borderThickness = parameters.hasOwnProperty("borderThickness") ?   parameters["borderThickness"] : 0; 
    var borderColor = parameters.hasOwnProperty("borderColor") ? parameters["borderColor"] : { r:0, g:0, b:0, a:1.0 }; 
    var backgroundColor = parameters.hasOwnProperty("backgroundColor") ? parameters["backgroundColor"] : { r:255, g:255, b:255, a:0};
  
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    context.font = " bold " + fontsize + "px " + fontface;
      
    // get size data (height depends only on font size)
    var metrics = context.measureText( message );
    var textWidth = metrics.width;
    
    // background color
    context.fillStyle   = "rgba(" + backgroundColor.r + "," + backgroundColor.g + ","  + backgroundColor.b + "," + backgroundColor.a + ")";
    // border color
    context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + ","  + borderColor.b + "," + borderColor.a + ")";

    context.lineWidth = borderThickness; 
    // text color 
    context.fillStyle = "rgba("+parameters.fontColor.r+", "+parameters.fontColor.g+", "+parameters.fontColor.b+", 1.0)";

    context.fillText( message, borderThickness, fontsize + borderThickness);
    
    // canvas contents will be used for a texture
    var texture = new THREE.Texture(canvas) 
    texture.minFilter = THREE.NearestFilter;
    texture.needsUpdate = true;

    var spriteMaterial = new THREE.SpriteMaterial( 
      { map: texture,  transparent:true, opacity:1 } );
    var sprite = new THREE.Sprite( spriteMaterial );
    sprite.scale.set(10,5,1.0);
    return sprite;  
  }

  return Doll;
  
});  
