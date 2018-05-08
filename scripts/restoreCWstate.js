/*global define*/
'use strict';

define([ 
  'pubsub',
  'underscore',  
  'millervector',
  'millerplane',
  'atomSphere' 
], function( 
  PubSub,
  _,
  MillerVector,
  MillerPlane ,
  AtomSphere
) {
  
  function RestoreCWstate( menu, lattice, motifEditor, orbitCrystal , orbitUnitCell, motifXcam,motifYcam,motifZcam, crystalRenderer, unitCellRenderer,crystalScene, unitCellScene, hudCube, hudArrows, motifRenderer, soundMachine, atomMaterialManager, renderingModes, gearTour, dollEditor, lod, dollGearBarME )  {  
    this.menu = menu ;
    this.lattice = lattice ;
    this.motifEditor = motifEditor ;
    this.orbitCrystal = orbitCrystal ;
    this.orbitUnitCell = orbitUnitCell ;
    this.motifXcam = motifXcam ;
    this.motifYcam = motifYcam ;
    this.motifZcam = motifZcam ;
    this.crystalRenderer = crystalRenderer ;
    this.unitCellRenderer = unitCellRenderer ;
    this.crystalScene = crystalScene ;
    this.hudCube = hudCube ;
    this.hudArrows = hudArrows ;
    this.motifRenderer = motifRenderer ;
    this.unitCellScene = unitCellScene ;
    this.soundMachine = soundMachine;
    this.renderingModes = renderingModes;
    this.atomMaterialManager = atomMaterialManager;
    this.gearTour = gearTour;
    this.dollEditor = dollEditor; 
    this.dollGearBarME = dollGearBarME; 
    this.lod = lod; 
    this.cwObj; 
    this.wereOnMobile; 
  }; 
  RestoreCWstate.prototype.configureState = function(cwObj, callbacks, wereOnMobile) { 
      
    var _this = this; 
    this.wereOnMobile = wereOnMobile;

    if(cwObj.system.latticeParams.lattice){ 
      var latticeName = cwObj.system.latticeParams.lattice.latticeName;
      this.lattice.latticeName = latticeName;

      require(['lattice/' + latticeName], function(lattice) {
        _this.lattice.lattice = lattice; 
        _this.lattice.latticeSystem = _this.lattice.lattice.latticeSystem ;
        _this.lattice.latticeType = _this.lattice.lattice.latticeType ;   
        _this.menu.setLatticeRestrictions(lattice.restrictions); 
        
        _this.menu.restore(cwObj);
        _this.beginRestoring(cwObj);
         
        
        if(callbacks !== undefined){ 
          for (var i = 0; i < callbacks.length ; i++) {
            callbacks[i]();
          };
        }
      }); 
    }
    else{
      this.menu.restore(cwObj); 
      this.beginRestoring(cwObj);
    }

    this.globalReset();
 

  };
  RestoreCWstate.prototype.beginRestoring = function(cwObj) { 
    
    var _this = this;

    this.cwObj = cwObj;  

    this.configureCameraSettings();

    this.configureGradeSettings(); 
     
    this.soundMachine.switcher(this.cwObj.appUI.visualTab.visualTools.sound.state);
    this.soundMachine.changeVolume(this.cwObj.appUI.visualTab.visualTools.sound.volume);
  
    this.lattice.actualAtoms.splice(0); 
 
    // AFTER ADDING EVERYTHING

    if(this.cwObj.system.latticeParams.lattice){  

      this.configureLatticeSettings(); 
      this.configureMillerObjectsSettings();
  
      this.lattice.setGradeChoices( {'faceCheckButton': this.cwObj.system.cellVisualization.faces.visible} );
      this.lattice.setGradeChoices( {'gridCheckButton': this.cwObj.system.cellVisualization.edges.visible} );
      
      this.lattice.updatePoints([
        this.lattice.createGrid,
        this.lattice.createFaces, 
        this.lattice.setGradeParameters, 
        this.lattice.forwardTransformations,   
        this.lattice.reCreateMillers, 
        this.lattice.recreateMotif,
        this.configureNotesState.bind(this)
      ]);   

      this.configureMotifEditorSettings();
    }
 
    /////

    this.lattice.currentMotif = this.motifEditor.getMotif();

    if(this.lattice.latticeName === 'hexagonal'){
      this.lattice.recreateMotif();
    }

    this.lattice.createAdditionalAtoms();

    var i = 0;

    while(i < this.lattice.cachedAtoms.length ){ 
      this.lattice.cachedAtoms[i].setVisibility(false); 
      i++;
    }

    this.configureVisualizationSettings();
 
  
  }; 
  RestoreCWstate.prototype.configureNotesState = function(arg) {

    var _this = this;

    var noteParams = this.cwObj.system.notesSettings; 

    _.extend(this.narrative_system.cameraData, noteParams.cameraData);
    _.extend(this.narrative_system.planeData, noteParams.planeData);
    _.extend(this.narrative_system.dirData, noteParams.dirData);

    if(this.lattice.actualAtoms.length === noteParams.atoms.length){ 
      for (var i = this.lattice.actualAtoms.length - 1; i >= 0; i--) {

        this.lattice.actualAtoms[i].notStates = {};
        _.extend(this.lattice.actualAtoms[i].notStates, noteParams.atoms[i]); 

      }
    };
 
    _.each(noteParams.gridNotes, function(n, k) { 

      _.each(_this.lattice.grids, function(grid, reference) { 
        grid.grid.setNoteState(k, n); 
      });
    });

    _.each(noteParams.faceNotes, function(n, k) { 
      _.each(_this.lattice.faces, function(face, reference) { 
        face.setNoteState(k,n); 
      });

    });

    _.each(noteParams.pointNotes, function(n, k) { 
      _.each(_this.lattice.points, function(p, reference) { 
        p.setNoteState(k,n); 
      });

    });
 
  }; 
  RestoreCWstate.prototype.globalReset = function(arg) { 

    // LATTICE 

      // remove 3d objects

      for (var i = this.lattice.actualAtoms.length - 1; i >= 0; i--) {
        this.lattice.actualAtoms[i].destroy();
      }; 
      for (var i = 0; i < this.lattice.millerDirections.length; i++) {
        this.lattice.millerDirections[i].direction.destroy();
      }  
      for (var i = 0; i < this.lattice.tempDirs.length; i++) {
        this.lattice.tempDirs[i].direction.destroy();  
      };   
      for (var i = 0; i < this.lattice.millerPlanes.length; i++) {
        this.lattice.millerPlanes[i].plane.destroy(); 
      }; 
      for (var i = 0; i < this.lattice.millerPlanes.length; i++) {
        this.lattice.millerPlanes[i].plane.destroy();
      } 
      for (var i = 0; i < this.lattice.tempPlanes.length; i++) {
        this.lattice.tempPlanes[i].plane.destroy(); 
      }; 
      for (var i = 0; i < this.lattice.cachedAtoms.length; i++) { 
        this.lattice.cachedAtoms[i].destroy();  
      } 
      for (var i = 0; i<this.lattice.actualAtoms.length; i++) { 
        this.lattice.actualAtoms[i].removesubtractedForCache();  
      } 
      for (var i = 0; i<this.lattice.cachedAtoms.length; i++) { 
        this.lattice.cachedAtoms[i].removesubtractedForCache();  
      }  
      _.each(this.lattice.points, function(point, reference) {
        point.destroy(); 
      }); 
      _.each(this.lattice.grids, function(grid, reference) {
        grid.grid.destroy(); 
      }); 
      _.each(this.lattice.faces, function(face, reference) {
        face.destroy();
      });

      // reset global variables

      this.lattice.lattice = null;

      this.lattice.parameters = {
        repeatX: 1, repeatY: 1, repeatZ: 1,
        scaleX: 1, scaleY: 1, scaleZ: 1,
        alpha: 90, beta: 90, gamma: 90
      };

      this.lattice.points = {}; 
      this.lattice.mutex = false;
      this.lattice.currentMotif = [];  
      this.lattice.actualAtoms = []; 

      // grade
      this.lattice.gradeChoice = {"face":true, "grid":true};
      this.lattice.gridPointsPos = [];
      this.lattice.grids = [];
      this.lattice.hexGrids = {};
      this.lattice.faces = [];
      this.lattice.gradeParameters = {"radius" : 2, "cylinderColor" : "A19EA1" , "faceOpacity" : 3 , "faceColor" : "907190"};
      this.lattice.hexagonalShapes = [] ;

      // miller
      this.lattice.millerParameters = []; 

      this.lattice.millerPlanes = [];
      this.lattice.planeState = {state:"initial", editing : undefined };
      this.lattice.planeList = [];
      this.lattice.tempPlanes = [];
      this.lattice.planesUnique = [];

      this.lattice.millerDirections = [];
      this.lattice.directionalState = {state:"initial", editing : undefined };    
      this.lattice.directionalList = [];
      this.lattice.tempDirs = [] ; 
      this.lattice.directionsUnique = [] ;

      //view
      this.lattice.viewBox = [];
      this.lattice.viewMode = 'crystalClassic'; 
      this.lattice.crystalNeedsRecalculation = {'cellSolidVoid' : false, 'cellSubstracted' : false};
      this.lattice.cachedAtoms = [];
      // visualization
      this.lattice.renderingMode = 'realistic';
      this.lattice.confirmationFunction = { id : ' ', object : ' '};
   
      this.lattice.labeling = false;
   
    // MOTIF EDITOR

      this.motifEditor.produceUuid(true);
      
      // remove 3d objects

      if(this.motifEditor.newSphere !== undefined){
        this.motifEditor.newSphere.destroy() ; 
      }  
      for (var i = 0; i<this.motifEditor.unitCellAtoms.length; i++) { 
        this.motifEditor.unitCellAtoms[i].destroy();  
      } 
      for (var i = 0; i<this.motifEditor.unitCellAtoms.length; i++) { 
        this.motifEditor.unitCellAtoms[i].removesubtractedForCache();  
      } 
      for (var i = 0; i<this.motifEditor.cachedAtoms.length; i++) { 
        this.motifEditor.cachedAtoms[i].removesubtractedForCache();  
      }  
      for (var i = 0; i<this.motifEditor.motifsAtoms.length; i++) { 
        this.motifEditor.motifsAtoms[i].destroy();  
      } 
      for (var i = 0; i<this.motifEditor.cachedAtoms.length; i++) { 
        this.motifEditor.cachedAtoms[i].destroy();  
      } 

      if( this.motifEditor.newSphere && this.motifEditor.newSphere.removesubtractedForCache){
        this.motifEditor.newSphere.removesubtractedForCache();
      }
       
      // global variables 
     
      this.motifEditor.cellParameters = { "alpha" : 90, "beta" : 90, "gamma" : 90, "scaleX" : 1, "scaleY" : 1, "scaleZ" : 1 }; 
      this.motifEditor.initialLatticeParams = { "alpha" : 90, "beta" : 90, "gamma" : 90, "scaleX" : 1, "scaleY" : 1, "scaleZ" : 1 }; 
      
      this.motifEditor.motifsAtoms = [];
      this.motifEditor.unitCellAtoms = [];
      this.motifEditor.unitCellPositions = {}; 
      this.motifEditor.viewMode = 'cellClassic';
      this.motifEditor.editorState = {state : "initial", fixed: false, atomPosMode : 'absolute', updated : false } ; 
      this.motifEditor.isEmpty = true ;
      this.motifEditor.latticeName = 'none';
      this.motifEditor.latticeType = 'none';  
      this.motifEditor.latticeSystem = 'none';
   
      this.motifEditor.manualSetCellAngles = false;
      this.motifEditor.leastCellLengths = {'x' : 0, 'y' : 0, 'z' : 0 };
      this.motifEditor.leastCellAngles = {'alpha' : 2, 'beta' : 2, 'gamma' : 2 };
      this.motifEditor.cellVolume =  {col : false, xInitVal : 0.5, yInitVal : 0.5, zInitVal : 0.5, aCol : false, bCol : false, cCol : false};

      this.motifEditor.newSphere = undefined;
      this.motifEditor.lastSphereAdded = undefined;
      this.motifEditor.dragMode = false;
      this.motifEditor.tangentToThis = undefined;
      this.motifEditor.rotAxis = 'x';
      this.motifEditor.mutex = true ;
      this.motifEditor.cellMutex = true ;
      this.motifEditor.globalTangency = true;
      this.motifEditor.padlock = true;
   
      // rendering mode
      this.motifEditor.renderingMode = 'realistic';  
      this.motifEditor.cellNeedsRecalculation = {'cellSolidVoid' : false, 'cellSubstracted' : false};
      this.motifEditor.cachedAtoms = [];
      this.motifEditor.cachedAtomsPositions = {} ;
      this.motifEditor.box3 = {bool : false, pos : undefined};  
   
      this.motifEditor.labeling = false;
      
      // CAMERAS
      
      this.motifXcam.position.set(0,0,50);  
      this.motifYcam.position.set(50,0,0);  
      this.motifZcam.position.set(0,50,0);  
      
      this.orbitCrystal.control.target = new THREE.Vector3(0,0,0) ;
      this.orbitUnitCell.control.target = new THREE.Vector3(0,0,0) ;
      
      this.crystalRenderer.cameras[0].fov = 15 ;  
      this.orbitCrystal.camera.position.set(30,30,60);
      this.orbitUnitCell.camera.position.set(20,20,40);
   
      this.orbitCrystal.sync = false;
      this.orbitUnitCell.sync = false; 
      
      // OTHER SCENE FEATURES

      this.crystalScene.AmbLight.color.setHex( 0x4D4D4C ); 
      this.crystalScene.light.intensity = 1 ;
      this.crystalScene.light.castShadow = true;  
      this.crystalScene.object3d.fog.density = 0 ;
      this.motifEditor.editObjectsInScene('crystalSolidVoid', 'remove', true);

      this.unitCellScene.AmbLight.color.setHex( 0x4D4D4C ); 
      this.unitCellScene.light.intensity = 1 ;
      this.unitCellScene.light.castShadow = true;
      this.lattice.editObjectsInScene('crystalSolidVoid', 'remove', true);

      // GEAR BAR 

      this.gearTour.crystalHasChanged = true;
      this.gearTour.state = 1 ;
      this.dollEditor.gearBarSlider.position.y = -7.05;

      // RENDERERS

      this.crystalRenderer.initAnaglyph(false);
      this.crystalRenderer.initStereoEffect(false);
      this.crystalRenderer.initOculusEffect(false);

      this.unitCellRenderer.initAnaglyph(false);
      this.unitCellRenderer.initStereoEffect(false);
      this.unitCellRenderer.initOculusEffect(false); 

      this.crystalRenderer.setUCviewport(false);

      this.crystalRenderer.backgroundColor = 0x000000;  
      this.unitCellRenderer.backgroundColor = 0x000000; 
      this.motifRenderer.viewportColors[0] = 0x000000;  
      this.motifRenderer.viewportColors[1] = 0x000000;  
      this.motifRenderer.viewportColors[2] = 0x000000;   
   
      // SOUNDS

      this.soundMachine.switcher(false);
      this.soundMachine.changeVolume(75);

      this.narrative_system;
  };
  RestoreCWstate.prototype.configureVisualizationSettings = function() {

    var visualTab = this.cwObj.appUI.visualTab ; 
    var crystalCam = this.orbitCrystal.camera ;
    var cellCamera = this.orbitUnitCell.camera ; 
 
    var toggles = this.cwObj.appUI.menuRibbon.toggleButtons ; 
  
    this.atomMaterialManager.setLabels({labelToggle : toggles.labelToggle});

    this.crystalScene.axisMode({xyzAxes : toggles.xyzAxes, abcAxes : toggles.abcAxes});
    this.crystalScene.updateAbcAxes({alpha : this.cwObj.appUI.latticeTab.latticeAngle.alpha, beta : this.cwObj.appUI.latticeTab.latticeAngle.beta, gamma :  this.cwObj.appUI.latticeTab.latticeAngle.gamma}, this.orbitCrystal.camera);
    
    for (var prop in visualTab.visualParameters.renderizationMode) {
      var mode = visualTab.visualParameters.renderizationMode[prop];
      if( mode === true){
        this.lattice.renderingModeChange({mode : prop});
        this.motifEditor.renderingModeChange({mode : prop});
     
        this.renderingModes.setMode({mode : prop}); 

        if(mode === 'toon'){
          this.crystalRenderer.setGamma(true);
          this.unitCellRenderer.setGamma(true);
        }
        else{
          this.crystalRenderer.setGamma(false);
          this.unitCellRenderer.setGamma(false);
        }
      }
    }
     
    this.crystalScene.fogActive = visualTab.visualTools.fog.state ;
    
    
    for (var i = this.lattice.planeName - 1; i >= 0; i--) {
      // /Things[i]
    };


    this.crystalScene.setFogProperties({
      "fogDensity" : visualTab.visualTools.fog.density,
      "fogColor" : visualTab.visualTools.fog.color,
      "fog" : visualTab.visualTools.fog.state,
    })
  
    this.crystalRenderer.backgroundColor = visualTab.visualTools.colorization.crystalScreenColor ; 
    this.unitCellRenderer.backgroundColor = visualTab.visualTools.colorization.cellScreenColor ; 
    this.motifRenderer.viewportColors[0] = visualTab.visualTools.colorization.motifXScreenColor ; 
    this.motifRenderer.viewportColors[1] = visualTab.visualTools.colorization.motifYScreenColor ; 
    this.motifRenderer.viewportColors[2] = visualTab.visualTools.colorization.motifZScreenColor ; 
    
    this.crystalScene.setLightProperties({lights : visualTab.visualParameters.lights.lights});
    this.unitCellScene.setLightProperties({lights : visualTab.visualParameters.lights.lights}); 
    
    this.crystalRenderer.ssaoEffect(visualTab.visualParameters.lights.ssao); 
    this.unitCellRenderer.ssaoEffect(visualTab.visualParameters.lights.ssao);

    this.crystalRenderer.shadowing(visualTab.visualParameters.lights.shadows); 
    this.unitCellRenderer.shadowing(visualTab.visualParameters.lights.shadows);
    
    var params = this.lattice.getParameters(); 
    this.crystalScene.updateShadowCameraProperties( params);

    this.crystalRenderer.initAnaglyph({anaglyph : false} /*visualTab.visualParameters.stereoscopicEffect.crystalAnaglyph*/ ); 
    this.unitCellRenderer.initAnaglyph({anaglyph : false} /*visualTab.visualParameters.stereoscopicEffect.cellAnaglyph*/ ); 
    
    var yPosGearSlider = [-7.05, -5.7 , -4.35 , -3 , -1.65 , -0.30];

    this.gearTour.crystalHasChanged = true;
    this.gearTour.state = this.cwObj.system.latticeParams.gearTourState ;
    
    if(this.cwObj.system.motif.length >0){
      this.gearTour.state = 6;
    } 
    else if(this.cwObj.system.latticeParams.lattice){
      this.gearTour.state = 2;
    }
    else{
      this.gearTour.state = 1;
    }

    if(this.cwObj.system.motif.length >0){
      this.dollEditor.levelLabels[1].allowed = true;  
      this.dollEditor.levelLabels[2].allowed = true;  
      this.dollEditor.levelLabels[3].allowed = true;
      this.dollEditor.levelLabels[4].allowed = true;
      this.dollEditor.levelLabels[5].allowed = true;
      this.dollGearBarME.levelClicked(5);
    }
    else{
      this.dollEditor.levelLabels[1].allowed = true; 
      this.dollGearBarME.levelClicked(this.cwObj.system.latticeParams.walkStep-1);
    }
    
    this.dollGearBarME.setWalkStep(this.cwObj.system.latticeParams.walkStep) ;

    var levelNames = [ '1. Lattice Points', '2. Motif', '3. Constructive Unit Cell', '4. Unit cell', '5. Cropped unit cell', '6. Crystal' ];
    
    if(this.wereOnMobile === false){ 
      this.menu.canvasTooltip({
        'message':levelNames[this.gearTour.state-1],
        'x': this.dollEditor.levelLabels[this.gearTour.state-1].position.x,
        'y':this.dollEditor.levelLabels[this.gearTour.state-1].position.y,
        'show':true
      }); 
    }

    if(this.gearTour.state > 2){
      for (var i = 0; i <= 5; i++) {
        this.dollEditor.levelLabels[i].allowed = true;
      };
    }
    else if(this.gearTour.state === 2){
      for (var i = 0; i <= 1; i++) {
        this.dollEditor.levelLabels[i].allowed = true;
      };
    }
    else{
      this.dollEditor.levelLabels[0].allowed = true;
    }
  
  };
  RestoreCWstate.prototype.configureMotifEditorSettings = function() {

    var cell = this.cwObj.system.unitCell ;
    var atoms = this.cwObj.system.motif ;
    var latticeParams = this.cwObj.system.latticeParams.lattice.defaults ;
    
    var anglesScales =  { 'alpha': cell.initialLatticeParams.alpha, 'beta': cell.initialLatticeParams.beta, 'gamma': cell.initialLatticeParams.gamma, 'scaleX': cell.initialLatticeParams.scaleX, 'scaleY': cell.initialLatticeParams.scaleY, 'scaleZ':cell.initialLatticeParams.scaleZ  };
    this.motifEditor.editorState = cell.editorState;
     
    this.motifEditor.editorState_({state : "initial"});

    this.motifEditor.cellParameters = { 'alpha': latticeParams.alpha, 'beta': latticeParams.beta, 'gamma': latticeParams.gamma, 'scaleX': latticeParams.scaleX, 'scaleY': latticeParams.scaleY, 'scaleZ':latticeParams.scaleZ  };

    if(this.motifEditor.newSphere){ 
      this.motifEditor.newSphere.destroy();
      this.motifEditor.newSphere = undefined ;
    }
     
    this.motifEditor.leastCellLengths = {'x' : cell.leastCellLengths.x, 'y' : cell.leastCellLengths.y, 'z' : cell.leastCellLengths.z } ;
    
    this.motifEditor.padlockMode({padlock : !cell.padlock}, true ) ;
    
    this.motifEditor.unitCellPositions = {};

    for (var i = cell.positions.length - 1; i >= 0; i--) { 
      this.motifEditor.unitCellPositions[cell.positions[i].reference] = {"position" : new THREE.Vector3(  cell.positions[i].x, cell.positions[i].y, cell.positions[i].z), "latticeIndex" : cell.positions[i].reference }  ;
    };
  
    this.motifEditor.setLatticeParameters({ 
        defaults : anglesScales,  
        latticeType : this.cwObj.system.latticeParams.lattice.latticeType, 
        latticeName : this.cwObj.system.latticeParams.lattice.latticeName, 
        latticeSystem : this.cwObj.system.latticeParams.lattice.latticeSystem,
        restore : true  
      }
    );

    this.motifEditor.produceUuid(true);

    if ( atoms.length > 0 ) {
      this.motifEditor.isEmpty = false;
    }

    this.motifEditor.offsetMotifsPointsScaling(true);

    var helperMotif = [];
    var  uiRelPosition;

    for (var i = 0; i < atoms.length; i++) { 
      
      uiRelPosition = {};
     _.extend(uiRelPosition, atoms[i].uiRelPosition);

      var atom = new AtomSphere( 
        atoms[i].visible, 
        new THREE.Vector3(atoms[i].position.x,atoms[i].position.y,atoms[i].position.z), 
        atoms[i].radius , 
        atoms[i].color, 
        this.lod.lodLevel, 
        atoms[i].elementName, 
        atoms[i].id, 
        atoms[i].opacity*10, 
        atoms[i].wireframe,
        atoms[i].ionicIndex,
        this.motifEditor.labeling,
        uiRelPosition
        
      );

      this.motifEditor.motifsAtoms.push(atom); 
       
      var radius = atoms[i].radius ;
  
      helperMotif.push(

        {
          "object3d" : {
            "position" : { 
              "x": atoms[i].position.x, 
              "y":atoms[i].position.y, 
              "z": atoms[i].position.z
            }
          }, 
          getRadius: function() { return this.radius; },
          getID: function() { return this.id; }, 
          'color' : atoms[i].color,
          'radius' : atoms[i].radius,
          'id' : atoms[i].id,
          'texture' : 'Images/atoms/'+atoms[i].texture+'.png',
          'opacity' : atoms[i].opacity*10,
          'ionicIndex' : atoms[i].ionicIndex,
          'wireframe' : atoms[i].wireframe  
        }

      );

      this.motifEditor.addAtomInCell(  
        new THREE.Vector3(atoms[i].position.x,atoms[i].position.y,atoms[i].position.z) , 
        atoms[i].radius , 
        atoms[i].color,  
        atoms[i].elementName, 
        atoms[i].id,  
        atoms[i].opacity*10,
        false,
        true,
        atoms[i].ionicIndex 
      ); 
   
      if(atoms[i].id == cell.lastSphereAdded) {
        this.motifEditor.lastSphereAdded = atom ;
      }
 
    } 
    
    this.motifEditor.cellVolume = {col : false, xInitVal : cell.cellVolume.xInitVal, yInitVal : cell.cellVolume.yInitVal, zInitVal : cell.cellVolume.zInitVal, aCol : false, bCol : false, cCol : false};

    this.lattice.currentMotif = helperMotif ;
  };
  RestoreCWstate.prototype.configureMillerObjectsSettings = function() {
    var dirs = this.cwObj.system.millerObjects.directions;
    var planes = this.cwObj.system.millerObjects.planes; 
     
    for (var i = dirs.length - 1; i >= 0; i--) {


      this.lattice.directionalState.state = 'initial'; 
    
      this.lattice.submitDirectional( 
        {   
          button: "newDirection",
          dirRadius: "1",
          directionColor: "ffffff",
          directionName: "",
          millerT: "",
          millerU: "",
          millerV: "",
          millerW: ""
        }
      );

      this.lattice.directionalState.state = 'creating';
      this.lattice.directionParameterChange(undefined, true);

      this.lattice.submitDirectional( 
        {   
          button: "saveDirection",
          dirRadius: parseInt(dirs[i].radius),
          directionColor: dirs[i].color,
          directionName: dirs[i].name,
          millerT: dirs[i].t,
          millerU: dirs[i].u,
          millerV: dirs[i].v,
          millerW: dirs[i].w
        }
      );

    }
 
    for (var i = planes.length - 1; i >= 0; i--) {
      
      this.lattice.planeState.state = 'initial';

      this.lattice.submitPlane( 
        { 
          button: "newPlane",
          interception: false,
          millerH: '',
          millerI: '',
          millerK: '',
          millerL: '',
          parallel: false,
          planeColor: '#ffffff"',
          planeName: '',
          planeOpacity: 6
        }
      );  

      this.lattice.planeState.state = 'creating';
      this.lattice.planeParameterChange(undefined, true);
    
      this.lattice.submitPlane( 
        { 
          button: "savePlane",
          interception: false,
          millerH: planes[i].h,
          millerI: planes[i].i,
          millerK: planes[i].k,
          millerL: planes[i].l,
          parallel: planes[i].parallel,
          planeColor: planes[i].color,
          planeName: planes[i].name,
          planeOpacity: planes[i].opacity
        }
      ); 

    }    
  }; 
  RestoreCWstate.prototype.configureGradeSettings = function() {
    
    this.lattice.gradeParameters = {
      "radius" : this.cwObj.appUI.latticeTab.cellVisualization.cellEdge.radius, 
      "cylinderColor" : this.cwObj.appUI.latticeTab.cellVisualization.cellEdge.color, 
      "faceOpacity" : this.cwObj.appUI.latticeTab.cellVisualization.cellFace.opacity, 
      "faceColor" : this.cwObj.appUI.latticeTab.cellVisualization.cellFace.color
    }; 
  };   
  RestoreCWstate.prototype.configureLatticeSettings = function() { 
    var _this = this ;
    var params = this.cwObj.system ;
  
    this.lattice.gradeChoice = {"face":this.cwObj.system.cellVisualization.edges.visible, "grid":this.cwObj.system.cellVisualization.faces.visible};
    
    var toggles = this.cwObj.appUI.menuRibbon.toggleButtons ; 

    this.lattice.toggleStates = {crystalAtoms : toggles.atomToggle, points : toggles.latticePoints, planes : toggles.planes, directions : toggles.directions}; 

    this.lattice.lattice = this.cwObj.system.latticeParams.lattice ; 
    
    this.lattice.parameters =  {
      'repeatX': params.latticeParams.repeatX, 
      'repeatY': params.latticeParams.repeatY, 
      'repeatZ': params.latticeParams.repeatZ,
      'scaleX': params.unitCell.dimensions.x, 
      'scaleY': params.unitCell.dimensions.y,
      'scaleZ': params.unitCell.dimensions.z, 
      'alpha': params.latticeParams.lattice.defaults.alpha, 
      'beta': params.latticeParams.lattice.defaults.beta, 
      'gamma': params.latticeParams.lattice.defaults.gamma
    }; 
       
  };   
  RestoreCWstate.prototype.configureCameraSettings = function() { 

    var settings = this.cwObj.system.cameraSettings ;
    var crystalCam = this.orbitCrystal.camera ;
    var cellCamera = this.orbitUnitCell.camera ; 

    crystalCam.position.set(settings.crystalCamera.position.x, settings.crystalCamera.position.y, settings.crystalCamera.position.z);
    cellCamera.position.set(settings.cellCamera.position.x, settings.cellCamera.position.y, settings.cellCamera.position.z);
 
    this.motifXcam.position.set(settings.motifCameras.xCam.position.x, settings.motifCameras.xCam.position.y, settings.motifCameras.xCam.position.z);  
    this.motifYcam.position.set(settings.motifCameras.yCam.position.x, settings.motifCameras.yCam.position.y, settings.motifCameras.yCam.position.z);  
    this.motifZcam.position.set(settings.motifCameras.zCam.position.x, settings.motifCameras.zCam.position.y, settings.motifCameras.zCam.position.z);  
  
    this.motifXcam.updateProjectionMatrix();
    this.motifYcam.updateProjectionMatrix();
    this.motifZcam.updateProjectionMatrix();
 
    // center at
    if(this.cwObj.appUI.visualTab.visualParameters.focalPoint.crystalCamTargetOn === true){
      this.orbitCrystal.control.target = new THREE.Vector3(0,0,0) ;
    }
    else{ 
      this.orbitCrystal.control.target = new THREE.Vector3(0,0,0) ;
      /*
      var g = lattice.customBox(lattice.viewBox);
      var centroid = new THREE.Vector3(0,0,0);

      if(g !== undefined){ 
        centroid = new THREE.Vector3(); 
        for ( var z = 0, l = g.vertices.length; z < l; z ++ ) {
          centroid.add( g.vertices[ z ] ); 
        }  
        centroid.divideScalar( g.vertices.length );
      }
 
      this.orbitCrystal.control.target = centroid ;
      */
    } 
 
    // distortion
    var cPos = this.crystalRenderer.cameras[0].position ;
    var currDistance = (this.crystalRenderer.cameras[0].position).distanceTo(new THREE.Vector3(0,0,0)) ;
    var vFOV = this.crystalRenderer.cameras[0].fov * Math.PI / 180;         
    var Visheight = 2 * Math.tan( vFOV / 2 ) * currDistance;   

    if(this.cwObj.appUI.visualTab.visualParameters.visualizationMode.distortionOn === true){
      this.crystalRenderer.cameras[0].fov = 75;
      var distance = Visheight/(2 * Math.tan( (75* Math.PI / 180) / 2 ) );
      var factor = distance/currDistance; 
      this.crystalRenderer.cameras[0].position.set(cPos.x * factor, cPos.y * factor, cPos.z * factor);
    }
    else{ 
      this.crystalRenderer.cameras[0].fov = 15;
      var distance = Visheight/(2 * Math.tan( (15* Math.PI / 180) / 2 ) );
      var factor = distance/currDistance; 
      this.crystalRenderer.cameras[0].position.set(cPos.x * factor, cPos.y * factor, cPos.z * factor);
    }   

    // sync cameras 
 
    if(this.cwObj.appUI.motifTab.lockCameras !== undefined && this.cwObj.appUI.motifTab.lockCameras === true){    
      cellCamera.position.set( crystalCam.position.x, crystalCam.position.y, crystalCam.position.z );   
      this.orbitUnitCell.control.target = this.orbitCrystal.control.target.clone();
      this.orbitCrystal.syncCams(true);
      this.orbitUnitCell.syncCams(true); 
    }
    else
    { 
      this.orbitUnitCell.control.target = new THREE.Vector3(0,0,0);
      this.orbitCrystal.syncCams(false);
      this.orbitUnitCell.syncCams(false);
    } 
  };  
 
  return RestoreCWstate;
});
