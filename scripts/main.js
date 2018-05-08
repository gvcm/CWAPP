 /*unused:false*/
'use strict'; 

require.config({
  baseUrl: 'scripts',
  paths: {
    'pubsub': '../vendor/pubsub',
    'three': '../vendor/three',
    'threejs-controls/OrbitControls': '../vendor/threejs-controls/OrbitControls',
    'threejs-controls/OrbitAndPanControls': '../vendor/threejs-controls/OrbitAndPanControls',
    'underscore': '../vendor/underscore',
    'jquery': '../vendor/jquery',
    'jquery-ui': '../vendor/jquery-ui/jquery-ui',
    'csg': '../vendor/csg',
    'threeCSG': '../vendor/ThreeCSG',
    'keyboardState': '../vendor/keyboardState',
    'rStats': '../vendor/rStats',
    'rStatsExtras': '../vendor/rStatsExtras',
    'leapMotion': '../vendor/leap-0.6.4',
    'icheck': '../vendor/icheck/icheck',
    'jquery.matchHeight': '../vendor/jquery-match-height/jquery.matchHeight-min',
    'bootstrap-select': '../vendor/bootstrap-select/dist/js/bootstrap-select',
    'jquery.mCustomScrollbar.concat.min': '../vendor/malihu-custom-scrollbar/jquery.mCustomScrollbar.concat.min',
    'niceScroll': '../vendor/jquery.nicescroll-latest',
    'bootstrap': '../vendor/bootstrap/assets/javascripts/bootstrap',
    'jColor': '../vendor/colorpicker/spectrum',
    'STLExporter': '../vendor/STLExporter',
    'OBJExporter': '../vendor/OBJExporter',
    'FileSaver': '../vendor/FileSaver',
    'individualAtomController': 'menu_modules/individualAtomController', 
    'stringEditor': 'menu_modules/stringEditor',
    'tooltipGenerator': 'menu_modules/tooltipGenerator',
    'getUIValue': 'menu_modules/getUIValue',
    'setUIValue': 'menu_modules/setUIValue',
    'interfaceResizer': 'menu_modules/interfaceResizer',
    'messages': 'menu_modules/messages',
    'latticeTab': 'menu_modules/latticeTab',
    'pndTab': 'menu_modules/pndTab',
    'motifTab': 'menu_modules/motifTab',
    'visualTab': 'menu_modules/visualTab',
    'libraryTab': 'menu_modules/libraryTab',
    'disableUIElement': 'menu_modules/disableUIElement',
    'notesTab': 'menu_modules/notesTab',
    'menuRibbon': 'menu_modules/menuRibbon',
    'userDialog': 'menu_modules/userDialog',
    'modals': 'menu_modules/modals',
    'menu_html': 'menu_modules/html',
    'dynamictexture': '../vendor/dynamictexture',
    'tag-it': '../vendor/tag-it',
    'jquery.qrcode-0.12.0.min': '../vendor/jquery.qrcode-0.12.0.min',
    'SSAOShader': '../vendor/ssao/SSAOShader',
    'CopyShader': '../vendor/ssao/CopyShader',
    'RenderPass': '../vendor/ssao/RenderPass',
    'MaskPass': '../vendor/ssao/MaskPass',
    'ShaderPass': '../vendor/ssao/ShaderPass',
    'EffectComposer': '../vendor/ssao/EffectComposer',
    'OculusRiftEffect': '../vendor/OculusRiftEffect',
    'html2canvas': '../vendor/html2canvas',
    'jszip': '../vendor/jszip',
    'jszip-utils': '../vendor/jszip-utils',
    'deviceOrientationControls': '../vendor/DeviceOrientationControls',
    'tween': '../vendor/Tween',
    'screenfull': '../vendor/screenfull' 

  },
  shim: {
    'three': { exports: 'THREE' },
    'threejs-controls/OrbitControls': { deps: [ 'three' ] },
    'tween': { deps: [ 'three' ] },
    'keyboardState': { deps: [ 'three' ] },
    'threejs-controls/OrbitAndPanControls': { deps: [ 'three' ] },
    'scg': { deps: [ 'three' ] },
    'threeCSG': { deps: [ 'three' ] },
    'rStats': { deps: [ 'three' ] },
    'STLExporter': { deps: [ 'three' ] },
    'OBJExporter': { deps: [ 'three' ] },
    'dynamictexture': { deps: [ 'three' ] },
    'SSAOShader': { deps: [ 'three' ] },
    'EffectComposer': { deps: [ 'three' ] },
    'ShaderPass': { deps: [ 'three' ] },
    'RenderPass': { deps: [ 'three' ] },
    'MaskPass': { deps: [ 'three' ] },
    'CopyShader': { deps: [ 'three' ] },
    'OculusRiftEffect': { deps: [ 'three' ] },
    'deviceOrientationControls': { deps: [ 'three' ] },
    'jquery.qrcode-0.12.0.min': { deps: [ 'jquery' ] },
    'tag-it': { deps: [ 'jquery' ] },
    'stringEditor': { deps: [ 'jquery' ] },
    'jColor': { deps: [ 'jquery' ] },
    'jquery.mCustomScrollbar.concat.min': { deps: [ 'jquery' ] },
    'niceScroll': { deps: [ 'jquery' ] },
    'bootstrap-select': { deps: [ 'jquery' ] },
    'getUIValue': { deps: [ 'jquery' ] },
    'setUIValue': { deps: [ 'jquery' ] }, 
    'tooltipGenerator': { deps: [ 'jquery' ] },
    'jquery-ui': { deps: [ 'jquery' ] }, 
    'interfaceResizer': { deps: [ 'jquery' ] }, 
    'disableUIElement': { deps: [ 'jquery' ] }, 
    'messages': { deps: [ 'jquery' ] }, 
    'visualTab': { deps: [ 'jquery' ] }, 
    'pndTab': { deps: [ 'jquery' ] }, 
    'userDialog': { deps: [ 'jquery' ] }, 
    'menuRibbon': { deps: [ 'jquery' ] }, 
    'modals': { deps: [ 'jquery' ] }, 
    'motifTab': { deps: [ 'jquery' ] }, 
    'latticeTab': { deps: [ 'jquery' ] }, 
    'libraryTab': { deps: [ 'jquery' ] }, 
    'notesTab': { deps: [ 'jquery' ] }, 
    'icheck': { deps: [ 'jquery' ] },  
    'jquery.matchHeight': { deps: [ 'jquery' ] },  
    'bootstrap': { deps: [ 'jquery-ui' ] }
  }
});

