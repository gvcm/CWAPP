 
define([
  'three',
  'unitCellExplorer',
  'underscore',
  'csg',
  'threeCSG',
  'atomMaterialManager' 
], function(
  THREE,
  UnitCellExplorer,
  _,
  csg,
  ThreeCSG,
  AtomMaterialManager 
) { 
  //var globGeometry = new THREE.SphereGeometry(1,32, 32);
  var globGeometries = [new THREE.OctahedronGeometry(1,0), new THREE.OctahedronGeometry(1,1), new THREE.OctahedronGeometry(1,2), new THREE.OctahedronGeometry(1,3), new THREE.OctahedronGeometry(1,4), new THREE.OctahedronGeometry(1,5) ];
  
  function UnitCellAtom(lod, position, radius, color, visible, elementName, id, latticeIndex, opacity, renderingMode, ionicIndex, labeling) { 
    
    var _this = this; 
    this.radius = radius;  
    this.material;
    this.latticeIndex = latticeIndex; 
    this.ionicIndex = ionicIndex; 
    this.materials;
    this.lod = lod;  
    this.tangency = tangency;  
    this.color = color; 
    this.visibility = (visible === undefined) ? true : visible ;
    this.opacity = opacity ; 
    this.myID = id; 
    this.elementName = elementName; 
    this.viewMode = 'cellClassic' ; 
    this.subtractedForCache = { 'object3d': undefined} ; 
    this.userOffset = {"x":0, "y":0, "z":0};
    this.helperPos = {"x":0, "y":0, "z":0};  
    this.viewModeBeen = {'cellClassic' : false, 'cellSubstracted' : false, 'cellGradeLimited' : false, 'cellSolidVoid' : false}; 
    this.materialLetter;
    this.texture;
    this.labeling = labeling;

    this.addMaterial(color, position, opacity, renderingMode, AtomMaterialManager.getTexture(this.elementName,this.ionicIndex)) ;
    
    // private vars
    var originalColor = color;
    this.getOriginalColor = function(){
      return originalColor;
    }
    this.setOriginalColor = function(color){
      originalColor = color;
    }
  }; 
  UnitCellAtom.prototype.addMaterial = function(color, position, opacity, renderingMode, image) {
    var _this = this ;
    var material; 

    this.texture = image;

    if(renderingMode === 'wireframe') { 
      material = new THREE.MeshPhongMaterial({  specular: 0x050505, shininess : 100,color : color, wireframe: true, opacity:0}) ;
       
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
      material = phongMaterial;
      this.colorMaterial = phongMaterial;
    }
    
    var labelOp = (this.labeling === true) ? this.opacity : 0 ;
     
    this.materialLetter = new THREE.MeshPhongMaterial({  map : image, transparent:true, opacity : labelOp   }) ;

    this.materials =  [  
      material,
      this.materialLetter
    ];
    
    var sphere = THREE.SceneUtils.createMultiMaterialObject( globGeometries[this.lod], this.materials); 
 
    sphere.visible = this.visibility;
     
    sphere.scale.set(this.radius, this.radius, this.radius);
    sphere.children[0].receiveShadow = true; 
    sphere.children[0].castShadow = true;  
    sphere.name = 'atom';
    this.object3d = sphere;
    this.object3d.position.fromArray(position.toArray()); 
    UnitCellExplorer.add(this);  
  };

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
  function createShaderMaterial(id) {

      var shader = THREE.ShaderTypes[id];

      var u = THREE.UniformsUtils.clone(shader.uniforms);

      var vs = shader.vertexShader;
      var fs = shader.fragmentShader;

      var material = new THREE.ShaderMaterial({ uniforms: u, vertexShader: vs, fragmentShader: fs });

      material.uniforms.uDirLightPos.value = new THREE.Vector3(300, 300, 60);
      material.uniforms.uDirLightColor.value = new THREE.Color( 0xFFFFFF );
      
      return material;

  };
  UnitCellAtom.prototype.setVisibility = function(bool) {
    this.visibility = bool;  
    this.object3d.visible = bool; 

  };
  UnitCellAtom.prototype.removesubtractedForCache = function() {
    if(this.subtractedForCache.object3d !== undefined){
      UnitCellExplorer.remove({'object3d' : this.subtractedForCache.object3d});  
      this.subtractedForCache.object3d = undefined;
    } 
  };
  UnitCellAtom.prototype.setNewLodGeometry = function() {

    var chs = this.object3d.children; 
    for (var j = 0, k = chs.length; j < k; j++) {
      chs[j].geometry.dispose();
      chs[j].geometry = globGeometries[this.lod] ;
    }
  };
  UnitCellAtom.prototype.setColorMaterial = function(color, temp) {
    
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
  UnitCellAtom.prototype.coonMode = function(){ 
 
    var phongMaterial = createShaderMaterial("phongDiffuse");
    phongMaterial.uniforms.uMaterialColor.value.copy(new THREE.Color( this.color )); 

    this.object3d.children[0].material = phongMaterial ;
    this.object3d.children[0].material.needsUpdate = true; 
  } 
  UnitCellAtom.prototype.hideSubtracted = function(bool) {
    this.subtractedForCache.object3d.visible = bool;
  };  
  UnitCellAtom.prototype.setOpacity = function(opacity, renderingMode) { 
    
    this.opacity = opacity/10;
    
    if(renderingMode === 'wireframe'){
      return;
    }
    else if(renderingMode === 'flat' || renderingMode === 'realistic' ){
      this.object3d.children[0].material.opacity = this.opacity ;  
      this.object3d.children[0].material.needsUpdate = true; 

      var labelOp = (this.labeling === true) ? this.opacity : 0 ;

      this.object3d.children[1].material.opacity = labelOp ;  
      this.object3d.children[1].material.needsUpdate = true; 
      this.object3d.children[1].material.needsUpdate = true;
    } 
  };
  UnitCellAtom.prototype.setLabeling = function(bool){
    this.labeling = bool;

    if(this.labeling === true){
      this.object3d.children[1].material.opacity = this.opacity ;  
      this.object3d.children[1].material.needsUpdate = true; 
      this.object3d.children[1].material.needsUpdate = true;
    }
    else if(this.labeling === false){
      this.object3d.children[1].material.opacity = 0 ;  
      this.object3d.children[1].material.needsUpdate = true; 
      this.object3d.children[1].material.needsUpdate = true;
    }
  };
  UnitCellAtom.prototype.flatMode = function(bool){
    
    this.object3d.children[0].material =  new THREE.MeshLambertMaterial( { color : this.color, transparent:true, opacity:this.opacity} );  
    this.object3d.children[0].material.needsUpdate = true; 

    var labelOp = (this.labeling === true) ? this.opacity : 0 ;

    this.object3d.children[1].material =  new THREE.MeshLambertMaterial( { color : this.color, transparent:true, opacity:labelOp} );  
    this.object3d.children[1].material.needsUpdate = true;   
  };
  UnitCellAtom.prototype.realisticMode = function(bool){

    this.object3d.children[0].material =  new THREE.MeshPhongMaterial({ specular: 0x050505, shininess : 100, color : this.color, transparent:true, opacity:this.opacity} );  
    this.object3d.children[0].material.needsUpdate = true; 

     var labelOp = (this.labeling === true) ? this.opacity : 0 ;

    this.object3d.children[1].material.opacity = labelOp;  
    this.object3d.children[1].material.needsUpdate = true;    
  };
  UnitCellAtom.prototype.wireframeMat = function(bool){
    this.wireframe = bool ;
    if(bool === true){  
      this.object3d.children[0].material = new THREE.MeshPhongMaterial({ specular: 0x050505, shininess : 100,color : this.color, wireframe: true, opacity:0}) ;
    }
    else{
      this.object3d.children[0].material = new THREE.MeshPhongMaterial({ specular: 0x050505, shininess : 100, color: this.color, transparent:true, opacity:this.opacity }) ;
     
    }
    this.object3d.children[0].material.needsUpdate = true;  
    this.object3d.children[1].material.needsUpdate = true;

    this.object3d.children[1].material.opacity = 0;  
    this.object3d.children[1].material.needsUpdate = true;   
  };
  UnitCellAtom.prototype.subtractedSolidView = function(box, pos, gear) {
    var _this = this; 
    this.viewModeBeen.cellSubstracted = true;
     
    var atomMesh = new THREE.Mesh( new THREE.OctahedronGeometry(this.radius, this.object3d.children[0].geometry.parameters.detail) , new THREE.MeshPhongMaterial() );
    atomMesh.position.set(pos.x, pos.y, pos.z); 

    if(gear === undefined){
      UnitCellExplorer.remove({'object3d':this.object3d});
    } 

    var cube = THREE.CSG.toCSG(box);
    cube = cube.inverse();
    var sphere = THREE.CSG.toCSG(atomMesh);
    var geometry = sphere.intersect(cube);
    var geom = THREE.CSG.fromCSG(geometry);
    var finalGeom = assignUVs(geom);
    
    var sphereCut = THREE.SceneUtils.createMultiMaterialObject( finalGeom, [this.object3d.children[0].material.clone(), this.object3d.children[1].material.clone()]); 
    sphereCut.name = 'subtractedAtom';
    
    sphereCut.children[0].receiveShadow = true; 
    sphereCut.children[0].castShadow = true; 
 
    if(gear !== undefined){
      this.subtractedForCache.object3d  = sphereCut ;
      UnitCellExplorer.add(this.subtractedForCache);
    }
    else{
      this.object3d = sphereCut; 
      UnitCellExplorer.add(this); 
    }

    this.helperPos.x = pos.x ;
    this.helperPos.y = pos.y ;
    this.helperPos.z = pos.z ;

    this.viewMode = 'cellSubstracted'; 
  };
  UnitCellAtom.prototype.removesubtractedForCache = function() {
    if(this.subtractedForCache.object3d !== undefined){
      UnitCellExplorer.remove({'object3d' : this.subtractedForCache.object3d});  
      this.subtractedForCache.object3d = undefined;
    } 
  };
  UnitCellAtom.prototype.SolidVoid = function( pos) {
    var _this = this; 
    this.helperPos.x = pos.x ;
    this.helperPos.y = pos.y ;
    this.helperPos.z = pos.z ;
    this.viewMode = 'cellSolidVoid'; 
    this.viewModeBeen.cellSolidVoid = true;
  };
  UnitCellAtom.prototype.GradeLimited = function() {
    this.viewMode = 'cellGradeLimited' ; 
    this.viewModeBeen.cellGradeLimited = true;
  };
  UnitCellAtom.prototype.classicView = function() {
    var _this = this;
    if(this.viewMode === 'cellGradeLimited'){
      this.viewMode = 'cellClassic'; 
      return;
    }
    var toDestroy = this.object3d;
    var pos = new THREE.Vector3(this.object3d.position.x, this.object3d.position.y, this.object3d.position.z  ); 
  
    var sphere = THREE.SceneUtils.createMultiMaterialObject( globGeometries[this.lod], [ this.colorMaterial ]);
    sphere.scale.set(this.radius, this.radius, this.radius);

    sphere.children[0].receiveShadow = true; 
    sphere.children[0].castShadow = true; 
    sphere.name = 'atom';
    this.object3d = sphere;
    this.object3d.position.x = this.helperPos.x ;
    this.object3d.position.y = this.helperPos.y ;
    this.object3d.position.z = this.helperPos.z ;

    UnitCellExplorer.add(this); 
    UnitCellExplorer.remove({'object3d':toDestroy}); 
  };
  UnitCellAtom.prototype.getUserOffset = function() {
    var _this = this ;
    return this.userOffset ;
  };
  UnitCellAtom.prototype.setUserOffset = function(axes, val) {
    var _this = this ;
    this.userOffset[axes] = val ;
  }; 
 
  UnitCellAtom.prototype.getID = function() {
    var _this = this ;
    return this.myID ;
  };  
  UnitCellAtom.prototype.getName = function() {
    var _this = this ;
    return this.elementName ;
  };
  UnitCellAtom.prototype.setName = function(name) {
    var _this = this ;
    this.elementName = name ;
  };
  UnitCellAtom.prototype.getRadius = function() {
    var _this = this ;
    return this.radius ;
  }; 
  UnitCellAtom.prototype.setMaterial = function(color, renderingMode) {
    var _this = this;
    this.color = color;
 
    if(renderingMode === 'wireframe'){
      this.wireframeMat(true);
    }
    else if(renderingMode === 'flat'){
      this.flatMode();
    }
    else if(renderingMode === 'realistic'){
      this.realisticMode();
    } 

  }; 
  UnitCellAtom.prototype.changeColor = function(color, forTime, renderingMode) { 
    // to change : no need to change material, just change color
    return;
    if(this.renderingMode === 'wireframe'){
      return;
    }
    var _this = this;
    this.color = color ;
    this.object3d.children[0].material = new THREE.MeshBasicMaterial({ color: color  });
    this.object3d.children[0].material.needsUpdate = true;
    setTimeout(function() { 
      _this.object3d.children[0].material = _this.colorMaterial;
      _this.object3d.children[0].material.needsUpdate = true; 
    }, 250);
  }; 
  UnitCellAtom.prototype.destroy = function() {
    UnitCellExplorer.remove(this);
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
  return UnitCellAtom;
});
