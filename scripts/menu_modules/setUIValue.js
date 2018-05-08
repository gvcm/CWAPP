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
    /* This modules changes every UI input/button/element.
    
        Every action triggered by the other modules, it actually takes place in here.
        
        * TO AVOID INFITE LOOPING, INPUTS CHANGE SLIDERS FROM THIS MODULE, BUT SLIDERS SHOULD CHANGE INPUTS LOCALLY FROM, THEIR HANDLER.
        * TO SUM UP, IN ORDER FOR THE SYSTEM TO MOVE A SLIDER, IT HAS TO CHANGE THE INPUT FROM THIS MODULE.
        
        * To dogde another inifite loop, we're using the allowPublish variable. If we run into a condition we cannot pass during the
          'taking action' part, then we're blocking the publishing of this event.
    */
    
    // Variables
    var $selector = undefined;
    var allowPublish = false;
    
    // Modules References
    var $messages = undefined;
    var $tooltipGenerator = undefined;
    var $stringEditor = undefined;
    var $menu = undefined;
    var html = undefined;
    var events = undefined;
    
    // Contructor //
    function setUIValue(argument) {
        
        // Acquire Module References //
        if (!(_.isUndefined(argument.messages))) $messages = argument.messages;
        else return false;
        if (!(_.isUndefined(argument.stringEditor))) $stringEditor = argument.stringEditor;
        else return false;
        if (!(_.isUndefined(argument.tooltipGenerator))) $tooltipGenerator = argument.tooltipGenerator;
        else return false;
        if (!(_.isUndefined(argument.menu))) $menu = argument.menu;
        else return false;
        if (!(_.isUndefined(argument.html))) html = argument.html;
        else return false;
        
        // Get Event List from Menu //
        events = $menu.events;
    };
    
    // Sets UI Value - Selector is optional //
    function takeAction(index,value,selector){
        
        // If setting a new value fails, block publish //
        var success = true;
        switch(index){
            
            // Menu Ribbon
            case 'xyzAxes':{
                if (value === true) html.menu.toggles.xyzAxes.parent().addClass('lightThemeActive');
                else html.menu.toggles.xyzAxes.parent().removeClass('lightThemeActive');
                $menu.showCanvasXYZLabels(value);
                break;
            }
            case 'abcAxes':{
                if (value === true) html.menu.toggles.abcAxes.parent().addClass('lightThemeActive');
                else html.menu.toggles.abcAxes.parent().removeClass('lightThemeActive');
                $menu.showCanvasABCLabels(value);
                break;
            }
            case 'edges':{
                if (value === true) {
                    html.lattice.visual.edgeCheckbox.iCheck('check');
                    html.menu.toggles.edges.parent().addClass('lightThemeActive');
                }
                else {
                    html.lattice.visual.edgeCheckbox.iCheck('uncheck');
                    html.menu.toggles.edges.parent().removeClass('lightThemeActive');
                }
                break;
            }
            case 'faces':{
                if (value === true) {
                    html.lattice.visual.faceCheckbox.iCheck('check');
                    html.menu.toggles.faces.parent().addClass('lightThemeActive');
                }
                else {
                    html.lattice.visual.faceCheckbox.iCheck('uncheck');
                    html.menu.toggles.faces.parent().removeClass('lightThemeActive');
                }
                break;
            }
            case 'latticePoints':{
                if (value === true) html.menu.toggles.latticePoints.parent().addClass('lightThemeActive');
                else html.menu.toggles.latticePoints.parent().removeClass('lightThemeActive');
                break;
            }
            case 'planes':{
                if (value === true) {
                    html.pnd.tables.planes.find('.planeButton').find('img').attr('src','Images/hidden-icon-sm.png');
                    html.menu.toggles.planes.parent().addClass('lightThemeActive');
                }
                else {
                    html.pnd.tables.planes.find('.planeButton').find('img').attr('src','Images/visible-icon-sm.png');
                    html.menu.toggles.planes.parent().removeClass('lightThemeActive');
                }
                publishAction('planes',value);
                break;
            }
            case 'directions':{
                if (value === true) {
                    html.pnd.tables.directions.find('.directionButton').find('img').attr('src','Images/hidden-icon-sm.png');
                    html.menu.toggles.directions.parent().addClass('lightThemeActive');
                }
                else {
                    html.pnd.tables.directions.find('.directionButton').find('img').attr('src','Images/visible-icon-sm.png');
                    html.menu.toggles.directions.parent().removeClass('lightThemeActive');
                }
                publishAction('directions',value);
                break;
            }
            case 'atomToggle':{
                if (value === true) html.menu.toggles.atomToggle.parent().addClass('lightThemeActive');
                else html.menu.toggles.atomToggle.parent().removeClass('lightThemeActive');
                break;
            }
            case 'atomRadius':{
                if (value === true) {
                    html.menu.other.atomRadiusSliderContainer.show('slow');
                    html.menu.toggles.atomRadius.parent().addClass('lightThemeActive');
                }
                else {
                    html.menu.other.atomRadiusSliderContainer.hide('slow');
                    html.menu.toggles.atomRadius.parent().removeClass('lightThemeActive');
                }
                break;
            }
            case 'unitCellViewport':{
                if (value === true) html.menu.toggles.unitCellViewport.parent().addClass('lightThemeActive');
                else html.menu.toggles.unitCellViewport.parent().removeClass('lightThemeActive');
                $menu.viewport(value);
                break;
            }
            case 'labelToggle':{
                if (value === true) html.menu.toggles.labelToggle.parent().addClass('lightThemeActive');
                else html.menu.toggles.labelToggle.parent().removeClass('lightThemeActive');
                break;
            }
            case 'highlightTangency':{
                if (value === true) html.menu.toggles.highlightTangency.parent().addClass('lightThemeActive');
                else html.menu.toggles.highlightTangency.parent().removeClass('lightThemeActive');
                break;
            }
            case 'atomRadiusSlider':{
                html.menu.other.atomRadiusSlider.slider('value',value);
                break;
            }
            case 'fullScreen':{
                if (value === true) html.menu.toggles.fullScreen.parent().addClass('lightThemeActive');
                else html.menu.toggles.fullScreen.parent().removeClass('lightThemeActive');
                break;
            }
            
            // Lattice Tab
            case 'latticePadlock':{
                if (value === true) {
                    if (!(html.lattice.padlocks.lattice.children().addClass('active'))) html.lattice.padlocks.lattice.find('a').button('toggle');
                    html.lattice.padlocks.lattice.children().addClass('active');
                }
                else {
                    if (html.lattice.padlocks.lattice.children().addClass('active')) html.lattice.padlocks.lattice.find('a').button('toggle');
                    html.lattice.padlocks.lattice.children().removeClass('active');
                }
                break;
            }
            case 'motifPadlock':{
                if (value === true) {
                    if (!(html.lattice.padlocks.motif.children().addClass('active'))) html.lattice.padlocks.motif.find('a').button('toggle');
                    html.lattice.padlocks.motif.children().addClass('active');
                }
                else {
                    if (html.lattice.padlocks.motif.children().addClass('active')) html.lattice.padlocks.motif.find('a').button('toggle');
                    html.lattice.padlocks.motif.children().removeClass('active');
                }
                break;
            }
            case 'selectedLattice':{
                html.lattice.other.selected.html(value);
                break;
            }
            case 'gridCheckButton':{
                if (value === true) html.lattice.visual.edgeCheckbox.addClass('active');
                else html.lattice.visual.edgeCheckbox.removeClass('active');
                takeAction('edges',value);
                break;
            }
            case 'faceCheckButton':{
                if (value === true) html.lattice.visual.faceCheckbox.addClass('active');
                else html.lattice.visual.faceCheckbox.removeClass('active');
                takeAction('faces',value);
                break;
            }
            case 'cylinderColor':{
                html.lattice.visual.edgeColorPicker.children().css('background','#'+value);
                break;  
            }
            case 'cellEdgeColor':{
                html.lattice.visual.edgeColorPicker.spectrum('set',value);
                html.lattice.visual.edgeColorPicker.children().css('background',value);
                break;  
            }
            case 'cellFaceColor':{
                html.lattice.visual.faceColorPicker.spectrum('set',value);
                html.lattice.visual.faceColorPicker.children().css('background',value);
                break;  
            }
            case 'faceColor':{
                html.lattice.visual.faceColorPicker.children().css('background','#'+value);
                break;  
            }
            case 'repeatX':{
                var newVal = $stringEditor.inputIsInteger(value.toString());
                if (newVal !== false) html.lattice.parameters.repeatX.val(newVal);
                else {
                    $tooltipGenerator.showTooltip({
                        'target': index,
                        'placement': 'top',
                        'message': $messages.getMessage(19)
                    });
                    html.lattice.parameters.repeatX.val('');
                    success = false;
                }
                break;
            }
            case 'repeatY':{
                var newVal = $stringEditor.inputIsInteger(value.toString());
                if (newVal !== false) html.lattice.parameters.repeatY.val(newVal);
                else {
                    $tooltipGenerator.showTooltip({
                        'target': index,
                        'placement': 'top',
                        'message': $messages.getMessage(19)
                    });
                    html.lattice.parameters.repeatY.val('');
                    success = false;
                }
                break;
            }
            case 'repeatZ':{
                var newVal = $stringEditor.inputIsInteger(value.toString());
                if (newVal !== false) html.lattice.parameters.repeatZ.val(newVal);
                else {
                    $tooltipGenerator.showTooltip({
                        'target': index,
                        'placement': 'top',
                        'message': $messages.getMessage(19)
                    });
                    html.lattice.parameters.repeatZ.val('');
                    success = false;
                }
                break;
            }
            case 'radius':{
                var newVal = $stringEditor.inputIsInteger(value);
                if (newVal !== false) {
                    takeAction('radiusSlider',newVal);
                    html.lattice.visual.radius.val(newVal);
                }
                else {
                    $tooltipGenerator.showTooltip({
                        'target': index,
                        'placement': 'top',
                        'message': $messages.getMessage(19)
                    });
                    html.lattice.visual.radius.val('');
                    success = false;
                }
                break;
            }
            case 'radiusSlider':{
                html.lattice.visual.radiusSlider.slider('value',value);
                break;
            }
            case 'faceOpacity':{
                var newVal = $stringEditor.inputIsInteger(value.toString());
                if (newVal !== false) {
                    takeAction('faceOpacitySlider',newVal);
                    html.lattice.visual.opacity.val(newVal);
                }
                else {
                    $tooltipGenerator.showTooltip({
                        'target': index,
                        'placement': 'top',
                        'message': $messages.getMessage(19)
                    });
                    html.lattice.visual.opacity.val('');
                    success = false;
                }
                break;
            }
            case 'faceOpacitySlider':{
                html.lattice.visual.opacitySlider.slider('value',value);
                break;
            }
            case 'alpha':{
                var newVal = $stringEditor.inputIsNumber(value.toString());
                if (newVal !== false) {
                    takeAction('alphaSlider',newVal);
                    html.lattice.parameters.alpha.val(newVal);
                }
                else {
                    $tooltipGenerator.showTooltip({
                        'target': index,
                        'placement': 'top',
                        'message': $messages.getMessage(20)
                    });
                    html.lattice.parameters.alpha.val('');
                    success = false;
                }
                break;
            }
            case 'alphaSlider':{
                html.lattice.sliders.alpha.slider('value',value);
                break;
            }
            case 'beta':{
                var newVal = $stringEditor.inputIsNumber(value.toString());
                if (newVal !== false) {
                    takeAction('betaSlider',newVal);
                    html.lattice.parameters.beta.val(newVal);
                }
                else {
                    $tooltipGenerator.showTooltip({
                        'target': index,
                        'placement': 'top',
                        'message': $messages.getMessage(20)
                    });
                    html.lattice.parameters.beta.val('');
                    success = false;
                }
                break;
            }
            case 'betaSlider':{
                html.lattice.sliders.beta.slider('value',value);
                break;
            }
            case 'gamma':{
                var newVal = $stringEditor.inputIsNumber(value.toString());
                if (newVal !== false) {
                    takeAction('gammaSlider',newVal);
                    html.lattice.parameters.gamma.val(newVal);
                }
                else {
                    $tooltipGenerator.showTooltip({
                        'target': index,
                        'placement': 'top',
                        'message': $messages.getMessage(20)
                    });
                    html.lattice.parameters.gamma.val('');
                    success = false;
                }
                break;
            }
            case 'gammaSlider':{
                html.lattice.sliders.gamma.slider('value',value);
                break;
            }
            case 'scaleX':{
                var newVal = $stringEditor.inputIsNumber(value.toString());
                if (newVal !== false) {
                    takeAction('scaleXSlider',newVal);
                    html.lattice.parameters.scaleX.val(newVal);
                }
                else {
                    $tooltipGenerator.showTooltip({
                        'target': index,
                        'placement': 'top',
                        'message': $messages.getMessage(20)
                    });
                    html.lattice.parameters.scaleX.val('');
                    success = false;
                }
                break;
            }
            case 'scaleXMotif':{
                var newVal = $stringEditor.inputIsNumber(value.toString());
                if (newVal !== false) {
                    takeAction('scaleXSlider',newVal);
                    selector.val(newVal);
                }
                else {
                    $tooltipGenerator.showTooltip({
                        'target': 'scaleX',
                        'placement': 'top',
                        'message': $messages.getMessage(20)
                    });
                    selector.val('');
                    success = false;
                }
                break;
            } // Requires Selector //
            case 'scaleXSlider':{
                html.lattice.sliders.scaleX.slider('value',value);
                break;
            }
            case 'scaleY':{
                var newVal = $stringEditor.inputIsNumber(value.toString());
                if (newVal !== false) {
                    takeAction('scaleYSlider',newVal);
                    html.lattice.parameters.scaleY.val(newVal);
                }
                else {
                    $tooltipGenerator.showTooltip({
                        'target': index,
                        'placement': 'top',
                        'message': $messages.getMessage(20)
                    });
                    html.lattice.parameters.scaleY.val('');
                    success = false;
                }
                break;
            }
            case 'scaleYMotif':{
                var newVal = $stringEditor.inputIsNumber(value.toString());
                if (newVal !== false) {
                    takeAction('scaleYSlider',newVal);
                    selector.val(newVal);
                }
                else {
                    $tooltipGenerator.showTooltip({
                        'target': 'scaleY',
                        'placement': 'top',
                        'message': $messages.getMessage(20)
                    });
                    selector.val('');
                    success = false;
                }
                break;
            } // Requires Selector //
            case 'scaleYSlider':{
                html.lattice.sliders.scaleY.slider('value',value.toString());
                break;
            }
            case 'scaleZ':{
                var newVal = $stringEditor.inputIsNumber(value.toString());
                if (newVal !== false) {
                    takeAction('scaleZSlider',newVal);
                    html.lattice.parameters.scaleZ.val(newVal);
                }
                else {
                    $tooltipGenerator.showTooltip({
                        'target': index,
                        'placement': 'top',
                        'message': $messages.getMessage(20)
                    });
                    html.lattice.parameters.scaleZ.val('');
                    success = false;
                }
                break;
            }
            case 'scaleZMotif':{
                var newVal = $stringEditor.inputIsNumber(value.toString());
                if (newVal !== false) {
                    takeAction('scaleZSlider',newVal);
                    selector.val(newVal);
                }
                else {
                    $tooltipGenerator.showTooltip({
                        'target': 'scaleZ',
                        'placement': 'top',
                        'message': $messages.getMessage(20)
                    });
                    selector.val('');
                    success = false;
                }
                break;
            } // Requires Selector //
            case 'scaleZSlider':{
                html.lattice.sliders.scaleZ.slider('value',value);
                break;
            }
                
            // PnD Tab
            case 'planeColor':{
                html.pnd.planeParameters.planeColor.spectrum('set',value);
                html.pnd.planeParameters.planeColor.children().css('background',value);
                break;
            }
            case 'planeOpacity':{
                html.pnd.planeParameters.planeOpacity.selectpicker('val',value);
                break;
            }
            case 'planeName':{
                html.pnd.planeParameters.planeName.val(value);
                break;
            }
            case 'millerH':{
                var newVal = $stringEditor.inputIsInteger(value.toString());
                if (newVal !== false) html.pnd.planeParameters.millerH.val(newVal);
                else {
                    $tooltipGenerator.showTooltip({
                        'target': index,
                        'placement': 'top',
                        'message': $messages.getMessage(19)
                    });
                    html.pnd.planeParameters.millerH.val('');
                    success = false;
                }
                break;
            }
            case 'millerK':{
                var newVal = $stringEditor.inputIsInteger(value.toString());
                if (newVal !== false) html.pnd.planeParameters.millerK.val(newVal);
                else {
                    $tooltipGenerator.showTooltip({
                        'target': index,
                        'placement': 'top',
                        'message': $messages.getMessage(19)
                    });
                    html.pnd.planeParameters.millerK.val('');
                    success = false;
                }
                break;
            }
            case 'millerL':{
                var newVal = $stringEditor.inputIsInteger(value.toString());
                if (newVal !== false) html.pnd.planeParameters.millerL.val(newVal);
                else {
                    $tooltipGenerator.showTooltip({
                        'target': index,
                        'placement': 'top',
                        'message': $messages.getMessage(19)
                    });
                    html.pnd.planeParameters.millerL.val('');
                    success = false;
                }
                break;
            }
            case 'millerI':{
                var newVal = $stringEditor.inputIsInteger(value.toString());
                if (newVal !== false) html.pnd.planeParameters.millerI.val(newVal);
                else {
                    $tooltipGenerator.showTooltip({
                        'target': index,
                        'placement': 'top',
                        'message': $messages.getMessage(19)
                    });
                    html.pnd.planeParameters.millerI.val('');
                    success = false;
                }
                break;
            }
            case 'directionColor':{
                html.pnd.directionParameters.directionColor.spectrum('set',value);
                html.pnd.directionParameters.directionColor.children().css('background',value);
                break;
            }
            case 'dirRadius':{
                html.pnd.directionParameters.dirRadius.selectpicker('val',value);
                break;
            }
            case 'directionName':{
                html.pnd.directionParameters.directionName.val(value);
                break;
            }
            case 'millerU':{
                var newVal = $stringEditor.inputIsInteger(value.toString());
                if (newVal !== false) html.pnd.directionParameters.millerU.val(newVal);
                else {
                    $tooltipGenerator.showTooltip({
                        'target': index,
                        'placement': 'top',
                        'message': $messages.getMessage(19)
                    });
                    html.pnd.directionParameters.millerU.val('');
                    success = false;
                }
                break;
            }
            case 'millerV':{
                var newVal = $stringEditor.inputIsInteger(value.toString());
                if (newVal !== false) html.pnd.directionParameters.millerV.val(newVal);
                else {
                    $tooltipGenerator.showTooltip({
                        'target': index,
                        'placement': 'top',
                        'message': $messages.getMessage(19)
                    });
                    html.pnd.directionParameters.millerV.val('');
                    success = false;
                }
                break;
            }
            case 'millerW':{
                var newVal = $stringEditor.inputIsInteger(value.toString());
                if (newVal !== false) html.pnd.directionParameters.millerW.val(newVal);
                else {
                    $tooltipGenerator.showTooltip({
                        'target': index,
                        'placement': 'top',
                        'message': $messages.getMessage(19)
                    });
                    html.pnd.directionParameters.millerW.val('');
                    success = false;
                }
                break;
            }
            case 'millerT':{
                var newVal = $stringEditor.inputIsInteger(value.toString());
                if (newVal !== false) html.pnd.directionParameters.millerT.val(newVal);
                else {
                    $tooltipGenerator.showTooltip({
                        'target': index,
                        'placement': 'top',
                        'message': $messages.getMessage(19)
                    });
                    html.pnd.directionParameters.millerT.val('');
                    success = false;
                }
                break;
            }
            case 'planeVisibility':{
                if (value === false) {
                    selector.find('.planeButton').find('img').attr('src','Images/hidden-icon-sm.png');
                    selector.find('.planeButton').removeClass('visible');
                }
                else {
                    selector.find('.planeButton').find('img').attr('src','Images/visible-icon-sm.png');
                    selector.find('.planeButton').addClass('visible');
                }
                break; 
            } // Requires Selector //
            case 'planeParallel':{
                if (value === false) selector.find('.parallel').removeClass('active');
                else selector.find('.parallel').addClass('active');
                break; 
            } // Requires Selector //
            case 'planeInterception':{
                if (value === false) selector.find('.interception').removeClass('active');
                else selector.find('.interception').addClass('active');
                break; 
            } // Requires Selector //
            case 'directionVisibility':{
                if (value === false) {
                    selector.find('.directionButton').find('img').attr('src','Images/hidden-icon-sm.png');
                    selector.find('.directionButton').removeClass('visible');
                }
                else {
                    selector.find('.directionButton').find('img').attr('src','Images/visible-icon-sm.png');
                    selector.find('.directionButton').addClass('visible');
                }
                break; 
            } // Requires Selector //
            
            // Motif Tab
            case 'atomName':{
                if (value.atomName === '-') html.motif.other.nameContainer.hide('slow');
                else {
                    var newAtom = 'ch-' + value.atonName;
                    var newAtomName = $stringEditor.capitalizeFirstLetter(value.atomName);
                    html.motif.other.nameContainer.find('a').attr('class','ch');
                    if (value.ionicIndex !== '0' && value.ionicIndex !== '3b')
                        html.motif.other.nameContainer.find('a').html('<span style="font-size:17px;">'+newAtomName+'<sup>'+value.ionicIndex+'</sup></span>');
                    else html.motif.other.nameContainer.find('a').html(newAtomName);
                    html.motif.other.nameContainer.find('a').css('background',value.atomColor);
                    html.motif.other.nameContainer.show('slow');
                }   
                break;
            }
            case 'elementContainer':{
                html.motif.other.nameContainer.find('a').removeAttr('class');
                html.motif.other.nameContainer.find('a').attr('class',selector.attr('class'));
                if ( value !== '0' && (value !== '3b')) html.motif.other.nameContainer.find('a').html('<span style="font-size:17px;">'+selector.html()+'<sup>'+value+'</sup></span>');
                else html.motif.other.nameContainer.find('a').html(selector.html());
                html.motif.other.nameContainer.show('slow');
                break;  
            } // Requires Selectors //
            case 'atomPosX':{
                var newVal = $stringEditor.inputIsNumber(value.toString());
                if (newVal !== false) {
                    html.motif.motifInputs.atomPosX.val(newVal);
                    takeAction('atomPosXSlider',value);
                }
                else {
                    $tooltipGenerator.showTooltip({
                        'target': index,
                        'placement': 'top',
                        'message': $messages.getMessage(20)
                    });
                    html.motif.motifInputs.atomPosX.val('');
                    success = false;
                }
                break;
            }
            case 'atomPosXSlider':{
                html.motif.motifInputsSliders.atomPosX.slider('value',value);
                break;   
            }
            case 'atomPosY':{
                var newVal = $stringEditor.inputIsNumber(value.toString());
                if (newVal !== false) {
                    html.motif.motifInputs.atomPosY.val(newVal);
                    takeAction('atomPosYSlider',value);
                }
                else {
                    $tooltipGenerator.showTooltip({
                        'target': index,
                        'placement': 'top',
                        'message': $messages.getMessage(20)
                    });
                    html.motif.motifInputs.atomPosY.val('');
                    success = false;
                }
                break;   
            }
            case 'atomPosYSlider':{
                html.motif.motifInputsSliders.atomPosY.slider('value',value);
                break;   
            }
            case 'atomPosZ':{
                var newVal = $stringEditor.inputIsNumber(value.toString());
                if (newVal !== false) {
                    html.motif.motifInputs.atomPosZ.val(newVal);
                    takeAction('atomPosZSlider',value);
                }
                else {
                    $tooltipGenerator.showTooltip({
                        'target': index,
                        'placement': 'top',
                        'message': $messages.getMessage(20)
                    });
                    html.motif.motifInputs.atomPosZ.val('');
                    success = false;
                }
                break;  
            }
            case 'atomPosZSlider':{
                html.motif.motifInputsSliders.atomPosZ.slider('value',value);
                break;   
            }
            case 'cellVolume':{
                var newVal = $stringEditor.inputIsNumber(value.toString());
                var tangency = $menu.getTangency();
                if (newVal !== false){
                    if (tangency.tangency === true){
                        if (newVal > 90) {
                            html.motif.other.cellVolume.val(newVal);
                            takeAction('cellVolumeSlider',newVal);
                        }
                        else {
                            $tooltipGenerator.showTooltip({
                                'target': index,
                                'placement': 'top',
                                'message': $messages.getMessage(22)
                            });
                            takeAction('cellVolumeSlider',90);
                            html.motif.other.cellVolume.val(90);
                            success = false;
                        }
                    }
                    else if (newVal > 0) {
                        html.motif.other.cellVolume.val(newVal);
                        takeAction('cellVolumeSlider',newVal);
                    }
                    else {
                        $tooltipGenerator.showTooltip({
                            'target': index,
                            'placement': 'top',
                            'message': $messages.getMessage(22)
                        });
                        takeAction('cellVolumeSlider',0);
                        html.motif.other.cellVolume.val(0);
                        success = false;
                    }
                }
                else {
                    $tooltipGenerator.showTooltip({
                        'target': index,
                        'placement': 'top',
                        'message': $messages.getMessage(22)
                    });
                    takeAction('cellVolumeSlider',100);
                    html.motif.other.cellVolume.val(100);
                    success = false;
                }
                break;   
            }
            case 'cellVolumeSlider':{
                html.motif.other.cellVolumeSlider.slider('value',value);
                break;   
            }
            case 'tangency':{
                if (value === false) html.motif.panel.tangency.parent().removeClass('purpleThemeActive');
                else html.motif.panel.tangency.parent().addClass('purpleThemeActive');
                break;   
            }
            case 'atomPositioningXYZ':{
                var tempValue = undefined;
                if ((_.isUndefined(value.toggle))) {
                    takeAction('atomPositioningXYZ',{value:!value,toggle:true});
                    tempValue = value;
                }
                else tempValue = value.value;
                if (tempValue === true){
                    html.motif.panel.atomPositioningXYZ.addClass('buttonPressed');
                    html.motif.panel.atomPositioningXYZ.removeClass('btn-light');
                    html.motif.panel.atomPositioningXYZ.addClass('btn-purple');
                     
                    html.motif.motifInputsLabels.xa.html('a');
                    html.motif.motifInputsLabels.yb.html('b');
                    html.motif.motifInputsLabels.zc.html('c');

                }
                else{  
                    html.motif.panel.atomPositioningXYZ.removeClass('buttonPressed');
                    html.motif.panel.atomPositioningXYZ.removeClass('btn-purple');
                    html.motif.panel.atomPositioningXYZ.addClass('btn-light');
                }
                break;
            }
            case 'atomPositioningABC':{
                var tempValue = undefined;
                if ((_.isUndefined(value.toggle))) {
                    takeAction('atomPositioningABC',{value:!value,toggle:true});
                    tempValue = value;
                }
                else tempValue = value.value;
                if (tempValue === true){
                    html.motif.panel.atomPositioningABC.addClass('buttonPressed');
                    html.motif.panel.atomPositioningABC.removeClass('btn-light');
                    html.motif.panel.atomPositioningABC.addClass('btn-purple');
                    html.motif.motifInputsLabels.xa.html('x');
                    html.motif.motifInputsLabels.yb.html('y');
                    html.motif.motifInputsLabels.zc.html('z');
                }
                else{  
                    html.motif.panel.atomPositioningABC.removeClass('buttonPressed');
                    html.motif.panel.atomPositioningABC.removeClass('btn-purple');
                    html.motif.panel.atomPositioningABC.addClass('btn-light');
                }
                break;
            }
            case 'atomPositioningAuto':{
                //////////////////////////
            }
            case 'lockCameras':{
                if (value === true) {
                    html.motif.other.lockCameras.addClass('active');
                    html.motif.other.lockCameras.find('img').attr('src','Images/lockCamerasActive.png');
                }
                else {
                    html.motif.other.lockCameras.removeClass('active');
                    html.motif.other.lockCameras.find('img').attr('src','Images/lockCameras.png');
                }
                break; 
            }
            case 'motifVisibilityInUC':{
                if (value === true) {
                    html.motif.other.motifVisibilityInUC.addClass('active');
                    html.motif.other.motifVisibilityInUC.find('img').attr('src','Images/motif-icon-white.png');
                }
                else {
                    html.motif.other.motifVisibilityInUC.removeClass('active');
                    html.motif.other.motifVisibilityInUC.find('img').attr('src','Images/motif-icon.png');
                }
                break; 
            }
            case 'swapButton':{
                if (value === true) html.motif.other.swapButton.addClass('motif');
                else html.motif.other.swapButton.removeClass('motif');
                break;
            }
            case 'atomVisibility':{
                if (value === false) {
                    selector.find('.atomButton').find('img').attr('src','Images/hidden-icon-sm.png');
                    selector.find('.atomButton').removeClass('visible');
                }
                else {
                    selector.find('.atomButton').find('img').attr('src','Images/visible-icon-sm.png');
                    selector.find('.atomButton').addClass('visible');
                }
                break; 
            } // Requires Selector //
            case 'atomColor':{
                html.motif.panel.color.children().css('background',value);
                html.motif.panel.color.spectrum('set',value);
                break;
            }
            case 'atomOpacity':{
                html.motif.atomParameters.atomOpacity.val(value);
                takeAction('atomOpacitySlider',value);
                break;
            }
            case 'atomOpacitySlider':{
                html.motif.panel.opacitySlider.slider('value',value);
                break;
            }
            case 'rotAngleTheta':{
                html.motif.rotatingAngles.combo.rotAngleTheta.val(value);
                break;
            }
            case 'rotAnglePhi':{
                html.motif.rotatingAngles.combo.rotAngleTheta.val(value);
                break;
            }
            case 'rotAngleX':{
                html.motif.rotatingAngles.x.text(value);
                break;
            }
            case 'rotAngleY':{
                html.motif.rotatingAngles.y.text(value);
                break;
            }
            case 'rotAngleZ':{
                html.motif.rotatingAngles.z.text(value);
                break;
            }
                
            // Visual Tab
            case 'autoQuality':{
                if (value === true){
                    _.each(html.visual.parameters.renderizationQuality, function($param, a) { $param.removeClass('active');});
                    html.visual.parameters.renderizationQuality.autoQuality.addClass('active');
                }
                else html.visual.parameters.renderizationQuality.autoQuality.removeClass('active');
                break;
            }
            case 'lowQuality':{
                if (value === true){
                    _.each(html.visual.parameters.renderizationQuality, function($param, a) { $param.removeClass('active');});
                    html.visual.parameters.renderizationQuality.lowQuality.addClass('active');
                    takeAction('lod',2);
                }
                else html.visual.parameters.renderizationQuality.lowQuality.removeClass('active');
                break;
            }
            case 'mediumQuality':{
                if (value === true){
                    _.each(html.visual.parameters.renderizationQuality, function($param, a) { $param.removeClass('active');});
                    html.visual.parameters.renderizationQuality.mediumQuality.addClass('active');
                    takeAction('lod',3);
                }
                else html.visual.parameters.renderizationQuality.mediumQuality.removeClass('active');
                break;
            }
            case 'highQuality':{
                if (value === true){
                    _.each(html.visual.parameters.renderizationQuality, function($param, a) { $param.removeClass('active');});
                    html.visual.parameters.renderizationQuality.highQuality.addClass('active');
                    takeAction('lod',4);
                }
                else html.visual.parameters.renderizationQuality.highQuality.removeClass('active');
                break;
            }
            case 'wireframe':{
                if (value === true){
                    _.each(html.visual.parameters.renderizationMode, function($param, a) { $param.removeClass('active');});
                    html.visual.parameters.renderizationMode.wireframe.addClass('active');
                }
                else html.visual.parameters.renderizationMode.wireframe.removeClass('active');
                break;
            }
            case 'toon':{
                if (value === true){
                    _.each(html.visual.parameters.renderizationMode, function($param, a) { $param.removeClass('active');});
                    html.visual.parameters.renderizationMode.toon.addClass('active');
                }
                else html.visual.parameters.renderizationMode.toon.removeClass('active');
                break;
            }
            case 'flat':{
                if (value === true){
                    _.each(html.visual.parameters.renderizationMode, function($param, a) { $param.removeClass('active');});
                    html.visual.parameters.renderizationMode.flat.addClass('active');
                }
                else html.visual.parameters.renderizationMode.flat.removeClass('active');
                break;
            }
            case 'realistic':{
                if (value === true){
                    _.each(html.visual.parameters.renderizationMode, function($param, a) { $param.removeClass('active');});
                    html.visual.parameters.renderizationMode.realistic.addClass('active');
                }
                else html.visual.parameters.renderizationMode.realistic.removeClass('active');
                break;
            }
            case 'lights':{
                if (value === true) html.visual.parameters.lights.addClass('active');
                else html.visual.parameters.lights.removeClass('active');
                break;
            }
            case 'ssao':{
                if (value === true) html.visual.parameters.ssao.addClass('active');
                else html.visual.parameters.ssao.removeClass('active');
                break;
            }
            case 'shadows':{
                if (value === true) html.visual.parameters.shadows.addClass('active');
                else html.visual.parameters.shadows.removeClass('active');
                break;
            }
            case 'distortionOn':{
                if (value === true) {
                    html.visual.parameters.distortionOn.addClass('active');
                    html.visual.parameters.distortionOff.removeClass('active');
                }
                else {
                    html.visual.parameters.distortionOn.removeClass('active');
                    html.visual.parameters.distortionOff.addClass('active');
                }
                break;
            }
            case 'distortionOff':{
                if (value === true) {
                    html.visual.parameters.distortionOff.addClass('active');
                    html.visual.parameters.distortionOn.removeClass('active');
                }
                else {
                    html.visual.parameters.distortionOff.removeClass('active');
                    html.visual.parameters.distortionOn.addClass('active');
                }
                break;
            }
            case 'anaglyph':{
                if (value === true){
                    _.each(html.visual.stereoscopic, function($param, a) { $param.removeClass('active');});
                    html.visual.stereoscopic.anaglyph.addClass('active');
                }
                else html.visual.stereoscopic.anaglyph.removeClass('active');
                break;
            }
            case 'oculus':{
                if (value === true){
                    _.each(html.visual.oculus, function($param, a) { $param.removeClass('active');});
                    html.visual.stereoscopic.oculus.addClass('active');
                }
                else html.visual.stereoscopic.oculus.removeClass('active');
                break;
            }
            case 'oculusTracker':{
                if (value === false) {
                    if (html.visual.parameters.oculusTracker.hasClass('active')) html.visual.parameters.oculusTracker.button('toggle');
                }
                else {
                    if (!(html.visual.oculusTracker.oculus.hasClass('active'))) html.visual.parameters.oculusTracker.button('toggle');   
                }
                break;
            }
            case 'cardboard':{
                if (value === false) {
                    if (html.visual.parameters.cardboard.hasClass('active')) html.visual.parameters.cardboard.button('toggle');
                }
                else {
                    if (!(html.visual.parameters.cardboard.hasClass('active'))) html.visual.parameters.cardboard.button('toggle');   
                }
                break;
            }
            case 'sideBySide':{
                if (value === true){
                    _.each(html.visual.stereoscopic, function($param, a) { $param.removeClass('active');});
                    html.visual.stereoscopic.sideBySide3D.addClass('active');
                }
                else html.visual.stereoscopic.sideBySide3D.removeClass('active');
                break;
            }
            case 'onTop':{
                if (value === true){
                    _.each(html.visual.stereoscopic, function($param, a) { $param.removeClass('active');});
                    html.visual.stereoscopic.onTop3D.addClass('active');
                }
                else html.visual.stereoscopic.onTop3D.removeClass('active');
                break;
            }
            case 'anaglyphCell':{
                if (value === true){
                    _.each(html.visual.stereoscopicCell, function($param, a) { $param.removeClass('active');});
                    html.visual.stereoscopicCell.anaglyphCell.addClass('active');
                }
                else html.visual.stereoscopicCell.anaglyphCell.removeClass('active');
                break;
            }
            case 'oculusCell':{
                if (value === true){
                    _.each(html.visual.oculusCell, function($param, a) { $param.removeClass('active');});
                    html.visual.stereoscopic.oculusCell.addClass('active');
                }
                //else html.visual.stereoscopic.oculusCell.removeClass('active');
                break;
            }
            case 'sideBySideCell':{
                if (value === true){
                    _.each(html.visual.stereoscopicCell, function($param, a) { $param.removeClass('active');});
                    html.visual.stereoscopicCell.sideBySide3DCell.addClass('active');
                }
                else html.visual.stereoscopicCell.sideBySide3DCell.removeClass('active');
                break;
            }
            case 'onTopCell':{
                if (value === true){
                    _.each(html.visual.stereoscopicCell, function($param, a) { $param.removeClass('active');});
                    html.visual.stereoscopicCell.onTop3DCell.addClass('active');
                }
                else html.visual.stereoscopicCell.onTop3DCell.removeClass('active');
                break;
            }
            case 'crystalCamTargetOn':{
                if (value === true) {
                    html.visual.parameters.crystalCamTargetOn.addClass('active');
                    html.visual.parameters.crystalCamTargetOff.removeClass('active');
                }
                else {
                    html.visual.parameters.crystalCamTargetOn.removeClass('active');
                    html.visual.parameters.crystalCamTargetOff.addClass('active');
                }
                break;
            }
            case 'crystalCamTargetOff':{
                if (value === true) {
                    html.visual.parameters.crystalCamTargetOff.addClass('active');
                    html.visual.parameters.crystalCamTargetOn.removeClass('active');
                }
                else {
                    html.visual.parameters.crystalCamTargetOff.removeClass('active');
                    html.visual.parameters.crystalCamTargetOn.addClass('active');
                }
                break;
            }
            case 'leapMotion':{
                if (value === false) {
                    if (html.visual.parameters.leapMotion.hasClass('active')) html.visual.parameters.leapMotion.button('toggle');
                }
                else {
                    if (!(html.visual.parameters.leapMotion.hasClass('active'))) html.visual.parameters.leapMotion.button('toggle');   
                }
                break;
            }
            case 'crystalClassic':{
                if (value === true){
                    _.each(html.visual.parameters.crystalMode, function($param, a) { $param.removeClass('active');});
                    html.visual.parameters.crystalMode.crystalClassic.addClass('active');
                }
                else html.visual.parameters.crystalMode.crystalClassic.removeClass('active');
                break;
            }
            case 'crystalSubstracted':{
                if (value === true){
                    _.each(html.visual.parameters.crystalMode, function($param, a) { $param.removeClass('active');});
                    html.visual.parameters.crystalMode.crystalSubstracted.addClass('active');
                }
                else html.visual.parameters.crystalMode.crystalSubstracted.removeClass('active');
                break;
            }
            case 'crystalSolidVoid':{
                if (value === true){
                    _.each(html.visual.parameters.crystalMode, function($param, a) { $param.removeClass('active');});
                    html.visual.parameters.crystalMode.crystalSolidVoid.addClass('active');
                }
                else html.visual.parameters.crystalMode.crystalSolidVoid.removeClass('active');
                break;
            }
            case 'crystalGradeLimited':{ 
                if (value === true){
                    _.each(html.visual.parameters.crystalMode, function($param, a) { $param.removeClass('active');});
                    html.visual.parameters.crystalMode.crystalGradeLimited.addClass('active');
                }
                else html.visual.parameters.crystalMode.crystalGradeLimited.removeClass('active');
                break;
            }
            case 'cellClassic':{
                if (value === true){
                    _.each(html.visual.parameters.unitCellMode, function($param, a) { $param.removeClass('active');});
                    html.visual.parameters.unitCellMode.cellClassic.addClass('active');
                }
                else html.visual.parameters.unitCellMode.cellClassic.removeClass('active');
                break;
            }
            case 'cellSubstracted':{
                if (value === true){
                    _.each(html.visual.parameters.unitCellMode, function($param, a) { $param.removeClass('active');});
                    html.visual.parameters.unitCellMode.cellSubstracted.addClass('active');
                }
                else html.visual.parameters.unitCellMode.cellSubstracted.removeClass('active');
                break;
            }
            case 'cellSolidVoid':{
                if (value === true){
                    _.each(html.visual.parameters.unitCellMode, function($param, a) { $param.removeClass('active');});
                    html.visual.parameters.unitCellMode.cellSolidVoid.addClass('active');
                }
                else html.visual.parameters.unitCellMode.cellSolidVoid.removeClass('active');
                break;
            }
            case 'cellGradeLimited':{
                if (value === true){
                    _.each(html.visual.parameters.unitCellMode, function($param, a) { $param.removeClass('active');});
                    html.visual.parameters.unitCellMode.cellGradeLimited.addClass('active');
                }
                else html.visual.parameters.unitCellMode.cellGradeLimited.removeClass('active');
                break;
            }
            case 'autoZoom':{
                _.each(html.visual.tools.zoomOptions, function($param, a) { $param.removeClass('active'); });
                html.visual.tools.zoomOptions.autoZoom.addClass('active');
                $menu.autoZoom(true);
                window.dispatchEvent(new Event('resize'));
                break;
            }
            case 'zoom100':{
                _.each(html.visual.tools.zoomOptions, function($param, a) { $param.removeClass('active'); });
                html.visual.tools.zoomOptions.zoom100.addClass('active');
                $menu.autoZoom(false);
                $menu.transformMenu(1);
                break;
            } 
            case 'zoom90':{
                _.each(html.visual.tools.zoomOptions, function($param, a) { $param.removeClass('active'); });
                html.visual.tools.zoomOptions.zoom90.addClass('active');
                $menu.autoZoom(false);
                $menu.transformMenu(0.9);
                break;
            } 
            case 'zoom80':{
                _.each(html.visual.tools.zoomOptions, function($param, a) { $param.removeClass('active'); });
                html.visual.tools.zoomOptions.zoom80.addClass('active');
                $menu.autoZoom(false);
                $menu.transformMenu(0.8);
                break;
            } 
            case 'zoom70':{
                _.each(html.visual.tools.zoomOptions, function($param, a) { $param.removeClass('active'); });
                html.visual.tools.zoomOptions.zoom70.addClass('active');
                $menu.autoZoom(false);
                $menu.transformMenu(0.7);
                break;
            }
            case 'fog':{
                if (value === true) {
                    html.visual.fog.checkbox.addClass('active');
                    html.visual.fog.checkbox.iCheck('check');
                }
                else {
                    html.visual.fog.checkbox.addClass('active');
                    html.visual.fog.checkbox.iCheck('uncheck');
                }
                break;
            }
            case 'fogColor':{
                html.visual.fog.color.spectrum('set',value);
                html.visual.fog.color.children().css('background',value);
                break;
            }
            case 'fogDensity':{
                html.visual.fog.density.val(value);
                takeAction('fogDensitySlider',value);
                break;
            }
            case 'fogDensitySlider':{
                html.visual.fog.densitySlider.slider('value',value);
                break;
            }
            case 'sounds':{
                if (value === true) {
                    html.visual.sound.sounds.addClass('active');
                    takeAction('soundSliderToggle',true);
                    takeAction('muteToggle',true);
                }
                else {
                    html.visual.sound.sounds.removeClass('active');
                    takeAction('soundSliderToggle',false);
                    takeAction('muteToggle',false);
                }
                break;
            }
            case 'soundSliderToggle':{
                if (value === true) html.visual.sound.soundSlider.slider('enable');
                else html.visual.sound.soundSlider.slider('disable');
                break;
            }
            case 'muteToggle':{
                if (value === true) html.visual.sound.mute.removeClass('disable');
                else html.visual.sound.mute.addClass('disable');
                break;
            }
            case 'muteSound':{
                if (value === true) {
                    html.visual.sound.mute.addClass('active');
                    html.visual.sound.soundSlider.slider('value',0);
                }
                else html.visual.sound.mute.removeClass('active');
                break;
            }
            case 'soundSlider':{
                html.visual.sound.soundSlider.slider('value',value);
                if (value > 0) takeAction('muteSound',false);
                break;
            }
            case 'lodQuality':{
                if (value < 1.5) takeAction('lowQuality', true);
                else if (value < 3.5) takeAction('mediumQuality', true);
                else takeAction('highQuality', true);
                break;
            }
            case 'lod':{
                html.visual.lod.lod.val(value);
                takeAction('lodSlider',value);
                break;
            }
            case 'lodSlider':{
                html.visual.lod.lodSlider.slider('value',value);
                break;
            }
            case 'crystalScreenColor':{
                html.visual.tools.colorPickers.crystalScreen.spectrum('set',value);
                html.visual.tools.colorPickers.crystalScreen.children().css('background',value);
                break;
            }
            case 'cellScreenColor':{
                html.visual.tools.colorPickers.cellScreen.spectrum('set',value);
                html.visual.tools.colorPickers.cellScreen.children().css('background',value);
                break;
            }
            case 'motifXScreenColor':{
                html.visual.tools.colorPickers.motifXScreen.spectrum('set',value);
                html.visual.tools.colorPickers.motifXScreen.children().css('background',value);
                break;
            }
            case 'motifYScreenColor':{
                html.visual.tools.colorPickers.motifYScreen.spectrum('set',value);
                html.visual.tools.colorPickers.motifYScreen.children().css('background',value);
                break;
            }
            case 'motifZScreenColor':{
                html.visual.tools.colorPickers.motifZScreen.spectrum('set',value);
                html.visual.tools.colorPickers.motifZScreen.children().css('background',value);
                break;
            }
            
            // Note Tab
            case 'noteTitle':{
                html.notes.properties.title.val(value);
                break;
            }
            case 'noteBody':{
                html.notes.other.body.val(value);
                break;
            }
            case 'noteOpacity':{
                html.notes.properties.opacity.selectpicker('val',value);
                break;
            }
            case 'noteColor':{
                html.notes.properties.color.spectrum('set',value);
                html.notes.properties.color.children().css('background',value);
                break;
            }
            case 'saveCamera':{
                if (value === true) {
                    html.notes.other.saveCamera.addClass('active');
                    html.notes.other.saveCamera.find('img').attr('src','Images/comments-hover.png');
                }
                else {
                    html.notes.other.saveCamera.removeClass('active');
                    html.notes.other.saveCamera.find('img').attr('src','Images/comments.png');
                }
                break;   
            }
            case 'enableParameters':{
                if (value === true) {
                    html.notes.other.enableParameters.addClass('active');
                    html.notes.other.enableParameters.find('img').attr('src','Images/motif-icon-white.png');
                }
                else {
                    html.notes.other.enableParameters.removeClass('active');
                    html.notes.other.enableParameters.find('img').attr('src','Images/motif-icon.png');
                }
                break;  
            }
            case 'noteVisibility':{
                if (value === false) {
                    selector.find('.noteButton').find('img').attr('src','Images/hidden-icon-sm.png');
                    selector.find('.noteButton').removeClass('visible');
                }
                else {
                    selector.find('.noteButton').find('img').attr('src','Images/visible-icon-sm.png');
                    selector.find('.noteButton').addClass('visible');
                }
                break; 
            } // Requires Selector //
            
            // Library Tab
            case 'projectName':{
                html.library.project.name.val(value);
                break;
            }
            case 'projectDescription':{
                html.library.project.description.val(value);
                break;
            }
            case 'projectTags':{
                _.each(value, function($parameter,k){
                    html.library.project.tags.tagit("createTag", $parameter); 
                });
            }
            case 'frameIT':{
                if (value === true) html.library.png.frameIT.attr('class','active btn btn-purple-dark');
                else html.library.png.frameIT.attr('class','btn btn-light');
                break;
            }
            case 'qrCode':{
                if (value === true) html.library.png.qrCode.attr('class','active btn btn-purple-dark');
                else html.library.png.qrCode.attr('class','btn btn-light');
                break;
            }
            case 'printMode':{
                if (value === true) html.library.png.printMode.attr('class','active btn btn-purple-dark');
                else html.library.png.printMode.attr('class','btn btn-light');
                break;
            }
                
            //IAC Box
            case 'iacVisibility':{
                if (value === true) {
                    html.iac.buttons.visibility.find('img').attr('src','Images/visible-icon-sm.png');
                    html.iac.buttons.visibility.removeClass('notVisible');
                }
                else {
                    html.iac.buttons.visibility.find('img').attr('src','Images/hidden-icon-sm.png');
                    html.iac.buttons.visibility.addClass('notVisible');
                } 
                break;
            }
            case 'iacColor':{
                html.iac.buttons.color.children().css('background',value);
                break;
            }
            case 'iacOpacity':{
                html.iac.other.opacity.val(value);
                takeAction('iacOpacitySlider',value);
                break;
            }
            case 'iacOpacitySlider':{
                html.iac.other.opacitySlider.slider('value',value);
                break;
            }
            case 'playerPlay':{
                if (value === true) {
                    html.notes.other.play.find('a').addClass('active');
                }
                else {
                    html.notes.other.play.find('a').removeClass('active');
                } 
                break;
            } 
            case 'playerRepeat':{
                if (value === true) {
                    html.notes.other.repeat.find('a').addClass('active');
                }
                else {
                    html.notes.other.repeat.find('a').removeClass('active');
                } 
                break;
            } 
            case 'playerPause':{
                if (value === true) {
                    html.notes.other.pause.find('a').addClass('active');
                }
                else {
                    html.notes.other.pause.find('a').removeClass('active');
                } 
                break;
            } 
            case 'playerForward':{
                if (value === true) {
                    html.notes.other.forward.find('a').addClass('active');
                }
                else {
                    html.notes.other.forward.find('a').removeClass('active');
                } 
                break;
            }
            case 'playerRewind':{
                if (value === true) {
                    html.notes.other.rewind.find('a').addClass('active');
                }
                else {
                    html.notes.other.rewind.find('a').removeClass('active');
                } 
                break;
            }
            case 'playerRepeat':{
                if (value === true) {
                    html.notes.other.repeat.find('a').addClass('active');
                }
                else {
                    html.notes.other.repeat.find('a').removeClass('active');
                } 
                break;
            }
            
            case 'reset':{
                
                // Tabs //
                $menu.reset('tabs');
                
                // Toggles //
                takeAction('latticePoints',true);
                takeAction('edges',false);
                takeAction('faces',false);
                takeAction('xyzAxes',true);
                takeAction('abcAxes',false);
                takeAction('unitCellViewport',false);
                takeActionWithoutPublish('planes',true);
                takeActionWithoutPublish('directions',true);
                takeAction('atomRadius',false);
                takeAction('atomToggle',true);
                takeAction('labelToggle',false);
                takeAction('highlightTangency',false);
                takeAction('fullScreen',false);
                
                // Lattice //
                takeAction('selectedLattice',$messages.getMessage(18));
                takeAction('latticePadlock',false);
                takeAction('repeatX',1);
                takeAction('repeatY',1);
                takeAction('repeatZ',1);
                takeAction('scaleX',1);
                takeAction('scaleY',1);
                takeAction('scaleZ',1);
                takeAction('alpha',90);
                takeAction('beta',90);
                takeAction('gamma',90);
                takeAction('motifPadlock',false);
                takeAction('cylinderColor','A19EA1');
                takeAction('faceColor','907190');
                takeAction('radius','2');
                takeAction('faceOpacity','3');
                $menu.reset('restrictions');
                $menu.reset('collisions');
                
                // Motif //
                takeAction('tangency',false);
                takeAction('cellVolume','100');
                $menu.reset('atomTable');
                takeAction('atomPosX',0);
                takeAction('atomPosY',0);
                takeAction('atomPosZ',0);
                takeAction('atomPositioningABC',{value:false,toggle:true});
                takeAction('atomPositioningXYZ',{value:false,toggle:true});
                html.motif.other.nameContainer.hide();
                html.motif.motifInputsLabels.xa.html('x');
                html.motif.motifInputsLabels.yb.html('y');
                html.motif.motifInputsLabels.zc.html('z');
                $menu.reset('motifCollisions');
                
                // Visual //
                takeAction('lod',2.5);
                takeAction('mediumQuality',true);
                takeAction('realistic',true);
                takeAction('lights',true);
                takeAction('ssao',false);
                takeAction('shadows',true);
                takeAction('distortionOff',true);
                takeAction('anaglyph',false);
                takeAction('oculus',false);
                takeAction('oculusTracker',false);
                takeAction('sideBySide',false);
                takeAction('onTop',false);
                takeAction('anaglyphCell',false);
                takeAction('oculusCell',false);
                takeAction('sideBySideCell',false);
                takeAction('onTopCell',false);
                takeAction('crystalCamTargetOn',true);
                takeAction('leapMotion',false);
                takeAction('cardboard',false);
                takeAction('oculusTracker',false);
                takeAction('crystalClassic',true);
                takeAction('cellClassic',true);
                takeAction('fog',false);
                takeAction('fogDensity',1);
                takeAction('fogColor','transparent');
                takeAction('sounds',false);
                takeAction('soundSlider',75);
                takeAction('crystalScreenColor','#000');
                takeAction('cellScreenColor','#000');
                takeAction('motifXScreenColor','#000');
                takeAction('motifYScreenColor','#000');
                takeAction('motifZScreenColor','#000');
                
                // PnD //
                takeAction('planeOpacity','6');
                takeAction('millerH','');
                takeAction('millerK','');
                takeAction('millerL','');
                takeAction('millerI','');
                takeAction('planeName','');
                takeAction('planeColor','transparent');
                takeAction('directionColor','transparent');
                takeAction('millerU','');
                takeAction('millerV','');
                takeAction('millerW','');
                takeAction('millerT','');
                takeAction('directionName','');
                takeAction('dirRadius','10');
                $menu.reset('planesTable');
                $menu.reset('directionTable');

                // Notes //
                takeAction('noteTitle','');
                takeAction('noteOpacity','10');
                takeAction('noteBody','');
                takeAction('noteColor','transparent');
                $menu.reset('notesTable');
                
                // Library //
                takeAction('frameIT',true);
                takeAction('qrCode',true);
                takeAction('printMode',true);
                break;
            }
                
        };
        allowPublish = success;
    };
    
    // Turn on/off toggles without publishing the event //
    function takeActionWithoutPublish(index,value){
        switch(index){
            case 'planes':{
                if (value === true) {
                    html.pnd.tables.planes.find('.planeButton').find('img').attr('src','Images/hidden-icon-sm.png');
                    html.menu.toggles.planes.parent().addClass('lightThemeActive');
                }
                else {
                    html.pnd.tables.planes.find('.planeButton').find('img').attr('src','Images/visible-icon-sm.png');
                    html.menu.toggles.planes.parent().removeClass('lightThemeActive');
                }
                break;
            }
            case 'directions':{
                if (value === true) {
                    html.pnd.tables.directions.find('.directionButton').find('img').attr('src','Images/hidden-icon-sm.png');
                    html.menu.toggles.directions.parent().addClass('lightThemeActive');
                }
                else {
                    html.pnd.tables.directions.find('.directionButton').find('img').attr('src','Images/visible-icon-sm.png');
                    html.menu.toggles.directions.parent().removeClass('lightThemeActive');
                }
                break;
            }   
        }
    };
    
    // Publishes event to the system //
    function publishAction(index,value){
        switch(index){
            
            // Menu Ribbon
            case 'xyzAxes':{
                PubSub.publish(events.AXIS_MODE, value);
                break;
            }
            case 'abcAxes':{
                PubSub.publish(events.AXIS_MODE, value);
                break;
            }
            case 'latticePoints':{
                PubSub.publish(events.LATTICE_POINTS_TOGGLE, value);
                break;
            }
            case 'planes':{
                PubSub.publish(events.PLANE_TOGGLE, value);
                break;
            }
            case 'directions':{
                PubSub.publish(events.DIRECTION_TOGGLE, value);
                break;
            }
            case 'atomToggle':{
                PubSub.publish(events.ATOM_TOGGLE, value);
                break;
            }
            case 'atomRadius':{
                PubSub.publish(events.CHANGE_CRYSTAL_ATOM_RADIUS, value);
                break;
            }
            case 'unitCellViewport':{
                PubSub.publish(events.UC_CRYSTAL_VIEWPORT, value);
                break;
            }
            case 'labelToggle':{
                PubSub.publish(events.LABEL_TOGGLE, value);
                break;
            }
            case 'highlightTangency':{
                PubSub.publish(events.HIGHLIGHT_TANGENCY, value);
                break;
            }
            
            // Motif tab
            case 'atomOpacity':{
                PubSub.publish(events.ATOM_PARAMETER_CHANGE, value);
                break;
            }
            case 'atomColor':{ 
                PubSub.publish(events.ATOM_PARAMETER_CHANGE, value);
                break;
            }
            case 'atomPosX':{
                PubSub.publish(events.ATOM_POSITION_CHANGE, value);
                break;
            }
            case 'atomPosY':{
                PubSub.publish(events.ATOM_POSITION_CHANGE, value);
                break;
            }
            case 'atomPosZ':{
                PubSub.publish(events.ATOM_POSITION_CHANGE, value);
                break;
            }
            case 'cellVolume':{
                PubSub.publish(events.CELL_VOLUME_CHANGE, value);
                break;
            }
            case 'tangentR':{
                PubSub.publish(events.TANGENTR, value);
                break;
            }
            case 'tangency':{
                PubSub.publish(events.ATOM_TANGENCY_CHANGE, value);
                break;
            }
            case 'previewAtomChanges':{
                PubSub.publish(events.MOTIF_TO_LATTICE, value);
                break;
            }
            case 'saveAtomChanges':{
                PubSub.publish(events.ATOM_SUBMIT, value);
                break;
            }
            case 'deleteAtom':{
                PubSub.publish(events.ATOM_SUBMIT, value);
                break;
            }
            case 'atomPositioningXYZ':{
                PubSub.publish(events.CHANGE_ATOM_POSITIONING_MODE, value);
                break;
            }
            case 'atomPositioningABC':{
                PubSub.publish(events.CHANGE_ATOM_POSITIONING_MODE, value);
                break;
            }
            case 'atomPositioningAuto':{
                PubSub.publish(events.CHANGE_ATOM_POSITIONING_MODE, value);
                break;
            }
            case 'lockCameras':{
                PubSub.publish(events.MOTIF_CAMERASYNC_CHANGE, value);
                break;
            }
            case 'motifVisibilityInUC':{
                PubSub.publish(events.TOGGLE_MOTIF_VISIBILITY_IN_UC, value);
                break;
            }
            case 'swapButton':{
                PubSub.publish(events.SWAP_SCREEN, value);
                break;
            }
            case 'rotatingAngles':{
                PubSub.publish(events.SET_ROTATING_ANGLE, value);
                break;
            }
               
            // Lattice Tab
            case 'motifPadlock':{
                PubSub.publish(events.SET_PADLOCK, value);
                break;  
            }
            case 'gridCheckButton':{
                PubSub.publish(events.GRADE_CHOICES, value);
                break;  
            }
            case 'faceCheckButton':{
                PubSub.publish(events.GRADE_CHOICES, value);
                break;  
            }
            case 'cylinderColor':{
                PubSub.publish(events.GRADE_PARAMETER_CHANGE, value);
                break;  
            }
            case 'faceColor':{
                PubSub.publish(events.GRADE_PARAMETER_CHANGE, value);
                break;  
            }
            case 'repeatX':{
                PubSub.publish(events.LATTICE_PARAMETER_CHANGE, value);
                break;
            }
            case 'repeatY':{
                PubSub.publish(events.LATTICE_PARAMETER_CHANGE, value);
                break;
            }
            case 'repeatZ':{
                PubSub.publish(events.LATTICE_PARAMETER_CHANGE, value);
                break;
            }
            case 'faceOpacity':{
                PubSub.publish(events.GRADE_PARAMETER_CHANGE, value);
                break;
            }
            case 'radius':{
                PubSub.publish(events.GRADE_PARAMETER_CHANGE, value);
                break;
            }
            case 'alpha':{
                PubSub.publish(events.LATTICE_PARAMETER_CHANGE, value);
                break;
            }
            case 'alphaMotif':{
                PubSub.publish(events.MAN_ANGLE_CHANGE, value);
                break;
            }
            case 'beta':{
                PubSub.publish(events.LATTICE_PARAMETER_CHANGE, value);
                break;
            }
            case 'betaMotif':{
                PubSub.publish(events.MAN_ANGLE_CHANGE, value);
                break;
            }
            case 'gamma':{
                PubSub.publish(events.LATTICE_PARAMETER_CHANGE, value);
                break;
            }
            case 'gammaMotif':{
                PubSub.publish(events.MAN_ANGLE_CHANGE, value);
                break;
            }
            case 'scaleX':{
                PubSub.publish(events.LATTICE_PARAMETER_CHANGE, value);
                break;
            }
            case 'scaleXMotif':{
                PubSub.publish(events.AXYZ_CHANGE, value);
                break;
            }
            case 'scaleY':{
                PubSub.publish(events.LATTICE_PARAMETER_CHANGE, value);
                break;
            }
            case 'scaleYMotif':{
                PubSub.publish(events.AXYZ_CHANGE, value);
                break;
            }
            case 'scaleZ':{
                PubSub.publish(events.LATTICE_PARAMETER_CHANGE, value);
                break;
            }
            case 'scaleZMotif':{
                PubSub.publish(events.AXYZ_CHANGE, value);
                break;
            }
            case 'motifRefresh':{
                PubSub.publish(events.MOTIF_TO_LATTICE, value);
                break;
            }
            case 'selectAtom':{
                PubSub.publish(events.SAVED_ATOM_SELECTION, value);
                break;
            }
            case 'atomVisibility':{
                PubSub.publish(events.ATOM_VISIBILITY, value);
                break;
            }
            case 'autoUpdate':{
                PubSub.publish(events.AUTO_UPDATE, value);
                break;
            }
                
            // PnD Tab
            case 'planeColor':{
                PubSub.publish(events.PLANE_PARAMETER_CHANGE, value);
                break;
            }
            case 'planeOpacity':{
                PubSub.publish(events.PLANE_PARAMETER_CHANGE, value);
                break;
            }
            case 'planeName':{
                PubSub.publish(events.PLANE_PARAMETER_CHANGE, value);
                break;
            }
            case 'millerH':{
                PubSub.publish(events.PLANE_PARAMETER_CHANGE, value);
                break;
            }
            case 'millerK':{
                PubSub.publish(events.PLANE_PARAMETER_CHANGE, value);
                break;
            }
            case 'millerL':{
                PubSub.publish(events.PLANE_PARAMETER_CHANGE, value);
                break;
            }
            case 'millerI':{
                PubSub.publish(events.PLANE_PARAMETER_CHANGE, value);
                break;
            }
            case 'directionColor':{
                PubSub.publish(events.DIRECTION_PARAMETER_CHANGE, value);
                break;
            }
            case 'dirRadius':{
                value.dirRadius = $stringEditor.divide10(value.dirRadius).toString();
                PubSub.publish(events.DIRECTION_PARAMETER_CHANGE, value);
                break;
            }
            case 'directionName':{
                PubSub.publish(events.DIRECTION_PARAMETER_CHANGE, value);
                break;
            }
            case 'millerU':{
                PubSub.publish(events.DIRECTION_PARAMETER_CHANGE, value);
                break;
            }
            case 'millerV':{
                PubSub.publish(events.DIRECTION_PARAMETER_CHANGE, value);
                break;
            }
            case 'millerW':{
                PubSub.publish(events.DIRECTION_PARAMETER_CHANGE, value);
                break;
            }
            case 'millerT':{
                PubSub.publish(events.DIRECTION_PARAMETER_CHANGE, value);
                break;
            }
            case 'selectPlane':{
                PubSub.publish(events.PLANE_SELECTION, value);
                break;
            }
            case 'planeVisibility':{
                PubSub.publish(events.PLANE_VISIBILITY, value);
                break;
            }
            case 'planeParallel':{
                PubSub.publish(events.PLANE_PARALLEL, value);
                break;
            }
            case 'planeInterception':{
                PubSub.publish(events.PLANE_INTERCEPTION, value);
                break;
            }
            case 'selectDirection':{
                PubSub.publish(events.DIRECTION_SELECTION, value);
                break;
            }
            case 'directionVisibility':{ 
                PubSub.publish(events.DIRECTION_VISIBILITY, value);
                break;
            }
                
            // Visual Tab
            case 'lod': {
                PubSub.publish(events.LOD, value);
                break;
            }
            case 'autoQuality': {
                PubSub.publish(events.AUTO_REND_QUALITY, value);
                break;
            }
            case 'lowQuality': {
                PubSub.publish(events.LOW_REND_QUALITY, value);
                break;
            }
            case 'mediumQuality': {
                PubSub.publish(events.MEDIUM_REND_QUALITY, value);
                break;
            }
            case 'highQuality': {
                PubSub.publish(events.HIGH_REND_QUALITY, value);
                break;
            }
            case 'wireframe': {
                PubSub.publish(events.CHANGE_REND_MODE, value);
                break;
            }
            case 'toon': {
                PubSub.publish(events.CHANGE_REND_MODE, value);
                break;
            }
            case 'flat': {
                PubSub.publish(events.CHANGE_REND_MODE, value);
                break;
            }
            case 'realistic': {
                PubSub.publish(events.CHANGE_REND_MODE, value);
                break;
            }
            case 'lights':{
                PubSub.publish(events.SET_LIGHTS, value);
                break;
            }
            case 'ssao':{
                PubSub.publish(events.SET_SSAO, value);
                break;
            }
            case 'shadows':{
                PubSub.publish(events.SET_SHADOWS, value);
                break;
            }
            case 'distortionOn':{
                PubSub.publish(events.MOTIF_DISTORTION_CHANGE, value);
                break;
            }
            case 'distortionOff':{
                PubSub.publish(events.MOTIF_DISTORTION_CHANGE, value);
                break;
            }
            case 'anaglyph':{
                PubSub.publish(events.ANAGLYPH_EFFECT_CRYSTAL, value);
                break;
            }
            case 'oculus':{
                PubSub.publish(events.OCULUS_CRYSTAL, value);
                break;
            }
            case 'oculusTracker':{
                PubSub.publish(events.OCULUS_CRYSTAL_TRACKER, value);
                break;
            }
            case 'cardboard':{
                PubSub.publish(events.CARDBOARD, value);
                break;
            }
            case 'sideBySide':{
                PubSub.publish(events.SIDE_BY_SIDE_3D_CRYSTAL, value);
                break;
            }
            case 'onTop':{
                PubSub.publish(events.ON_TOP_3D_CRYSTAL, value);
                break;
            }
            case 'anaglyphCell':{
                PubSub.publish(events.ANAGLYPH_EFFECT_UNIT_CELL, value);
                break;
            }
            case 'oculusCell':{
                PubSub.publish(events.OCULUS_UNIT_CELL, value);
                break;
            }
            case 'sideBySideCell':{
                PubSub.publish(events.SIDE_BY_SIDE_3D_UNIT_CELL, value);
                break;
            }
            case 'onTopCell':{
                PubSub.publish(events.ON_TOP_3D_UNIT_CELL, value);
                break;
            }
            case 'crystalCamTargetOn':{
                PubSub.publish(events.CRYSTAL_CAM_TARGET, value);
                break;
            }
            case 'crystalCamTargetOff':{
                PubSub.publish(events.CRYSTAL_CAM_TARGET, value);
                break;
            }
            case 'fullScreen':{
                PubSub.publish(events.FULL_SCREEN_APP, value);
                break;
            }
            case 'leapMotion':{
                PubSub.publish(events.LEAP_MOTION, value);
                break;
            }
            case 'crystalClassic':{
                PubSub.publish(events.CHANGE_CRYSTAL_MODE, value);
                break;
            }
            case 'crystalSubstracted':{
                PubSub.publish(events.CHANGE_CRYSTAL_MODE, value);
                break;
            }
            case 'crystalSolidVoid':{
                PubSub.publish(events.CHANGE_CRYSTAL_MODE, value);
                break;
            }
            case 'crystalGradeLimited':{
                PubSub.publish(events.CHANGE_CRYSTAL_MODE, value);
                break;
            }
            case 'cellClassic':{
                PubSub.publish(events.CHANGE_UNIT_CELL_MODE, value);
                break;
            }
            case 'cellSubstracted':{
                PubSub.publish(events.CHANGE_UNIT_CELL_MODE, value);
                break;
            }
            case 'cellSolidVoid':{
                PubSub.publish(events.CHANGE_UNIT_CELL_MODE, value);
                break;
            }
            case 'cellGradeLimited':{
                PubSub.publish(events.CHANGE_UNIT_CELL_MODE, value);
                break;
            }
            case 'fog': {
                PubSub.publish(events.FOG_CHANGE, value);
                break;
            }
            case 'fogDensity': {
                PubSub.publish(events.FOG_PARAMETER_CHANGE, value);
                break;
            }
            case 'fogColor': {
                PubSub.publish(events.FOG_PARAMETER_CHANGE, value);
                break;
            }
            case 'sounds': {
                PubSub.publish(events.SET_SOUNDS, value);
                break;
            }
            case 'muteSound': {
                PubSub.publish(events.MUTE_SOUND, value);
                break;
            }
            case 'soundVolume': {
                PubSub.publish(events.SOUND_VOLUME, value);
                break;
            }
            case 'crystalScreenColor':{
                PubSub.publish(events.RENDERER_COLOR_CHANGE, value);
                break;
            }
            case 'cellScreenColor':{
                PubSub.publish(events.RENDERER_COLOR_CHANGE, value);
                break;
            }
            case 'motifXScreenColor':{
                PubSub.publish(events.RENDERER_COLOR_CHANGE, value);
                break;
            }
            case 'motifYScreenColor':{
                PubSub.publish(events.RENDERER_COLOR_CHANGE, value);
                break;
            }
            case 'motifZScreenColor':{
                PubSub.publish(events.RENDERER_COLOR_CHANGE, value);
                break;
            }
            case '3DPrinting':{
                PubSub.publish(events.THREE_D_PRINTING, value);
                break;
            }
            case 'objExporting':{
                PubSub.publish(events.OBJ_SAVE, value);
                break;
            }
                
            // Notes Tab
            case 'atomNoteTable':{
                PubSub.publish(events.UPDATE_NOTES, value);
                break;
            }
            case 'noteVisibility':{
                PubSub.publish(events.NOTE_VISIBILITY, value);
                break;
            }
            case 'noteMovement':{
                PubSub.publish(events.NOTE_MOVEMENT, value);
                break;
            }
            case 'noteColor':{
                PubSub.publish(events.NOTE_COLOR, value);
                break;
            }
            case 'saveCamera':{
                PubSub.publish(events.ENABLE_CAMERA_PARAMETERS, value);
                break;   
            }
            case 'saveNoteForSystem':{
                PubSub.publish(events.SAVE_NOTE_FOR_SYSTEM, value);
                break;   
            }
            case 'selectNote':{
                PubSub.publish(events.SELECT_NOTE_FOR_SYSTEM, value);
                break;   
            }
            case 'deleteNote':{
                PubSub.publish(events.DELETE_NOTE_FOR_SYSTEM, value);
                break;   
            }

            case 'enableParameters':{ 
                PubSub.publish(events.ENABLE_MOTIF_PARAMETERS, value);
                break;   
            }
            case 'publishCameraData':{ 
                PubSub.publish(events.PUBLISH_CAMERA_STATE, value);
                break;   
            }
                
            // IAC Box
            case 'iacSound': {
                PubSub.publish(events.ATOM_CUSTOMIZATION, value); 
                break;
            }
            case 'iacVisibility':{
                PubSub.publish(events.ATOM_CUSTOMIZATION, value); 
                break;
            }
            case 'iacDoll':{
                PubSub.publish(events.ATOM_CUSTOMIZATION, value); 
                break;
            }
            case 'iacColor':{
                PubSub.publish(events.ATOM_CUSTOMIZATION, value); 
                break;
            }
            case 'iacClose':{
                PubSub.publish(events.ATOM_CUSTOMIZATION, value); 
                break;
            }
            case 'iacOpacity':{
                PubSub.publish(events.ATOM_CUSTOMIZATION, value); 
                break;
            }

            case 'reset':{
                PubSub.publish(events.RESET, value); 
                break;
            }

            // player narrative

            case 'playerPlay':{
                PubSub.publish(events.PLAYER_PLAY, value); 
                break;
            } 
            case 'playerRepeat':{
                PubSub.publish(events.PLAYER_REPEAT, value); 
                break;
            } 
            case 'playerPause':{
                PubSub.publish(events.PLAYER_PAUSE, value); 
                break;
            }
            case 'playerForward':{
                PubSub.publish(events.PLAYER_FORWARD, value); 
                break;
            }
            case 'playerRepeat':{
                PubSub.publish(events.PLAYER_REPEAT, value); 
                break;
            }
            case 'playerRewind':{
                PubSub.publish(events.PLAYER_REWIND, value); 
                break;
            }
        };
    };
    
    // Module Interface //
    setUIValue.prototype.setValue = function(argument){
        if (Object.keys(argument).length <= 0) return false;
        else {
            _.each(argument,function($parameter, k){
                
                // Read Value and run action //
                if (!(_.isUndefined($parameter.value))) {
                    // Select Element (if no selector is defined, the index is used //
                    if (_.isUndefined($parameter.other)) $selector = jQuery('#'+k);
                    else $selector = $parameter.other;
                    takeAction(k,$parameter.value,$selector);
                }
                else allowPublish = true;
                
                // Publish Event //
                if (!(_.isUndefined($parameter.publish))) {
                    if (allowPublish === true) publishAction(k,$parameter.publish);
                }
                allowPublish = false;
            });
        }
    };
    setUIValue.prototype.restoreUI = function(appUI,info){
        // Restore Library Tab //
        takeAction('projectName',info.name);
        takeAction('projectDescription',info.description);
        takeAction('projectTags',info.tags);
        
        // Tabs //
        $menu.restoreTabs(appUI.menuRibbon);
        
        // Toggles //
        takeAction('latticePoints',appUI.menuRibbon.toggleButtons.latticePoints);
        takeAction('edges',appUI.menuRibbon.toggleButtons.edges);
        takeAction('faces',appUI.menuRibbon.toggleButtons.faces);
        takeAction('xyzAxes',appUI.menuRibbon.toggleButtons.xyzAxes);
        takeAction('abcAxes',appUI.menuRibbon.toggleButtons.abcAxes);
        // Ignore Viewport and Full Screen //
        takeAction('unitCellViewport',false);
        takeAction('fullScreen',false);
        //takeAction('unitCellViewport',appUI.menuRibbon.toggleButtons.unitCellViewport);
        takeActionWithoutPublish('planes',appUI.menuRibbon.toggleButtons.planes);
        takeActionWithoutPublish('directions',appUI.menuRibbon.toggleButtons.directions);
       
        takeAction('atomRadius',appUI.menuRibbon.toggleButtons.atomRadius);
        takeAction('atomToggle',appUI.menuRibbon.toggleButtons.atomToggle);
        takeAction('labelToggle',appUI.menuRibbon.toggleButtons.labelToggle);
        takeAction('highlightTangency',appUI.menuRibbon.toggleButtons.highlightTangency);
        
        // Atom Radius Slider //
        takeAction('atomRadiusSlider',appUI.menuRibbon.toggleButtons.atomRadiusSlider.toString());
        
        // Lattice Tab //
        $menu.reset('collisions');
        takeAction('selectedLattice',appUI.latticeTab.latticeSelecion.selectedLattice);
        takeAction('repeatX',appUI.latticeTab.latticeRepetition.repeatX);
        takeAction('repeatY',appUI.latticeTab.latticeRepetition.repeatY);
        takeAction('repeatZ',appUI.latticeTab.latticeRepetition.repeatZ);
        takeAction('scaleX',appUI.latticeTab.latticeLength.scaleX);
        takeAction('scaleY',appUI.latticeTab.latticeLength.scaleY);
        takeAction('scaleZ',appUI.latticeTab.latticeLength.scaleZ);
        takeAction('alpha',appUI.latticeTab.latticeAngle.alpha);
        takeAction('beta',appUI.latticeTab.latticeAngle.beta);
        takeAction('gamma',appUI.latticeTab.latticeAngle.gamma); 
        $menu.restorePadlocks(appUI.latticeTab.padlocks.lattice.state,appUI.latticeTab.padlocks.motif.state);
        takeAction('cellEdgeColor',appUI.latticeTab.cellVisualization.cellEdge.color);
        takeAction('cellFaceColor',appUI.latticeTab.cellVisualization.cellFace.color);
        takeAction('radius',appUI.latticeTab.cellVisualization.cellEdge.radius.toString());
        takeAction('faceOpacity',appUI.latticeTab.cellVisualization.cellFace.opacity.toString());
        
        
        // Motif //
        takeAction('tangency',appUI.motifTab.tangency);
        takeAction('cellVolume',appUI.motifTab.cellVolume.toString());
        takeAction('lockCameras',appUI.motifTab.lockCameras);
        $menu.reset('atomTable');
        html.motif.other.nameContainer.hide();
        $menu.reset('motifCollisions');
        
        // Library
        if (appUI.hasOwnProperty('libraryTab')) {
            takeAction('frameIT',appUI.libraryTab.pngOptions.frameIT);
            takeAction('qrCode',appUI.libraryTab.pngOptions.qrCode);
            takeAction('printMode',appUI.libraryTab.pngOptions.printMode);
        }

        // Visual //
        if (appUI.visualTab.visualParameters.hasOwnProperty('lod')) 
            takeAction('lod', appUI.visualTab.visualParameters.lod.lod.toString());
        if (appUI.visualTab.visualParameters.hasOwnProperty('renderizationQuality')) {
            takeAction('autoQuality',appUI.visualTab.visualParameters.renderizationQuality.autoQuality);
            takeAction('lowQuality',appUI.visualTab.visualParameters.renderizationQuality.lowQuality);
            takeAction('mediumQuality',appUI.visualTab.visualParameters.renderizationQuality.mediumQuality);
            takeAction('highQuality',appUI.visualTab.visualParameters.renderizationQuality.highQuality);
        }
        takeAction('wireframe',appUI.visualTab.visualParameters.renderizationMode.wireframe);
        takeAction('toon',appUI.visualTab.visualParameters.renderizationMode.toon);
        takeAction('flat',appUI.visualTab.visualParameters.renderizationMode.flat);
        takeAction('realistic',appUI.visualTab.visualParameters.renderizationMode.realistic);
        takeAction('lights',appUI.visualTab.visualParameters.lights.lights);
        takeAction('ssao',appUI.visualTab.visualParameters.lights.ssao);
        takeAction('shadows',appUI.visualTab.visualParameters.lights.shadows);
        takeAction('distortionOff',appUI.visualTab.visualParameters.visualizationMode.distortionOff);
        takeAction('distortionOn',appUI.visualTab.visualParameters.visualizationMode.distortionOn);
        takeAction('anaglyph',appUI.visualTab.visualParameters.stereoscopicEffect.anaglyph);
        takeAction('oculus',appUI.visualTab.visualParameters.stereoscopicEffect.oculus);
        takeAction('sideBySide',appUI.visualTab.visualParameters.stereoscopicEffect.sideBySide3D);
        takeAction('onTop',appUI.visualTab.visualParameters.stereoscopicEffect.OnTop3D);
        if (appUI.visualTab.visualParameters.hasOwnProperty('stereoscopicCellEffect')) {
            takeAction('anaglyphCell',appUI.visualTab.visualParameters.stereoscopicCellEffect.anaglyphCell);
            takeAction('oculusCell',appUI.visualTab.visualParameters.stereoscopicCellEffect.oculusCell);
            takeAction('sideBySideCell',appUI.visualTab.visualParameters.stereoscopicCellEffect.sideBySide3DCell);
            takeAction('onTopCell',appUI.visualTab.visualParameters.stereoscopicCellEffect.OnTop3DCell);
        }
        takeAction('crystalCamTargetOn',appUI.visualTab.visualParameters.focalPoint.crystalCamTargetOn);
        takeAction('crystalCamTargetOff',appUI.visualTab.visualParameters.focalPoint.crystalCamTargetOff);
        takeAction('leapMotion',appUI.visualTab.visualParameters.leapMotion);
        takeAction('crystalClassic',appUI.visualTab.visualParameters.crystalModelRepresentation.crystalClassic);
        takeAction('crystalSubstracted',appUI.visualTab.visualParameters.crystalModelRepresentation.crystalSubstracted);
        takeAction('crystalSolidVoid',appUI.visualTab.visualParameters.crystalModelRepresentation.crystalSolidVoid);
        takeAction('crystalGradeLimited',appUI.visualTab.visualParameters.crystalModelRepresentation.crystalGradeLimited);
        takeAction('cellClassic',appUI.visualTab.visualParameters.unitCellModelRepresentation.cellClassic);
        takeAction('cellSubstracted',appUI.visualTab.visualParameters.unitCellModelRepresentation.cellSubstracted);
        takeAction('cellSolidVoid',appUI.visualTab.visualParameters.unitCellModelRepresentation.cellSolidVoid);
        takeAction('cellGradeLimited',appUI.visualTab.visualParameters.unitCellModelRepresentation.cellGradeLimited);
        if (appUI.visualTab.visualTools.menuZoom.autoZoom === true) takeAction('autoZoom','');
        if (appUI.visualTab.visualTools.menuZoom.zoom100 === true) takeAction('zoom100','');
        if (appUI.visualTab.visualTools.menuZoom.zoom90 === true) takeAction('zoom90','');
        if (appUI.visualTab.visualTools.menuZoom.zoom80 === true) takeAction('zoom80','');
        if (appUI.visualTab.visualTools.menuZoom.zoom70 === true) takeAction('zoom70','');
        takeAction('fog',appUI.visualTab.visualTools.fog.state);
        takeAction('fogDensity',appUI.visualTab.visualTools.fog.density);
        takeAction('fogColor',appUI.visualTab.visualTools.fog.color);
        takeAction('sounds',appUI.visualTab.visualTools.sound.state);
        takeAction('soundSlider',appUI.visualTab.visualTools.sound.volume);
        takeAction('crystalScreenColor',appUI.visualTab.visualTools.colorization.crystalScreenColor);
        takeAction('cellScreenColor',appUI.visualTab.visualTools.colorization.cellScreenColor);
        takeAction('motifXScreenColor',appUI.visualTab.visualTools.colorization.motifXScreenColor);
        takeAction('motifYScreenColor',appUI.visualTab.visualTools.colorization.motifYScreenColor);
        takeAction('motifZScreenColor',appUI.visualTab.visualTools.colorization.motifZScreenColor);
    };
    
    return setUIValue;
});