require([
  'pubsub', 
  'underscore', 
  'three', 
  'explorer', 
  'renderer', 
  'orbit', 
  'menu', 
  'lattice',  
  'navArrowsHud',
  'navCubeHud',
  'motifeditor',
  'unitCellExplorer',
  'motifExplorer',
  'mouseEvents',
  'navArrows',
  'navCube',
  'crystalMouseEvents',
  'storeProject',
  'restoreCWstate',
  'sound',
  'animate',
  'gearTour',
  'doll', 
  'dollGearBarMouseEvents', 
  'dollExplorer',
  'keyboardKeys',
  'keyboardState',
  'fullScreen',
  'sceneResizer',
  'rStats', 
  'rStatsExtras', 
  'leapMotionHandler',
  'renderingMode',
  'tabActions',
  'atomCustomizer',
  'STLExporter',
  'OBJExporter',
  'FileSaver',
  'individualAtomController',
  'atomMaterialManager',  
  'atomRelationshipManager', 
  'noteManager',
  'SSAOShader',
  'EffectComposer',
  'ShaderPass',
  'RenderPass',
  'MaskPass',
  'CopyShader',
  'html2canvas',
  'jszip',
  'jszip-utils',
  'menu_html',
  'fitToCrystal',
  'LOD',
  'multitouch',
  'cwState',
  'narrative_system',
  'screenfull', 
  'cp' 

], function(
  PubSub, 
  _, 
  THREE,
  Explorer, 
  Renderer, 
  Orbit, 
  Menu, 
  Lattice,  
  NavArrowsHud, 
  NavCubeHud, 
  Motifeditor, 
  UnitCellExplorer, 
  MotifExplorer, 
  MouseEvents, 
  NavArrows, 
  NavCube, 
  CrystalMouseEvents, 
  StoreProject, 
  RestoreCWstate, 
  Sound, 
  Animate, 
  GearTour, 
  Doll, 
  DollGearBarMouseEvents, 
  DollExplorer, 
  KeyboardKeys, 
  KeyboardState, 
  FullScreen, 
  SceneResizer, 
  RStats, 
  RStatsExtras, 
  LeapMotionHandler,
  RenderingMode,
  TabActions,
  AtomCustomizer,
  STLExporter,
  OBJExporter,
  FileSaver,
  IndividualAtomController,
  AtomMaterialManager,  
  AtomRelationshipManager,
  NoteManager,
  SSAOShader,
  EffectComposer, 
  ShaderPass,
  RenderPass,
  MaskPass,
  CopyShader,
  html2canvas,
  jszip,
  jszipUtils,
  menu_html,
  FitToCrystal,
  LOD,
  Multitouch,
  CwState,
  Narrative_system,
  Screenfull,
  cp

) {
  
  var wereOnMobile = ($(window).width() < 450 || $(window).height() < 450) ? true : false;
  
  var menu = new Menu();
     

  var bSupport = (function () { 
      try { 
        var canvas = document.createElement( 'canvas' ); return !! ( window.WebGLRenderingContext && ( canvas.getContext( 'webgl' ) || canvas.getContext( 'experimental-webgl' ) ) ); 
      } catch ( e ) {
        return false;
      }
  } )(); 
  if(!bSupport){ 
    menu.showWarningDialog({message : '<p> Oops, :-(<br />It seems that your browser does not support WebGL.</p><br/><p>Check out <a href="http://get.webgl.org/">WebGL</a>, or try installing the latest version of: </p><br/></p> <a href="https://www.google.com/chrome">Chrome</a> [ https://www.google.com/chrome ] </p></p><a href="https://www.mozilla.org/en-US/firefox">Firefox</a> [ https://www.mozilla.org/en-US/firefox ]</p>'});
    return; 
  }     
  

  // app's state
  var cwState = crystalWalkState();

  // Scenes 
  var crystalScene = Explorer.getInstance();
  crystalScene.menu = menu;

  var unitCellScene = UnitCellExplorer.getInstance();
  var motifScene = MotifExplorer.getInstance();
 
  var height,width;
 
  var crystalRenderer = new Renderer(crystalScene, 'crystalRenderer', 'crystal' ); 
  crystalRenderer.createPerspectiveCamera(new THREE.Vector3(0,0,0), 30,30,60, 15);
  
  // stlExporter
  var stlExporter = new STLExporter();
 
  // objExporter
  var objExporter = new OBJExporter();

  // crystal scene stats
  var glS = new glStats();
  var tS = new threeStats( crystalRenderer.renderer );

  var rS = rStats(  {
    values: {
      frame: { caption: 'Total frame time (ms)', over: 16 },
      fps: { caption: 'Framerate (FPS)', below: 30 },
      calls: { caption: 'Calls (three.js)', over: 3000 },
      raf: { caption: 'Time since last rAF (ms)' },
      rstats: { caption: 'rStats update (ms)' }
    },
    groups: [
      { caption: 'Framerate', values: [ 'fps', 'raf' ] },
      { caption: 'Frame Budget', values: [ 'frame', 'texture', 'setup', 'render' ] }
    ],
    fractions: [
      { base: 'frame', steps: [ 'texture', 'setup', 'render' ] }
    ],
    plugins: [
      tS,
      glS
    ]
  } );

  crystalRenderer.rS = rS;
  crystalRenderer.glS = glS;

  // sound & animations
  var animationMachine = new Animate(crystalScene);
  var soundMachine = new Sound(animationMachine); 
  animationMachine.soundMachine = soundMachine;
  crystalRenderer.externalFunctions.push(animationMachine.animation.bind(animationMachine));
  crystalRenderer.externalFunctions.push(TWEEN.update.bind(TWEEN));
  
  var lattice = new Lattice(cwState, menu, soundMachine);
  soundMachine.lattice = lattice;

  // HUD  
  var navArrowsScene = NavArrowsHud.getInstance();  
  var hudArrows = new NavArrows(navArrowsScene.object3d, lattice, !wereOnMobile);
    

  var navCubeScene = NavCubeHud.getInstance();  
  var hudCube = new NavCube(navCubeScene.object3d, lattice, !wereOnMobile);
 
  //  WebGL Renderers and cameras
  var displayFactor = 6 ; // changes how big or small will be the Hud 
  crystalRenderer.initHud(navArrowsScene.object3d, navCubeScene.object3d, displayFactor);

  var unitCellRenderer = new Renderer(unitCellScene, 'unitCellRenderer', 'cell');
  unitCellRenderer.createPerspectiveCamera(new THREE.Vector3(0,0,0), 30,30,60, 15);

  var motifRenderer = new Renderer(motifScene, 'motifRenderer','motif'); 
  motifRenderer.createPerspectiveCamera(new THREE.Vector3(0,0,0), 0,0,50, 15);
  motifRenderer.createPerspectiveCamera(new THREE.Vector3(0,0,0), 50,0,0, 15);
  motifRenderer.createPerspectiveCamera(new THREE.Vector3(0,0,0), 0,50,0, 15);

  crystalRenderer.startAnimation();  
  
  var orbitCrystal;
 
  orbitCrystal = new Orbit(
    crystalRenderer.getMainCamera(), 
    '#crystalRendererMouse',   
    "perspective",  
    false, 
    'crystal', 
    undefined,
    [crystalRenderer.getHudCameraCube(), crystalRenderer.getHudCamera()],
    'cardBoard'
  ); 
 
   
  soundMachine.crystalCameraOrbit = orbitCrystal ;
   
  var orbitUnitCell = new Orbit(unitCellRenderer.getMainCamera(), '#unitCellRendererMouse',  "perspective",  false, 'cell');
 
  orbitUnitCell.setSyncedCamControl(orbitCrystal);
  orbitCrystal.setSyncedCamControl(orbitUnitCell); 
 
  var motifCamX = new Orbit(motifRenderer.getSpecificCamera(0), '#motifPosX', "perspective", true, 'motif'   );
  var motifCamY = new Orbit(motifRenderer.getSpecificCamera(1), '#motifPosY', "perspective", true, 'motif'   );
  var motifCamZ = new Orbit(motifRenderer.getSpecificCamera(2), '#motifPosZ', "perspective", true, 'motif'   );

  crystalRenderer.onAnimationUpdate(orbitCrystal.update.bind(orbitCrystal));

  unitCellRenderer.onAnimationUpdate(orbitUnitCell.update.bind(orbitUnitCell)); 

  motifRenderer.onAnimationUpdate(motifCamX.update.bind(motifCamX));
  motifRenderer.onAnimationUpdate(motifCamY.update.bind(motifCamY));
  motifRenderer.onAnimationUpdate(motifCamZ.update.bind(motifCamZ));

  // Motif editor
  var motifEditor = new Motifeditor(cwState, menu, soundMachine); 
 
  var dragNdropXevent = new MouseEvents(motifEditor, 'dragNdrop', motifRenderer.getSpecificCamera(0), 'motifPosX');
  var dragNdropYevent = new MouseEvents(motifEditor, 'dragNdrop', motifRenderer.getSpecificCamera(1), 'motifPosY');
  var dragNdropZevent = new MouseEvents(motifEditor, 'dragNdrop', motifRenderer.getSpecificCamera(2), 'motifPosZ');

  // navigation cube
  var CubeEvent = new MouseEvents(lattice, 'navCubeDetect', crystalRenderer.hudCameraCube, 'hudRendererCube',  [orbitUnitCell,orbitCrystal], soundMachine, hudCube );
  CubeEvent.enableCubeEvents = !wereOnMobile ;

  // Gear Bar Tour
  var gearTour = new GearTour(crystalScene, motifEditor, lattice, menu);

  // storing mechanism  
  var storeMechanism = new StoreProject( lattice, motifEditor, crystalRenderer.getMainCamera(), unitCellRenderer.getMainCamera(),motifRenderer.getSpecificCamera(0),motifRenderer.getSpecificCamera(1),motifRenderer.getSpecificCamera(2), crystalRenderer, stlExporter, menu, gearTour );
 
  // handel keyboard keys
  var keyboardControl = new THREEx.KeyboardState();
  var keyboard = new KeyboardKeys(keyboardControl, crystalScene, orbitCrystal, motifEditor, crystalRenderer, lattice);
  animationMachine.keyboard = keyboard;
  crystalRenderer.externalFunctions.push(keyboard.handleKeys.bind(keyboard));
  crystalRenderer.externalFunctions.push(crystalScene.updateXYZlabelPos.bind(crystalScene, crystalRenderer.getMainCamera()));

  // CW Doll
  var dollScene = DollExplorer.getInstance();  
  crystalRenderer.setDoll(dollScene.object3d ); 
  var dollEditor = new Doll(crystalRenderer.dollCamera, crystalScene, orbitCrystal, lattice, animationMachine, keyboard, soundMachine, gearTour, menu, !wereOnMobile);
  crystalRenderer.setDoll(undefined, dollEditor.doll);  
  //dollEditor.rePosition(); 
  

  // doll and gear tour mouse events
  var dollGearBarME = new DollGearBarMouseEvents(crystalRenderer.dollCamera, orbitCrystal, lattice, dollEditor, soundMachine, animationMachine, keyboard, gearTour, menu, crystalScene);
  orbitCrystal.dollOnDocumentMouseDown(dollGearBarME.onDocumentMouseDown.bind(dollGearBarME)) ;
  storeMechanism.dollGearBarME = dollGearBarME;

  // atom customizer
  var atomCustomizer = new AtomCustomizer(lattice, soundMachine, dollEditor, menu, orbitCrystal, crystalScene);
  keyboard.atomCustomizer = atomCustomizer;
  
  // mouse events happen in crytal screen 
  var crystalScreenEvents = new CrystalMouseEvents(lattice, crystalRenderer.getMainCamera(), 'crystalRendererMouse', 'default', dollEditor, atomCustomizer, keyboardControl);

  // full screen
  var fullScreen = new FullScreen();

  // resizer
  var sceneResizer = new SceneResizer(crystalRenderer, motifRenderer, unitCellRenderer, displayFactor, dollEditor, hudCube);
  $( document ).ready(function() {
    sceneResizer.resize( 'crystal');
  });
  window.addEventListener('resize', function () {
    sceneResizer.resize( crystalScreenEvents.state);
  }, false);

  // leap motion
  var leapM = new LeapMotionHandler(lattice, motifEditor, orbitCrystal, soundMachine, dollEditor, keyboard, crystalScene, crystalRenderer.getMainCamera(), animationMachine);

  // rendering modes
  var renderingModes = new RenderingMode(crystalScene, unitCellScene, motifScene);
  var tabActionsManager = new TabActions(lattice, motifEditor, crystalRenderer, unitCellRenderer,crystalScreenEvents, motifRenderer, dollEditor, hudCube, hudArrows, CubeEvent, sceneResizer, gearTour);

  // material manager
  var crystalScene = Explorer.getInstance();

  var atomMaterialManager = AtomMaterialManager.getInstance(lattice, motifEditor);
  var atomRelationshipManager =  new AtomRelationshipManager(lattice, motifEditor);
   
  motifEditor.atomRelationshipManager = atomRelationshipManager;
  lattice.atomRelationshipManager = atomRelationshipManager;
  
  // lod
  var lod = new LOD(lattice, motifEditor, menu);
  storeMechanism.LOD = lod;

  // restoring
  var restoreMechanism = new RestoreCWstate(menu, lattice, motifEditor, orbitCrystal, orbitUnitCell, motifRenderer.getSpecificCamera(0),motifRenderer.getSpecificCamera(1),motifRenderer.getSpecificCamera(2), crystalRenderer, unitCellRenderer, crystalScene, unitCellScene, hudCube, hudArrows, motifRenderer, soundMachine, atomMaterialManager, renderingModes, gearTour, dollEditor, lod, dollGearBarME, sceneResizer);
  
  // NoteManager
  var noteManager = new NoteManager(lattice, menu, crystalScene, crystalRenderer.getMainCamera());
 
  crystalRenderer.externalFunctions.push(noteManager.updateNotesPositions.bind(noteManager)); 

  // fit camera to crystal 
  var fitToCrystal = new FitToCrystal(orbitCrystal, lattice, crystalRenderer, crystalScene);
  storeMechanism.fitToCrystal = fitToCrystal;

  // for menu - to be removed!
  menu.toggleExtraParameter('i', 'none');
  menu.toggleExtraParameter('t', 'none');
  $('dirRadius').selectpicker('val',20);

  //////////// for menu - to be removed!

  // multi touch events for tablets,mobiles etc.
  var domElTOTouch = document;
  var mtEvents = new Multitouch(domElTOTouch, keyboard, crystalScene, orbitCrystal, crystalRenderer.getMainCamera());
  //dollGearBarME.multitouch = mtEvents;

  var narrative_system = new Narrative_system(lattice, orbitCrystal, animationMachine, crystalScene );
  storeMechanism.narrative_system = narrative_system;
  restoreMechanism.narrative_system = narrative_system;

  // experimental feature  
  orbitCrystal.syncCams(true);
  orbitUnitCell.syncCams(true);
 
  
  // lattice events binding
  menu.onLatticeChange(function(message, latticeName) {
    restoreMechanism.globalReset();
    lattice.load(latticeName);
    motifEditor.latticeName = latticeName;
    dollGearBarME.setWalkStep(2); 
     
    dollEditor.gearState = 2;
     
  });
  menu.onLatticeParameterChange(function(message, latticeParameters) {  
     
    gearTour.crystalHasChanged = true;  
    
    lattice.setParameters(latticeParameters); 
    motifEditor.updateFixedDimensions(latticeParameters);

    var params = lattice.getParameters();

    crystalScene.updateShadowCameraProperties( params);

  });
  menu.onLatticeParameterChangeForHud(function(message, latticeParameters) {  
  
    hudArrows.updateLengths(latticeParameters);
    hudArrows.updateAngles(latticeParameters);  
    hudCube.updateAngles(latticeParameters);
    crystalScene.updateAbcAxes(latticeParameters, crystalRenderer.getMainCamera());
    motifScene.updateAbcAxes(latticeParameters, motifRenderer.getMainCamera());
    unitCellScene.updateAbcAxes(latticeParameters, unitCellRenderer.getMainCamera());
  });
  // grade
  menu.onGradeParameterChange(function(message, gradeParameters) {  
    lattice.setGrade(gradeParameters);
    noteManager.setLineRadius(gradeParameters);
  });
  menu.onGradeChoices(function(message, gradeChoices) {
    lattice.setGradeChoices(gradeChoices); 
  });

  // miller
  menu.onDirectionalSubmit(function(message, millerParameters) {  
    lattice.millerParameters = millerParameters ;
    lattice.submitDirectional(millerParameters);
  });
  menu.onPlaneSubmit(function(message, millerParameters) {
    lattice.millerParameters = millerParameters ;
    lattice.submitPlane(millerParameters);
  });
  menu.directionSelection(function(message, which) {
    lattice.selectDirection(which);
  });
  menu.directionParameterChange(function(message, arg) {  
    lattice.directionParameterChange(arg);
  });
  menu.planeParameterChange(function(message, arg) { 
    lattice.planeParameterChange(arg);
  });
  menu.planeSelection(function(message, which) {
    lattice.selectPlane(which);
  });
  menu.onPlaneVisibility(function(message, arg) {
    lattice.planeVisibility(arg);
  });
  menu.onDirectionVisibility(function(message, arg) {
    lattice.directionVisibility(arg);
  });
  lattice.onPlaneStateChange(function(message, state) {
    lattice._planeState(state);
  });
  lattice.onDirectionStateChange(function(message, state) {
    lattice.directionState(state);
  });  
  menu.setAnaglyphCrystal(function(message, arg) {
    crystalRenderer.initAnaglyph(arg); 
  }); 
  menu.setAnaglyphUnitCell(function(message, arg) {  
    //motifRenderer.setAnaglyph({ anaglyph : arg.anaglyphCell});
    unitCellRenderer.initAnaglyph({ anaglyph : arg.anaglyphCell});
  }); 
  menu.onSoundsSet(function(message, arg) { 
    soundMachine.switcher(arg.sounds); 
  });
  menu.onRadiusToggle(function(message, arg) { 
    lattice.toggleRadius(arg); 
  });
  menu.onAtomPosModeChange(function(message, arg) { 
    motifEditor.atomPosMode(arg); 
  });
  menu.onSoundVolume(function(message, arg) {   
    soundMachine.changeVolume(arg); 
  });
  menu.on3DPrinting(function(message, arg) {  
    var scene = new THREE.Scene(); 
    stlExporter.saveSTL(crystalScene.object3d, 'stl_FIle', arg.resolution);
  });
  menu.onOBJsave(function(message, arg) {  
    var scene = new THREE.Scene(); 
    objExporter.saveOBJ(crystalScene.object3d, 'obj_file', arg.resolution);
  });
  menu.onSwapScreen(function(message, arg) {  
    tabActionsManager.tabClick(arg.swap, wereOnMobile);
    if(arg.swap === 'latticeTab'){ 
      crystalScreenEvents.state = 'default';
    }
    else if(arg.swap === 'motifTab'){
      crystalScreenEvents.state = 'motifScreen';
    } 
  });
  menu.onLightsSet(function(message, arg) {
    crystalScene.setLightProperties(arg);
    unitCellScene.setLightProperties(arg); 
  });
  menu.onLeapMotionSet(function(message, arg) {  
    leapM.toggle(arg.leap);
  });
  menu.onFogParameterChange(function(message, arg) { 
    crystalScene.setFogProperties(arg);
  });
  menu.onFogChange(function(message, arg) { 
    crystalScene.setFogProperties(arg);
  });
  menu.onRendererColorChange(function(message, arg) { 
     
    if(!_.isUndefined(arg.crystalScreenColor)){ 
      crystalRenderer.backgroundColor = ('#'+arg.crystalScreenColor);
    }
    else if(!_.isUndefined(arg.cellScreenColor)){ 
      unitCellRenderer.backgroundColor = ('#'+arg.cellScreenColor);
    } 
    else if(!_.isUndefined(arg.motifXScreenColor)){ 
      motifRenderer.viewportColors[0] = ('#'+arg.motifXScreenColor);
    } 
    else if(!_.isUndefined(arg.motifYScreenColor)){  
      motifRenderer.viewportColors[1] = ('#'+arg.motifYScreenColor);
    } 
    else if(!_.isUndefined(arg.motifZScreenColor)){  
      motifRenderer.viewportColors[2] = ('#'+arg.motifZScreenColor);
    } 
  });
  
  // motif editor events binding
  $("#list li").click(function(e) {
    tabActionsManager.tabClick($(this).attr('id'), wereOnMobile);
  }); 
  menu.atomSelection(function(message , arg) {
    
    motifEditor.selectElem(arg); 
    var parameters = motifEditor.getDimensions() ;
    lattice.setMotif(motifEditor.getMotif(), parameters) ;
    
    dollGearBarME.setWalkStep(3);
    dollEditor.levelLabels[2].allowed = true;  
    dollEditor.levelLabels[3].allowed = true;
    dollEditor.levelLabels[4].allowed = true;
    dollEditor.levelLabels[5].allowed = true;
 
    gearTour.setState(6, true);
    dollEditor.gearState = 6;

    atomRelationshipManager.checkCrystalforOverlap(); 
    motifEditor.checkCellForCollisions();
    motifEditor.checkMotifForCollisions();
  
    var params = lattice.getParameters();

    crystalScene.updateShadowCameraProperties( params);

    var p = new THREE.Vector3(parameters.x, parameters.y, parameters.z);
     
    unitCellScene.updateShadowCameraProperties( p.length()*2);
      
    var t = orbitCrystal.control.target.clone();

    fitToCrystal.fit({ target : t}); 
  
    var storeBoll = orbitCrystal.control.syncCams; 
    orbitCrystal.syncCams(storeBoll);
    orbitUnitCell.syncCams(storeBoll);

    hudArrows.updateLengths(params); 
  }); 
  motifEditor.onEditorStateChange(function(message, state) {
    motifEditor.editorState_(state);
  }); 
  menu.onAtomCustomization(function(message, arg) {
    atomCustomizer.customizeAtom(arg);
  }); 
  menu.onAtomSubmit(function(message, atomParam) {
    var parameters = motifEditor.getDimensions() ;
    if(atomParam.button === 'saveChanges'){
      
      lattice.setMotif(motifEditor.getMotif(), parameters)  ;
      
      var params = {
        alpha : parameters.alpha,
        beta : parameters.beta,
        gamma : parameters.gamma, 
        scaleX : parameters.x,
        scaleY : parameters.y,
        scaleZ : parameters.z,
      }
      hudArrows.updateLengths(params);
      hudArrows.updateAngles(params); 
      hudArrows.setVisibility();
      hudCube.updateAngles(params);
      crystalScene.updateAbcAxes(params, crystalRenderer.getMainCamera());
      motifScene.updateAbcAxes(params, crystalRenderer.getMainCamera());
      unitCellScene.updateAbcAxes(params, crystalRenderer.getMainCamera());
      motifEditor.submitAtom(atomParam); 
    }
    else if(atomParam.button === 'deleteAtom'){
      motifEditor.submitAtom(atomParam);
      
      lattice.setMotif(motifEditor.getMotif(), parameters) ;
      
      var params = {
        alpha : parameters.alpha,
        beta : parameters.beta,
        gamma : parameters.gamma, 
        scaleX : parameters.x,
        scaleY : parameters.y,
        scaleZ : parameters.z,
      }
      hudArrows.updateLengths(params);
      hudArrows.updateAngles(params); 
      hudArrows.setVisibility();
      hudCube.updateAngles(params);
      crystalScene.updateAbcAxes(params, crystalRenderer.getMainCamera());
      motifScene.updateAbcAxes(params, crystalRenderer.getMainCamera());
      unitCellScene.updateAbcAxes(params, crystalRenderer.getMainCamera());
    } 

    motifEditor.checkCellForCollisions();
    atomRelationshipManager.checkCrystalforOverlap();
    motifEditor.checkMotifForCollisions();

    var params = lattice.getParameters();

    crystalScene.updateShadowCameraProperties( params);
 
    var p = new THREE.Vector3(parameters.x, parameters.y, parameters.z);
    unitCellScene.updateShadowCameraProperties( p.length()/2); 
  });
  menu.savedAtomSelection(function(message, which) { 
    motifEditor.selectAtom(which);
  });
  menu.onTangentR(function(message, arg) { 
    motifEditor.changeTangentR(arg);
  });
  menu.onAtomParameterChange(function(message, param) { 
    motifEditor.setAtomsParameter(param);
  });
  menu.onAtomPositionChange(function(message, param) {  
    motifEditor.setAtomsPosition(param);
  }); 
  menu.onManuallyCellVolumeChange(function(message, param) { 
    motifEditor.setManuallyCellVolume(param);
  });  
  menu.onAtomVisibility(function(message, param) { 
    motifEditor.atomVisibility(param); 
    lattice.atomVisibility(param); 
  }); 
  menu.onFixedLengthChange(function(message, param) {  
    motifEditor.padlockMode(param); 
  }); 
  menu.padlockSet(function(message, param) {  
    motifEditor.padlockMode(param); 
  });  
  menu.fullScreenApp(function(message, param) {  
    fullScreen.fs();
  });   
  menu.onCameraSyncChange(function(message, param) { 
    var cellCamera = unitCellRenderer.getMainCamera();
    var crystalCamera = crystalRenderer.getMainCamera();

    if(param.syncCameras === true){   
      
      cellCamera.position.set( crystalCamera.position.x, crystalCamera.position.y, crystalCamera.position.z );   
      orbitUnitCell.control.target = orbitCrystal.control.target.clone();
      orbitCrystal.syncCams(true);
      orbitUnitCell.syncCams(true); 
    }
    else
    {  

      orbitUnitCell.control.target = new THREE.Vector3(0,0,0);
      orbitCrystal.syncCams(false);
      orbitUnitCell.syncCams(false);
    }
  });  
  menu.onCameraDistortionChange(function(message, mode){  
    var cPos = crystalRenderer.cameras[0].position ;
    var currDistance = (crystalRenderer.cameras[0].position).distanceTo(new THREE.Vector3(0,0,0)) ;
    var vFOV = crystalRenderer.cameras[0].fov * Math.PI / 180;         
    var Visheight = 2 * Math.tan( vFOV / 2 ) * currDistance;   

    if(mode.distortion === true){
      crystalRenderer.cameras[0].fov = 75;
      var distance = Visheight/(2 * Math.tan( (75* Math.PI / 180) / 2 ) );
      var factor = distance/currDistance; 
      crystalRenderer.cameras[0].position.set(cPos.x * factor, cPos.y * factor, cPos.z * factor);
    }
    else{ 
      crystalRenderer.cameras[0].fov = 15;
      var distance = Visheight/(2 * Math.tan( (15* Math.PI / 180) / 2 ) );
      var factor = distance/currDistance; 
      crystalRenderer.cameras[0].position.set(cPos.x * factor, cPos.y * factor, cPos.z * factor);
    } 
  });
  menu.cellDimensionChange(function(message, param){ 
    motifEditor.updateCellDimens(param) ;
  });
  menu.motifToLattice(function(message, param){
    
    var parameters = motifEditor.getDimensions() ;
    
    lattice.setMotif(motifEditor.getMotif(), parameters) ; 
    
    var params = {
      alpha : parameters.alpha,
      beta : parameters.beta,
      gamma : parameters.gamma, 
      scaleX : parameters.x,
      scaleY : parameters.y,
      scaleZ : parameters.z,
    };

    hudArrows.updateLengths(params);
    hudArrows.updateAngles(params); 
    hudArrows.setVisibility();
    hudCube.updateAngles(params);
    crystalScene.updateAbcAxes(params, crystalRenderer.getMainCamera());
    motifScene.updateAbcAxes(params, crystalRenderer.getMainCamera());
    unitCellScene.updateAbcAxes(params, crystalRenderer.getMainCamera());

    atomRelationshipManager.checkCrystalforOverlap();
    motifEditor.checkCellForCollisions();

    var params = lattice.getParameters();

    crystalScene.updateShadowCameraProperties( params);

    var p = new THREE.Vector3(parameters.x, parameters.y, parameters.z);
    unitCellScene.updateShadowCameraProperties( p.length()/2);
  
  });
  menu.setDragMode(function(message, param){
    motifEditor.setDraggableAtom(param)  ;
  });
  menu.onRotatingAngleChange(function(message, param){ 
    motifEditor.changeRotatingAngle(param)  ;
  }); 
  menu.onUnitCellChange(function(message, which) { 
    motifEditor.setCSGmode(which);
  });
  menu.onCrystalChange(function(message, which) {  
    lattice.setCSGmode(which);
  });
  menu.onDialogResult(function(message, arg) { 

    // TODO improve this. it is just a workaround

    if(motifEditor.whichToConfirm !== undefined){
      motifEditor.getConfirmationAnswer(arg);
    }
    else{
      lattice.getConfirmationAnswer(arg);
    }
    
  });
  menu.onUnitCellViewport(function(message, arg) { 
    if(arg.unitCellViewport === true){ 
      sceneResizer.ucViewPortActive = true;
      sceneResizer.showViewport({'viewport' : 'unitCell', 'active' : true});
      unitCellRenderer.startAnimation();

      var cellCamera = unitCellRenderer.getMainCamera();
      var crystalCamera = crystalRenderer.getMainCamera();
      
      fitToCrystal.fit();

      cellCamera.position.set( crystalCamera.position.x, crystalCamera.position.y, crystalCamera.position.z );   
      orbitUnitCell.control.target = orbitCrystal.control.target.clone();
      orbitCrystal.syncCams(true);
      orbitUnitCell.syncCams(true); 
      

    }
    else{ 
      sceneResizer.ucViewPortActive = false;
      sceneResizer.showViewport({'viewport' : 'unitCell', 'active' : false});
      unitCellRenderer.stopAtomAnimation();
 
      orbitUnitCell.control.target = new THREE.Vector3(0,0,0);
      orbitCrystal.syncCams(false);
      orbitUnitCell.syncCams(false);
       
    }
     
    unitCellRenderer.setUCviewport(arg.unitCellViewport);
  });
  menu.onRendModeChange(function(message, arg) { 

    lattice.renderingModeChange(arg);
    motifEditor.renderingModeChange(arg); 
    renderingModes.setMode(arg); 

    if(arg.mode === 'toon'){
      crystalRenderer.setGamma(true);
      unitCellRenderer.setGamma(true);
    }
    else{
      crystalRenderer.setGamma(false);
      unitCellRenderer.setGamma(false);
    }

  }); 
  menu.onPlaneToggle(function(message, arg) {  
    lattice.planeToggle(arg);
  }); 
  menu.onDirectionToggle(function(message, arg) { 
    lattice.directionToggle(arg);
  }); 
  menu.onAtomToggle(function(message, arg) { 
    lattice.atomToggle(arg);
  }); 
  menu.onLatticePointsToggle(function(message, arg) { 
    lattice.togglePoints(arg);
  }); 
  menu.onAxisModeChange(function(message, arg) { 
    crystalScene.axisMode(arg);
    motifScene.axisMode(arg);
    unitCellScene.axisMode(arg);
  });  
  menu.onLeapTrackingSystemChange(function(message, arg) { 
    leapM.selectTS(arg);
  });  
  menu.onPlaneParallel(function(message, arg) { 
    lattice.parallelPlane(arg);
  }); 
  menu.onAtomTangencyChange(function(message, arg) { 
    motifEditor.setTangency(arg);
  });
  menu.onPlaneInterception(function(message, arg) { 
    lattice.interceptedPlane(arg);
  }); 
  menu.targetOfCamChange(function(message, arg) {  
    if(arg.center){
      orbitCrystal.control.target = new THREE.Vector3(0,0,0) ;
    }
    else{ 

      var g = lattice.customBox(lattice.viewBox);
      var centroid = new THREE.Vector3(0,0,0);

      if(g !== undefined){ 
        centroid = new THREE.Vector3(); 
        for ( var z = 0, l = g.vertices.length; z < l; z ++ ) {
          centroid.add( g.vertices[ z ] ); 
        }  
        centroid.divideScalar( g.vertices.length );
      }
 
      orbitCrystal.control.target = centroid ;
    } 
  });
  menu.onManuallyCellDimsChange(function(message, param) { 
    motifEditor.setManuallyCellLengths(param);
  });
  menu.onManuallyCellAnglesChange(function(message, param) { 
    motifEditor.setManuallyCellAngles(param);
  });
  lattice.onLoad(function(message, lattice) {
    if (_.isObject(lattice)) {  
      menu.setLatticeParameters(lattice.defaults);   
      motifEditor.setLatticeParameters(lattice);  
      menu.setLatticeRestrictions(lattice.restrictions);
      dollEditor.levelLabels[1].allowed = true;
    }
  });
  menu.onLabelToggle(function(message, arg) { 
    atomMaterialManager.setLabels(arg);
  }); 
  menu.onHighlightTangency(function(message, arg) { 
    atomRelationshipManager.checkForOverlap(arg); 
  }); 
  menu.onReset(function(message, arg) { 
    restoreMechanism.globalReset(arg); 
  });
  menu.updateNotes(function(message, arg) { 
    noteManager.addNote(arg); 
  });
  menu.onNoteVisibility(function(message, arg) { 
    noteManager.noteVisibility(arg); 
  });
  menu.onNoteMovement(function(message, arg) { 
    noteManager.noteMove(arg, 'note'); 
  });
  menu.onNoteColor(function(message, arg) { 
    noteManager.setLineColor(arg ); 
  });
  menu.onShadowsChange(function(message, arg) { 
    crystalRenderer.shadowing(arg);
    unitCellRenderer.shadowing(arg);
  });
  menu.onSSAOChange(function(message, arg) { 
    crystalRenderer.ssaoEffect(arg);
    unitCellRenderer.ssaoEffect(arg);
  }); 
  menu.onDownloadProject(function(message, arg) { 
    storeMechanism.downloadProject(arg);
  });
  menu.onSaveOnline(function(message, arg) { 
    storeMechanism.saveOnline(arg);
  }); 
  menu.onExportJSON(function(message, arg) { 
    storeMechanism.exportJSON(arg);
  });
  $(document).keyup(function(e) {
    if (e.keyCode === 27 && (crystalScreenEvents.state === 'oculusCrystal' || crystalScreenEvents.state === 'oculusCrystal')) { // escape key maps to keycode `27`
      
      dollEditor.setVisibility(true); 
      hudCube.setVisibility(true);
      hudArrows.setVisibility(true);
      CubeEvent.enableCubeEvents = true ;
      sceneResizer.resize('crystal');
      crystalRenderer.initOculusEffect({oculus : false}); 
      crystalRenderer.initCardBoard({onTop : false}); 
      crystalScreenEvents.state = 'default';
    }
  });
  menu.setOculusCrystal(function(message, arg) { 
    if(arg.oculus === true){  
      dollEditor.setVisibility(!arg.oculus); 
      hudCube.setVisibility(!arg.oculus);
      hudArrows.setVisibility(!arg.oculus);
      CubeEvent.enableCubeEvents = !arg.oculus ;
      sceneResizer.resize('oculusCrystal');
      crystalRenderer.initOculusEffect(arg); 
      crystalScreenEvents.state = 'oculusCrystal';
      fullScreen.fs(); 
    }
  });
  menu.onSideBySide3DCrystal(function(message, arg) { 
    dollEditor.setVisibility(!arg.stereo); 
    hudCube.setVisibility(!arg.stereo);
    hudArrows.setVisibility(!arg.stereo);
    CubeEvent.enableCubeEvents = !arg.stereo ; 
    crystalRenderer.initStereoEffect(arg);
  });
  menu.onOnTop3DCrystal(function(message, arg) { 
    dollEditor.setVisibility(!arg.onTop); 
    hudCube.setVisibility(!arg.onTop);
    hudArrows.setVisibility(!arg.onTop);
    CubeEvent.enableCubeEvents = !arg.onTop ; 

    orbitCrystal.disableUpdate = arg.stereo;
 
    if(arg.onTop){ 
      dollEditor.setVisibility(!arg.onTop); 
      hudCube.setVisibility(!arg.onTop);
      hudArrows.setVisibility(!arg.onTop);
      CubeEvent.enableCubeEvents = !arg.onTop ;
      sceneResizer.resize('oculusCrystal');
       
      crystalScreenEvents.state = 'oculusCrystal';
      fullScreen.fs(); 
      
      crystalRenderer.initCardBoard(arg);
    }
  });
  menu.setOculusUnitCell(function(message, arg) {  
    unitCellRenderer.initOculusEffect({oculus : arg.oculusCell});
  });
  menu.onSideBySide3DUnitCell(function(message, arg) {  
    unitCellRenderer.initStereoEffect({sideBySide : arg.sideBySideCell});
  });
  menu.onExportPNG(function(message, arg) { 
    if(arg.pngOptions.frameIT){ 
      var storeBoll = orbitCrystal.control.syncCams;
      orbitCrystal.syncCams(false);
      orbitUnitCell.syncCams(false);
      fitToCrystal.fit(); 
      orbitCrystal.syncCams(storeBoll);
      orbitUnitCell.syncCams(storeBoll);
    }
     
    storeMechanism.exportPNG(arg);
  });
  menu.onLowRenderizationQuality(function(message, arg) { 
    lod.setLOD({lod:2});
    crystalRenderer.shadowing({shadows:false});
    unitCellRenderer.shadowing({shadows:false}); 
    crystalRenderer.ssaoEffect({ssao : false});
    unitCellRenderer.ssaoEffect({ssao : false}); 
  });
  menu.onMediumRenderizationQuality(function(message, arg) { 
    lod.setLOD({lod:3});
    crystalRenderer.shadowing({shadows:false});
    unitCellRenderer.shadowing({shadows:false}); 
    crystalRenderer.ssaoEffect({ssao : true});
    unitCellRenderer.ssaoEffect({ssao : true}); 
  });
  menu.onHighRenderizationQuality(function(message, arg) { 
    lod.setLOD({lod:4});
    crystalRenderer.shadowing({shadows:true});
    unitCellRenderer.shadowing({shadows:true}); 
    crystalRenderer.ssaoEffect({ssao : true});
    unitCellRenderer.ssaoEffect({ssao : true}); 
  });
  menu.onToggleVisibilityInUC(function(message, arg) { 
    var motifVis = (motifEditor.latticeName === 'hexagonal') ? 'hc_000' : '_000';
  
    if(arg.toggleMotifVisibilityInUC === true){
      motifEditor.toggleVisibilityByLatticeIndex(motifVis, true);
    }
    else if(arg.toggleMotifVisibilityInUC === false){
       motifEditor.toggleVisibilityByLatticeIndex('nonexistent', false);
    }
     
  });
  menu.onOpenJSON(function(message, arg) { 
    restoreMechanism.configureState(arg);
  }); 
  menu.onLOD(function(message, arg) { 
    lod.setLOD(arg);
    //lattice.setOctahedronDetail(arg);
    //motifEditor.setOctahedronDetail(arg);
  }); 
  menu.onNoteSelectForSystem(function(message, arg) { 
    narrative_system.enableNoteState(arg);
  });
  menu.onNoteDeleteForSystem(function(message, arg) { 
   narrative_system.deleteNoteState(arg);
  });
  menu.onNoteSaveForSystem(function(message, arg) { 
    narrative_system.saveNoteState(arg);
  });

  menu.onCardBoard(function(message, arg) { 
     
    if(arg.toggle === true){
       
      if (screenfull.enabled) {
        screenfull.request();
      } 
      orbitCrystal.deviceOrientationControlsActive = true;
       
      crystalScreenEvents.state = 'oculusCrystal';
      
      crystalRenderer.renderer.domElement.addEventListener('click', fullScreen.fs, true);

      crystalRenderer.initCardBoard({onTop : true}); 
      sceneResizer.resize('oculusCrystal');
    }
    else if(arg.toggle === false){
      
      if (screenfull.enabled) {
        screenfull.exit();
      } 

      orbitCrystal.deviceOrientationControlsActive = false;
        
      crystalScreenEvents.state = 'default';
      
      crystalRenderer.renderer.domElement.addEventListener('click', fullScreen.fs, false);

      crystalRenderer.initCardBoard({onTop : false}); 
      sceneResizer.resize('crystal');
  
    }
  });

  // menu.aNoteWasJustSavedDearSystem(function(message, arg) {  
  //   var p = crystalRenderer.getMainCamera().position.clone();
  //   var t = orbitCrystal.control.target.clone();

  //   menu.doSmthWithSystemCamState({
  //     position : {
  //       x:p.x,
  //       y:p.y,
  //       z:p.z
  //     },
  //     target : {
  //       x : t.x,
  //       y : t.y,
  //       z : t.z
  //     },
  //     id : arg.id
  //   });
  // }); 

   
  // menu.publishCameraState(function(message, arg) { 
 
  //   var cam = crystalRenderer.getMainCamera() ; 

  //   orbitCrystal.control.target.x = arg.data.target.x;
  //   orbitCrystal.control.target.y = arg.data.target.y;
  //   orbitCrystal.control.target.z = arg.data.target.z;

  //   cam.position.x = arg.data.position.x;
  //   cam.position.y = arg.data.position.y;
  //   cam.position.z = arg.data.position.z;
  // });  

  ///////////////////// TO BE DELETED - EXPERIMENTAL FEATURE

  var fullWidth =  $(window).width();
  var fullHeight =  $(window).height();

  var menuWidth = (1*fullWidth/1.5);
  var menuHeight = (7*fullHeight/8);

  var menuleft = (fullWidth/6);
  var menuTop = (fullHeight/9);
  
  $("#secretMenu").css({
    "width" : menuWidth/2+'px',
    "height" : menuHeight+'px',
    "left" : menuleft*2+'px',
    "top" : menuTop+'px'

  }); 
  //

  $("#blue1").css({ 
    "position" : 'absolute',
    "background-color" : 'blue', 
    "width" : (2*menuWidth/12 )+'px',
    "left" : ( menuWidth/12)+'px', 
    "height" : (2*menuWidth/12)+'px',
    "top" :  menuHeight/20+'px'  
  });

  $("#red1").css({ 
    "position" : 'absolute',
    "background-color" : 'red', 
    "width" : (2*menuWidth/12 )+'px',
    "left" : ( menuWidth/12)+'px', 
    "height" : (2*menuWidth/12)+'px',
    "top" :  ( (2*menuWidth/12 ) + 2*menuHeight/20 )+'px'  
  });

  $("#red2").css({ 
    "position" : 'absolute',
    "background-color" : 'red', 
    "width" : (2*menuWidth/12 )+'px',
    "left" : ( menuWidth/12 +  2*menuWidth/12 + menuHeight/20   )+'px', 
    "height" : (2*menuWidth/12)+'px',
     "top" :  menuHeight/20+'px' 
  });

  $("#blue2").css({ 
    "position" : 'absolute',
    "background-color" : 'blue', 
    "width" : (2*menuWidth/12 )+'px',
    "left" : ( menuWidth/12 +  2*menuWidth/12 + menuHeight/20   )+'px', 
    "height" : (2*menuWidth/12)+'px',
    "top" :  ( (2*menuWidth/12 ) + 2*menuHeight/20 )+'px'   
  });

  ////

  $("#colorPickerRedWrapper").css({ 
    "position" : 'absolute',
    "left" : ((fullWidth/24) + (1*fullWidth/20) )+'px',
    "top" : (9*menuHeight/10)+'px'  

  });

  $("#colorPickerBlueWrapper").css({ 
    "position" : 'absolute',
    "left" : ((fullWidth/12) + (1*fullWidth/7) )+'px',
    "top" : (9*menuHeight/10)+'px'  
  });

  ///////
 
 

  $('#colorPickerRed').spectrum({
      color: "red",
      allowEmpty:true,
      chooseText: "Choose",
      cancelText: "Close",
      move: function(){
        var color = $('#colorPickerRed').spectrum("get").toHex();
        $('#red1').css({ "background-color" : '#'+color});
        $('#red2').css({ "background-color" : '#'+color});
        
        var r = parseInt(color.substring(0,2), 16);
        var g = parseInt(color.substring(2,4), 16);
        var b = parseInt(color.substring(4,6), 16);
        if(r === 0) r = 1;
        if(r === 255) r = 254;
        crystalRenderer.stereoscopicEffect.setNewMaterial({r : r/255});
      },
      change: function(){
           
      }
  });

  $('#colorPickerBlue').spectrum({
      color: "blue",
      allowEmpty:true,
      chooseText: "Choose",
      cancelText: "Close",
      move: function(){
         var color = $('#colorPickerBlue').spectrum("get").toHex();
        $('#blue1').css({ "background-color" : '#'+color});
        $('#blue2').css({ "background-color" : '#'+color});
        crystalRenderer.stereoscopicEffect.setNewMaterial({'blue' :3 , 'red' : 3});

        var r = parseInt(color.substring(0,2), 16);
        var g = parseInt(color.substring(2,4), 16);
        var b = parseInt(color.substring(4,6), 16);
        
        if(g === 0) g = 1;
        if(b === 0) b = 1;

        if(g === 255) g = 254;
        if(b === 255) b = 254;
         
        
        crystalRenderer.stereoscopicEffect.setNewMaterial({g : g/255, b : b/255});
      },
      change: function(){
           
      }
  });
        


  ////////////////////

  
  function loadJSON(callback) {   
  
    var xobj = new XMLHttpRequest(); 

    xobj.overrideMimeType("application/json");
    xobj.open('GET', 'settings.json', true); // Replace 'my_data' with the path to your file
 
    xobj.onreadystatechange = function () { 
    
      if (xobj.readyState == 4 ) {
        // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
       
        // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
        try{ 
          if(xobj.responseText || xobj.responseText.length>0){ 
            restoreMechanism.configureState(JSON.parse(xobj.responseText));
          }
        }
        catch(err) { 
        }
      }
    };
    xobj.send(null);  
  }

  loadJSON();

  // to read the json file
   
  var hash = window.location.hash.substr(1);
  var service = 'https://cwgl.herokuapp.com' ; 
  
  if(hash.length>0){ 
    var slug = hash.replace(/^#/, '');
    
    $.ajax(service + '/' + slug + '.json', {
      method: 'GET',
      beforeSend: function(xmlHttpRequest) {
        xmlHttpRequest.withCredentials = true;
      }
    })
    .done(function(res) {  
      if(res){
        menu.resetProgressBar('Loading JSON from database...',true);
        if (res.data !== null) {
            restoreMechanism.configureState(res.data, [
            function(){
            if(wereOnMobile === true){ 
                menu.closeMenu({close : true});
                menu.hideMenu(true);
            
                dollEditor.setVisibility(!wereOnMobile); 
                hudCube.setVisibility(!wereOnMobile);
                hudArrows.setVisibility(!wereOnMobile);
                CubeEvent.enableCubeEvents = !wereOnMobile ;
            }
            },
            function(){ menu.progressBarFinish('force'); },
            ],
            wereOnMobile
            );  
        }
        else menu.progressBarFinish('ready');
      }
    }); 
  } 
  else{
      menu.progressBarFinish('ready');
  } 
  
});
 