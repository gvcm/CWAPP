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
{   /* This module handles the motif tab. It assign listeners for the user input, and maintains a list of all atoms that the user has added.
        - Motif Inputs Panel
        - Atom List
        - Atom Tangency Mechanics
            * An atom may connect to another as child, only if it has no other role (not a parent)
                * If the atom that it's connecting to, is already a child, then we upgrade this atom from child->child/parent.
                * Thus, a chain is created: new atom (child) -> connects to (child/parent [old child]) -> connects to its parent.
                * Case 1: 
                    atom1 connects atom2 ===> atom1->atom2 or child->parent
                * Case 2:
                    atom1 connects to atom2->atom3->atom4 ===> atom1->atom2->atom3->atom4 or child->child/parent->child/parent->parent 
            * An atom may disconnect from another atom, no matter what:
                * Case 1:
                    atom1->atom2->atom3->atom4 or child->child/parent->child/parent->parent
                    disconnect atom1
                    atom1 atom2->atom3->atom4 or  empty child->child/parent->parent
                * Case 2:
                    atom1->atom2->atom3->atom4 or child->child/parent->child/parent->parent
                    disconnect atom2
                    atom1 atom2 atom3->atom4 or  empty empty child->parent
                * Case 3:
                    atom1->atom2->atom3-atom4 or child->child/parent->child/parent->parent
                    disconnect atom3
                    atom1->atom2 atom3 atom4 or  child->parent empty empty
                * Case 4:
                    atom1->atom2->atom3->atom4 or child->child/parent->child/parent->parent
                    disconnect atom4
                    atom1->atom2->atom3 atom4 or  child->child/parent->parent empty
        - Collision Mechanics
    */
    // Variables //
    var collisions = {};
    var collisionTooltip = {
        cellVolume: false,
        atomPosX: false,
        atomPosY: false,
        atomPosZ: false
    };
    
    // Module References //
    var $messages = undefined;
    var $getUIValue = undefined;
    var $setUIValue = undefined;
    var $menuRibbon = undefined;
    var $tooltipGenerator = undefined;
    var $latticeTab = undefined;
    var $disableUIElement = undefined;
    var $stringEditor = undefined;
    var html = undefined;
    
    // Contructor //
    function motifTab(argument) {
         
        // Acquire Module References
        if (!(_.isUndefined(argument.messages))) $messages = argument.messages;
        else return false;
        if (!(_.isUndefined(argument.getUIValue))) $getUIValue = argument.getUIValue;
        else return false;
        if (!(_.isUndefined(argument.setUIValue))) $setUIValue = argument.setUIValue;
        else return false;
        if (!(_.isUndefined(argument.tooltipGenerator))) $tooltipGenerator = argument.tooltipGenerator;
        else return false;
        if (!(_.isUndefined(argument.disableUIElement))) $disableUIElement = argument.disableUIElement;
        else return false;
        if (!(_.isUndefined(argument.menuRibbon))) $menuRibbon = argument.menuRibbon;
        else return false;
        if (!(_.isUndefined(argument.latticeTab))) $latticeTab = argument.latticeTab;
        else return false;
        if (!(_.isUndefined(argument.stringEditor))) $stringEditor = argument.stringEditor;
        else return false;
        if (!(_.isUndefined(argument.html))) html = argument.html;
        else return false;
        
        // Input Handlers
        html.motif.panel.opacitySlider.slider({
            value: 10,
            min: 0,
            max: 10,
            step: 0.1,
            animate: true,
            slide: function(event, ui){
                $setUIValue.setValue({
                    atomOpacity:{
                        publish:{atomOpacity:ui.value}
                    }
                });
                html.motif.atomParameters.atomOpacity.val(ui.value);
            }
        });
        
        // Cell Volume //
        html.motif.other.cellVolumeSlider.slider({
            value: 100,
            min: 0,
            max: 400,
            step: 0.1,
            animate: true,
            slide: function(event, ui){
                var value = ui.value;
                // Pass Collistion Detection //
                if (!(_.isUndefined(collisions.cellVolume))){
                    // Check for collision //
                    if (collision(ui.value,collisions.cellVolume,2) === true){
                        // Make sure that the code below will run only once //
                        if (collisionTooltip.cellVolume === false){
                            $tooltipGenerator.addStaticTooltip({
                                'target': 'cellVolumeSlider',
                                'placement': 'top',
                                'message': $messages.getMessage(24)
                            });
                            collisionTooltip.cellVolume = true;
                            // Publish event //
                            var publish = {};
                            publish.cellVolume = collisions.cellVolume;
                            var argument = {};
                            argument.cellVolume = {publish: publish};
                            $setUIValue.setValue(argument);
                        }
                        // Freeze Input Field and Slider //
                        html.motif.other.cellVolume.val(collisions.cellVolume);
                        html.motif.other.cellVolumeSlider.slider('value',collisions.cellVolume);
                        // Exit Handler //
                        return false; 
                    } 
                }
                
                // Destroy tooltip since the collision test was successful //
                collisionTooltip.cellVolume = false;
                html.motif.other.cellVolumeSlider.tooltip('destroy');
                
                // Get Tangency State //
                var tangency = $getUIValue.getValue({tangency: {id:'tangency'}});
                if (tangency.tangency === true){
                    // With Tangency option active, the cell volume can't drop below 100.
                    if (value < 100) {
                        value = 100;
                        html.motif.other.cellVolume.val(value);
                        html.motif.other.cellVolumeSlider.slider('value',value);
                        $tooltipGenerator.showTooltip({
                            'target': 'cellVolumeSlider',
                            'placement': 'top',
                            'message': $messages.getMessage(22)
                        });
                        $setUIValue.setValue({
                            cellVolume:{
                                publish: {cellVolume:100}
                            }
                        });
                        return false;
                    }
                }
                
                // Publish value normally //
                $setUIValue.setValue({
                    cellVolume:{
                        publish: {cellVolume:value}
                    }
                });
                
                // Update Input Field //
                html.motif.other.cellVolume.val(value);
            },
            stop: function(){
                html.motif.other.cellVolumeSlider.tooltip('destroy');   
            }
        });
        html.motif.other.cellVolume.on('change', function() {
            console.log('asd');
            $setUIValue.setValue({
                cellVolume:{
                    value: html.motif.other.cellVolume.val(),
                    publish: {cellVolume:html.motif.other.cellVolume.val()}
                }
            });       
        });
        html.motif.other.cellVolume.val(100);
        
        // Motif Panel //
        html.motif.panel.tangentR.on('change', function() {
            $setUIValue.setValue({
                tangetR:{
                    publish: {tangentR:html.motif.panel.tangentR.val()}   
                }
            });
        });
        _.each(html.motif.atomParameters, function($parameter, k ) {
            $parameter.on('change', function() {
                
                // Get //
                var askValue = {};
                askValue[k] = {id:k};
 
                var publish = $getUIValue.getValue(askValue);
                
                // Set Value //
                var argument = {};
                argument[k] = { 
                    value: publish[k]
                }
                $setUIValue.setValue(argument);
                
                
                // Publish if everything ok
                var publish = $getUIValue.getValue(askValue);
                if (publish[k] !== false) {
                    var argument = {};
                    argument[k] = { 
                        publish: publish
                    }
                    $setUIValue.setValue(argument);
                }
            }); 
        });
        _.each(html.motif.motifInputs, function($parameter, k) {
            $parameter.on('change', function() {
                
                // Get //
                var askValue = {};
                askValue[k] = {id:k};
                var publish = $getUIValue.getValue(askValue);
                publish.trigger = 'textbox';
                
                // Set Value //
                var argument = {};
                argument[k] = { 
                    value: publish[k]
                }
                $setUIValue.setValue(argument);
               
                // Publish if everything ok
                var publish = $getUIValue.getValue(askValue);
                if (publish[k] !== false) {
                    var argument = {};
                    argument[k] = { 
                        publish: publish
                    }
                    $setUIValue.setValue(argument);
                }
            });
        });
        _.each(html.motif.motifSliders, function($parameter, k) {
            $parameter.slider({
                value: 0,
                min: -20.000,
                max: 10.000,
                step: 0.001,
                animate: true,
                slide: function(event, ui){
                    
                    // Pass Collistion Detection //
                    if (!(_.isUndefined(collisions[k]))){
                        // Check for collision //
                        if (collision(ui.value,collisions[k],0.1) === true){
                            // Make sure that the code below will run only once //
                            if (collisionTooltip[k] === false){
                                $tooltipGenerator.addStaticTooltip({
                                    'target': k+'Slider',
                                    'placement': 'top',
                                    'message': $messages.getMessage(24)
                                });
                                collisionTooltip[k] = true;
                                // Publish event only once //
                                var publish = {};
                                publish[k] = collisions[k];
                                var argument = {};
                                argument[k] = {publish: publish};
                                $setUIValue.setValue(argument);
                                motifInputs[k].val(ui.value);
                            }
                            // Freeze input field and slider value //
                            jQuery('#'+k).val(collisions[k]);
                            jQuery('#'+k+'Slider').slider('value',collisions[k]);
                            // Exit Handler //
                            return false; 
                        } 
                    }
                    
                    // Collision Passed //
                    var publish = {};
                    publish[k] = ui.value;
                    var argument = {};
                    argument[k] = {publish: publish};
                    $setUIValue.setValue(argument);
                    html.motif.motifInputs[k].val(ui.value);
                    
                    // Destroy collision tooltip and update input field //
                    collisionTooltip[k] = false;
                    jQuery('#'+k+'Slider').tooltip('destroy');
                    jQuery('#'+k).val(ui.value);
                },
                stop: function(){
                   jQuery('#'+k+'Slider').tooltip('destroy');    
                }
            });
        });
        _.each(html.motif.rotatingAngles.combo, function($parameter, k) {
            $parameter.on('change', function() {
                $setUIValue.setValue({
                    rotatingAngles:{
                        publish: {rotAnglePhi: html.motif.rotatingAngles.combo.rotAnglePhi.val(), rotAngleTheta: html.motif.rotatingAngles.combo.rotAngleTheta.val() }   
                    }
                });
            });
        });
        html.motif.panel.color.spectrum({
            color: "#000000",
            allowEmpty:true,
            chooseText: "Choose",
            cancelText: "Close",
            move: function(){
                $setUIValue.setValue({
                    atomColor:{
                        publish:{atomColor:html.motif.panel.color.spectrum('get').toHex()},
                        value: '#'+html.motif.panel.color.spectrum('get').toHex()
                    }
                });
            },
            change: function(){
                $setUIValue.setValue({
                    atomColor:{
                        publish:{atomColor:html.motif.panel.color.spectrum('get').toHex()},
                        value: '#'+html.motif.panel.color.spectrum('get').toHex()
                    }
                });
            }
        });
        
        html.motif.panel.tangency.on('click',function(){
            var value = undefined;
            if ( !(html.motif.panel.tangency.parent().hasClass('disabled')) ){
                (html.motif.panel.tangency.parent().hasClass('purpleThemeActive')) ? value = false : value = true;
                $setUIValue.setValue({
                    tangency:{
                        publish:{button:'tangency',tangency:value},
                        value:value
                    }
                });
                // if tangency was just turned on, update cell volume to 100 //
                if (value === true) {
                    $setUIValue.setValue({
                        cellVolume:{
                            value: 100,
                            publish: {cellVolume:100}
                        }
                    });
                }
            }
        });
        html.motif.actions.preview.on('click', function(){
            var value = undefined;
            if (!(html.motif.actions.preview.hasClass('disabled'))){
                $setUIValue.setValue({
                    previewAtomChanges:{
                        publish:{empty:0}
                    }
                });
            }
        });   
        html.motif.actions.save.on('click', function(){
            if (!(html.motif.actions.save.hasClass('disabled'))){
                var publish = {};
                publish = $getUIValue.getValue({
                    atomColor:{
                        id:'atomColor'   
                    },
                    atomOpacity:{
                        id:'atomOpacity'   
                    }
                });
                publish.button = 'saveChanges';
                $setUIValue.setValue({
                    saveAtomChanges:{
                        publish: publish
                    }
                });
            }
        });
        html.motif.actions.delete.on('click', function(){
            if (!(html.motif.actions.delete.hasClass('disabled'))){
                $setUIValue.setValue({
                    deleteAtom:{
                        publish: {'button':'deleteAtom'}
                    }
                });
            }
        });
        html.motif.panel.atomPositioningXYZ.on('click', function() {
            var value = undefined;
            if (!(html.motif.panel.atomPositioningXYZ.hasClass('disabled'))){ 
                (html.motif.panel.atomPositioningXYZ.hasClass('buttonPressed')) ? value = false : value = true;
                $setUIValue.setValue({
                    atomPositioningXYZ:{
                        publish: {abc:value},
                        value: value
                    }
                });
            }
        });
        html.motif.panel.atomPositioningABC.on('click', function() {
            var value = undefined;
            if (!(html.motif.panel.atomPositioningABC.hasClass('disabled'))){ 
                (html.motif.panel.atomPositioningABC.hasClass('buttonPressed')) ? value = false : value = true;
                $setUIValue.setValue({
                    atomPositioningABC:{
                        publish: {xyz:value},
                        value: value
                    }
                });
            }
        });
        html.motif.panel.atomPositioningAuto.on('click', function() {
            var value = undefined;
            if (!(html.motif.panel.atomPositioningAuto.hasClass('disabled'))){ 
                (html.motif.panel.atomPositioningAuto.hasClass('buttonPressed')) ? value = false : value = true;
                $setUIValue.setValue({
                    atomPositioningAuto:{
                        publish: {autoPos:value},
                        value: value
                    }
                });
            }
        });
        html.motif.other.atomTable.find('tbody').sortable({
            appendTo: document.body,
            axis: 'y',
            containment: "parent",
            cursor: "move",
            items: "> tr",
            tolerance: "pointer",
            cancel: 'td.atomButton, td.btn-tangent',
            update: function(e,ui){ 
                // Cancel update if atom has been assigned a role (parent) //
                if (jQuery(ui.item).attr('role') !== 'empty'){
                    html.motif.other.atomTable.find('tbody').sortable("cancel");
                }
                // Cancel update if atom has parent //
                else if (ui.item.prev('tr').length > 0){
                    if (ui.item.prev('tr').attr('role') === 'parent') html.motif.other.atomTable.find('tbody').sortable('cancel');
                    else if (ui.item.prev('tr').attr('role') === 'parentChild') html.motif.other.atomTable.find('tbody').sortable('cancel');
                }
            }
        });
        html.motif.other.lockCameras.click(function() { 
            var value = undefined;
            (html.motif.other.lockCameras.hasClass('active')) ? value = false : value = true;
            $setUIValue.setValue({
                lockCameras:{
                    publish: {'syncCameras':value},
                    value: value
                }
            });          
        });
        html.motif.other.motifVisibilityInUC.click(function() { 
            var value = undefined;
            (html.motif.other.motifVisibilityInUC.hasClass('active')) ? value = false : value = true;
            $setUIValue.setValue({
                motifVisibilityInUC:{
                    publish: {'toggleMotifVisibilityInUC':value},
                    value: value
                }
            });          
        });
        _.each(html.motif.latticeLabels, function($parameter, k){
            $parameter.parent().parent().on('click', function(){
                $menuRibbon.switchTab('latticeTab');
                var conditions = $latticeTab.getConditions();
                if (conditions.atomAdded !== false) $swapButton.trigger('click');
            });
        });
        html.motif.other.swapButton.on('click', function(){
            var value = undefined;
            var swap = undefined;
            (html.motif.other.swapButton.hasClass('motif')) ? value = false : value = true;
            (html.motif.other.swapButton.hasClass('motif')) ? swap = 'latticeTab' : swap = 'motifLI';
            $setUIValue.setValue({
                swapButton:{
                    publish:{swap:swap},
                    value:value
                }
            });
        });
        
        // Initiation //
        $disableUIElement.disableElement({
            atomTable:{
                value: true
            },
            atomOpacity:{
                value: true
            },
            atomOpacitySlider:{
                value: true
            },
            atomColor:{
                value: true
            },
            atomPosX:{
                value: true
            },
            atomPosY:{
                value: true
            },
            atomPosZ:{
                value: true
            },
            atomPosXSlider:{
                value: true
            },
            atomPosYSlider:{
                value: true
            },
            atomPosZSlider:{
                value: true
            },
            tangentR:{
                value: true
            },
            atomPositioningXYZ:{
                value: true
            },
            atomPositioningABC:{
                value: true
            },
            atomPositioningAuto:{
                value: true
            },
            saveAtomChanges:{
                value: true
            }
        });
        html.motif.other.atomTable.hide();
    };
    
    // Get Position of the atom in the parent/child chain //
    function getChainLevel(id){
        var level = 0;
        var tangent = html.motif.other.atomTable.find('#'+id).attr('tangentTo');
        if (tangent !== 'x'){
            level =  1 + getChainLevel(tangent);               
        }
        return level;
    };
    // Correlate two atoms with the relationship parent/child //
    function tangent(id,restore){
        var arg = {};
        var current = html.motif.other.atomTable.find('#'+id);
        var above = current.prev('tr');
        var parent = html.motif.other.atomTable.find('#'+current.attr('tangentTo'));
        //UNLINK
        if ( (current.find('.btn-tangent').hasClass('active')) && !(current.find('.btn-tangent').hasClass('blocked')) ) {

            // If atom is a child //
            if (current.attr('role') === 'child') {

                // Publish Event //
                arg["dragMode"]= false;
                arg["parentId"]= current.attr('tangentTo');
                if (restore === undefined) PubSub.publish('menu.drag_atom', arg);

                // Assign role empty and deactivate button //
                current.attr('role','empty');
                current.find('.btn-tangent').removeClass('active');

                // Remove role if only parent //
                if (parent.attr('role') === 'parent'){
                    parent.attr('role','empty');
                }
                // Assign child role again //
                else{
                    parent.attr('role','child');
                    parent.find('.btn-tangent').addClass('active');
                }

                // UNLINK and hide icon //
                current.attr('tangentTo','x');
                current.find('.chain').addClass('hiddenIcon');
                current.find('.element-serial').toggleClass('small');
            }
        }
        //LINK
        else if (!(current.find('.btn-tangent').hasClass('blocked'))) {
            if (current.attr('role') === 'empty') {
                // If there's an atom above //
                if (above.length !== 0 ) {

                    // If atom above isn't a parent //
                    if (above.attr('role') !== 'parent'){

                        // Make child and activate button //
                        current.attr('role','child');
                        current.find('.btn-tangent').addClass('active');

                        // Make atom above a parent or parentChild //
                        if (above.attr('role') === 'empty') above.attr('role','parent');
                        else above.attr('role','parentChild');

                        // Link Parent-Child and show icon //
                        current.attr('tangentTo',above.attr('id'));
                        current.find('.element-serial').toggleClass('small');
                        current.find('.chain').removeClass('hiddenIcon');
                        current.find('.chain').find('a').html(getChainLevel(id));

                        // Publish Event //
                        arg["dragMode"]= true;
                        arg["parentId"]= above.attr('id');
                        if (restore === undefined) PubSub.publish('menu.drag_atom', arg);
                    }
                }
            }
        }   
    };
    // Break Chain of Atoms //
    function breakChain(argument){
        var current = html.motif.other.atomTable.find('#'+argument['id']);
        var above = current.prev('tr');
        var below = current.next('tr');

        // Disconnecting Child //
        if (current.attr('role') === 'child'){
            if (above.attr('role') === 'parent') {
                above.attr('role','empty');
                above.find('.btn-tangent').attr('class','btn-tangent disabled blocked');
            }
            else above.attr('role','child');
        }
        // Disconnecting Parent //
        else if (current.attr('role') === 'parent'){
            if (below.attr('role') === 'child') below.attr('role','empty');
            else below.attr('role','parent');
            below.attr('tangentTo','x');
            below.find('.chain').addClass('hiddenIcon');
            below.find('.element-serial').removeClass('small');
            below.find('.btn-tangent').attr('class','btn-tangent disabled blocked');
        }
        // Disconnecting child/parent //
        else if (current.attr('role') === 'parentChild'){
            if (above.attr('role') === 'parent') {
                above.attr('role','empty');
                above.attr('tangentTo','x');
                above.find('.chain').addClass('hiddenIcon');
                above.find('.element-serial').removeClass('small');
                above.find('.btn-tangent').attr('class','btn-tangent disabled blocked');
            }
            else above.attr('role','child');
            if (below.attr('role') === 'child') below.attr('role','empty');
            else below.attr('role','parent');
            below.attr('tangentTo','x');
            below.find('.chain').addClass('hiddenIcon');
            below.find('.element-serial').removeClass('small');
            below.find('.btn-tangent').attr('class','btn-tangent disabled blocked');
        }

        // Update atom list //
        if (argument['remove'] === true) current.remove();
        else{
            current.attr('role','empty');
            current.find('.chain').addClass('hiddenIcon');
            current.find('.element-serial').removeClass('small');
            current.find('.btn-tangent').attr('class','btn-tangent');
            current.attr('tangentTo','x');
            if (above.attr('tangentTo') !== 'x') tangent(current.attr('id'));
            else current.find('.btn-tangent').addClass('blocked');
        }
        // Update Chain Numbers///
        jQuery('#tableAtom tbody tr').each(function(){
            jQuery(this).find('.chain').find('a').html(getChainLevel(jQuery(this).attr('id')));
        });
    };
    // Check for Collision //
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
        else return 122.906;
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
    // Update Sliders with collision conditions //
    function refreshStickyVisuals(){
        _.each(collisions, function($parameter,k){
            var steps = countSteps(jQuery('#'+k+'Slider').slider('option','step'),collisions[k],jQuery('#'+k+'Slider').slider('option','min'));
            var shift = steps*sliderStepWidth(k);
            shift -=5;
            jQuery('#'+k+'Shift').css('width',shift+'px');
        });
    };
    // Table to Object //
    function tableToObject(){
        var result = {};
        _.each(html.motif.other.atomTable.find('tr'), function(entry,k){
            var current = jQuery(entry);
            result[current.attr('id')] = {
                role: current.attr('role'),
                tangentTo: current.attr('tangentto'),
                visibility: current.find('.visibility').hasClass('visible'),
                chain: !(current.find('.chain').hasClass('hiddenIcon')),
                level: current.find('#level').html(),
                element: current.find('.element').attr('element'),
                sup: current.find('.element sup').html(),
                atomPos: current.find('.element-serial a').html().replace(/"/g, "'")
            };
        });
        return result;
    };
    
    // Module Interface //
    
    // Add, Save, Delete atoms from the Table //
    motifTab.prototype.editAtom = function(argument){
        var constructor = {};
        constructor.eyeButton = '';
        constructor.visible = '';
        constructor.elementCode = '';
        constructor.elementName = '';
        constructor.atomPos = '';
        constructor.small = '';
        constructor.role = 'empty';
        constructor.chain = 'hiddenIcon chain';
        constructor.tangentTo = 'x';
        constructor.btnState = 'btn-tangent blocked';
        constructor.current = html.motif.other.atomTable.find('#'+argument['id']);
        constructor.level = '';

        // Update construct object from argument //
        _.each(argument, function($parameter, k){
            switch(k){
                case 'visible':
                    if ($parameter === true) { constructor.visible = 'visible'; constructor.eyeButton = constructor.visible; }
                    else { constructor.visible = ''; constructor.eyeButton = 'hidden'; }   
                    break;
                case 'elementCode':
                    constructor.elementCode = $parameter;
                    break;
                case 'elementName':
                    constructor.elementName = $parameter;
                    break;
                case 'ionicIndex':
                    if ($parameter !== '0' && $parameter !== '3b' && $parameter !== 'undefined') constructor.elementName = '<span style="font-size:13px;">'+constructor.elementName+'<sup>'+argument['ionicIndex']+'</sup></span>';
                    break;
                case 'atomPos':
                    constructor.atomPos = $parameter;
                    break;
            }
        });

        // Update atom entry properties //
        if (argument['action']==='edit') {
            // Role
            constructor.role = constructor.current.attr('role');
            constructor.tangentTo = constructor.current.attr('tangentTo');
            // Element serial size
            if (constructor.role === 'child') constructor.small = 'small';
            else if (constructor.role === 'parentChild') constructor.small = 'small';
            // Chain
            constructor.chain = constructor.current.find('.chain').attr('class');
            constructor.level = getChainLevel(argument['id']);
            //Color
            constructor.btnState = constructor.current.find('.btn-tangent').attr('class');
        }

        
        // Beautify Atom Position
        constructor.atomPos = constructor.atomPos.split('&'); 
        
        
        // Construct HTML Query //
        var HTMLQuery = '<tr id="'+argument['id']+'" role="'+constructor.role+'" tangentTo="'+constructor.tangentTo+'" class="bg-light-gray"><td class="visibility atomButton '+constructor.visible+'"><a><img src="Images/'+constructor.eyeButton+'-icon-sm.png" class="img-responsive" alt=""/></a></td"><td class="hiddenIcon blank"></td><td class="'+constructor.chain+'"><a id="level">'+constructor.level+'</a><img src="Images/chain-icon.png" class="img-responsive" alt=""/></td><td element="'+constructor.elementCode+'" class="element ch-'+constructor.elementCode+'">'+constructor.elementName+'</td><td  class="element-serial '+constructor.small+' selectable"><a>'+'<b><span id=\'bfont\'>(</span>'+constructor.atomPos[0]+'<span id=\'bfont\'>)</span></b><br>'+'<span id=\'sfont\'>['+constructor.atomPos[1]+'] <span id=\'xsfon\'>&Aring;</span></span>'+'</a></td><td class="'+constructor.btnState+'"><a href="#"><img src="Images/tangent-icon.png" class="img-responsive" alt=""/></a></td></tr>';

        // Add, Remove, Edit Entry
        switch(argument['action']){
            case 'save':
                html.motif.other.atomTable.find('tbody').append(HTMLQuery);
                break;  

            case 'edit':
                constructor.current.replaceWith(HTMLQuery);
                setTimeout(function(){
                    constructor.current.find('.element').attr('class','element').css('background',argument['atomColor']);
                },300);
                break;

            case 'delete':
                constructor.current.remove();
                break;

        }
        
        // Update Current Selection //
        constructor.current = html.motif.other.atomTable.find('#'+argument['id']);
        
        // Handlers //
        if ( (argument['action']==='save') || (argument['action']==='edit') ){
            
            // Tooltips //
            $tooltipGenerator.addOnHoverTooltip({
                other: constructor.current.find('.atomButton'),
                message: $messages.getMessage('atomVisibility'),
                placement: 'top'
            });
            
            $tooltipGenerator.addOnHoverTooltip({
                other: constructor.current.find('.btn-tangent'),
                message: $messages.getMessage('atomTangent'),
                placement: 'top'
            });
            
            // Tangent //
            constructor.current.find('.btn-tangent').on('click', function(){
                tangent(argument['id']);
            });
            // Select Entry //
            constructor.current.find('.selectable').on('click',function(){
                $setUIValue.setValue({
                    selectAtom:{
                        publish: argument['id']
                    }
                });
            });
            // Atom Visibility //
            constructor.current.find('.atomButton').on('click', function(){
                var value = undefined;
                (constructor.current.find('.atomButton').hasClass('visible')) ? value = false : value = true;
                $setUIValue.setValue({
                    atomVisibility:{
                        value: value,
                        publish: {id:argument['id'],visible:value},
                        other: constructor.current
                    }
                });
            });
        }
        
        // Show table if there are entries //
        if (html.motif.other.atomTable.find('tr').length > 0) html.motif.other.atomTable.css('display','block');
        else {
            html.motif.other.atomTable.css('display','none');
            html.motif.other.atomTable.find('tbody').sortable('disable');
        }  
    };
    // Highlight Table Entry (Purple) //
    motifTab.prototype.highlightAtomEntry = function(argument){
        if (argument['color'] === 'bg-light-purple') {
            html.motif.other.atomTable.find('#'+argument['id']).find('.btn-tangent').removeClass('blocked');
            html.motif.other.atomTable.find('#'+argument['id']).find('.btn-tangent').removeClass('disabled');
        }
        else if (html.motif.other.atomTable.find('#'+argument['id']).find('.btn-tangent').hasClass('active')){
            html.motif.other.atomTable.find('#'+argument['id']).find('.btn-tangent').addClass('blocked');
        }
        else {
            html.motif.other.atomTable.find('#'+argument['id']).find('.btn-tangent').addClass('disabled');
            html.motif.other.atomTable.find('#'+argument['id']).find('.btn-tangent').addClass('blocked');
        }
        html.motif.other.atomTable.find('#'+argument['id']).removeAttr('class');
        html.motif.other.atomTable.find('#'+argument['id']).attr('class',argument['color']);   
    };
    // Enable/Disable/Block etc tangent option on a table entry //
    motifTab.prototype.btnTangentState = function(argument){
        var current = html.motif.other.atomTable.find('#'+argument['id']).find('.btn-tangent');
        switch(argument['state']){
            case 'reset':
                current.attr('class','btn-tangent');
                break;
            case 'activate':
                current.attr('class','btn-tangent active');
                break;
            case 'block':
                current.addClass('blocked');
                break;
            case 'unblock':
                current.removeClass('blocked');
                break;
            case 'disable':
                current.attr('class','btn-tangent disabled');
                break;
        }  
    };
    // Hide/Show Table Entry //
    motifTab.prototype.setAtomEntryVisibility = function(argument){
        $disableUIElement.disableElement({
            entryVisibility:{
                value: argument.action,
                other: html.motif.other.atomTable.find('#'+argument['id']).find('.atomButton')
            }
        });
    };
    motifTab.prototype.breakChain = function(argument){
         breakChain(argument); 
    };
    motifTab.prototype.getChainLevel = function(id){
        return getChainLevel(id);  
    };
    // Add/Remove collision condition //
    motifTab.prototype.stickySlider = function(argument){
        // Read state from argument //
        if (_.isUndefined(argument)) return false;
        else {
            _.each(argument, function($parameter,k){
                // Remove from list //
                if ($parameter === false) {
                    delete collisions[k];
                    jQuery('#'+k+'Collision').css('background-color','white');
                }
                // Add to list //
                else {
                    collisions[k] = $parameter;
                    jQuery('#'+k+'Collision').css('background-color','#6f6299');
                }
            });
            refreshStickyVisuals();
        }
        return true;
    };
    // Update Slider Collision Visuals //
    motifTab.prototype.refreshStickyVisuals = function(){
        refreshStickyVisuals();
    };
    // Clear Collision //
    motifTab.prototype.clearCollisions = function(){
        _.each(collisions, function($parameter,k){
            jQuery('#'+k+'Collision').css('background-color','white'); 
            delete collisions[k];
        });  
    };
    // Clear Atom Table //
    motifTab.prototype.resetTable = function(){
        html.motif.other.atomTable.find('tbody').html('');
    };
    // Save Atom Table as an object //
    motifTab.prototype.tableToObject = function(){
        return tableToObject();
    };
    // Restore Atom List //
    motifTab.prototype.restoreTable = function(data){
        var _this = this;
        _.each(data, function(entry,id){
            // Add Table Entry //
            _this.editAtom({
                id: id,
                action: 'save',
                visible: entry.visibility,
                elementCode: entry.element,
                elementName: $stringEditor.capitalizeFirstLetter(entry.element),
                ionicIndex: entry.sup,
                atomPos: entry.atomPos
            });
            // Highlight entry //
            _this.highlightAtomEntry({
                id: id,
                color: 'bg-light-purple'
            });
            // Make atom tangent to the above //
            if (entry.tangentTo !== 'x') tangent(id,true);
            // De-highlight entry //
            _this.highlightAtomEntry({
                id: id,
                color: 'bg-light-gray'
            });
        });
    };
    
    return motifTab;
});