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
    /* This tabs takes care of the Menu Ribbon, which includes: 
    
        - Toggle Buttons
        - Tab buttons
        - Tab accessibility
    
    */
    var value = undefined;
    
    // Module References
    var $messageList = undefined;
    var $interfaceResizer = undefined;
    var $tooltipGenerator = undefined;
    var $latticeTab = undefined;
    var $setUI = undefined;
    var $userDialog = undefined;
    var html = undefined;

    // Check if swap button should be visible //
    var swapState = false; 
    
    // Contructor //
    function menuRibbon(argument) {
        
        // Acquire module references
        if (!(_.isUndefined(argument.messages))) $messageList = argument.messages;
        else return false;
        if (!(_.isUndefined(argument.interfaceResizer))) $interfaceResizer = argument.interfaceResizer;
        else return false;
        if (!(_.isUndefined(argument.tooltipGenerator))) $tooltipGenerator = argument.tooltipGenerator;
        else return false;
        if (!(_.isUndefined(argument.userDialog))) $userDialog = argument.userDialog;
        else return false;
        if (!(_.isUndefined(argument.setUIValue))) $setUI = argument.setUIValue;
        else return false;
        if (!(_.isUndefined(argument.latticeTab))) $latticeTab = argument.latticeTab;
        else return false;
        if (!(_.isUndefined(argument.html))) html = argument.html;
        else return false;
        
        // Assign Tab handlers //
        html.menu.tabs.latticeTab.on('click', function(event){
            // Stop Action //
            if (html.menu.tabs.latticeTab.hasClass('disabled')){
                event.preventDefault();
                event.stopPropagation();
            }
            // Open Menu /w swap button on canvas //
            else if(swapState === true) {
                $interfaceResizer.openMenu(html.menu.tabs.latticeTab);
                html.motif.other.swapButton.show();
            }
            // Open Menu //
            else {
                $interfaceResizer.openMenu(html.menu.tabs.latticeTab);
                html.motif.other.swapButton.hide();
                html.motif.other.swapButton.attr('class','');   
            }
        });
        html.menu.tabs.motifTab.on('click', function(event){
            // Stop Event //
            if (html.menu.tabs.motifTab.hasClass('disabled')){
                event.preventDefault();
                event.stopPropagation();
                // If no atom has been added yet //
                if (html.menu.tabs.motifTab.hasClass('blocked')) {
                    if ( html.lattice.other.selected.html() === 'Choose a Lattice' ) $tooltipGenerator.showTooltip({target:'motifLI',placement:'left',message:$messageList.getMessage(5)});
                }
            }
            else {
                $interfaceResizer.openMenu(html.menu.tabs.motifTab);
                // Update Lattice Labels every time we open the Motif Tab!!! //
                $latticeTab.updateLatticeLabels();
            }
            html.motif.other.swapButton.hide();
        });
        html.menu.tabs.visualTab.on('click', function(event){
            // Stop Event //
            if (html.menu.tabs.visualTab.hasClass('disabled')){
                event.preventDefault();
                event.stopPropagation();
                // If no atom is added yet //
                if (html.menu.tabs.visualTab.hasClass('blocked')) {
                    if ( html.lattice.other.selected.html() === 'Choose a Lattice' ) $tooltipGenerator.showTooltip({target:'visualTab',placement:'left',message:$messageList.getMessage(5)});
                }
            }
            else $interfaceResizer.openMenu(html.menu.tabs.visualTab);
            html.motif.other.swapButton.hide();
        });
        html.menu.tabs.pndTab.on('click', function(event){
            // Stop Event //
            if (html.menu.tabs.pndTab.hasClass('disabled')){
                event.preventDefault();
                event.stopPropagation();
                // If no atom is added yet //
                if (html.menu.tabs.pndTab.hasClass('blocked')) {
                    if ( jQuery('#selected_lattice').html() === 'Choose a Lattice' ) $tooltipGenerator.showTooltip({target:'millerPI',placement:'left',message:$messageList.getMessage(5)});
                }
            }
            else $interfaceResizer.openMenu(html.menu.tabs.pndTab);
            html.motif.other.swapButton.hide();
        });
        html.menu.tabs.publicTab.on('click', function(event){
            // Stop Event //
            if (html.menu.tabs.publicTab.hasClass('disabled')){
                event.preventDefault();
                event.stopPropagation();
            }
            else $interfaceResizer.openMenu(html.menu.tabs.publicTab);
            html.motif.other.swapButton.hide();
        });
        html.menu.tabs.notesTab.on('click', function(event){
            // Stop Event //
            if (html.menu.tabs.notesTab.hasClass('disabled')){
                event.preventDefault();
                event.stopPropagation();
            }
            else $interfaceResizer.openMenu(html.menu.tabs.notesTab);
            html.motif.other.swapButton.hide();
        });
        html.menu.tabs.helpTab.on('click', function(){
            if (!(html.menu.tabs.helpTab.hasClass('disabled'))) $userDialog.showInfoTutDialog({ messageID: 4 });
        });
        
        // Block Tabs //
        disableTab({'tab':'motifTab','value':true});
        blockTab({'tab':'motifTab','value':true});
        disableTab({'tab':'pndTab','value':true});
        blockTab({'tab':'pndTab','value':true});
        disableTab({'tab':'visualTab','value':true});
        blockTab({'tab':'visualTab','value':true});
        
        // Top Menu Button //
        html.interface.sidebar.toggler.on('click', function(){
            if (html.interface.sidebar.menu.hasClass('controls-open')) $interfaceResizer.closeMenu();
            else $interfaceResizer.hideMenu(true);
        });
        html.interface.canvas.showIcon.on('click',function(){
             $interfaceResizer.hideMenu(false);
        });
        html.interface.canvas.cardBoard.on('click', function(){ 

            var screenHeight = jQuery(window).height();
            var screenWidth = jQuery(window).width();
         
            if(screenHeight >= 450 && screenWidth >= 450) { 
                return;
            }

            var state = html.interface.canvas.cardBoard.hasClass('active');
            // off //
            if (state) {
                html.interface.canvas.cardBoard.removeClass('active');
                html.interface.canvas.cardBoard.find('img').attr('src','Images/stereoscope-switch-icon-03-hover.png');
                html.interface.canvas.showIcon.show();
                PubSub.publish('menu.cardboard', {toggle : !state});
            }
            // on //
            else {
                html.interface.canvas.cardBoard.addClass('active');
                html.interface.canvas.cardBoard.find('img').attr('src','Images/stereoscope-switch-icon-03-purple.png');
                html.interface.canvas.showIcon.hide();
                if (screenHeight < screenWidth) {
                    PubSub.publish('menu.cardboard',  {toggle : !state});
                }
            }
        });
        
        // Toggle Buttons Initiation //
        _.each(html.menu.toggles, function($parameter, k){
            var title;
            switch(k){
                case 'xyzAxes':
                    title = $messageList.getMessage(6);
                    break;
                 case 'abcAxes':
                    $parameter.parent().toggleClass('lightThemeActive');
                    title = $messageList.getMessage(7);
                    break;
                case 'edges':
                    $parameter.parent().toggleClass('lightThemeActive');
                    title = $messageList.getMessage(8);
                    break;
                case 'faces':
                    $parameter.parent().toggleClass('lightThemeActive');
                    title = $messageList.getMessage(9);
                    break;
                case 'latticePoints':
                    $parameter.parent().toggleClass('lightThemeActive');
                    title = $messageList.getMessage(10);
                    break;
                case 'directions':
                    $parameter.parent().toggleClass('lightThemeActive');
                    title = $messageList.getMessage(11);
                    break;
                case 'planes':
                    $parameter.parent().toggleClass('lightThemeActive');
                    title = $messageList.getMessage(12);
                    break;
                case 'atomToggle':
                    $parameter.parent().toggleClass('lightThemeActive');
                    title = $messageList.getMessage(13);
                    break;
                case 'atomRadius':
                    title = $messageList.getMessage(14);
                    break;
                case 'unitCellViewport':
                    title = $messageList.getMessage(15);
                    break;
                case 'labelToggle':
                    title = $messageList.getMessage(16);
                    break;
                case 'highlightTangency':
                    title = $messageList.getMessage(17);
                    break;
                case 'fullScreen':
                    title = $messageList.getMessage(99);
                    break;
            }
            $tooltipGenerator.addOnHoverTooltip({
                other: $parameter.parent(),
                message: title,
                placement: 'left'
            });
        });
        html.menu.toggles.xyzAxes.on('click', function() {
            (html.menu.toggles.xyzAxes.parent().hasClass('lightThemeActive')) ? value = false : value = true;
            $setUI.setValue({
                xyzAxes:{
                    value: value,
                    publish: {xyzAxes:value}
                }
            });
        });
        html.menu.toggles.abcAxes.on('click', function() {
            (html.menu.toggles.abcAxes.parent().hasClass('lightThemeActive')) ? value = false : value = true;
            $setUI.setValue({
                abcAxes:{
                    value: value,
                    publish: {abcAxes:value}
                }
            });
        });
        html.menu.toggles.edges.on('click', function() {
            (html.menu.toggles.edges.parent().hasClass('lightThemeActive')) ? value = false : value = true;
            $setUI.setValue({
                edges:{
                    value: value
                }
            });
        });  
        html.menu.toggles.faces.on('click', function() {
            (html.menu.toggles.faces.parent().hasClass('lightThemeActive')) ? value = false : value = true;
            $setUI.setValue({
                faces:{
                    value: value
                }
            });
        }); 
        html.menu.toggles.latticePoints.parent().on('click', function() {
            (html.menu.toggles.latticePoints.parent().hasClass('lightThemeActive')) ? value = false : value = true;
            $setUI.setValue({
                latticePoints:{
                    value: value,
                    publish: {latticePoints:value}
                }
            });
        });
        html.menu.toggles.planes.on('click', function() {
            (html.menu.toggles.planes.parent().hasClass('lightThemeActive')) ? value = false : value = true;
            $setUI.setValue({
                planes:{
                    value: value,
                    publish: {planeToggle:value}
                }
            });
        });  
        html.menu.toggles.directions.on('click', function() {
            (html.menu.toggles.directions.parent().hasClass('lightThemeActive')) ? value = false : value = true;
            $setUI.setValue({
                directions:{
                    value: value,
                    publish: {directionToggle:value}
                }
            });
        });
        html.menu.toggles.atomToggle.on('click', function() {
            (html.menu.toggles.atomToggle.parent().hasClass('lightThemeActive')) ? value = false : value = true;
            $setUI.setValue({
                atomToggle:{
                    value: value,
                    publish: {atomToggle:value}
                }
            });
        });
        html.menu.other.atomRadiusSlider.slider({
            value: 10.2,
            min: 1,
            max: 10.2,
            step: 0.2,
            animate: true,
            slide: function(event, ui){
                $setUI.setValue({
                    atomRadius:{
                        publish:{atomRadius: ui.value}
                    }
                });
            }
        });
        html.menu.toggles.atomRadius.on('click', function() {
            if (!(html.menu.tabs.motifTab.hasClass('active'))){
                (html.menu.toggles.atomRadius.parent().hasClass('lightThemeActive')) ? value = false : value = true;
                $setUI.setValue({
                    atomRadius:{
                        value: value
                    }
                });
            }
        });
        html.menu.toggles.unitCellViewport.on('click', function(){
            (html.menu.toggles.unitCellViewport.parent().hasClass('lightThemeActive')) ? value = false : value = true;
            $setUI.setValue({
                unitCellViewport:{
                    value: value,
                    publish: {unitCellViewport:value}
                }
            });
        });
        html.menu.toggles.labelToggle.on('click', function(){
            (html.menu.toggles.labelToggle.parent().hasClass('lightThemeActive')) ? value = false : value = true;
            $setUI.setValue({
                labelToggle:{
                    value: value,
                    publish: {labelToggle:value}
                }
            });
        });
        html.menu.toggles.highlightTangency.on('click', function(){
            (html.menu.toggles.highlightTangency.parent().hasClass('lightThemeActive')) ? value = false : value = true;
            $setUI.setValue({
                highlightTangency:{
                    value: value,
                    publish: {highlightTangency:value}
                }
            });
        });
        html.menu.toggles.fullScreen.on('click', function(){
            (html.menu.toggles.fullScreen.parent().hasClass('lightThemeActive')) ? value = false : value = true;
            $setUI.setValue({
                fullScreen:{
                    value: value,
                    publish: {}
                }
            });
        });
    };
    function openFirstActiveTab(){
        var openTab = html.interface.sidebar.tabList.find('li.active');
        if (!(openTab.hasClass('disabled'))) openTab.trigger('click');  
        else {
            openTab = html.interface.sidebar.tabList.find('li:not(.disabled):first');
            openTab.trigger('click');
        }
    };
    function blockTab(argument){
        _.each(html.menu.tabs, function($param,a){
            if (a === argument.tab) {
                if (argument.value === true) $param.addClass('blocked');
                else $param.removeClass('blocked');
            }
        });
    };
    function disableTab(argument){
        _.each(html.menu.tabs, function($param,a){
            if (a === argument.tab) {
                if (argument.value === true) {
                    $param.addClass('disabled');
                    $param.find('a').removeAttr('href');
                }
                else {
                    $param.removeClass('disabled');
                    switch(argument.tab){
                        case 'latticeTab': 
                            html.menu.tabs.latticeTab.find('a').attr('href','#scrn_lattice');
                            break;        
                        case 'pndTab': 
                            html.menu.tabs.pndTab.find('a').attr('href','#scrn_pnd'); 
                            break;
                        case 'motifTab': 
                            html.menu.tabs.motifTab.find('a').attr('href','#scrn_motif'); 
                            break;
                        case 'visualTab': 
                            html.menu.tabs.visualTab.find('a').attr('href','#scrn_visualize'); 
                            break;
                        case 'publicTab': 
                            html.menu.tabs.publicTab.find('a').attr('href','#scrn_public_library');
                            break;
                        case 'notesTab': 
                            html.menu.tabs.notesTab.find('a').attr('href','#notes_tab');
                            break;
                    }
                }
            }
        });
    };
    
    menuRibbon.prototype.setSwapButtonState = function(state){
        if (!(_.isUndefined(state))) swapState = state;
    };
    menuRibbon.prototype.switchTab = function(tab){
        switch(tab){
            case 'latticeTab': 
                html.menu.tabs.latticeTab.find('a').trigger('click');
                break;        
            case 'motifTab': 
                html.menu.tabs.motifTab.find('a').trigger('click'); 
                break;
            case 'visualTab': 
                html.menu.tabs.visualTab.find('a').trigger('click'); 
                break;
            case 'pndTab': 
                html.menu.tabs.pndTab.find('a').trigger('click'); 
                break;
            case 'publicTab': 
                html.menu.tabs.publicTab.find('a').trigger('click');
                break;
            case 'notesTab': 
                html.menu.tabs.notesTab.find('a').trigger('click');
                break;
            case 'helpTab': 
                html.menu.tabs.helpTab.find('a').trigger('click');
                break;
        }
        if (tab !== 'latticeTab') html.motif.other.swapButton.hide();
    };
    menuRibbon.prototype.disableTab = function(argument){
        _.each(argument, function($parameter, k){
            disableTab({
                tab:k,
                value:$parameter
            });
        });
    };
    menuRibbon.prototype.blockTab = function(argument){
        _.each(argument, function($parameter, k){
            blockTab({
                tab:k,
                value:$parameter   
            });
        });
    };
    menuRibbon.prototype.restoreTabs = function(argument){
        this.switchTab(argument.activeTab);
        _.each(html.menu.tabs, function($parameter,k){
            var value = argument.disabledTabs[k];
            disableTab({'tab':k,'value':value});
            blockTab({'tab':k,'value':value});
        });
    };
    menuRibbon.prototype.closeMenu = function(arg){
        if (arg.close === true) {
            $interfaceResizer.closeMenu();
        }
        else if (arg.close === false) {
            $interfaceResizer.hideMenu(true);
        }
    };
    menuRibbon.prototype.resetTabs = function(){
        this.switchTab('latticeTab');
        _.each(html.menu.tabs, function($parameter,k){
            switch(k){
                case 'motifTab':{
                    
                }
                case 'pndTab':{
                    
                }
                case 'visualTab':{
                    disableTab({'tab':k,'value':true});
                    blockTab({'tab':k,'value':true});
                    break;
                }
                default:{
                    disableTab({'tab':k,'value':false});
                    blockTab({'tab':k,'value':false}); 
                }
            }
        });
        setTimeout(function(){
            html.interface.screen.body.mCustomScrollbar("scrollTo",'top');
        },200);
    };
    
    return menuRibbon;
});