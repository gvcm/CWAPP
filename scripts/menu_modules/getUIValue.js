/*global define*/
'use strict';

// Dependecies

define([
    'jquery',
    'jquery-ui',
    'pubsub',
    'underscore'
], function(
    jQuery,
    jQuery_ui,
    PubSub, 
    _
) 
{    
    /* This module is used in order to get the current value/state of an HTML element. */
    
    // Variables //
    var $selector = undefined;
    var html = undefined;
    
    // Modules References //
    var $stringEditor = undefined;
    
    // Contructor //
    function getUIValue(argument) {
        // Acquire Module References //
        if (!(_.isUndefined(argument.stringEditor))) $stringEditor = argument.stringEditor;
        else return false;
        if (!(_.isUndefined(argument.html))) html = argument.html;
        else return false;
    };
    
    // Retrieve value using the combination of ID + selector //
    function retrieveValue(index,selector){
        switch(index){
            case 'planeVisibility':{
                if (html.pnd.tables.planes.find('#'+selector).find('.planeButton').hasClass('visible')) return true;
                else return false;
            }
            case 'parallel':{
                if (html.pnd.tables.planes.find('#'+selector).find('.parallel').hasClass('active')) return true;
                else return false;
            }
            case 'interception':{
                if (html.pnd.tables.planes.find('#'+selector).find('.interception').hasClass('active')) return true;
                else return false;
            }
        };
    };
    
    // Retrieve value based on the ID only //
    function retrieveValueFromID(index){
        switch(index){
            
            case 'activeTab':{
                if (html.menu.tabs.latticeTab.hasClass('active')) return 'latticeTab';
                else if (html.menu.tabs.motifTab.hasClass('active')) return 'motifTab';
                else if (html.menu.tabs.visualTab.hasClass('active')) return 'visualTab';
                else if (html.menu.tabs.pndTab.hasClass('active')) return 'pndTab';
                else if (html.menu.tabs.notesTab.hasClass('active')) return 'notesTab';
                else if (html.menu.tabs.publicTab.hasClass('active')) return 'publicTab';
            }
            case 'tabDisable':{
                var result = {};
                if (html.menu.tabs.latticeTab.hasClass('disabled')) result.latticeTab = true;
                else result.latticeTab = false;
                if (html.menu.tabs.motifTab.hasClass('disabled')) result.motifTab = true;
                else result.motifTab = false;
                if (html.menu.tabs.visualTab.hasClass('disabled')) result.visualTab = true;
                else result.visualTab = false;
                if (html.menu.tabs.pndTab.hasClass('disabled')) result.pndTab = true;
                else result.pndTab = false;
                if (html.menu.tabs.notesTab.hasClass('disabled')) result.notesTab = true;
                else result.notesTab = false;
                if (html.menu.tabs.publicTab.hasClass('disabled')) result.publicTab = true;
                else result.publicTab = false;
                return result;
            }
            case 'toggleButtons':{
                var result = {};
                if (html.menu.toggles.latticePoints.parent().hasClass('lightThemeActive')) result.latticePoints = true;
                else result.latticePoints = false;
                if (html.menu.toggles.edges.parent().hasClass('lightThemeActive')) result.edges = true;
                else result.edges = false;
                if (html.menu.toggles.faces.parent().hasClass('lightThemeActive')) result.faces = true;
                else result.faces = false;
                if (html.menu.toggles.xyzAxes.parent().hasClass('lightThemeActive')) result.xyzAxes = true;
                else result.xyzAxes = false;
                if (html.menu.toggles.abcAxes.parent().hasClass('lightThemeActive')) result.abcAxes = true;
                else result.abcAxes = false;
                if (html.menu.toggles.unitCellViewport.parent().hasClass('lightThemeActive')) result.unitCellViewport = true;
                else result.unitCellViewport = false;
                if (html.menu.toggles.planes.parent().hasClass('lightThemeActive')) result.planes = true;
                else result.planes = false;
                if (html.menu.toggles.directions.parent().hasClass('lightThemeActive')) result.directions = true;
                else result.directions = false;
                if (html.menu.toggles.atomRadius.parent().hasClass('lightThemeActive')) result.atomRadius = true;
                else result.atomRadius = false;
                if (html.menu.toggles.atomToggle.parent().hasClass('lightThemeActive')) result.atomToggle = true;
                else result.atomToggle = false;
                if (html.menu.toggles.labelToggle.parent().hasClass('lightThemeActive')) result.labelToggle = true;
                else result.labelToggle = false;
                if (html.menu.toggles.highlightTangency.parent().hasClass('lightThemeActive')) result.highlightTangency = true;
                else result.highlightTangency = false;
                if (html.menu.toggles.fullScreen.parent().hasClass('lightThemeActive')) result.fullScreen = true;
                else result.fullScreen = false;
                
                result.atomRadiusSlider = html.menu.other.atomRadiusSlider.slider('value');
                return result;
            }
                
            // Motif Tab
            case 'tangency':{
                if (html.motif.panel.tangency.parent().hasClass('purpleThemeActive')) return true;
                else return false;
            }
            case 'lockCameras':{
                if (html.motif.other.lockCameras.hasClass('active')) return true;
                else return false;
            }
            case 'atomOpacity':{
                return $stringEditor.inputIsNumber(html.motif.atomParameters.atomOpacity.val());
            }
            case 'atomColor':{
                return html.motif.panel.color.spectrum('get').toHex();
            }
            case 'atomPosX':{
                return $stringEditor.inputIsNumber(html.motif.motifInputs.atomPosX.val());
            }
            case 'atomPosY':{
                return $stringEditor.inputIsNumber(html.motif.motifInputs.atomPosY.val());
            }
            case 'atomPosZ':{
                return $stringEditor.inputIsNumber(html.motif.motifInputs.atomPosZ.val());
            }
            case 'rotAngleTheta':{
                return html.motif.rotatingAngles.rotAngleTheta.val();
            }
            case 'rotAnglePhi':{
                return html.motif.rotatingAngles.rotAnglePhi.val();
            }
            case 'tangentR':{
                return html.motif.panel.tangentR.val();
            }
            case 'rotAngleX':{
                return html.motif.rotatingAngles.x.text();
            }
            case 'rotAngleY':{
                return html.motif.rotatingAngles.y.text();
            }
            case 'rotAngleZ':{
                return html.motif.rotatingAngles.z.text();
            }
            case 'cellVolume':{
                return $stringEditor.inputIsNumber(html.motif.other.cellVolume.val());  
            }
            case 'atomPositioningABC':{
                if (html.motif.panel.atomPositioningABC.hasClass('buttonPressed')) return true;
                else return false;
            }
            case 'atomPositioningXYZ':{
                if (html.motif.panel.atomPositioningXYZ.hasClass('buttonPressed')) return true;
                else return false;
            }
            case 'atomName':{
                return html.motif.other.name.html();
            }
            case 'motifLabels':{
                var result = {};
                result.a = html.motif.latticeLabels.scaleX.html();
                result.b = html.motif.latticeLabels.scaleY.html();
                result.c = html.motif.latticeLabels.scaleZ.html();
                result.alpha = html.motif.latticeLabels.alpha.html();
                result.beta = html.motif.latticeLabels.beta.html();
                result.gamma = html.motif.latticeLabels.gamma.html();
                return result;
            }
                
            // Lattice Tab
            case 'repeatX':{
                return $stringEditor.inputIsInteger(html.lattice.parameters.repeatX.val());
            }
            case 'repeatY':{
                return $stringEditor.inputIsInteger(html.lattice.parameters.repeatY.val());
            }
            case 'repeatZ':{
                return $stringEditor.inputIsInteger(html.lattice.parameters.repeatZ.val());
            }
            case 'scaleX':{
                return $stringEditor.inputIsNumber(html.lattice.parameters.scaleX.val());
            }
            case 'scaleY':{
                return $stringEditor.inputIsNumber(html.lattice.parameters.scaleY.val());
            }
            case 'scaleZ':{
                return $stringEditor.inputIsNumber(html.lattice.parameters.scaleZ.val());
            }
            case 'alpha':{
                return $stringEditor.inputIsNumber(html.lattice.parameters.alpha.val());
            }
            case 'beta':{
                return $stringEditor.inputIsNumber(html.lattice.parameters.beta.val());
            }
            case 'gamma':{
                return $stringEditor.inputIsNumber(html.lattice.parameters.gamma.val());
            }
            case 'selectedLattice':{
                return html.lattice.other.selected.html();
            }
            case 'latticePadlock':{
                if (html.lattice.padlocks.lattice.children().hasClass('active')) return true;
                else return false;
            }
            case 'motifPadlock':{
                if (html.lattice.padlocks.motif.children().hasClass('active')) return true;
                else return false;
            }
            case 'borderColor':{
                return '#'+html.lattice.visual.edgeColorPicker.spectrum('get').toHex();
            }
            case 'filledColor':{
                return '#'+html.lattice.visual.faceColorPicker.spectrum('get').toHex();
            }
            case 'radius':{
                return $stringEditor.inputIsInteger(html.lattice.visual.radius.val());
            }
            case 'opacity':{
                return $stringEditor.inputIsInteger(html.lattice.visual.opacity.val());
            }
                
            // PnD Tab
            case 'planeColor':{
                return '#'+html.pnd.planeParameters.planeColor.spectrum('get').toHex();
            }
            case 'planeName':{
                return html.pnd.planeParameters.planeName.val();
            }
            case 'planeOpacity':{
                return $stringEditor.inputIsNumber(html.pnd.planeParameters.planeOpacity.val());
            }
            case 'millerH':{
                return $stringEditor.inputIsInteger(html.pnd.planeParameters.millerH.val());
            }
            case 'millerK':{
                return $stringEditor.inputIsInteger(html.pnd.planeParameters.millerK.val());
            }
            case 'millerL':{
                return $stringEditor.inputIsInteger(html.pnd.planeParameters.millerL.val());
            }
            case 'millerI':{
                return $stringEditor.inputIsInteger(html.pnd.planeParameters.millerI.val());
            }
            case 'directionColor':{
                return html.pnd.directionParameters.directionColor.spectrum('get').toHex();
            }
            case 'directionName':{
                return html.pnd.directionParameters.directionName.val();
            }
            case 'dirRadius':{
                return $stringEditor.divide10(html.pnd.directionParameters.dirRadius.val()).toString();
            }
            case 'millerU':{
                return $stringEditor.inputIsInteger(html.pnd.directionParameters.millerU.val());
            }
            case 'millerV':{
                return $stringEditor.inputIsInteger(html.pnd.directionParameters.millerV.val());
            }
            case 'millerW':{
                return $stringEditor.inputIsInteger(html.pnd.directionParameters.millerW.val());
            }
            case 'millerT':{
                return $stringEditor.inputIsInteger(html.pnd.directionParameters.millerT.val());
            }
            
            // Visual Tab
            case 'lod':{
                return $stringEditor.inputIsNumber(html.visual.lod.lod.val());
            }
            case 'autoQuality':{
                if (html.visual.parameters.renderizationQuality.autoQuality.hasClass('active')) return true;
                else return false;
            }
            case 'lowQuality':{
                if (html.visual.parameters.renderizationQuality.lowQuality.hasClass('active')) return true;
                else return false;
            }
            case 'mediumQuality':{
                if (html.visual.parameters.renderizationQuality.mediumQuality.hasClass('active')) return true;
                else return false;
            }
            case 'highQuality':{
                if (html.visual.parameters.renderizationQuality.highQuality.hasClass('active')) return true;
                else return false;
            }
            case 'wireframe':{
                if (html.visual.parameters.renderizationMode.wireframe.hasClass('active')) return true;
                else return false;
            }
            case 'toon':{
                if (html.visual.parameters.renderizationMode.toon.hasClass('active')) return true;
                else return false;
            }
            case 'flat':{
                if (html.visual.parameters.renderizationMode.flat.hasClass('active')) return true;
                else return false;
            }
            case 'realistic':{
                if (html.visual.parameters.renderizationMode.realistic.hasClass('active')) return true;
                else return false;
            }
            case 'lights':{
                if (html.visual.parameters.lights.hasClass('active')) return true;
                else return false;
            }
            case 'ssao':{
                if (html.visual.parameters.ssao.hasClass('active')) return true;
                else return false;
            }
            case 'shadows':{
                if (html.visual.parameters.shadows.hasClass('active')) return true;
                else return false;
            }
            case 'distortionOn':{
                if (html.visual.parameters.distortionOn.hasClass('active')) return true;
                else return false;
            }
            case 'distortionOff':{
                if (html.visual.parameters.distortionOff.hasClass('active')) return true;
                else return false;
            }
            case 'anaglyph':{
                if (html.visual.parameters.anaglyph.hasClass('active')) return true;
                else return false;
            }
            case 'oculus':{
                if (html.visual.parameters.oculus.hasClass('active')) return true;
                else return false;
            }
            case 'sideBySide3D':{
                if (html.visual.parameters.sideBySide3D.hasClass('active')) return true;
                else return false;
            }
            case 'onTop3D':{
                if (html.visual.parameters.onTop3D.hasClass('active')) return true;
                else return false;
            }
            case 'anaglyphCell':{
                if (html.visual.stereoscopicCell.anaglyphCell.hasClass('active')) return true;
                else return false;
            }
            case 'oculusCell':{ return false;
                if (html.visual.stereoscopicCell.oculusCell.hasClass('active')) return true;
                else return false;
            }
            case 'sideBySide3DCell':{
                if (html.visual.stereoscopicCell.sideBySide3DCell.hasClass('active')) return true;
                else return false;
            }
            case 'onTop3DCell':{
                if (html.visual.stereoscopicCell.onTop3DCell.hasClass('active')) return true;
                else return false;
            }
            case 'crystalCamTargetOn':{
                if (html.visual.parameters.crystalCamTargetOn.hasClass('active')) return true;
                else return false;
            }
            case 'crystalCamTargetOff':{
                if (html.visual.parameters.crystalCamTargetOff.hasClass('active')) return true;
                else return false;
            }
            case 'leapMotion':{
                if (html.visual.parameters.leapMotion.hasClass('active')) return true;
                else return false;
            }
            case 'crystalClassic':{
                if (html.visual.parameters.crystalMode.crystalClassic.hasClass('active')) return true;
                else return false;
            }
            case 'crystalSubstracted':{
                if (html.visual.parameters.crystalMode.crystalSubstracted.hasClass('active')) return true;
                else return false;
            }
            case 'crystalSolidVoid':{
                if (html.visual.parameters.crystalMode.crystalSolidVoid.hasClass('active')) return true;
                else return false;
            }
            case 'crystalGradeLimited':{
                if (html.visual.parameters.crystalMode.crystalGradeLimited.hasClass('active')) return true;
                else return false;
            }
            case 'cellClassic':{
                if (html.visual.parameters.unitCellMode.cellClassic.hasClass('active')) return true;
                else return false;
            }
            case 'cellSubstracted':{
                if (html.visual.parameters.unitCellMode.cellSubstracted.hasClass('active')) return true;
                else return false;
            }
            case 'cellSolidVoid':{
                if (html.visual.parameters.unitCellMode.cellSolidVoid.hasClass('active')) return true;
                else return false;
            }
            case 'cellGradeLimited':{
                if (html.visual.parameters.unitCellMode.cellGradeLimited.hasClass('active')) return true;
                else return false;
            }
            case 'zoom100':{
                if (html.visual.tools.zoomOptions.zoom100.hasClass('active')) return true;
                else return false;
            }
            case 'zoom90':{
                if (html.visual.tools.zoomOptions.zoom90.hasClass('active')) return true;
                else return false;
            }
            case 'zoom80':{
                if (html.visual.tools.zoomOptions.zoom80.hasClass('active')) return true;
                else return false;
            }
            case 'zoom70':{
                if (html.visual.tools.zoomOptions.zoom70.hasClass('active')) return true;
                else return false;
            }
            case 'autoZoom':{
                if (html.visual.tools.zoomOptions.autoZoom.hasClass('active')) return true;
                else return false;
            }
            case 'fog':{
                if (html.visual.fog.checkbox.hasClass('active')) return true;
                else return false;
            }
            case 'fogColor':{
                return '#'+html.visual.fog.color.spectrum('get').toHex();
            }
            case 'fogDensity':{
                return html.visual.fog.density.val();   
            }
            case 'sounds':{
                if (html.visual.sound.sounds.hasClass('active')) return true;
                else return false;
            }
            case 'soundVolume':{
                return html.visual.sound.soundSlider.slider('value');   
            }
            case 'crystalScreenColor':{
                return '#'+html.visual.tools.colorPickers.crystalScreen.spectrum('get').toHex();
            }
            case 'cellScreenColor':{
                return '#'+html.visual.tools.colorPickers.cellScreen.spectrum('get').toHex();
            }
            case 'motifXScreenColor':{
                return '#'+html.visual.tools.colorPickers.motifXScreen.spectrum('get').toHex();
            }
            case 'motifYScreenColor':{
                return '#'+html.visual.tools.colorPickers.motifYScreen.spectrum('get').toHex();
            }
            case 'motifZScreenColor':{
                return '#'+html.visual.tools.colorPickers.motifZScreen.spectrum('get').toHex();
            }
            
            // Library //
            case 'frameIT':{
                if (html.library.png.frameIT.hasClass('active')) return true;
                else return false;
            }
            case 'qrCode':{
                if (html.library.png.qrCode.hasClass('active')) return true;
                else return false;
            }
            case 'printMode':{
                if (html.library.png.printMode.hasClass('active')) return true;
                else return false;
            }
        };
    };
    
    // Determine whether an element is accessible by the app user (enabled/disabled) //
    function retrieveAccessibility(index){
        switch(index){
            case 'latticePadlockDisable':{
                if (html.lattice.padlocks.lattice.hasClass('disabled')) return true;
                else return false;
            }
            case 'motifPadlockDisable':{
                if (html.lattice.padlocks.motif.hasClass('disabled')) return true;
                else return false;
            }
            case 'selectedLattice':{
                if (html.lattice.other.selected.hasClass('disabled')) return true;
                else return false;
            }
        };
    };
    
    // Module Interface //
    /* This functions collects all values/states of every HTML element. Returns the following object:
        {
            activeTab: value,
            tabDisable: value,
            ...
        }
    */
    getUIValue.prototype.getAppState = function(){
        var app = {};
        
        // Retrieve Menu Ribbon Values //
        app.activeTab = retrieveValueFromID('activeTab');
        app.tabDisable = retrieveValueFromID('tabDisable');
        app.toggleButtons = retrieveValueFromID('toggleButtons');
        
        // Retrieve Lattice Tab Values //
        app.selectedLattice = retrieveValueFromID('selectedLattice');
        app.selectedLatticeDisable = retrieveAccessibility('selectedLattice');
        app.latticePadlockDisable = retrieveAccessibility('latticePadlockDisable');
        app.latticePadlock = retrieveValueFromID('latticePadlock');
        app.repeatX = retrieveValueFromID('repeatX');
        app.repeatY = retrieveValueFromID('repeatY');
        app.repeatZ = retrieveValueFromID('repeatZ');
        app.motifPadlockDisable = retrieveAccessibility('motifPadlockDisable');
        app.motifPadlock = retrieveValueFromID('motifPadlock');
        app.scaleX = retrieveValueFromID('scaleX');
        app.scaleY = retrieveValueFromID('scaleY');
        app.scaleZ = retrieveValueFromID('scaleZ');
        app.alpha = retrieveValueFromID('alpha');
        app.beta = retrieveValueFromID('beta');
        app.gamma = retrieveValueFromID('gamma');
        app.borderColor = retrieveValueFromID('borderColor');
        app.filledColor = retrieveValueFromID('filledColor');
        app.radius = retrieveValueFromID('radius');
        app.opacity = retrieveValueFromID('opacity');
        
        // Retrieve Motif Tab Values //
        app.tangency = retrieveValueFromID('tangency');
        app.cellVolume = retrieveValueFromID('cellVolume');
        app.motifLabels = retrieveValueFromID('motifLabels');
        app.lockCameras = retrieveValueFromID('lockCameras');
        
        // Retrieve Visual Tab Values //
        app.lod = retrieveValueFromID('lod');
        app.autoQuality = retrieveValueFromID('autoQuality');
        app.lowQuality = retrieveValueFromID('lowQuality');
        app.mediumQuality = retrieveValueFromID('mediumQuality');
        app.highQuality = retrieveValueFromID('highQuality');
        app.wireframe = retrieveValueFromID('wireframe');
        app.toon = retrieveValueFromID('toon');
        app.flat = retrieveValueFromID('flat');
        app.realistic = retrieveValueFromID('realistic');
        app.lights = retrieveValueFromID('lights');
        app.ssao = retrieveValueFromID('ssao');
        app.shadows = retrieveValueFromID('shadows');
        app.distortionOn = retrieveValueFromID('distortionOn');
        app.distortionOff = retrieveValueFromID('distortionOff');
        app.anaglyph = retrieveValueFromID('anaglyph');
        app.oculus = retrieveValueFromID('oculus');
        app.sideBySide3D = retrieveValueFromID('sideBySide3D');
        app.onTop3D = retrieveValueFromID('onTop3D');
        app.anaglyphCell = retrieveValueFromID('anaglyphCell');
        app.oculusCell = retrieveValueFromID('oculusCell');
        app.sideBySide3DCell = retrieveValueFromID('sideBySide3DCell');
        app.onTop3DCell = retrieveValueFromID('onTop3DCell');
        app.crystalCamTargetOn = retrieveValueFromID('crystalCamTargetOn');
        app.crystalCamTargetOff = retrieveValueFromID('crystalCamTargetOff');
        app.leapMotion = retrieveValueFromID('leapMotion');
        app.crystalClassic = retrieveValueFromID('crystalClassic');
        app.crystalSubstracted = retrieveValueFromID('crystalSubstracted');
        app.crystalSolidVoid = retrieveValueFromID('crystalSolidVoid');
        app.crystalGradeLimited = retrieveValueFromID('crystalGradeLimited');
        app.cellClassic = retrieveValueFromID('cellClassic');
        app.cellSubstracted = retrieveValueFromID('cellSubstracted');
        app.cellSolidVoid = retrieveValueFromID('cellSolidVoid');
        app.cellGradeLimited = retrieveValueFromID('cellGradeLimited');
        app.autoZoom = retrieveValueFromID('autoZoom');
        app.zoom100 = retrieveValueFromID('zoom100');
        app.zoom90 = retrieveValueFromID('zoom90');
        app.zoom80 = retrieveValueFromID('zoom80');
        app.zoom70 = retrieveValueFromID('zoom70');
        app.fog = retrieveValueFromID('fog');
        app.fogColor = retrieveValueFromID('fogColor');
        app.fogDensity = retrieveValueFromID('fogDensity');
        app.sounds = retrieveValueFromID('sounds');
        app.soundVolume = retrieveValueFromID('soundVolume');
        app.crystalScreenColor = retrieveValueFromID('crystalScreenColor');
        app.cellScreenColor = retrieveValueFromID('cellScreenColor');
        app.motifXScreenColor = retrieveValueFromID('motifXScreenColor');
        app.motifYScreenColor = retrieveValueFromID('motifYScreenColor');
        app.motifZScreenColor = retrieveValueFromID('motifZScreenColor');
        
        // Retrieve PNG options //
        app.frameIT = retrieveValueFromID('frameIT');
        app.qrCode = retrieveValueFromID('qrCode');
        app.printMode = retrieveValueFromID('printMode');
        
        return app;
    };
    /* This functions is called by passing multiple objects, like:
        {
            element#1: {
                id: elementID,
                selector: HTML Selector [This is optional]
            },
            element#2: {
                ...
            }
        }
        and returns the following object:
        {
            element#1: value,
            element#2: value,
            ...
        }
    */
    getUIValue.prototype.getValue = function(argument){
        var returnObject = {};
        if (Object.keys(argument).length <= 0) return false;
        else {
            _.each(argument,function($parameter, k){
                // Retrieve value
                if (!(_.isUndefined($parameter.selector))) returnObject[k] = retrieveValue($parameter.id,$parameter.selector);
                else returnObject[k] = retrieveValueFromID($parameter.id);
            });
        }
        return returnObject;
    };
    
    return getUIValue;
});