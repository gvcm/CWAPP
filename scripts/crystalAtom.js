 

define([
  'three',
  'explorer',
  'underscore',
  'atomMaterialManager',
  'tween'
], function(
  THREE,
  Explorer,
  _,
  AtomMaterialManager,
  TWEEN
) {
  
  //var globGeometry = new THREE.SphereGeometry(1,32, 32);
  var globalGeometries = [new THREE.OctahedronGeometry(1,0), new THREE.OctahedronGeometry(1,1), new THREE.OctahedronGeometry(1,2), new THREE.OctahedronGeometry(1,3), new THREE.OctahedronGeometry(1,4), new THREE.OctahedronGeometry(1,5) ];
  var globalMaterials = {} ;
  var uniqueId = -1; 
  var animationTime = 2500;

  function CrystalAtom(position, radius, color, elementName, id, offsetX, offsetY, offsetZ, centerOfMotif, lod, opacity, renderingMode, latticeIndex, ionicIndex, labeling, visible) { 
        
    var _this = this; 
    this.radius = radius;  
    this.material;
    this.materialLetter;
    this.scale = 1;
    this.lod = lod;
    this.identity = id ; 
    this.color = color; 
    this.cachedColor = color; 
    this.ionicIndex = ionicIndex; 
    this.offsetX = offsetX; 
    this.offsetY = offsetY; 
    this.opacity = opacity; 
    this.offsetZ = offsetZ; 
    this.centerOfMotif = new THREE.Vector3(centerOfMotif.x, centerOfMotif.y, centerOfMotif.z); ; 
    this.helperPos = {"x":0, "y":0, "z":0};
    this.elementName = elementName; 
    this.latticeIndex = latticeIndex; 
    this.visibility = (visible === undefined) ? true : visible ; 
    this.subtractedForCache = { 'object3d': undefined} ;  
    this.viewMode = 'Classic';
    this.viewModeBeen = {'crystalSolidVoid' : false, 'crystalSubstracted' : false, 'crystalGradeLimited' : false, 'crystalClassic' : false}; 
    this.uniqueID = uniqueID(); 
    this.tempKEY = uniqueID(); 
    this.materialLetter;
    this.outlineMesh; 
    this.notStates = {};

    this.labeling = labeling;

    this.addMaterial(color, position, opacity, renderingMode, id, AtomMaterialManager.getTexture(this.elementName, this.ionicIndex)) ;

    // private vars
    var originalColor = color;
    this.getOriginalColor = function(){
      return originalColor;
    }
    this.setOriginalColor = function(color){
      originalColor = color;
    } 
  };
  CrystalAtom.prototype.addMaterial = function(color, position, opacity, renderingMode, identity, image) {
    var _this = this ;
 
    var material;  

    if(renderingMode === 'wireframe') {
      material =  new THREE.MeshPhongMaterial({ specular: 0x050505, shininess : 100, color : color, wireframe: true, opacity:0}) ;
      //this.colorMaterial = new THREE.MeshPhongMaterial({ specular: 0x050505, shininess : 100, transparent:true, opacity:0 }) ; 
    }
    else if(renderingMode === 'realistic'){   
      this.colorMaterial = new THREE.MeshPhongMaterial({ specular: 0x050505, shininess : 100, color: color, transparent:true, opacity:opacity }) ; 
      material = this.colorMaterial;
    }
    else if(renderingMode === 'flat'){ 
      this.colorMaterial = new THREE.MeshLambertMaterial({ color: color, transparent:true, opacity:opacity }) ;
      material = this.colorMaterial;
    }
    else if(renderingMode === 'toon'){ 
      var phongMaterial = createShaderMaterial("phongDiffuse");
      phongMaterial.uniforms.uMaterialColor.value.copy(new THREE.Color(color));  
      this.colorMaterial = phongMaterial;
      material = this.colorMaterial;
    }
    
    var labelOp = (this.labeling === true) ? this.opacity : 0 ;
    
    this.materialLetter = new THREE.MeshBasicMaterial({  map : image, transparent:true, opacity : labelOp }) ;

    this.materials =  [  
      material,
      this.materialLetter
    ];

    var sphere = THREE.SceneUtils.createMultiMaterialObject( globalGeometries[this.lod] , this.materials);
 
    sphere.name = 'atom';
    sphere.scale.set(this.radius, this.radius, this.radius);
    sphere.identity = identity ;
    sphere.uniqueID = this.uniqueID ;
    sphere.latticeIndex = this.latticeIndex ;
    sphere.children[0].receiveShadow = true; 
    sphere.children[0].castShadow = true; 
    this.object3d = sphere;
   
    this.object3d.visible = this.visibility; 
    this.object3d.position.set(position.x, position.y, position.z);
    Explorer.add(this);  
  };
  function validateColor(color){

    var isOk  = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(color);
    
    //return hexColor;
  }
  CrystalAtom.prototype.setNewLodGeometry = function( ) {

    var chs = this.object3d.children; 
    
    for (var j = 0, k = chs.length; j < k; j++) {
      chs[j].geometry.dispose();
      chs[j].geometry = globalGeometries[this.lod] ;
    }
  };
  CrystalAtom.prototype.setNoteState = function( noteID, arg) {

    this.notStates[noteID] = arg;
    
  };
  CrystalAtom.prototype.deleteNoteState = function( noteID ) {
    if(this.notStates[noteID] === undefined){
      return;
    }
    else{
      this.notStates[noteID] === undefined;
    }
     
  };
  CrystalAtom.prototype.applyNoteState = function( noteID ) {
    
    if(this.notStates[noteID] === undefined){
      return;
    }
     
    var _this = this;

    if(this.notStates[noteID].visible !== this.visibility ){ 
      
      var sign;

      if(this.visibility === true){
        // animate towards invisibility
        sign = -1;
        this.setOpacity(1);
        
      }
      else{
        // animate towards visibility
        sign = 1; 
        this.setOpacity(0);
        this.setVisibility(true);
      }

      var tweenO = new TWEEN.Tween({opacity : 0})
        .to({opacity : 1}, animationTime)
        .easing(TWEEN.Easing.Linear.None)
        .onUpdate(function () { 
          if(sign === -1) { 
            _this.setOpacity(1-this.opacity);
          }
          else{ 
            _this.setOpacity(this.opacity);
          }
        })
        .onComplete(function () {
          _this.setVisibility(_this.notStates[noteID].visible);   
        })
        .start();
        
    }
    
    if(this.notStates[noteID].opacity !== this.opacity ){
      var sign;
      var difference = Math.abs(this.opacity - this.notStates[noteID].opacity);
      var currentOp = this.opacity;

      if(this.opacity <= this.notStates[noteID].opacity){ 
        sign = 1; 
      }
      else{ 
        sign = -1;  
      }

      var tweenO = new TWEEN.Tween({opacity : 0})
        .to({opacity : difference}, animationTime)
        .easing(TWEEN.Easing.Linear.None)
        .onUpdate(function () { 
          if(sign === -1) { 
            _this.setOpacity(currentOp-this.opacity);
          }
          else{ 
            _this.setOpacity(currentOp+this.opacity);
          }
        })
        .onComplete(function () {  
        })
        .start();
    }
    
    if(this.notStates[noteID].color !== this.color ){
      console.log(this.notStates[noteID].color);
      var newColor = this.notStates[noteID].color ;  
      var tweenC = new TWEEN.Tween(this.object3d.children[0].material.color)
        .to({r : newColor.r , g : newColor.g , b : newColor.b } , animationTime)
        .easing(TWEEN.Easing.Linear.None)
        .onUpdate(
            function(){}
        )
        .onComplete(function () {
          _this.setColorMaterial((new THREE.Color( _this.notStates[noteID].color.r, _this.notStates[noteID].color.g, _this.notStates[noteID].color.b)).getHex() );   
        })
        .start();
    }
  };
  CrystalAtom.prototype.setVisibility = function( bool) {

    this.visibility = bool;  
    this.object3d.visible = bool;

    if(this.outlineMesh !== undefined){
      this.outlineMesh.visible = bool;
    }

  };
  CrystalAtom.prototype.setOpacity = function( opacity) {
    
    if(_.isUndefined(opacity)) return;
    this.opacity = opacity;
    this.object3d.children[0].material.opacity = opacity ; 
    if(this.labeling){
      this.object3d.children[1].material.opacity = opacity ; 
    }

    if(this.outlineMesh !== undefined){
      this.outlineMesh.material.opacity = opacity ;
    }
  }; 
  CrystalAtom.prototype.setColorMaterial = function(color, temp) {
    
    if(this.object3d === undefined){
      return;
    }
    
    var _this = this;
    if(color === undefined){
      this.object3d.children[0].material.color = new THREE.Color( this.color );
    }
    else if(temp === undefined){ 
      this.color = color ;  
      this.object3d.children[0].material.color = new THREE.Color( this.color );
    }
    else if(temp !== undefined){   
      this.object3d.children[0].material.color = new THREE.Color( color );
    } 
  }; 
  CrystalAtom.prototype.coonMode = function(){   
 
    var phongMaterial = createShaderMaterial("phongDiffuse");
    phongMaterial.uniforms.uMaterialColor.value.copy(new THREE.Color( this.color )); 

    this.object3d.children[0].material = phongMaterial ;
    this.object3d.children[0].material.needsUpdate = true; 
  }  
  CrystalAtom.prototype.wireframeMat = function(bool){
    this.wireframe = bool ;

    if(bool === true){ 
      //this.object3d.children[0].material = new THREE.MeshBasicMaterial({transparent:true, opacity:0}) ;
      this.object3d.children[0].material = new THREE.MeshPhongMaterial({ specular: 0x050505, shininess : 100,color : this.color, wireframe: true, opacity:0}) ;
    }
    else{
      this.object3d.children[0].material = new THREE.MeshPhongMaterial({ specular: 0x050505, shininess : 100,color: this.color, transparent:true, opacity:this.opacity }) ;
      //this.object3d.children[1].material = new THREE.MeshBasicMaterial({transparent:true, opacity:0}) ;
    }
 
    this.object3d.children[0].material.needsUpdate = true;   
  };
  CrystalAtom.prototype.flatMode = function(bool){
    
    this.object3d.children[0].material = new THREE.MeshLambertMaterial( {color : this.color, transparent:true, opacity:this.opacity} );  
    this.object3d.children[0].material.needsUpdate = true; 

    var labelOp = (this.labeling === true) ? this.opacity : 0 ;

    this.object3d.children[1].material = new THREE.MeshLambertMaterial( { color : this.color, transparent:true, opacity:labelOp} );  
    this.object3d.children[1].material.needsUpdate = true;     
  };
  CrystalAtom.prototype.setLabeling = function(bool){
 
    this.labeling = bool;
    
    if(this.labeling === true){
      this.object3d.children[1].material.opacity = this.opacity ;   
    }
    else if(this.labeling === false){
      this.object3d.children[1].material.opacity = 0 ;   
    }
  };

  CrystalAtom.prototype.realisticMode = function(bool){
    
    this.object3d.children[0].material =  new THREE.MeshPhongMaterial({ specular: 0x050505, shininess : 100, color : this.color, transparent:true, opacity:this.opacity} );  
    this.object3d.children[0].material.needsUpdate = true; 

    var labelOp = (this.labeling === true) ? this.opacity : 0 ;

    this.object3d.children[1].material.opacity = labelOp;  
    this.object3d.children[1].material.needsUpdate = true;    
  }; 
  CrystalAtom.prototype.GradeLimited = function() {
    this.viewMode = 'crystalGradeLimited' ; 
    this.viewModeBeen.crystalGradeLimited = true;
  };
  CrystalAtom.prototype.subtractedSolidView = function(box, pos, gear) {
    var _this = this;  

    this.viewModeBeen.crystalSubstracted = true;
 
    var atomMesh = new THREE.Mesh( new THREE.OctahedronGeometry(this.radius, this.object3d.children[0].geometry.parameters.detail) , new THREE.MeshPhongMaterial() );
    atomMesh.position.set(pos.x, pos.y, pos.z); 

    if(gear === undefined){
      Explorer.remove({'object3d':this.object3d});
    } 

    var cube = THREE.CSG.toCSG(box); 
    cube = cube.inverse();
    var sphere = THREE.CSG.toCSG(atomMesh); 
    var geometry = sphere.intersect(cube); 
    var geom = THREE.CSG.fromCSG(geometry);
    var finalGeom = assignUVs(geom);
    
    var sphereCut = THREE.SceneUtils.createMultiMaterialObject( finalGeom, [/*_this.materialLetter,*/ _this.colorMaterial ]); 
    sphereCut.name = 'subtractedAtom';
    sphereCut.children[0].receiveShadow = true; 
    sphereCut.children[0].castShadow = true; 

    if(gear !== undefined){
      this.subtractedForCache.object3d  = sphereCut ;
      Explorer.add(this.subtractedForCache);
    }
    else{
      this.object3d = sphereCut; 
      Explorer.add(this); 
    }
     
    this.helperPos.x = pos.x ;
    this.helperPos.y = pos.y ;
    this.helperPos.z = pos.z ;

    this.viewMode = 'crystalSubstracted';
  };
  CrystalAtom.prototype.getScaledRadius = function() { 
    return (this.radius*this.scale) ;
  };
  CrystalAtom.prototype.setScale = function(scale) { 
    var ratio = this.radius * scale ; 
    this.object3d.scale.set(ratio,ratio,ratio); 
    this.scale = scale; 
  };
  CrystalAtom.prototype.removesubtractedForCache = function() { 

    if(this.subtractedForCache.object3d !== undefined){
      Explorer.remove({'object3d' : this.subtractedForCache.object3d});  
      this.subtractedForCache.object3d = undefined;
    } 
  };
  CrystalAtom.prototype.SolidVoid = function( pos) {
    var _this = this;   
    this.helperPos.x = pos.x ;
    this.helperPos.y = pos.y ;
    this.helperPos.z = pos.z ; 
    this.viewMode = 'crystalSolidVoid'; 
    this.viewModeBeen.crystalSolidVoid = true; 
  };
  CrystalAtom.prototype.hideSubtracted = function(bool) {
    this.subtractedForCache.object3d.visible = bool;
  }; 
  CrystalAtom.prototype.classicView = function() {
    var _this = this;
    if(this.viewMode === 'crystalGradeLimited'){
      this.viewMode = 'crystalClassic'; 
      return;
    }
    var toDestroy = this.object3d;
    var pos = new THREE.Vector3(_this.object3d.position.x ,_this.object3d.position.y , _this.object3d.position.z  ); 
   
    var sphere = THREE.SceneUtils.createMultiMaterialObject( globalGeometries[this.lod], [/*_this.materialLetter,*/ this.colorMaterial ]); 
    sphere.scale.set(this.radius, this.radius, this.radius);

    sphere.children[0].receiveShadow = true; 
    sphere.children[0].castShadow = true; 
    sphere.name = 'atom';
    sphere.identity = this.identity ; 
    sphere.uniqueID = this.uniqueID ;
    sphere.latticeIndex = this.latticeIndex ;
    this.object3d = sphere;
    this.object3d.position.x = _this.helperPos.x ;
    this.object3d.position.y = _this.helperPos.y ;
    this.object3d.position.z = _this.helperPos.z ;

    Explorer.add(this); 
    Explorer.remove({'object3d':toDestroy}); 
  };
  CrystalAtom.prototype.getID = function() {
    var _this = this ;
    return this.myID ;
  };  
  CrystalAtom.prototype.getName = function() {
    var _this = this ;
    return this.elementName ;
  };
  CrystalAtom.prototype.setName = function(name) {
    var _this = this ;
    this.elementName = name ;
  };
  CrystalAtom.prototype.getRadius = function() {
    var _this = this ;
    return this.radius ;
  };  
  CrystalAtom.prototype.destroy = function() {  
    Explorer.remove(this);  
    if(this.outlineMesh !== undefined){
      Explorer.remove({ object3d : this.outlineMesh});
    }
  };
  function assignUVs( geometry ){ //todo maybe it doesn't work right
     
    geometry.computeBoundingBox();

    var max     = geometry.boundingBox.max;
    var min     = geometry.boundingBox.min;

    var offset  = new THREE.Vector2(0 - min.x, 0 - min.y);
    var range   = new THREE.Vector2(max.x - min.x, max.y - min.y);

    geometry.faceVertexUvs[0] = [];
    var faces = geometry.faces;

    for (var i = 0; i < geometry.faces.length ; i++) {

      var v1 = geometry.vertices[faces[i].a];
      var v2 = geometry.vertices[faces[i].b];
      var v3 = geometry.vertices[faces[i].c];

      geometry.faceVertexUvs[0].push([
        new THREE.Vector2( ( v1.x + offset.x ) / range.x , ( v1.y + offset.y ) / range.y ),
        new THREE.Vector2( ( v2.x + offset.x ) / range.x , ( v2.y + offset.y ) / range.y ),
        new THREE.Vector2( ( v3.x + offset.x ) / range.x , ( v3.y + offset.y ) / range.y )
      ]);

    }

    geometry.uvsNeedUpdate = true;

    return geometry;
  }
  function uniqueID() {
    uniqueId++; 
    return uniqueId;
  };
  function createShaderMaterial(id) {

      var shader = THREE.ShaderTypes[id];

      var u = THREE.UniformsUtils.clone(shader.uniforms);

      var vs = shader.vertexShader;
      var fs = shader.fragmentShader;

      var material = new THREE.ShaderMaterial({ uniforms: u, vertexShader: vs, fragmentShader: fs });

      material.uniforms.uDirLightPos.value = new THREE.Vector3(300, 300, 60);
      material.uniforms.uDirLightColor.value = new THREE.Color( 0xFFFFFF );
      
      return material;

  }
  THREE.ShaderTypes = { 
    'phongDiffuse' : {

        uniforms: {

            "uDirLightPos": { type: "v3", value: new THREE.Vector3() },
            "uDirLightColor": { type: "c", value: new THREE.Color( 0xffffff ) },

            "uMaterialColor":  { type: "c", value: new THREE.Color( 0xffffff ) },

            uKd: {
                type: "f",
                value: 0.7
            },
            uBorder: {
                type: "f",
                value: 0.4
            }
        },

        vertexShader: [

            "varying vec3 vNormal;",
            "varying vec3 vViewPosition;",

            "void main() {",

                "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
                "vNormal = normalize( normalMatrix * normal );",
                "vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
                "vViewPosition = -mvPosition.xyz;",

            "}"

        ].join("\n"),

        fragmentShader: [

            "uniform vec3 uMaterialColor;",

            "uniform vec3 uDirLightPos;",
            "uniform vec3 uDirLightColor;",

            "uniform float uKd;",
            "uniform float uBorder;",

            "varying vec3 vNormal;",
            "varying vec3 vViewPosition;",

            "void main() {",

                // compute direction to light
                "vec4 lDirection = viewMatrix * vec4( uDirLightPos, 0.0 );",
                "vec3 lVector = normalize( lDirection.xyz );",

                // diffuse: N * L. Normal must be normalized, since it's interpolated.
                "vec3 normal = normalize( vNormal );",
                //was: "float diffuse = max( dot( normal, lVector ), 0.0);",
                // solution
                "float diffuse = dot( normal, lVector );",
                "if ( diffuse > 0.6 ) { diffuse = 1.0; }",
                "else if ( diffuse > -0.2 ) { diffuse = 0.7; }",
                "else { diffuse = 0.3; }",

                "gl_FragColor = vec4( uKd * uMaterialColor * uDirLightColor * diffuse, 1.0 );",

            "}"

        ].join("\n") 
    } 
  };
  return CrystalAtom;
});
