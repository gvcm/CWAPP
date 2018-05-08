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
    
    /* This module handles the lattice tab. It assigns listeners to the user events (new input, slider handle moves, etc) and
    also filters these events depending on the application needs. It contains:
        - Lattice Repetition
        - Lattice Length
        - Lattice Angle
        - Padlocks and their functionallity
        - Input restrictions for lattice length and lattice repetition
        - Collision Detection
        - Cell Visualization
        - Lattice Length/Angle become Motif Length/Angle after at least one atom is added.
    */
    
    // Variables //
    var value = undefined;
    var localRestrictions = undefined;
    var restrictionList = {};
    var collisions = {};
    var collisionTooltip = {
        scaleX: false,   
        scaleY: false,   
        scaleZ: false,   
        alpha: false,   
        beta: false,   
        gamma: false 
    };
    var collisionRange = {
        scaleX: 0.5,
        scaleY: 0.5,
        scaleZ: 0.5,
        alpha: 3,
        beta: 3,
        gamma: 3
    };
    
    // Grouping //
    var conditions = {
        autoRefresh: false,
        atomAdded: false
    }
    var LastLatticeParameters = [];
    var lengthSlider = ['scaleX','scaleY','scaleZ'];
    var angleSliders = ['alpha','beta','gamma'];
    
    // Module References //
    var $messages = undefined;
    var $setUIValue = undefined;
    var $stringEditor = undefined;
    var $disableUIElement = undefined;
    var $userDialog = undefined;
    var $tooltipGenerator = undefined;
    var html = undefined;
    
    // Contructor //
    function latticeTab(argument) {
        // Acquire Module References
        if (!(_.isUndefined(argument.messages))) $messages = argument.messages;
        else return false;
        if (!(_.isUndefined(argument.disableUIElement))) $disableUIElement = argument.disableUIElement;
        else return false;
        if (!(_.isUndefined(argument.setUIValue))) $setUIValue = argument.setUIValue;
        else return false;
        if (!(_.isUndefined(argument.userDialog))) $userDialog = argument.userDialog;
        else return false;
        if (!(_.isUndefined(argument.stringEditor))) $stringEditor = argument.stringEditor;
        else return false;
        if (!(_.isUndefined(argument.tooltipGenerator))) $tooltipGenerator = argument.tooltipGenerator;
        else return false;
        if (!(_.isUndefined(argument.html))) html = argument.html;
        else return false;
        
        // Inputs //
        
        // Cell Visualization check-boxes //
        jQuery(html.lattice.other.icheck).iCheck({
            checkboxClass: 'icheckbox_square-grey',
            radioClass: 'iradio_square-grey',
            checkedClass: 'checked'
        });
        html.lattice.other.icheckVisual.iCheck('check');
        html.lattice.other.icheck.on('ifChecked',function(){
            var name = jQuery(this).attr('name');
            var argument = {};
            var publish = {};
            var value = {};
            value.value = true;
            publish[name] = true;
            value.publish = publish;
            argument[name] = value;
            $setUIValue.setValue(argument);
        });
        html.lattice.other.icheck.on('ifUnchecked',function(){
            var name = jQuery(this).attr('name');
            var argument = {};
            var publish = {};
            var value = {};
            value.value = false;
            publish[name] = false;
            value.publish = publish;
            argument[name] = value;
            $setUIValue.setValue(argument);
        });
        
        
        // Cell Visualization color pickers //
        html.lattice.visual.edgeColorPicker.spectrum({
            color: "#A19EA1",
            allowEmpty:true,
            chooseText: "Choose",
            cancelText: "Close",
            move: function(){
                $setUIValue.setValue({
                    cylinderColor:{
                        value: html.lattice.visual.edgeColorPicker.spectrum('get').toHex(),
                        publish: { cylinderColor: html.lattice.visual.edgeColorPicker.spectrum('get').toHex() }
                    }
                });
            },
            change: function(){
                $setUIValue.setValue({
                    cylinderColor:{
                        value: html.lattice.visual.edgeColorPicker.spectrum('get').toHex(),
                        publish: { cylinderColor: html.lattice.visual.edgeColorPicker.spectrum('get').toHex() }
                    }
                });
            }
        });
        html.lattice.visual.edgeColorPicker.children().css('background','#A19EA1');
        html.lattice.visual.faceColorPicker.spectrum({
            color: "#907190",
            allowEmpty:true,
            chooseText: "Choose",
            cancelText: "Close",
            move: function(){
                $setUIValue.setValue({
                    faceColor:{
                        value: html.lattice.visual.faceColorPicker.spectrum('get').toHex(),
                        publish: { faceColor: html.lattice.visual.faceColorPicker.spectrum('get').toHex() }
                    }
                });
            },
            change: function(){
                $setUIValue.setValue({
                    faceColor:{
                        value: html.lattice.visual.faceColorPicker.spectrum('get').toHex(),
                        publish: { faceColor: html.lattice.visual.faceColorPicker.spectrum('get').toHex() }
                    }
                });
            }
        });
        html.lattice.visual.faceColorPicker.children().css('background','#907190');
        
        // Lattice Repetition Spinners //
        html.lattice.other.spinner.spinner({
            min: 1,
            spin: function(event,ui){
                var name = jQuery(this).attr('id');
                var argument = {};
                var value = {};
                value.value = ui.value;
                var publish = {};
                publish[name] = ui.value;
                value.publish = publish;
                argument[name] = value;
                $setUIValue.setValue(argument);
            }
        });
        
        // Lattice Parameters (Repetition,Angle,Length) inputs + Restrictions //
        _.each(html.lattice.parameters, function($parameter, k) {
            // Initiate restore table //
            LastLatticeParameters[k] = 1;
            // Spinner Inputs Listener //
            if ((k === 'repeatX')||(k === 'repeatY')||(k === 'repeatZ')){
                $parameter.val(1);
                $parameter.on('change',function(){
                    var argument = {};
                    var sendValue = {};
                    var publish = {};
                    publish[k] = $parameter.val();
                    sendValue.publish = publish;
                    sendValue.value = $parameter.val();
                    argument[k] = sendValue;
                    $setUIValue.setValue(argument);
                });
            }
            else{
                
                // Assign initial values //
                if ((k === 'scaleX')||(k === 'scaleY')||(k === 'scaleZ')){
                    $parameter.val(1.000);
                    LastLatticeParameters[k] = 1;
                }
                else{
                    $parameter.val(90.000);
                    LastLatticeParameters[k] = 90;
                }
                
                // User input listener //
                $parameter.on('change', function() {
                    var argument = {};
                    // Check if user input is a number //
                    if ($stringEditor.inputIsNumber($parameter.val()) !== false) {
                        argument[k] = $stringEditor.inputIsNumber($parameter.val());
                        // Apply restrictions to the input //
                        var restrictionsMet = applyRestrictions(k,argument[k],false);
                        if ( restrictionsMet === 'success' ) $parameter.trigger('success', [argument[k]]);
                    }
                    // Revert to the previous value //
                    else {
                        $parameter.val(LastLatticeParameters[k]);
                        // Display error tooltip //
                        $tooltipGenerator.showTooltip({
                            'target': k,
                            'placement': 'top',
                            'message': $messages.getMessage(20)
                        });
                    }
                });   
                // This listener reflects the value of another input. It is triggers by the restriction mechanics. //
                $parameter.on('reflect',function(event, value) {
                    $parameter.val(value);
                    $parameter.trigger('success',[value]);
                });
                // This listener is triggered when the value of the input is valid (has passed restrictions + numbercheck). //
                $parameter.on('success',function(event, value) {
                    
                    var argument = {};
                    var publish = {};
                    publish[k] = value;
                    /* Choose Input Mode: 
                        if at least one atom is added to the lattice, then these inputs publish motif events. 
                        Otherwise they publish lattice events.    
                    */
                    if (conditions.atomAdded === false) {
                        argument[k] = {
                            value: value,
                            publish: publish   
                        };
                    }
                    else {
                        argument[k+'Motif'] = {
                            other: $parameter,
                            value: value,
                            publish: publish   
                        };
                    }
                    $setUIValue.setValue(argument);
                    
                    // Auto Refresh //
                    if (conditions.autoRefresh === true){
                        $setUIValue.setValue({
                            motifRefresh:{
                                publish: { empty: 0 }   
                            }
                        });
                    }
                    // Update Restore Table //
                    LastLatticeParameters[k] = value;
                });
                // This listener is triggered when the restriction mechanics fail. //
                $parameter.on('fail',function(event, value) {
                    $parameter.val(value);
                    LastLatticeParameters[k] = value;
                    jQuery('#'+k+'Slider').slider('value',value);
                });
                // This listener is triggered when the restriction mechanics fail and we also need to restore the old value. //
                $parameter.on('undo',function(event, value) {
                    $parameter.trigger('fail',[value]);
                });
            }
        });
        
        // Lattice Length Sliders //
        _.each(lengthSlider, function(name) {
            LastLatticeParameters[name] = 1;
            // This listener is triggered when the restriction mechanics fail. //
            jQuery('#'+name+'Slider').on('fail', function(event, value){
                var argument = {};
                var sendValue = {};
                var publish = {};
                
                // Pick different event if sliders are being used by Motif //
                publish[name] = value;
                sendValue.publish = publish;
                sendValue.value = value;
                if (conditions.atomAdded === false) argument[name] = sendValue;
                else argument[name+'Motif'] = sendValue;
                $setUIValue.setValue(argument);
                
                // Update Restore Table and input field //
                LastLatticeParameters[name] = value;
                jQuery('#'+name).val(value);
            });
            // This listener is triggered when the restriction mechanics fail and we need to revert to the previous value. //
            jQuery('#'+name+'Slider').on('undo', function(event, value){
                jQuery('#'+name+'Slider').trigger('fail',[value]);
            });
            // This listener is triggered in order to reflect a slider event due to restrictions. // 
            jQuery('#'+name+'Slider').on('reflect', function(event, value){
                var argument = {};
                var sendValue = {};
                var publish = {};
                
                // Pick different event if sliders are being used by Motif //
                publish[name] = value;
                sendValue.publish = publish;
                sendValue.value = value;
                if (conditions.atomAdded === false) argument[name] = sendValue;
                else argument[name+'Motif'] = sendValue;
                $setUIValue.setValue(argument);
                
                // Update Restore Table and input field //
                LastLatticeParameters[name] = value;
                jQuery('#'+name).val(value);
            });
            // User Input Listener //
            jQuery('#'+name+'Slider').slider({
                value: 1,
                min: 1,
                max: 20,
                step: 0.01,
                animate: true,
                slide: function(event, ui){
                    var argument = {};
                    var value = {};
                    var publish = {};
                    
                    // Pass Collision Detection !!!!!(Exits function if fails)!!!!! //
                    if (!(_.isUndefined(collisions[name]))){
                        // Check for collision //
                        if (collision(ui.value,collisions[name],collisionRange[name]) === true){
                            // First time we detect collision //
                            if (collisionTooltip[name] === false){
                                // Make sure that the following won't run repeatedly in this collision event //
                                collisionTooltip[name] = true;
                                // Display static error tooltip //
                                $tooltipGenerator.addStaticTooltip({
                                    'target': name+'Slider',
                                    'placement': 'top',
                                    'message': $messages.getMessage(24)
                                });
                                // Pass restrictions as usual and publish the event //
                                _.each(html.lattice.parameters, function($parameter,k){
                                    if (k === name) {
                                        applyRestrictions(k+'Slider',collisions[name].toString(),true);
                                        publish[name] = collisions[name];
                                    }
                                });
                                value.publish = publish;
                                value.other = jQuery('#name');
                                // Choose slider behaviour (lattice/motif) //
                                if (conditions.atomAdded === false) argument[name] = value;
                                else argument[name+'Motif'] = value;
                                $setUIValue.setValue(argument);
                            }
                            // Freeze slider + input //
                            jQuery('#'+name).val(collisions[name]);
                            jQuery('#'+name+'Slider').slider('value',collisions[name]);
                            // Exit Listener //
                            return false; 
                        } 
                    }
                    
                    // Pass Restrictions //
                    _.each(html.lattice.parameters, function($parameter,k){
                        if (k === name) {
                            applyRestrictions(k+'Slider',ui.value.toString(),true);
                            publish[name] = ui.value;
                        }
                    });
                    value.publish = publish;
                    value.other = jQuery('#name');
                    // Choose slider behaviour (lattice/motif) //
                    if (conditions.atomAdded === false) argument[name] = value;
                    else argument[name+'Motif'] = value;
                    $setUIValue.setValue(argument);
                    // Destroy collision tooltip //
                    collisionTooltip[name] = false;
                    jQuery('#'+name+'Slider').tooltip('destroy');
                    // Update input field //
                    jQuery('#'+name).val(ui.value);
                },
                stop: function(event,ui){
                    // Auto-Refresh
                    if (conditions.autoRefresh === true){
                        $setUIValue.setValue({
                            motifRefresh:{
                                publish: { empty: 0 }   
                            }
                        });
                    }
                    // Destroy collision tooltip //
                    jQuery('#'+name+'Slider').tooltip('destroy');
                    collisionTooltip[name] = false;
                }
            });
        });
        
        // Lattice Angle Sliders //
        _.each(angleSliders, function(name) {
            LastLatticeParameters[name] = 1;
            // This listener is triggered when the restriction mechanics fail. //
            jQuery('#'+name+'Slider').on('fail', function(event, value){
                var argument = {};
                var sendValue = {};
                var publish = {};
                
                // Pick different event is sliders are being used by Motif //
                publish[name] = value;
                sendValue.publish = publish;
                sendValue.value = value;
                // Choose slider behavior (lattice/motif) //
                if (conditions.atomAdded === false) argument[name] = sendValue;
                else argument[name+'Motif'] = sendValue;
                $setUIValue.setValue(argument);
                
                // Update Restore Table and input field //
                LastLatticeParameters[name] = value;
                jQuery('#'+name).val(value);
            });
            // This listener is triggered when the restriction mechanics fail and we need to revert to the previous value. //
            jQuery('#'+name+'Slider').on('undo', function(event, value){
                jQuery('#'+name+'Slider').trigger('fail',[value]);
            });
            // This listener is triggered in order to reflect a slider event due to restrictions. // 
            jQuery('#'+name+'Slider').on('reflect', function(event, value){
                var argument = {};
                var sendValue = {};
                var publish = {};
                
                publish[name] = value;
                sendValue.publish = publish;
                sendValue.value = value;
                // Choose slider behavior (lattice/motif) //
                if (conditions.atomAdded === false) argument[name] = sendValue;
                else argument[name+'Motif'] = sendValue;
                $setUIValue.setValue(argument);
                
                // Update Restore Table and input field //
                LastLatticeParameters[name] = value;
                jQuery('#'+name).val(value);
            });
            // User Input Listener //
            jQuery('#'+name+'Slider').slider({
                value: 90,
                min: 1,
                max: 180,
                step: 1,
                animate: true,
                slide: function(event, ui){
                    var argument = {};
                    var value = {};
                    var publish = {};
                    
                    // Pass Collision Detection !!!!!(Exits function if fails)!!!!! //
                    if (!(_.isUndefined(collisions[name]))){
                        // Check for collision //
                        if (collision(ui.value,collisions[name],collisionRange[name]) === true){
                            if (collisionTooltip[name] === false){
                                // Make sure that the following won't run repeatedly in this collision event //
                                collisionTooltip[name] = true;
                                // Display static error tooltip //
                                $tooltipGenerator.addStaticTooltip({
                                    'target': name+'Slider',
                                    'placement': 'top',
                                    'message': $messages.getMessage(24)
                                });
                                // Apply restrictions as usual //
                                _.each(html.lattice.parameters, function($parameter,k){
                                    if (k === name) {
                                        applyRestrictions(k+'Slider',collisions[name].toString(),true);
                                        publish[name] = collisions[name];
                                    }
                                });
                                value.publish = publish;
                                value.other = jQuery('#name');
                                // Choose slider behavior (lattice/motif) //
                                if (conditions.atomAdded === false) argument[name] = value;
                                else argument[name+'Motif'] = value;
                                $setUIValue.setValue(argument);
                            }
                            // Freeze slider + input //
                            jQuery('#'+name).val(collisions[name]);
                            jQuery('#'+name+'Slider').slider('value',collisions[name]);
                            // Exit listener //
                            return false; 
                        } 
                    }
                    
                    // Pass Restrictions //
                    _.each(html.lattice.parameters, function($parameter,k){
                        if (k === name) {
                            applyRestrictions(k+'Slider',ui.value.toString(),true);
                            publish[name] = ui.value;
                        }
                    });
                    value.publish = publish;
                    value.other = jQuery('#name');
                    // Choose slider behavior (lattice/motif) //
                    if (conditions.atomAdded === false) argument[name] = value;
                    else argument[name+'Motif'] = value;
                    $setUIValue.setValue(argument);
                    // Destroy collision tooltip //
                    collisionTooltip[name] = false;
                    jQuery('#'+name+'Slider').tooltip('destroy');
                    // Update input field //
                    jQuery('#'+name).val(ui.value);
                    
                },
                stop: function(event,ui){
                    // Auto-Refresh
                    if (conditions.autoRefresh === true){
                        $setUIValue.setValue({
                            motifRefresh:{
                                publish: { empty: 0 }   
                            }
                        });
                    }
                    // Destroy collision tooltip //
                    jQuery('#'+name+'Slider').tooltip('destroy');
                    collisionTooltip[name] = false;
                }
            });
        });
        
        // Cell Visualization Inputs //
        html.lattice.visual.radius.val(2);
        html.lattice.visual.radius.on('change', function() {
            $setUIValue.setValue({
                radius:{
                    publish:{radius:html.lattice.visual.radius.val()},
                    value: html.lattice.visual.radius.val()
                }
            });
        });
        html.lattice.visual.opacity.val(3);
        html.lattice.visual.opacity.on('change', function() {
            $setUIValue.setValue({
                faceOpacity:{
                    publish:{radius:html.lattice.visual.opacity.val()},
                    value: html.lattice.visual.opacity.val()
                }
            });
        });
        html.lattice.visual.radiusSlider.slider({
            value: 2,
            min: 1,
            max: 10,
            step: 1,
            animate: true,
            slide: function(event, ui){
                $setUIValue.setValue({
                    radius:{
                        publish:{radius:ui.value}
                    }
                });
                html.lattice.visual.radius.val(ui.value);
            }
        });
        html.lattice.visual.opacitySlider.slider({
            value: 3,
            min: 1,
            max: 10,
            step: 1,
            animate: true,
            slide: function(event, ui){
                $setUIValue.setValue({
                    faceOpacity:{
                        publish:{faceOpacity:ui.value}
                    }
                });
                html.lattice.visual.opacity.val(ui.value);
            }
        });
        
        
        // Buttons //
        // Disable Padlocks + Refresh Button //
        $disableUIElement.disableElement({
            latticePadlock:{
                value: true
            },
            motifPadlock:{
                value: true
            },
            latticeRefreshButtons:{
                value: true
            }
        });
        
        // Padlocks //
        html.lattice.padlocks.lattice.on('click', function() {
            if (!(html.lattice.padlocks.lattice.hasClass('disabled'))) latticePadlock();
        });
        html.lattice.padlocks.motif.on('click', function() {
            if (!(html.lattice.padlocks.motif.hasClass('disabled'))) {
                if (!(html.lattice.padlocks.motif.children().hasClass('active'))) {
                    $setUIValue.setValue({
                        motifPadlock:{
                            publish: { padlock: true }
                        }
                    });   
                }
                else {
                    $setUIValue.setValue({
                        motifPadlock:{
                            publish: { padlock: false }
                        }
                    });   
                }
            }
        });
        
        // Auto-Refresh //
        html.lattice.other.autoRefresh.on('click', function(){
            if (!(html.lattice.other.autoRefresh.hasClass('off'))) {
                html.lattice.other.autoRefresh.addClass('off');
                conditions.autoRefresh = false;
            }
            else{
                html.lattice.other.autoRefresh.removeClass('off');
                conditions.autoRefresh = true;
            }
            $setUIValue.setValue({
                autoUpdate:{
                    publish: {autoUpdate: conditions.autoRefresh}   
                }
            });
        });
    };
    // Unlocks lattice padlock -> No restrictions -> Unlocks Motif Padlock //
    function latticePadlock(){
        if (!(html.lattice.padlocks.lattice.children().hasClass('active'))) {
            
            // If crystal is added //
            if (!( html.lattice.other.selected.html() === 'Choose a Lattice' )) {

                // Change Title //
                $setUIValue.setValue({
                    selectedLattice:{
                        value: $messages.getMessage(21)   
                    }
                });
                
                // Toggle Lattice Padlock //
                html.lattice.padlocks.lattice.find('a').button('toggle');
                html.lattice.padlocks.lattice.children().addClass('active');
                
                // Disable both padlocks //
                $disableUIElement.disableElement({
                    latticePadlock:{
                        value: true
                    },
                    motifPadlock:{
                        value: true   
                    }
                });
                
                // Clear Lattice Restrictions //
                removeLatticeRestrictions();
                
                // Unlock Motif Padlock //
                $setUIValue.setValue({
                    motifPadlock:{
                        publish: { padlock: true }
                    }
                });
                
                // Show Info Message //
                $userDialog.showInfoDialog({ messageID:1 });
            }
        }
    };
    // Clear Lattice Restrictions //
    function removeLatticeRestrictions(){
        restrictionList = {};
        // Re-enable all lattice parameters //
        $disableUIElement.disableElement({
            latticeParameters:{ value: false } 
        });
    };
    // Create restriction mechanics //
    function setLatticeRestrictions(restrictions){
        // Return is restrictions is not an object
        if (_.isObject(restrictions) === false) {
            return;
        }

        localRestrictions = restrictions;

        var left = {};
        var right = {};

        /* The iteration can be described as following:
                For each lattice parameter 
                    if we receive a set of restriction for it
                        we create a function for each restriction on the set
                            the function above judges if a certain input on the this lattice parameter, passes the restriction that we were given
                    
                All restriction-functions are stored in the restricionList object.
                There are 4 types of functions
                    lattice parameters = number
                    lattice parameters = another lattice parameters
                    lattice parameters != number
                    lattice parameters != another lattice parameters
                    
                    and they return the following properties:
                        action: success/fail/reflect/undo
                        source: left hand of the above expressions
                        target: right hand of the above expressions
                        value: value to be assigned
                        restriction: = or !=
        */
        
        _.each(html.lattice.parameters, function($parameter, pk) {

            // Enable slider + input //
            $parameter.prop('disabled',false);
            jQuery('#'+pk+'Slider').slider('enable');

            if (_.isUndefined(restrictions[pk]) === false) {

                // Left side of expression
                left[pk] = $parameter;

                _.each(restrictions[pk], function(operator, rk) {

                    // Right side of expression
                    right[rk] = html.lattice.parameters[rk];

                    var restrictionName = 'restriction'+Object.keys(restrictionList).length;

                    if (operator === '=') {
                        // Add equalToNumber restriction
                        if (_.isUndefined(right[rk])) {
                            left[pk].prop('disabled',true);
                            jQuery('#'+pk+'Slider').slider('disable');
                            restrictionList[restrictionName] = function(caller,value){
                                if (caller === pk){
                                    if (parseFloat(value) !== parseFloat(rk)) {
                                        return { 
                                            action: 'fail',
                                            source: left[pk],
                                            target: parseFloat(rk),
                                            value: parseFloat(rk),
                                            restriction: 'equalTo'
                                        };
                                    }
                                }
                                else if (caller === pk+'Slider'){
                                    if (parseFloat(value) !== parseFloat(rk)) {
                                        return { 
                                            action: 'fail',
                                            source: jQuery('#'+pk+'Slider'),
                                            target: parseFloat(rk),
                                            value: parseFloat(rk),
                                            restriction: 'equalTo'
                                        };
                                    }
                                }
                                return { action: 'success' };
                            }
                        }
                        // Add equalToInput restriction
                        else {
                            if (right[rk].prop('disabled') === false){
                                right[rk].prop('disabled',true);
                                jQuery('#'+rk+'Slider').slider('disable');
                            }
                            restrictionList[restrictionName] = function(caller,value){
                                if(caller === pk){
                                    return {
                                        action: 'reflect',
                                        source: left[pk],
                                        target: right[rk],
                                        value: value
                                    };
                                }
                                else if (caller === pk+'Slider'){
                                    return {
                                        action: 'reflect',
                                        source: jQuery('#'+pk+'Slider'),
                                        target: jQuery('#'+rk+'Slider'),
                                        value: value
                                    };
                                }
                                return { action: 'success' };
                            }
                        }
                    } 
                    else if (operator === '≠') {

                        // Add differentThanNumber restriction
                        if (_.isUndefined(right[rk])) {
                            restrictionList[restrictionName] = function(caller,value){
                                if (caller === pk){
                                    if (parseFloat(value) === parseFloat(rk)) {
                                        return { 
                                            action: 'fail',
                                            source: left[pk],
                                            target: parseFloat(rk),
                                            value: LastLatticeParameters[pk],
                                            restriction: 'differentThan'
                                        };
                                    }
                                }
                                else if (caller === pk+'Slider'){
                                    if (parseFloat(value) === parseFloat(rk)) {
                                        return { 
                                            action: 'fail',
                                            source: jQuery('#'+pk+'Slider'),
                                            target: parseFloat(rk),
                                            value: LastLatticeParameters[pk],
                                            restriction: 'differentThan'
                                        };
                                    }
                                }
                                return { action: 'success' };
                            }
                        }
                        // Add differentThanInput restriction
                        else {
                            restrictionList[restrictionName] = function(caller,value){
                                if (caller === pk){
                                    if (value === right[rk].val()) {
                                        return { 
                                            action: 'undo',
                                            source: left[pk],
                                            target: right[rk],
                                            value: LastLatticeParameters[pk]
                                        };
                                    }
                                }
                                else if (caller === pk+'Slider'){
                                    if (value === right[rk].val()) {
                                        return { 
                                            action: 'undo',
                                            source: jQuery('#'+pk+'Slider'),
                                            target: jQuery('#'+rk+'Slider'),
                                            value: LastLatticeParameters[pk]
                                        };
                                    }
                                }
                                return { action: 'success' };
                            }
                        }
                    }
                });
            }
        });
    };
    // Unlock Motif Padlock //
    function unlockMotifPadlock(){    
        // Toggle //
        if (!(html.lattice.padlocks.motif.children().hasClass('active'))) html.lattice.padlocks.motif.find('a').button('toggle');
        html.lattice.padlocks.motif.children().addClass('active');
        
        // Turn off tangency //
        $setUIValue.setValue({
            tangency: {
                value: false
            }
        });
        
        // Enable Lattice Parameters //
        $disableUIElement.disableElement({
            latticeParameters:{
                value: false   
            }
        });
        
        // Re-apply lattice restrictions if needed
        if (!(html.lattice.padlocks.lattice.children().hasClass('active'))) {
            removeLatticeRestrictions();
            setLatticeRestrictions(localRestrictions);
        }
        
        // Show info message //
        $userDialog.showInfoDialog({ messageID : 2 });
    };
    // Lock Motif Padlock //
    function lockMotifPadlock(){     
        // Toggle //
        if (html.lattice.padlocks.motif.children().hasClass('active')) html.lattice.padlocks.motif.find('a').button('toggle');
        html.lattice.padlocks.motif.children().removeClass('active');
        
        // Turn on tangency //
        $setUIValue.setValue({
            tangency: {
                value: true
            }
        });
        
        // Disable Lattice Parameters //
        $disableUIElement.disableElement({
            latticeParameters:{
                value: true   
            }
        });
    };
    // Apply restrictions on a certain input //
    function applyRestrictions(caller,value,context,noTooltips){
        var result = {};
        var returnValue = 'success';

        // No-Restrictions yet //
        if (_.isEmpty(restrictionList)) return returnValue;
        // RUN RESTRICTION FUNCTIONS //
        _.each(restrictionList, function($parameter,pk){
            result[pk] = $parameter(caller,value);
        });

        // Evaluate Resutls - Trigger Listeners //
        // ORDER [ ≠X > =X >  ≠Number,=Number] //
        _.each(result, function($param, a){
            if ($param.action === 'undo') {
                if (noTooltips !== true){
                    $tooltipGenerator.showTooltip({
                        target: $param.source.attr('id'),
                        placement: 'top',
                        message: $stringEditor.translateParameter($param.source.attr('id'))+' should be ≠ '+$stringEditor.translateParameter($param.target.attr('id'))
                    });
                    $param.source.trigger($param.action, [$param.value]);
                    returnValue = 'abort';
                }
            }
        });
        if (returnValue !== 'abort') {
            _.each(result, function($param, a){
                if ($param.action === 'reflect') {
                    $param.source.trigger($param.action, [$param.value]);
                    $param.target.trigger($param.action, [$param.value]);
                    returnValue = 'reflect';
                }
            });
        }
        if (returnValue !== 'abort') {
            _.each(result, function($param, a){
                if ($param.action === 'fail') {
                    var message;
                    if ($param.restriction === 'equalTo') message = $stringEditor.translateParameter($param.source.attr('id'))+' should be = '+$param.target;
                    else message = $stringEditor.translateParameter($param.source.attr('id'))+' should be ≠ '+$param.target;
                    if (noTooltips !== true){
                        $tooltipGenerator.showTooltip({
                            target: $param.source.attr('id'),
                            placement: 'top',
                            message: message
                        });
                        $param.source.trigger($param.action, [$param.value]);
                        returnValue = 'fail';
                    }
                }
            });
        }
        return returnValue;
    };
    // Check for collision //
    function collision(value,limit,range){
        var upper = limit + range;
        var lower = limit - range; 
        if ( (value > lower) && (value < upper) ) return true;
        else return false;
    };
    // Slider Mathematics //
    function sliderWidth(name){
        var width = jQuery('#'+name+'Slider').width();
        if (width > 0) return width;
        else return 187.578;
    };
    function sliderStepWidth(name){
        var range = jQuery('#'+name+'Slider').slider('option','max') - jQuery('#'+name+'Slider').slider('option','min');
        var numberOfSteps = (range / jQuery('#'+name+'Slider').slider('option','step')) + 1;
        return sliderWidth(name) / numberOfSteps;
    };
    function countSteps(step,value,min){
        var counter = 0;
        while(value > min) {
            value -= step;
            counter++;
        }
        return counter;
    };
    // Refresh slider bar and add collision area //
    function refreshStickyVisuals(){
        _.each(collisions, function($parameter,k){
            var steps = countSteps(jQuery('#'+k+'Slider').slider('option','step'),collisions[k],jQuery('#'+k+'Slider').slider('option','min'));
            var shift = steps*sliderStepWidth(k);
            jQuery('#'+k+'Shift').css('width',shift+'px');
        });
    };
    
    // Module Interface //
    latticeTab.prototype.setLatticeRestrictions = function(argument){
        setLatticeRestrictions(argument);  
    };
    // Update Auto-Refresh + Atom Addition State
    latticeTab.prototype.updateCondition = function(argument){
        _.each(argument, function($parameter, k){
             conditions[k] = $parameter;
        });
    };
    latticeTab.prototype.getConditions = function(){
        return conditions;
    };
    // Lock/Unlock Motif Padlock //
    latticeTab.prototype.setMotifPadlock = function(state){
        if (state === 'lock') {
            if ((html.lattice.padlocks.motif.children().hasClass('active'))) html.lattice.padlocks.motif.find('a').removeClass('active');
            lockMotifPadlock();
        }
        else if (state === 'unlock') {
            if (!(html.lattice.padlocks.motif.children().hasClass('active'))) html.lattice.padlocks.motif.find('a').addClass('active');
            unlockMotifPadlock();
        }
    };
    // Assign Values to Lattice Length/Angle/Repetition //
    latticeTab.prototype.setLatticeParameters = function(parameters){
        _.each(html.lattice.parameters, function($latticeParameter, k) {
            if (_.isUndefined(parameters[k]) === false) {
                var argument = {};
                var publish = {};
                publish[k] = parameters[k];
                argument[k] = {
                    value: parameters[k],
                    publish: publish
                };
                $setUIValue.setValue(argument);
                // Update Restore Table //
                LastLatticeParameters[k] = parameters[k];
            }
        }); 
    };
    // Disable input fields of Lattice Length/Angle/Repetition //
    latticeTab.prototype.disableLatticeParameters = function(parameters){
        _.each(html.lattice.parameters, function($parameter, k) {
            if (parameters[k] !== undefined) {
                var argument = {};
                argument[k] = {
                    value: parameters[k]   
                }
                disableUIElementModule.disableElement(argument);
            }
        });  
    };
    // Update Lattice Labels on the MOTIF tab //
    latticeTab.prototype.updateLatticeLabels = function(){
        _.each(html.motif.latticeLabels, function($parameter,k){
            var labelLength = parseFloat(html.lattice.parameters[k].val()).toFixed(3);
            var labelAngle = parseFloat(html.lattice.parameters[k].val()).toFixed(0);
            if ( (k !== 'alpha') && (k !== 'beta') && (k !== 'gamma') ) $parameter.text(labelLength+'Å'); 
            else $parameter.text(labelAngle+'°'); 
        });
    };
    // Insert Collision //
    latticeTab.prototype.stickySlider = function(argument){
        // Read state from argument //
        if (_.isUndefined(argument)) return false;
        else {
            _.each(argument, function($parameter,k){
                // Remove collision area + condition //
                if ($parameter === false) {
                    jQuery('#'+k+'Collision').css('background-color','white');
                    delete collisions[k];
                }
                // Paint collision area, add new condition //
                else {
                    collisions[k] = $parameter;
                    jQuery('#'+k+'Collision').css('background-color','#6f6299');
                }
            });
            refreshStickyVisuals();
        }
        return true;
    };
    // Update Sliders with collision conditions //
    latticeTab.prototype.refreshStickyVisuals = function(){
        refreshStickyVisuals();
    };
    // Clear Lattice Restrictions //
    latticeTab.prototype.removeRestrictions = function(){
        removeLatticeRestrictions();
        localRestrictions = undefined;  
    };
    // Clear Collisions //
    latticeTab.prototype.clearCollisions = function(){
        _.each(collisions, function($parameter,k){
            jQuery('#'+k+'Collision').css('background-color','white'); 
            delete collisions[k];
        });  
    };
    // Restore Padlocks //
    latticeTab.prototype.restorePadlocks = function(lattice, motif){
        
        /* 
            lattice === false --> LOCK
            lattice === true --> UNLOCK
            
            motif === false ---> LOCK
            motif === true ---> UNLOCK
        */
        // Grab HTML State //
 
        var latticeUnlocked = html.lattice.padlocks.lattice.children().hasClass('active');
        var motifUnlocked = html.lattice.padlocks.motif.children().hasClass('active');
        
        // LATTICE //
        if ( (lattice === false) && (latticeUnlocked === true)) {
            html.lattice.padlocks.lattice.find('a').button('toggle');
            html.lattice.padlocks.lattice.children().removeClass('active');
        }
        // Unlock when it is locked //
        else if ((lattice === true) && (latticeUnlocked === false)) {
            html.lattice.padlocks.lattice.find('a').button('toggle');
            html.lattice.padlocks.lattice.children().addClass('active');
        };
        
        // MOTIF //
        if ( (motif === false) && (motifUnlocked === true)) {
            html.lattice.padlocks.motif.find('a').button('toggle');
            html.lattice.padlocks.motif.children().removeClass('active');
        }
        // Unlock when it is locked //
        else if ((motif === true) && (motifUnlocked === false)) {
            html.lattice.padlocks.motif.find('a').button('toggle');
            html.lattice.padlocks.motif.children().addClass('active');
        };
        
        // LATTICE PARAMETERS //
        if (lattice === true) {
            removeLatticeRestrictions();
            $disableUIElement.disableElement({
                latticeParameters:{ value: false } 
            });   
        }
        else if (motif === false) {
            $disableUIElement.disableElement({
                latticeParameters:{ value: true } 
            });   
        }
    };
    
    return latticeTab;
});