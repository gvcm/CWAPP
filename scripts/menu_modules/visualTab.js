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
    /* This module handles the Visualization Tab, which is a simple collection of buttons and inputs! */
    
    // Variables
    var $getUI = undefined;
    var $setUI = undefined;
    var $userDialog = undefined;
    var $disableUIElement = undefined;
    var value = undefined;
    var argument = undefined;
    var publish = undefined;
    var html = undefined;
    var tempVolume = 70;
    
    // Contructor //
    function visualTab(argument) {
        
        // Acquire Module References
        if (!(_.isUndefined(argument.getUIValue))) $getUI = argument.getUIValue;
        else return false;
        if (!(_.isUndefined(argument.setUIValue))) $setUI = argument.setUIValue;
        else return false;
        if (!(_.isUndefined(argument.userDialog))) $userDialog = argument.userDialog;
        else return false;
        if (!(_.isUndefined(argument.disableUIElement))) $disableUIElement = argument.disableUIElement;
        else return false;
        if (!(_.isUndefined(argument.html))) html = argument.html;
        else return false;
        
        // Visual Parameters //
        html.visual.lod.lod.val(4);
        html.visual.lod.lod.prop('disabled', true);
        html.visual.lod.lodSlider.slider({
            value: 4,
            min: 0,
            max: 5,
            step: 1,
            animate: true,
            slide: function(event, ui){
                // Publish //
                $setUI.setValue({
                    lod:{
                        publish:{lod: ui.value}
                    }
                });
                // Input //
                html.visual.lod.lod.val(ui.value);
            }
        });
        _.each(html.visual.parameters.renderizationQuality, function($parameter, k) {
            $parameter.on('click', function() {
                if (!($parameter.hasClass('disabled'))) {
                    if (k === 'highQuality') {
                        $userDialog.showWarningDialog({ messageID: 3, caller: $parameter });
                    }
                    else $parameter.trigger('action');
                }
            });
            // Triggered by the Warning dialog!!!! //
            $parameter.on('action', function() {
                if (!($parameter.hasClass('disabled'))) {
                    ($parameter.hasClass('active')) ? value = false : value = true;
                    if (value === true){
                        publish = {};
                        publish.renderizationQuality = k;
                        argument = {};
                        argument[k] = {
                            publish: publish,
                            value: value
                        };
                        $setUI.setValue(argument);
                    }
                }
            });
        });
        _.each(html.visual.parameters.renderizationMode, function($parameter, k) {
            $parameter.on('click', function() {
                if (!($parameter.hasClass('disabled'))) {
                    ($parameter.hasClass('active')) ? value = false : value = true;
                    if (value === true){
                        publish = {};
                        publish.mode = k;
                        argument = {};
                        argument[k] = {
                            publish: publish,
                            value: value
                        };
                        $setUI.setValue(argument);
                    }
                }
            });
        });
        html.visual.parameters.lights.on('click', function(){
            (html.visual.parameters.lights.hasClass('active')) ? value = false : value = true;
            $setUI.setValue({
                lights:{
                    publish:{lights:value},
                    value:value
                }
            });
        });
        html.visual.parameters.ssao.on('click', function(){
            (html.visual.parameters.ssao.hasClass('active')) ? value = false : value = true;
            $setUI.setValue({
                ssao:{
                    publish:{ssao:value},
                    value:value
                }
            });
        });
        html.visual.parameters.shadows.on('click', function(){
            (html.visual.parameters.shadows.hasClass('active')) ? value = false : value = true;
            $setUI.setValue({
                shadows:{
                    publish:{shadows:value},
                    value:value
                }
            });
        });
        html.visual.parameters.distortionOn.on('click', function() {
            (html.visual.parameters.distortionOn.hasClass('active')) ? value = false : value = true;
            if (value === true){
                $setUI.setValue({
                    distortionOn:{
                        publish:{distortion:true},
                        value:value
                    }
                });  
            }
        });
        html.visual.parameters.distortionOff.on('click', function() {  
            (html.visual.parameters.distortionOff.hasClass('active')) ? value = false : value = true;
            if (value === true){
                $setUI.setValue({
                    distortionOff:{
                        publish:{distortion:false},
                        value:value
                    }
                });
            }
        });
        html.visual.parameters.anaglyph.on('click', function() {
            (html.visual.parameters.anaglyph.hasClass('active')) ? value = false : value = true;
            $setUI.setValue({
                anaglyph:{
                    publish:{anaglyph:value},
                    value:value
                }
            });
        });
        html.visual.parameters.oculus.on('click', function() {
            (html.visual.parameters.oculus.hasClass('active')) ? value = false : value = true;
            $setUI.setValue({
                oculus:{
                    publish:{oculus:value},
                    value:value
                }
            });
        });
        html.visual.parameters.oculusTracker.on('click', function() {
            (html.visual.parameters.oculusTracker.hasClass('active')) ? value = false : value = true;
            $setUI.setValue({
                oculusTracker:{
                    publish:{oculusTracker:value}
                }
            });
        });
        html.visual.parameters.cardboard.on('click', function() {
            (html.visual.parameters.cardboard.hasClass('active')) ? value = false : value = true;
            $setUI.setValue({
                cardboard:{
                    publish:{cardboard:value}
                }
            });
        });
        html.visual.parameters.sideBySide3D.on('click', function() {
            (html.visual.parameters.sideBySide3D.hasClass('active')) ? value = false : value = true;
            $setUI.setValue({
                sideBySide:{
                    publish:{sideBySide:value},
                    value:value
                }
            });
        });
        html.visual.parameters.onTop3D.on('click', function() {
            (html.visual.parameters.onTop3D.hasClass('active')) ? value = false : value = true;
            $setUI.setValue({
                onTop:{
                    publish:{onTop:value},
                    value:value
                }
            });
        });
        html.visual.parameters.anaglyphCell.on('click', function() {
            (html.visual.parameters.anaglyphCell.hasClass('active')) ? value = false : value = true;
            $setUI.setValue({
                anaglyphCell:{
                    publish:{anaglyphCell:value},
                    value:value
                }
            });
        });
        html.visual.parameters.oculusCell.on('click', function() {
            (html.visual.parameters.oculusCell.hasClass('active')) ? value = false : value = true;
            $setUI.setValue({
                oculusCell:{
                    publish:{oculusCell:value},
                    value:value
                }
            });
        });
        html.visual.parameters.sideBySide3DCell.on('click', function() {
            (html.visual.parameters.sideBySide3DCell.hasClass('active')) ? value = false : value = true;
            $setUI.setValue({
                sideBySideCell:{
                    publish:{sideBySideCell:value},
                    value:value
                }
            });
        });
        html.visual.parameters.onTop3DCell.on('click', function() {
            (html.visual.parameters.onTop3DCell.hasClass('active')) ? value = false : value = true;
            $setUI.setValue({
                onTopCell:{
                    publish:{onTopCell:value},
                    value:value
                }
            });
        });
        html.visual.parameters.crystalCamTargetOn.on('click', function(){
            (html.visual.parameters.crystalCamTargetOn.hasClass('active')) ? value = false : value = true;
            if (value === true) {
                $setUI.setValue({
                    crystalCamTargetOn:{
                        publish:{center:true},
                        value:value
                    }
                });
            }
        });
        html.visual.parameters.crystalCamTargetOff.on('click', function(){
            (html.visual.parameters.crystalCamTargetOff.hasClass('active')) ? value = false : value = true;
            if (value === true) {
                $setUI.setValue({
                    crystalCamTargetOff:{
                        publish:{center:false},
                        value:value
                    }
                });
            }
        });
        html.visual.parameters.leapMotion.click(function() {
            (html.visual.parameters.leapMotion.hasClass('active')) ? value = false : value = true;
            $setUI.setValue({
                leapMotion:{
                    publish:{leap:value}
                }
            });          
        });
        _.each(html.visual.parameters.crystalMode, function($parameter, k) {
            $parameter.on('click', function() {
                if (!($parameter.hasClass('disabled'))) {
                    if ( (k === 'crystalSubstracted') || (k === 'crystalSolidVoid') ) {
                        $userDialog.showWarningDialog({ messageID: 3, caller: $parameter });
                    }
                    else $parameter.trigger('action');
                }
            });
            // Triggered by the Warning dialog!!!! //
            $parameter.on('action', function() {
                ($parameter.hasClass('active')) ? value = false : value = true;
                if (value === true){
                    publish = {};
                    publish.mode = k;
                    argument = {};
                    argument[k] = {
                        publish: publish,
                        value: value
                    };
                    $setUI.setValue(argument);
                }
            });
        });
        _.each(html.visual.parameters.unitCellMode, function($parameter, k) {
            $parameter.on('click', function() {
                if (!($parameter.hasClass('disabled'))) {
                    ($parameter.hasClass('active')) ? value = false : value = true;
                    if (value === true){
                        publish = {};
                        publish.mode = k;
                        argument = {};
                        argument[k] = {
                            publish: publish,
                            value: value
                        };
                        $setUI.setValue(argument);
                    }
                }
            });
        });
        
        // Visualization Tools //
        _.each(html.visual.tools.zoomOptions, function($parameter, k) {
            $parameter.on('click', function() {
                ($parameter.hasClass('active')) ? value = false : value = true;
                if (value === true){
                    argument = {};
                    argument[k] = {value:value};
                    $setUI.setValue(argument);
                }
            });
        });
        // Fog //
        html.visual.fog.checkbox.iCheck({
            checkboxClass: 'icheckbox_square-grey',
            radioClass: 'iradio_square-grey'
        });
        html.visual.fog.checkbox.on('ifChecked',function(){
            html.visual.fog.checkbox.addClass('active');
            $setUI.setValue({
                fog:{
                    publish:{fog:true}
                }
            });
        });
        html.visual.fog.checkbox.on('ifUnchecked',function(){
            html.visual.fog.checkbox.removeClass('active');
            $setUI.setValue({
                fog:{
                    publish:{fog:false}
                }
            });
        });
        html.visual.fog.density.val(1);
        html.visual.fog.density.on('change',function(){
            $setUI.setValue({
                fogDensity:{
                    publish:{fogDensity: html.visual.fog.density.val()},
                    value: html.visual.fog.density.val()
                }
            });
        });
        html.visual.fog.densitySlider.slider({
            value: 5,
            min: 1,
            max: 10,
            step: 0.1,
            animate: true,
            slide: function(event, ui){
                $setUI.setValue({
                    fogDensity:{
                        publish:{fogDensity: html.visual.fog.density.val()}
                    }
                });
                html.visual.fog.density.val(ui.value);
            }
        });
        html.visual.fog.color.children().css('background','#000');
        html.visual.fog.color.spectrum({
            color: "#000000",
            allowEmpty:true,
            chooseText: "Choose",
            cancelText: "Close",
            move: function(){
                $setUI.setValue({
                    fogColor:{
                        value: '#' + html.visual.fog.color.spectrum('get').toHex(),
                        publish: { fogColor: html.visual.fog.color.spectrum('get').toHex() }
                    }
                });
            },
            change: function(){
                $setUI.setValue({
                    fogColor:{
                        value: '#' + html.visual.fog.color.spectrum('get').toHex(),
                        publish: { fogColor: html.visual.fog.color.spectrum('get').toHex() }
                    }
                });
            }
        });
        // Sound //
        html.visual.sound.mute.on('click', function(){
            (html.visual.sound.mute.hasClass('active')) ? value = false : value = true;
            $setUI.setValue({
                muteSound:{
                    publish:{muteSound:value},
                    value:value
                }
            }); 
            if (value === false) {
                $setUI.setValue({
                    soundVolume:{
                        publish:{soundVolume: tempVolume}
                    },
                    soundSlider:{
                        value: tempVolume
                    }
                });
            }
        });
        html.visual.sound.sounds.on('click', function(){
            (html.visual.sound.sounds.hasClass('active')) ? value = false : value = true;
            $setUI.setValue({
                sounds:{
                    publish:{sounds:value},
                    value:value
                }
            });
        });
        html.visual.sound.soundSlider.slider({
            value: 75,
            min: 0,
            max: 100,
            step: 1,
            animate: true,
            slide: function(event, ui){
                tempVolume = ui.value;
                $setUI.setValue({
                    soundVolume:{
                        publish:{soundVolume: ui.value}
                    }
                });
            
                if (ui.value > 0) {
                    $setUI.setValue({
                        muteSound:{
                            value:false
                        }
                    });
                }
            }
        });
        html.visual.sound.soundSlider.slider('disable');
        $disableUIElement.disableElement({
            muteSound: {
                value: true
            }
        });
        _.each(html.visual.tools.colorPickers, function($parameter, k) {
            $parameter.spectrum({
                color: "#000000",
                allowEmpty:true,
                chooseText: "Choose",
                cancelText: "Close",
                move: function(){
                    publish = {};
                    publish[k+'Color'] = $parameter.spectrum("get").toHex();
                    argument = {};
                    argument[k+'Color'] = {
                        publish: publish
                    };
                    $setUI.setValue(argument);
                    $parameter.children().css('background','#'+$parameter.spectrum("get").toHex());
                },
                change: function(){
                    publish = {};
                    publish[k+'Color'] = $parameter.spectrum("get").toHex();
                    argument = {};
                    argument[k+'Color'] = {
                        publish: publish
                    };
                    $setUI.setValue(argument);
                    $parameter.children().css('background','#'+$parameter.spectrum("get").toHex());
                }
            });
        });
        // Hard Reset //
        html.visual.other.reset.on('click',function(){
            $setUI.setValue({
                reset: {
                    value: true,
                    publish: true
                }
            });
            $disableUIElement.disableElement({
                reset: {
                    value: true
                }
            });
        });
    };
    
    // Module Interface //
    visualTab.prototype.chooseActiveRenderMode = function(id){
        var argument = {};
        argument[id] = {value: true};
        $setUI.setValue(argument);
    };
    visualTab.prototype.chooseActiveCrystalMode = function(id){
        var argument = {};
        argument[id] = {value: true};
        $setUI.setValue(argument);
    };
    visualTab.prototype.chooseActiveUnitCellMode = function(id){
        var argument = {};
        argument[id] = {value: true};
        $setUI.setValue(argument);
    };
    visualTab.prototype.disableRenderizationButtons = function(values){
        var argument = {};
        _.each(values, function($parameter,k){
            argument[k] = {value: $parameter};
        });
        $disableUIElement.disableElement(argument);
    };
    visualTab.prototype.disableCrystalButtons = function(values){
        var argument = {};
        _.each(values, function($parameter,k){
            argument[k] = {value: $parameter};
        });
        $disableUIElement.disableElement(argument);
    };
    visualTab.prototype.disableUnitCellButtons = function(values){
        var argument = {};
        _.each(values, function($parameter,k){
            argument[k] = {value: $parameter};
        });
        $disableUIElement.disableElement(argument);
    };
    return visualTab;
});