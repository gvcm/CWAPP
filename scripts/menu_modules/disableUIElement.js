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
    /* This module is used in order to enable/disable certain HTML elements, like inputs,buttons etc. */
    
    // Module References //
    var html = undefined;
    
    // Functions //
    function disableUIElement(argument) {
        // Acquire Module References
        if (!(_.isUndefined(argument.html))) html = argument.html;
        else return false;
    };
    function takeAction(index,value,selector){
        switch(index){
            
            // Lattice Tab //
            case 'latticePadlock':{
                if (value === false){
                    html.lattice.padlocks.lattice.find('a').prop('disabled', false);
                    html.lattice.padlocks.lattice.removeClass('disabled');
                }
                else {
                    html.lattice.padlocks.lattice.find('a').prop('disabled', true);
                    html.lattice.padlocks.lattice.addClass('disabled');
                }
                break;   
            }
            case 'motifPadlock':{
                if (value === false){
                    html.lattice.padlocks.motif.find('a').prop('disabled', false);
                    html.lattice.padlocks.motif.removeClass('disabled');
                }
                else {
                    html.lattice.padlocks.motif.find('a').prop('disabled', true);
                    html.lattice.padlocks.motif.addClass('disabled');
                }
                break;   
            }
            case 'latticeParameters':{
                _.each(html.lattice.parameters, function($parameter,k){

                    // fix_ by Thanos - to be removed

                    // my temp fix
                    if(k !== 'repeatX' && k !== 'repeatY' && k !== 'repeatZ' )
                    {
                        if (value === true){
                            $parameter.prop('disabled',value);
                            jQuery('#'+k+'Slider').slider('disable');
                        }
                        else {
                            $parameter.prop('disabled',value);
                            jQuery('#'+k+'Slider').slider('enable');
                        }
                    }
                    //

                    // old code
                     /*
                     if (value === true){
                        $parameter.prop('disabled',value);
                        jQuery('#'+k+'Slider').slider('disable');
                    }
                    else {
                        $parameter.prop('disabled',value);
                        jQuery('#'+k+'Slider').slider('enable');
                    }
                    */

                });   
            }
            case 'select_lattice': {
                if (value === true) {
                    html.lattice.other.selected.parent().addClass('disabled');
                    html.lattice.other.selected.addClass('disabled');
                }
                else {
                    html.lattice.other.selected.parent().removeClass('disabled');
                    html.lattice.other.selected.removeClass('disabled');
                }
                break;
            }
            case 'latticeRefreshButtons':{
                if (value === true) html.lattice.other.refreshButtons.hide();
                else html.lattice.other.refreshButtons.show();
                break;   
            }
            case 'repeatX':{
                html.lattice.parameters.repeatX.prop('disabled', value);
                break;
            }
            case 'repeatY':{
                html.lattice.parameters.repeatY.prop('disabled', value);
                break;
            }
            case 'repeatZ':{
                html.lattice.parameters.repeatZ.prop('disabled', value);
                break;
            }
            case 'scaleX':{
                html.lattice.parameters.scaleX.prop('disabled', value);
                break;
            }
            case 'scaleY':{
                html.lattice.parameters.scaleY.prop('disabled', value);
                break;
            }
            case 'scaleZ':{
                html.lattice.parameters.scaleZ.prop('disabled', value);
                break;
            }
            case 'alpha':{
                html.lattice.parameters.alpha.prop('disabled', value);
                break;
            }
            case 'beta':{
                html.lattice.parameters.beta.prop('disabled', value);
                break;
            }
            case 'gamma':{
                html.lattice.parameters.gamma.prop('disabled', value);
                break;
            }
                
            // PnD Tab //
            case 'planeName':{
                html.pnd.planeParameters.planeName.prop('disabled', value);
                break;
            }
            case 'planeColor':{
                if (value === true) html.pnd.planeParameters.planeColor.spectrum('disable');
                else html.pnd.planeParameters.planeColor.spectrum('enable');
                break;
            }
            case 'planeOpacity':{
                html.pnd.planeParameters.planeOpacity.prop('disabled', value);
                break;
            }
            case 'millerH':{
                html.pnd.planeParameters.millerH.prop('disabled', value);
                break;
            }
            case 'millerK':{
                html.pnd.planeParameters.millerK.prop('disabled', value);
                break;
            }
            case 'millerL':{
                html.pnd.planeParameters.millerL.prop('disabled', value);
                break;
            }
            case 'millerI':{
                html.pnd.planeParameters.millerI.prop('disabled', value);
                break;
            }
            case 'directionName':{
                html.pnd.directionParameters.directionName.prop('disabled', value);
                break;
            }
            case 'directionColor':{
                if (value === true) html.pnd.directionParameters.directionColor.spectrum('disable');
                else html.pnd.directionParameters.directionColor.spectrum('enable');
                break;
            }
            case 'dirRadius':{
                html.pnd.directionParameters.dirRadius.prop('disabled', value);
                break;
            }
            case 'millerU':{
                html.pnd.directionParameters.millerU.prop('disabled', value);
                break;
            }
            case 'millerV':{
                html.pnd.directionParameters.millerV.prop('disabled', value);
                break;
            }
            case 'millerW':{
                html.pnd.directionParameters.millerW.prop('disabled', value);
                break;
            }
            case 'millerT':{
                html.pnd.directionParameters.millerT.prop('disabled', value);
                break;
            }
            case 'savePlane':{
                if (value === true) html.pnd.planeButtons.savePlane.addClass('disabled');
                else html.pnd.planeButtons.savePlane.removeClass('disabled');
                break;
            }
            case 'deletePlane':{
                if (value === true) html.pnd.planeButtons.deletePlane.addClass('disabled');
                else html.pnd.planeButtons.deletePlane.removeClass('disabled');
                break;
            }
            case 'newPlane':{
                if (value === true) html.pnd.planeButtons.newPlane.addClass('disabled');
                else html.pnd.planeButtons.newPlane.removeClass('disabled');
                break;
            }
            case 'parallelPlane':{
                if (value === true) html.pnd.planeButtons.parallelPlane.addClass('disabled');
                else html.pnd.planeButtons.parallelPlane.removeClass('disabled');
                break;
            }
            case 'saveDirection':{
                if (value === true) html.pnd.directionButtons.saveDirection.addClass('disabled');
                else html.pnd.directionButtons.saveDirection.removeClass('disabled');
                break;
            }
            case 'deleteDirection':{
                if (value === true) html.pnd.directionButtons.deleteDirection.addClass('disabled');
                else html.pnd.directionButtons.deleteDirection.removeClass('disabled');
                break;
            }
            case 'newDirection':{
                if (value === true) html.pnd.directionButtons.newDirection.addClass('disabled');
                else html.pnd.directionButtons.newDirection.removeClass('disabled');
                break;
            }
                
            // Motif Tab //
            case 'motifPadlock':{
                if (value === false){
                    html.lattice.padlocks.motif.find('a').prop('disabled', false);
                    html.lattice.padlocks.motif.removeClass('disabled');
                }
                else {
                    html.lattice.padlocks.motif.find('a').prop('disabled', true);
                    html.lattice.padlocks.motif.add('disabled');
                }
                break;   
            }
            case 'atomPosX':{
                html.motif.motifInputs.atomPosX.prop('disabled', value);
                break;
            }
            case 'atomPosXSlider':{
                if(value === true) html.motif.motifSliders.atomPosX.slider('disable');
                else html.motif.motifSliders.atomPosX.slider('enable');
                break;
            }
            case 'atomPosY':{
                html.motif.motifInputs.atomPosY.prop('disabled', value);
                break;
            }
            case 'atomPosYSlider':{
                if(value === true) html.motif.motifSliders.atomPosY.slider('disable');
                else html.motif.motifSliders.atomPosY.slider('enable');
                break;
            }
            case 'atomPosZ':{
                html.motif.motifInputs.atomPosZ.prop('disabled', value);
                break;
            }
            case 'atomPosZSlider':{
                if(value === true) html.motif.motifSliders.atomPosZ.slider('disable');
                else html.motif.motifSliders.atomPosZ.slider('enable');
                break;
            }
            case 'tangentR':{
                html.motif.panel.tangentR.prop('disabled', value);
                break;
            }
            case 'rotAngleTheta':{
                html.motif.rotatingAngles.combo.rotAngleTheta.prop('disabled', value);
                break;
            }
            case 'rotAnglePhi':{
                html.motif.rotatingAngles.combo.rotAnglePhi.prop('disabled', value);
                break;
            }
            case 'atomOpacity':{
                html.motif.atomParameters.atomOpacity.prop('disabled', value);
                takeAction('atomOpacitySlider',value);
                break;
            }
            case 'atomOpacitySlider':{
                if(value === true) html.motif.panel.opacitySlider.slider('disable');
                else html.motif.panel.opacitySlider.slider('enable');
                break;
            }
            case 'atomColor':{
                if (value === true) html.motif.panel.color.spectrum('disable');
                else html.motif.panel.color.spectrum('enable');
                break;
            }
            case 'atomPositioningXYZ':{
                if (value === true){
                    html.motif.panel.atomPositioningXYZ.addClass('disabled');
                    html.motif.panel.atomPositioningXYZ.parent().addClass('disabled');
                }
                else {
                    html.motif.panel.atomPositioningXYZ.removeClass('disabled');
                    html.motif.panel.atomPositioningXYZ.parent().removeClass('disabled');
                }
                break;
            }
            case 'atomPositioningABC':{
                if (value === true){
                    html.motif.panel.atomPositioningABC.addClass('disabled');
                    html.motif.panel.atomPositioningABC.parent().addClass('disabled');
                }
                else {
                    html.motif.panel.atomPositioningABC.removeClass('disabled');
                    html.motif.panel.atomPositioningABC.parent().removeClass('disabled');
                }
                break;
            }
            case 'atomPositioningAuto':{
                if (value === true){
                    html.motif.panel.atomPositioningAuto.addClass('disabled');
                    html.motif.panel.atomPositioningAuto.parent().addClass('disabled');
                }
                else {
                    html.motif.panel.atomPositioningAuto.removeClass('disabled');
                    html.motif.panel.atomPositioningAuto.parent().removeClass('disabled');
                }
                break;
            }
            case 'saveAtomChanges':{
                if (value === true) html.motif.actions.save.addClass('disabled');
                else html.motif.actions.save.removeClass('disabled');
                break;
            }
            case 'atomPalette':{
                if (value === true) {
                    html.motif.actions.add.children().removeAttr('data-toggle');
                    html.motif.actions.add.addClass('disabled');
                }
                else {
                    html.motif.actions.add.children().attr('data-toggle','modal');
                    html.motif.actions.add.removeClass('disabled');   
                }
                break;
            }
            case 'deleteAtom':{
                if (value === true) html.motif.actions.delete.addClass('disabled');
                else html.motif.actions.delete.removeClass('disabled');
                break;
            }
            case 'tangency':{
                if (value === true) html.motif.panel.tangency.parent().addClass('disabled');
                else html.motif.panel.tangency.parent().removeClass('disabled');
                break;
            }
            case 'cellVolume':{
                html.motif.other.cellVolume.prop('disabled', value);
                takeAction('cellVolumeSlider',value);
                break;
            }
            case 'cellVolumeSlider':{
                if(value === true) html.motif.other.cellVolumeSlider.slider('disable');
                else html.motif.other.cellVolumeSlider.slider('enable');
                break;
            }
            case 'rotAngleSection':{
                if (value === true) html.motif.rotatingAngles.section.show(0);
                else html.motif.rotatingAngles.section.hide(0);
                html.interface.screen.scrollBars.getNiceScroll().resize();
                break;   
            }
            case 'hideChainIcon':{
                if (value.value === true) html.motif.other.atomTable.find('#'+value.id).find('.chain').addClass('hiddenIcon');
                else html.motif.other.atomTable.find('#'+value.id).find('.chain').removeClass('hiddenIcon');
                break;
            }     
            case 'entryVisibility':{
                if(value === true){ 
                    selector.find('img').attr('src','Images/visible-icon-sm.png');
                    selector.addClass('visible');
                }
                else {
                    selector.find('img').attr('src','Images/hidden-icon-sm.png');
                    selector.removeClass('visible');
                }
                break;   
            }// REQUIRES SELECTOR FROM THE CALLER //
                
            // Note Tab
            case 'noteOpacity':{
                html.notes.properties.opacity.prop('disabled', value);
                break;
            }
            case 'noteTitle':{
                html.notes.properties.title.prop('disabled', value);
                break;
            }
            case 'noteBody':{
                html.notes.other.body.prop('disabled', value);
                break;
            }
            case 'noteColor':{
                if (value === true) html.notes.properties.color.spectrum('disable');
                else html.notes.properties.color.spectrum('enable');
                break;
            }
            case 'newNote':{
                if (value === true) html.notes.actions.new.addClass('disabled');
                else html.notes.actions.new.removeClass('disabled');
                break;
            }
            case 'deleteNote':{
                if (value === true) html.notes.actions.delete.addClass('disabled');
                else html.notes.actions.delete.removeClass('disabled');
                break;
            }
            case 'saveNote':{
                if (value === true) html.notes.actions.save.addClass('disabled');
                else html.notes.actions.save.removeClass('disabled');
                break;
            }
                
            // Visual Tab
            case 'realistic':{
                if (value === true){
                    html.visual.parameters.renderizationMode.realistic.css('background','white');
                    html.visual.parameters.renderizationMode.realistic.removeClass('active');
                    html.visual.parameters.renderizationMode.realistic.addClass('disabled');
                }
                else {
                    html.visual.parameters.renderizationMode.realistic.css('background','#36383d');
                    html.visual.parameters.renderizationMode.realistic.removeClass('disabled');
                }
                break;   
            }
            case 'wireframe':{
                if (value === true){
                    html.visual.parameters.renderizationMode.wireframe.css('background','white');
                    html.visual.parameters.renderizationMode.wireframe.removeClass('active');
                    html.visual.parameters.renderizationMode.wireframe.addClass('disabled');
                }
                else {
                    html.visual.parameters.renderizationMode.wireframe.css('background','#36383d');
                    html.visual.parameters.renderizationMode.wireframe.removeClass('disabled');
                }
                break;   
            }
            case 'toon':{
                if (value === true){
                    html.visual.parameters.renderizationMode.toon.css('background','white');
                    html.visual.parameters.renderizationMode.toon.removeClass('active');
                    html.visual.parameters.renderizationMode.toon.addClass('disabled');
                }
                else {
                    html.visual.parameters.renderizationMode.toon.css('background','#36383d');
                    html.visual.parameters.renderizationMode.toon.removeClass('disabled');
                }
                break;   
            }
            case 'flat':{
                if (value === true){
                    html.visual.parameters.renderizationMode.flat.css('background','white');
                    html.visual.parameters.renderizationMode.flat.removeClass('active');
                    html.visual.parameters.renderizationMode.flat.addClass('disabled');
                }
                else {
                    html.visual.parameters.renderizationMode.flat.css('background','#36383d');
                    html.visual.parameters.renderizationMode.flat.removeClass('disabled');
                }
                break;   
            }
            case 'crystalClassic':{
                if (value === true){
                    html.visual.parameters.crystalMode.crystalClassic.css('background','white');
                    html.visual.parameters.crystalMode.crystalClassic.removeClass('active');
                    html.visual.parameters.crystalMode.crystalClassic.addClass('disabled');
                }
                else {
                    html.visual.parameters.crystalMode.crystalClassic.css('background','#36383d');
                    html.visual.parameters.crystalMode.crystalClassic.removeClass('disabled');
                }
                break;   
            }
            case 'crystalSubstracted':{
                if (value === true){
                    html.visual.parameters.crystalMode.crystalSubstracted.css('background','white');
                    html.visual.parameters.crystalMode.crystalSubstracted.removeClass('active');
                    html.visual.parameters.crystalMode.crystalSubstracted.addClass('disabled');
                }
                else {
                    html.visual.parameters.crystalMode.crystalSubstracted.css('background','#36383d');
                    html.visual.parameters.crystalMode.crystalSubstracted.removeClass('disabled');
                }
                break;   
            }
            case 'crystalSolidVoid':{
                if (value === true){
                    html.visual.parameters.crystalMode.crystalSolidVoid.css('background','white');
                    html.visual.parameters.crystalMode.crystalSolidVoid.removeClass('active');
                    html.visual.parameters.crystalMode.crystalSolidVoid.addClass('disabled');
                }
                else {
                    html.visual.parameters.crystalMode.crystalSolidVoid.css('background','#36383d');
                    html.visual.parameters.crystalMode.crystalSolidVoid.removeClass('disabled');
                }
                break;   
            }
            case 'crystalGradeLimited':{
                if (value === true){
                    html.visual.parameters.crystalMode.crystalGradeLimited.css('background','white');
                    html.visual.parameters.crystalMode.crystalGradeLimited.removeClass('active');
                    html.visual.parameters.crystalMode.crystalGradeLimited.addClass('disabled');
                }
                else {
                    html.visual.parameters.crystalMode.crystalGradeLimited.css('background','#36383d');
                    html.visual.parameters.crystalMode.crystalGradeLimited.removeClass('disabled');
                }
                break;   
            }
            case 'cellClassic':{
                if (value === true){
                    html.visual.parameters.unitCellMode.cellClassic.css('background','white');
                    html.visual.parameters.unitCellMode.cellClassic.removeClass('active');
                    html.visual.parameters.unitCellMode.cellClassic.addClass('disabled');
                }
                else {
                    html.visual.parameters.unitCellMode.cellClassic.css('background','#36383d');
                    html.visual.parameters.unitCellMode.cellClassic.removeClass('disabled');
                }
                break;   
            }
            case 'cellSubstracted':{
                if (value === true){
                    html.visual.parameters.unitCellMode.cellSubstracted.css('background','white');
                    html.visual.parameters.unitCellMode.cellSubstracted.removeClass('active');
                    html.visual.parameters.unitCellMode.cellSubstracted.addClass('disabled');
                }
                else {
                    html.visual.parameters.unitCellMode.cellSubstracted.css('background','#36383d');
                    html.visual.parameters.unitCellMode.cellSubstracted.removeClass('disabled');
                }
                break;   
            }
            case 'cellSolidVoid':{
                if (value === true){
                    html.visual.parameters.unitCellMode.cellSolidVoid.css('background','white');
                    html.visual.parameters.unitCellMode.cellSolidVoid.removeClass('active');
                    html.visual.parameters.unitCellMode.cellSolidVoid.addClass('disabled');
                }
                else {
                    html.visual.parameters.unitCellMode.cellSolidVoid.css('background','#36383d');
                    html.visual.parameters.unitCellMode.cellSolidVoid.removeClass('disabled');
                }
                break;   
            }
            case 'cellGradeLimited':{
                if (value === true){
                    html.visual.parameters.unitCellMode.cellGradeLimited.css('background','white');
                    html.visual.parameters.unitCellMode.cellGradeLimited.removeClass('active');
                    html.visual.parameters.unitCellMode.cellGradeLimited.addClass('disabled');
                }
                else {
                    html.visual.parameters.unitCellMode.cellGradeLimited.css('background','#36383d');
                    html.visual.parameters.unitCellMode.cellGradeLimited.removeClass('disabled');
                }
                break;   
            }
            case 'muteSound':{
                if (value === true){
                    html.visual.sound.mute.removeClass('active');
                    html.visual.sound.mute.addClass('disable');
                }
                else {
                    html.visual.sound.mute.removeClass('disable');
                }
                break;
            };
                
            // Reset
            case 'reset':{
                
                // Lattice
                takeAction('latticeRefreshButtons',true);
                takeAction('latticePadlock',true);
                takeAction('motifPadlock',true);
                
                // Motif
                takeAction('atomPalette',false);
                takeAction('saveAtomChanges ',true);
                takeAction('atomPositioningXYZ',true);
                takeAction('atomPositioningABC',true);
                takeAction('atomPosX',true);
                takeAction('atomPosXSlider',true);
                takeAction('atomPosY',true);
                takeAction('atomPosYSlider',true);
                takeAction('atomPosZ',true);
                takeAction('atomPosZSlider',true);
                takeAction('atomColor',true);
                takeAction('atomOpacity',true);
                takeAction('atomOpacitySlider',true);
                takeAction('rotAngleSection',false);
                html.motif.other.atomTable.hide();
                
                // PnD
                takeAction('newPlane',false);
                takeAction('savePlane',true);
                takeAction('deletePlane',true);
                takeAction('millerH',true);
                takeAction('millerK',true);
                takeAction('millerL',true);
                takeAction('millerI',true);
                takeAction('planeColor',true);
                takeAction('planeName',true);
                takeAction('planeOpacity',true);
                html.pnd.tables.planes.hide();
                takeAction('newDirection',false);
                takeAction('saveDirection',true);
                takeAction('deleteDirection',true);
                takeAction('millerU',true);
                takeAction('millerV',true);
                takeAction('millerW',true);
                takeAction('millerT',true);
                takeAction('directionColor',true);
                takeAction('directionName',true);
                takeAction('dirRadius',true);
                html.pnd.tables.directions.hide();
                
                // Notes
                takeAction('newNote',false);
                takeAction('saveNote',true);
                takeAction('deleteNote',true);
                takeAction('noteTitle',true);
                takeAction('noteOpacity',true);
                takeAction('noteBody',true);
                takeAction('noteColor',true);
                html.notes.other.table.hide();
            }
        };
    };

    // Module Interface //
    /* This function is called by passing multiple objects, like:
        {
            element#1: {
                value: true/false,
                other: HTML selector [This is optional, see line 360]
            },
            element#2:{
                ...
            },
            ...
        }
    */
    disableUIElement.prototype.disableElement = function(argument){
        if (Object.keys(argument).length <= 0) return false;
        else {
            _.each(argument,function($parameter, k){
                // Read Value and run action
                var selector = undefined;
                if (_.isUndefined($parameter.other)) selector = '';
                else selector = $parameter.other;
                if (!(_.isUndefined($parameter.value))) takeAction(k,$parameter.value,selector);
            });
        }
    };
    /* This functions restores some HTML elements to the state described by the data argument, which is a JSON parsed object. */
    disableUIElement.prototype.restoreUI = function(data){
        takeAction('latticePadlock',data.latticeTab.padlocks.lattice.disabled);
        takeAction('motifPadlock',data.latticeTab.padlocks.motif.disabled);
        takeAction('select_lattice',data.latticeTab.latticeSelecion.selectedLatticeDisable);
    };
    
    return disableUIElement;
});