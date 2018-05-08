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
    /* This modules handles the planes and directions tab. It includes:
            - User Input Management
                - miller inputs
                - color
                - radius
                - opacity
            - Table Management
                - Add
                - Edit
                - Delete
                - Hide/Show
    */
    
    // Module References //
    var $getUIValue = undefined;
    var $tooltipGenerator = undefined;
    var $disableUIElement = undefined;
    var $setUIValue = undefined;
    var $messages = undefined;
    var html = undefined;
    var millers = {
        millerH : 0,  
        millerK : 0,  
        millerL : 0,  
        millerI : 0,  
        millerU : 0,  
        millerV : 0,  
        millerW : 0,  
        millerT : 0  
    };
    
    // Contructor //
    function pndTab(argument) {
        // Acquire Module References //
        if (!(_.isUndefined(argument.getUIValue))) $getUIValue = argument.getUIValue;
        else return false;
        if (!(_.isUndefined(argument.disableUIElement))) $disableUIElement = argument.disableUIElement;
        else return false;
        if (!(_.isUndefined(argument.tooltipGenerator))) $tooltipGenerator = argument.tooltipGenerator;
        else return false;
        if (!(_.isUndefined(argument.messages))) $messages = argument.messages;
        else return false;
        if (!(_.isUndefined(argument.html))) html = argument.html;
        else return false;
        
        $setUIValue = argument.setUIValue;
        
        // Hide extra miller parameters and tables
        
        html.pnd.other.hexICoord.hide('slow');
        html.pnd.other.hexICoord.hide('slow');
        html.pnd.tables.planes.hide('slow');
        html.pnd.tables.directions.hide('slow');
         
        // Inputs //
        _.each(html.pnd.planeParameters, function($parameter, k) {
            // Construct Color Picker //
            if (k === 'planeColor'){
                $parameter.spectrum({
                    color: "#000000",
                    allowEmpty:true,
                    chooseText: "Choose",
                    cancelText: "Close",
                    move: function(){
                        $setUIValue.setValue({
                            planeColor:{
                                publish:{planeColor: $parameter.spectrum('get').toHex()},
                                value: '#'+$parameter.spectrum('get').toHex()
                            }
                        });
                    },
                    change: function(){
                        $setUIValue.setValue({
                            planeColor:{
                                publish:{planeColor: $parameter.spectrum('get').toHex()},
                                value: '#'+$parameter.spectrum('get').toHex()
                            }
                        });
                    }
                });
            }
            else {
                if (k === 'planeOpacity'){
                    $parameter.html('<option>0</option><option>2</option><option>4</option><option>6</option><option>8</option><option>10</option>');
                    $parameter.selectpicker();
                    $parameter.selectpicker('val','6');
                }
                // Change Handlers //
                $parameter.on('change', function() {
                    // Disable Interception //
                    if (k!== 'planeName') html.pnd.tables.planes.find('.bg-light-purple').find('.interception').removeClass('active');
                    
                    // Publish Value
                    var publish = {};
                    publish = parallelInterception(publish);
                    publish[k] = $parameter.val();
                    var argument = {};
                    argument[k] = {
                        value: $parameter.val(),
                        publish: publish
                    };
                    $setUIValue.setValue(argument);
                });
                $parameter.on('keyup',function() {
                    if (millers[k] !== undefined) {
                        if (isInt($parameter.val())) millers[k] = parseInt($parameter.val());
                    }
                    html.pnd.planeParameters.millerI.val(-(millers.millerH+millers.millerK)); 
                });
            }
        }); 
        _.each(html.pnd.directionParameters, function($parameter, k) {
            // Construct Color Picker //
            if (k === 'directionColor'){
                $parameter.spectrum({
                    color: "#000000",
                    allowEmpty:true,
                    chooseText: "Choose",
                    cancelText: "Close",
                    move: function(){
                        $setUIValue.setValue({
                            directionColor:{
                                publish:{directionColor: $parameter.spectrum('get').toHex()},
                                value: '#'+$parameter.spectrum('get').toHex()
                            }
                        });
                    },
                    change: function(){
                        $setUIValue.setValue({
                            directionColor:{
                                publish:{directionColor: $parameter.spectrum('get').toHex()},
                                value: '#'+$parameter.spectrum('get').toHex()
                            }
                        });
                    }
                });
            }
            else{
                if (k === 'dirRadius'){
                    $parameter.html('<option>10</option><option>20</option><option>40</option><option>60</option><option>80</option><option>100</option>');
                    $parameter.selectpicker(); 
                    $parameter.selectpicker('val',10);
                }
                // Change Handlers //
                $parameter.on('change', function() {
                    // Publish Value
                    var publish = {};
                    publish[k] = $parameter.val();
                    var argument = {};
                    argument[k] = {
                        value: $parameter.val(),
                        publish: publish
                    }
                    $setUIValue.setValue(argument);
                });
                $parameter.on('keyup',function() {
                    if (millers[k] !== undefined) {
                        if (isInt($parameter.val())) millers[k] = parseInt($parameter.val());
                    }
                    html.pnd.directionParameters.millerT.val(-(millers.millerU+millers.millerV)); 
                });
            }
        });
        
        // Disable Inputs //
        $disableUIElement.disableElement({
            planeName:{
                value: true
            },
            planeOpacity:{
                value: true
            },
            planeColor:{
                value: true
            },
            millerH:{
                value: true
            },
            millerK:{
                value: true
            },
            millerL:{
                value: true
            },
            millerI:{
                value: true
            },
            directionName:{
                value: true
            },
            directionColor:{
                value: true
            },
            dirRadius:{
                value: true
            },
            millerU:{
                value: true
            },
            millerV:{
                value: true
            },
            millerW:{
                value: true
            },
            millerT:{
                value: true
            }
        });
        
        // Button Handlers //
        _.each(html.pnd.planeButtons, function($parameter, k ) {
            $parameter.on('click', function(){
                if (!($parameter.hasClass('disabled'))){
                    // Construct publish object //
                    var publish = $getUIValue.getValue({
                        planeColor: {
                            id: 'planeColor'  
                        },
                        planeName: {
                            id: 'planeName'  
                        },
                        planeOpacity: {
                            id: 'planeOpacity'  
                        },
                        millerH: {
                            id: 'millerH'  
                        },
                        millerK: {
                            id: 'millerK'  
                        },
                        millerL: {
                            id: 'millerL'  
                        },
                        millerI: {
                            id: 'millerI'  
                        }
                    })
                    publish = parallelInterception(publish);
                    publish.button = k;
                    PubSub.publish('menu.miller_plane_submit', publish);
                }
            });
        });
        _.each(html.pnd.directionButtons, function($parameter, k ) {
            $parameter.on('click', function(){
                if (!($parameter.hasClass('disabled'))){
                    // Construct publish object //
                    var publish = $getUIValue.getValue({
                        directionColor: {
                            id: 'directionColor'  
                        },
                        directionName: {
                            id: 'directionName'  
                        },
                        dirRadius: {
                            id: 'dirRadius'  
                        },
                        millerU: {
                            id: 'millerU'  
                        },
                        millerV: {
                            id: 'millerV'  
                        },
                        millerW: {
                            id: 'millerW'  
                        },
                        millerT: {
                            id: 'millerT'  
                        }
                    })
                    publish.button = k;
                    PubSub.publish('menu.miller_directional_submit', publish);
                }
            });
        });
    };
    // Check if Parallel and interception buttons are active //
    function parallelInterception(argument){
        if (html.pnd.tables.planes.find('.bg-light-purple').find('.parallel').hasClass('active')) argument.parallel = true;
        else argument.parallel = false;
        if (html.pnd.tables.planes.find('.bg-light-purple').find('.interception').hasClass('active')) argument.interception = true;
        else argument.interception = false;  
        return argument;
    };
    function isInt(value){
        if (isNaN(value)) {
            return false;
        }
        var x = parseFloat(value);
        return (x | 0) === x;
    };
            
    // Module Interface //
    // Show Hide Extra Miller Parameters //
    pndTab.prototype.toggleExtraParameter = function(choice,action){ 
        if ( (choice === 'i') && (action === 'block') ) html.pnd.other.hexICoord.show('fast');
        else if ( (choice === 'i')) html.pnd.other.hexICoord.hide('fast');
        else if ( (choice === 't') && (action === 'block') ) html.pnd.other.hexTCoord.show('fast');
        else html.pnd.other.hexTCoord.hide('fast');
        // Match Height //
        setTimeout(function(){$.fn.matchHeight._update();},500);
    };
    // Activate Paraller/Interception in a plane entry //
    pndTab.prototype.editPlaneToggles = function(argument){
        if (!(_.isUndefined(argument.parallel))){
            if (argument.parallel === true) html.pnd.tables.planes.find('#'+argument.id).find('.parallel').addClass('active');
            else html.pnd.tables.planes.find('#'+argument.id).find('.parallel').removeClass('active');
        }
        if (!(_.isUndefined(argument.interception))){
            if (argument.interception === true) html.pnd.tables.planes.find('#'+argument.id).find('.interception').addClass('active');
            else html.pnd.tables.planes.find('#'+argument.id).find('.interception').removeClass('active');
        }
    };
    // Show/Hide all planes //
    pndTab.prototype.hidePlanes = function(state){
        if (state === true){
            html.pnd.tables.planes.find('.planeButton').find('img').attr('src','Images/hidden-icon-sm.png');
            PubSub.publish('menu.planes_toggle', {'planeToggle':state});
        }
        else {
            html.pnd.tables.planes.find('.planeButton').find('img').attr('src','Images/visible-icon-sm.png');
            PubSub.publish('menu.planes_toggle', {'planeToggle':state});
        }
    };
    // Show/Hide all directions //
    pndTab.prototype.hideDirections = function(state){
        if (state === true){
            html.pnd.tables.directions.find('.directionButton').find('img').attr('src','Images/hidden-icon-sm.png');
            PubSub.publish('menu.directions_toggle', {'directionToggle':state});
        }
        else {
            html.pnd.tables.directions.find('.directionButton').find('img').attr('src','Images/visible-icon-sm.png');
            PubSub.publish('menu.directions_toggle', {'directionToggle':state});
        }
    };
    // Highlight table entries //
    pndTab.prototype.highlightPlaneEntry = function(argument){
        html.pnd.tables.planes.find('#'+argument['id']).removeAttr('class');
        html.pnd.tables.planes.find('#'+argument['id']).attr('class',argument['color']);  
    };
    pndTab.prototype.highlightDirectionEntry = function(argument){
        html.pnd.tables.directions.find('#'+argument['id']).removeAttr('class');
        html.pnd.tables.directions.find('#'+argument['id']).attr('class',argument['color']);  
    };
    // Add/Save/Delete on tables //
    pndTab.prototype.editPlane = function(argument){
        var parameters;
        // Parameters [,,,,] //
        if ( argument['i'] === undefined ) parameters = '('+argument['h']+','+argument['k']+','+argument['l']+')';
        else parameters = '('+argument['h']+','+argument['k']+','+argument['l']+','+argument['i']+')';
        
        // Buttons //
        if (!(_.isUndefined(argument.parallel))) (argument.parallel) ? argument.parallel = 'active' : argument.parallel = '';
        if (!(_.isUndefined(argument.interception))) (argument.interception) ? argument.interception = 'active' : argument.interception = '';
        
        // Add,Edit,Remove Entry //
        switch(argument['action']){
            case 'save':
                html.pnd.tables.planes.find('tbody').append('<tr id="'+argument['id']+'" class="bg-dark-gray"><td class="visibility vis"><a class="planeButton visible"><img src="Images/visible-icon-sm.png" class="img-responsive" alt=""/></a></td><td class="selectable pnd-serial">'+parameters+'</td><td class="selectable pnd-name">'+argument['name']+'</td><td class="selectable pnd-color"><div class="color-picker color-picker-sm theme-02 bg-purple"><div class="color"></div></div></td><td class="visibility"><a class="parallel"><img src="Images/planes.png" class="img-responsive" alt=""/></a></td><td class="visibility"><a class="interception"><img src="Images/atomIcon.png" class="img-responsive" alt=""/></a></td></tr>');
                html.pnd.tables.planes.find('#'+argument['id']).find('.color').css('background',argument['color']);
                break;  

            case 'edit':
                html.pnd.tables.planes.find('#'+argument['oldId']).replaceWith('<tr id="'+argument['id']+'" class="bg-dark-gray"><td class="visibility vis"><a class="planeButton visible"><img src="Images/visible-icon-sm.png" class="img-responsive" alt=""/></a></td><td class="selectable pnd-serial">'+parameters+'</td><td class="selectable pnd-name">'+argument['name']+'</td><td class="selectable pnd-color"><div class="color-picker color-picker-sm theme-02 bg-purple"><div class="color"></div></div></td><td class="visibility"><a class="parallel '+argument['parallel']+'"><img src="Images/planes.png" class="img-responsive" alt=""/></a></td><td class="visibility"><a class="interception '+argument['interception']+'"><img src="Images/atomIcon.png" class="img-responsive" alt=""/></a></td></tr>');
                html.pnd.tables.planes.find('#'+argument['id']).find('.color').css('background',argument['color']);
                break;

            case 'delete':
                html.pnd.tables.planes.find('#'+argument['oldId']).remove();
                break;
        }
        
        // Handlers //
        if ( (argument['action']==='save') | (argument['action']==='edit') ){
            
            // Tooltips //
            $tooltipGenerator.addOnHoverTooltip({
                other: html.pnd.tables.planes.find('#'+argument.id).find('.vis'),
                message: $messages.getMessage('planeVisibility'),
                placement: 'top'
            });
            $tooltipGenerator.addOnHoverTooltip({
                other: html.pnd.tables.planes.find('#'+argument.id).find('.parallel'),
                message: $messages.getMessage('planeParallel'),
                placement: 'top'
            });
            $tooltipGenerator.addOnHoverTooltip({
                other: html.pnd.tables.planes.find('#'+argument.id).find('.interception'),
                message: $messages.getMessage('planeInterception'),
                placement: 'top'
            });
            
            // Select Entry //
            html.pnd.tables.planes.find('#'+argument['id']).find('.selectable').on('click',function(){
                $setUIValue.setValue({
                    selectPlane:{
                        publish: argument['id']   
                    }
                });
            });
            
            // Toggle Visibility //
            html.pnd.tables.planes.find('#'+argument['id']).find('.planeButton').on('click', function(){
                var value = undefined;
                (html.pnd.tables.planes.find('#'+argument['id']).find('.planeButton').hasClass('visible')) ? value = false : value = true;
                $setUIValue.setValue({
                    planeVisibility:{
                        value: value,
                        publish: {id:argument['id'], visible: value},
                        other: html.pnd.tables.planes.find('#'+argument['id'])
                    }
                });
            });
            
            // Parallel Planes //
            html.pnd.tables.planes.find('#'+argument['id']).find('.parallel').on('click', function(){
                var value = undefined;
                (html.pnd.tables.planes.find('#'+argument['id']).find('.parallel').hasClass('active')) ? value = false : value = true;
                $setUIValue.setValue({
                    planeParallel:{
                        value: value,
                        publish: {id:argument['id'], parallel: value},
                        other: html.pnd.tables.planes.find('#'+argument['id'])
                    }
                });
            });
            
            // Atom Interception //
            html.pnd.tables.planes.find('#'+argument['id']).find('.interception').on('click', function(){
                var value = undefined;
                (html.pnd.tables.planes.find('#'+argument['id']).find('.interception').hasClass('active')) ? value = false : value = true;
                $setUIValue.setValue({
                    planeInterception:{
                        value: value,
                        publish: {id:argument['id'], interception: value},
                        other: html.pnd.tables.planes.find('#'+argument['id'])
                    }
                });
            });
        }

        // Show Table if there are entries //
        if (html.pnd.tables.planes.find('tr').length > 0) html.pnd.tables.planes.show('slow');
        else html.pnd.tables.planes.hide('slow');  
    };
    pndTab.prototype.editDirection = function(argument){
        var parameters;
        
        // Parameters [,,,,] //
        if ( argument['t'] === undefined ) parameters = '['+argument['u']+','+argument['v']+','+argument['w']+']';
        else parameters = '['+argument['u']+','+argument['v']+','+argument['w']+','+argument['t']+']';
        
        // Add,Edit,Remove Entry //
        switch(argument['action']){
            case 'save':
                html.pnd.tables.directions.find('tbody').append('<tr id="'+ argument['id']+'" class="bg-dark-gray"><td class="visibility"><a class="directionButton visible"><img src="Images/visible-icon-sm.png" class="img-responsive" alt=""/></a></td><td class="selectable pnd-serial">'+parameters+'</td><td class="selectable pnd-name">'+argument['name']+'</td><td class="selectable pnd-color"><div class="color-picker color-picker-sm theme-02 bg-purple"><div class="color"></div></div></td></tr>');
                html.pnd.tables.directions.find('#'+argument['id']).find('.color').css('background',argument['color']);
                break;  

            case 'edit':
                html.pnd.tables.directions.find('#'+argument['oldId']).replaceWith('<tr id="'+argument['id']+'" class="bg-dark-gray"><td class="visibility"><a class="directionButton visible"><img src="Images/visible-icon-sm.png" class="img-responsive" alt=""/></a></td><td class="selectable pnd-serial">'+parameters+'</td><td class="selectable pnd-name">'+argument['name']+'</td><td class="selectable pnd-color"><div class="color-picker color-picker-sm theme-02 bg-purple"><div class="color"></div></div></td></tr>');
                html.pnd.tables.directions.find('#'+argument['id']).find('.color').css('background',argument['color']);
                break;

            case 'delete':
                html.pnd.tables.directions.find('#'+argument['oldId']).remove();
                break;

        }
        
        // Handlers //
        if ( (argument['action']==='save') | (argument['action']==='edit') ){
            
            // Tooltip //
            $tooltipGenerator.addOnHoverTooltip({
                other: html.pnd.tables.directions.find('#'+argument.id).find('.directionButton'),
                message: $messages.getMessage('directionVisibility'),
                placement: 'top'
            });
            
            // Select Entry //
            html.pnd.tables.directions.find('#'+argument['id']).find('.selectable').on('click',function(){
                $setUIValue.setValue({
                    selectDirection:{
                        publish: argument['id']   
                    }
                });
            });
            
            // Toggle Visibility //
            html.pnd.tables.directions.find('#'+argument['id']).find('.directionButton').on('click', function(){
                var value = undefined;
                (html.pnd.tables.directions.find('#'+argument['id']).find('.directionButton').hasClass('visible')) ? value = false : value = true;
                $setUIValue.setValue({
                    directionVisibility:{
                        value: value,
                        publish: {id:argument['id'], visible: value},
                        other: html.pnd.tables.directions.find('#'+argument['id'])
                    }
                });
            });
        }

        // Show Table if there are entries //
        if (html.pnd.tables.directions.find('tr').length > 0) html.pnd.tables.directions.show('slow');
        else html.pnd.tables.directions.hide('slow'); 
    };
    // Toggle Visibility //
    pndTab.prototype.setPlaneEntryVisibility = function(argument){
        $disableUIElement.disableElement({
            entryVisibity:{
                value: argument.action,
                other: html.pnd.tables.planes.find('#'+argument['id']).find('.planeButton')
            }
        });
    };
    pndTab.prototype.setDirectionEntryVisibility = function(argument){
        $disableUIElement.disableElement({
            entryVisibity:{
                value: argument.action,
                other: html.pnd.tables.directions.find('#'+argument['id']).find('.directionButton')
            }
        });
    };
    // Clear Table //
    pndTab.prototype.resetTable = function(table){
        if (table === 'planesTable') html.pnd.tables.planes.find('tbody').html('');
        else html.pnd.tables.directions.find('tbody').html('');
    };
    
    return pndTab;
});