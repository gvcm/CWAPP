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
    /* This module handles the 3 dialog modals:
            - Error Modal
            - Information Modal
            - Warning Modal
                - It gaves the option to "freeze" any user interaction until he takes some action on the dialog window
                - It is called by passing the caller HTML element, and depending on the action that the user takes,
                  it triggers the caller's 'action' listener.
    */
    
    // Variables
    var argument = undefined;
    var $messageList = undefined;
    var $interface = undefined;
    var html = undefined;
    var pubEvent = 'menu.dialog_result';
    var steps = {
        1 : {
            element : $('#latticeTab').find('a'),
            title   : 'Step 1: Introduction',
            text    : '<br><p>Following the approach of combining Bravais Lattice with a Motif to create a <a href="" target="_blank">Crystal Structure</a>, CrystalWalk’s first step to take you to the Lattice Tab to create a Crystal Structure is to interactively guide you into choosing a Lattice.</p><br><p>Let\'s start with opening the application menu. Click on the <span style="color:green">highlighted</span> button to open the Bravais Lattice Parameters tab of the menu.</p>',
            state   : true,
            next    : '2'
        },
        2 : {
            element : $('#selected_lattice'),
            title   : 'Step 2: Choosing a Bravais Lattice',
            text    : '<br><p>Click at the <span style="color:green">highlighted</span> menu button at your right and choose between the 14 Bravais + Hexagonal Lattices. And don’t worry if you don’t know what Lattice you should be using in your Crystal Structure, you can return to this tab and change its parameters at any time. Also just keep in mind that your lattice parameters will always be available to you on the Navigation Compass, in highlighted.</p><br><p>Additionally to the main menu, toggle bar will always be available so that you can switch on or off scene elements as abc / xyz axes, lattice points, edges and faces as well planes, directions, atoms and much more.</p>',
            state   : false,
            next    : '3',
            action  : 'latticeTab'
        },
        3 : {
            element : $('#motifLI').find('a'),
            title   : 'Step 3: Composing your Motif',
            text    : '<br><p>Having chosen your Lattice and its parameters, next step to create a Crystal Structure is to use the Motif Editor tab to interactively guide you into composing your Motif.</p><br><p>Click at the <span style="color:green">highlighted</span> menu button to open up the Motif\'s Atom Coordinates tab.</p>',
            state   : false,
            next    : '4'
        },
        4 : {
            element : $('#atomPalette').find('a'),
            title   : 'Step 4: Adding Atoms',
            text    : '<br><p>Click at the <span style="color:green">highlighted</span> menu button at your right and add an atom by interactively choosing an ion from the periodic table. CrystalWalk uses the AUTO mode as per default, which assumes prototype structures and the rigid sphere’s model to guess and automatically position your atoms and adjust your lattice parameters. </p><br><p>If you are a student it is likely all you need to know are the lattice and atoms that compose your motif, although a set of additional parameters is also available if you want to manually position motif atoms at a particular ABSOLUT (in Å) or VECOTORIAL coordinates relative to the crystallographic axys.</p><br><p>Repeat this process as many times as you want, you can always return to this tab.</p>',
            state   : false,
            next    : '5',
            action  : 'motifLI'
        },
        5 : {
            element : $('#visualTab').find('a'),
            title   : 'Step 5: Visualizing and Interacting',
            text    : '<br><p>Congratulations, you have just created your Crystal Structure!</p><br><p>A few options <span style="color:green">highlighted</span> at both your left and right sides are now available to help you better visualize it. In Blue at your left you can see both Atom View which can position you in first person at a selected atom location, as well GearBox which can help you transition scales from Lattice points, Motif, different representations of unit cell and Crystal Structure.</p><br><p>In the menu, at your left, a whole lot of visualization tools and options are given. You can explore different types of model representations, rendering parameters and effects as well interacting with your Crystal Structure in 3D using experimental human interaction devices (HID) if your system supports it.</p><br><p>Just give it a try, you can always do/undo any of the options you choose.</p>',
            state   : false,
            next    : '6'
        },
        6 : {
            element : $('#millerPI').find('a'),
            element2: $('#notesTab').find('a'),
            title   : 'Step 6: Additional Visualization Resources',
            text    : '<br><p>At this point a whole set of extra features and resources are available, you can create a diverse planes and directions representation at this tab, as well a didactic narrative with texts, links and animations to illustrate classes and examples. </p><br><p>Just give it a try, you can always do/undo any of the options you choose.</p>',
            state   : false,
            next    : 'last'
        },
        last : {
            element : $('#publicTab').find('a'),
            title   : 'Step 7: Save Your Project',
            text    : '<p>Going through all of these steps, it’s now time to save your project for later use so that you share them with students and other colleagues.</p><br><p>After providing some basic information about your project <span style="color:green">highlighted</span> in the Import / Export tab at your right, several options will become available. You can save your project online at our servers, using our cool cw.gl url shortner and QR code generator services, create bitmap images and even export geometry in the STL format for 3D printing your model.</p><br><p>Finally you can have access to our online library, search for specific terms / description and open your model at the options menu below.</p><br><p>Thank you for making to this far! A series of community supported tutorials on how to create and explore crystal structures is accessible at <a href="http://www.instructables.com/id/CrystalWalk-Collection/" target="_blank">CrystalWalk’s Instructable Channel</a></p><br><p>You can also find more information at CrystalWalk project’s page at crystalwalk.org, or reach the author at <a href="mailto:bardella@ipen.br" target="_blank">bardella@ipen.br</a> for any questions, comments or concerns.</p>',
            state   : false,
            next    : ''
        }

    };
    
    // Contructor //
    function userDialog(argument) {
        // Acquire Module References
        if (!(_.isUndefined(argument.messages))) $messageList = argument.messages;
        else return false;
        if (!(_.isUndefined(argument.interfaceResizer))) $interface = argument.interfaceResizer;
        else return false;
        if (!(_.isUndefined(argument.html))) html = argument.html;
        else return false;
        
        // Warning Modal Handlers //
        html.modals.dialog.warning.modal.caller = 'none';
        html.modals.dialog.warning.close.on('click',function(){
            argument = {};
            argument.result = false;
            PubSub.publish(pubEvent, argument);
            // Trigger Cancel Action //
            if (html.modals.dialog.warning.modal.caller !== 'none') html.modals.dialog.warning.modal.caller.trigger('actionFail');
            html.modals.dialog.warning.modal.caller = 'userDenied';
        });
        html.modals.dialog.warning.cancel.on('click',function(){
            argument = {};
            argument.result = false;
            PubSub.publish(pubEvent, argument);
            // Trigger Cancel Action //
            if (html.modals.dialog.warning.modal.caller !== 'none') html.modals.dialog.warning.modal.caller.trigger('actionFail');
            html.modals.dialog.warning.modal.caller = 'userDenied';
        });
        html.modals.dialog.warning.continue.on('click',function(){
            argument = {};
            argument.result = true;
            PubSub.publish(pubEvent, argument);
            // Trigger callback if any
            if (html.modals.dialog.warning.modal.caller !== 'none') {
                html.modals.dialog.warning.modal.caller.trigger('action');
                html.modals.dialog.warning.modal.caller = 'none';
            }
            html.modals.dialog.warning.modal.caller = 'userConfirmed';
        });
        html.modals.dialog.warning.modal.on('hide.bs.modal', function(){
            // If modal is hidden by system event, only reset callback
            if (html.modals.dialog.warning.modal.caller !== undefined){
                if ( (html.modals.dialog.warning.modal.caller === 'userConfirmed') || (html.modals.dialog.warning.modal.caller === 'userDenied') ){
                    html.modals.dialog.warning.modal.caller = 'none';
                    return true;
                }
                else {
                    html.modals.dialog.warning.modal.caller.trigger('actionFail');
                    html.modals.dialog.warning.modal.caller = 'none';
                    return true;
                }
            }
            // else publish failure
            argument = {};
            argument.result = false;
            PubSub.publish(pubEvent, argument);
            html.modals.dialog.warning.modal.caller = 'none';
        });
        
        // Info Modal Handlers //
        html.modals.dialog.tutorial.on('click',function(){
            start_tutorial();
            html.modals.dialog.title.find('h2').html('Information');
        });
        html.modals.dialog.doNotShowAgain.on('click',function(){
            var d = new Date();
            var exdays = 1000;
            d.setTime(d.getTime() + (exdays*24*60*60*1000));
            var expires = "expires=" + d.toGMTString();
            document.cookie = 'hasVisited'+"="+'true'+"; "+expires; 
        });
        
        // Tutorial Layout //
        html.tutorial.box.body.draggable({
            scroll: false,
            handle: '#tutorialHeader',
            containment: [0,0,50000,50000]
        });
        
        // Tutorial Handlers //
        html.tutorial.box.close.on('click', function(){
            finish_tutorial();
        });
        html.tutorial.box.next.on('click', function(){
            tutorial_next(); 
        });
        
        // Show info at startup // 
        if(getCookie("hasVisited") === undefined){
            this.showInfoTutDialog({ messageID: 4 });
        }   
        
    };
    
    function getCookie(key) {
        var name = key + "=";
        var ca = document.cookie.split(';');
        for(var i=0; i<ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1);
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return ;
    };
    
    function start_tutorial(){
        html.tutorial.box.body.show();
        tutorial_step('1');
    };
    
    function finish_tutorial(){
        html.tutorial.box.body.hide('slow');
        $interface.tutorialElementOff();
    };
    
    function tutorial_next(){
        var active = '';
        _.each(steps, function($parameter, k){
            if ($parameter.state === true) active = k;
        });
        if (active === 'last') finish_tutorial();
        else {
            steps[active].state = false;
            tutorial_step(steps[active].next);
        }
    };
    
    function tutorial_step(i){
        if (steps[i].action !== undefined) jQuery('#'+steps[i].action).find('a').trigger('click');
        $interface.tutorialElementOff();
        html.tutorial.box.text.html(steps[i].text);
        html.tutorial.box.title.html(steps[i].title);
        steps[i].state = true;
        $interface.tutorialElementOn({ obj: steps[i].element });
        if (steps[i].element2 !== undefined) $interface.tutorialElementOnSecond({ obj: steps[i].element2 });
        if (i === 'last') html.tutorial.box.next.html('Finish');
    };
    
    userDialog.prototype.showWarningDialog = function(argument){
        var screen_height = jQuery(window).height();
        
        // Pick message source
        if (!(_.isUndefined(argument.messageID))) html.modals.dialog.warning.modal.find('#warningMessage').html($messageList.getMessage(argument.messageID));
        else if (!(_.isUndefined(argument.message))) html.modals.dialog.warning.modal.find('#warningMessage').html(argument.message);
        
        // Position Modal
        html.modals.dialog.warning.modal.modal('show').css('margin-top',(screen_height/2)-100);
        
        // Pass Caller
        if (!(_.isUndefined(argument.caller))) html.modals.dialog.warning.modal.caller = argument.caller;
    };
    userDialog.prototype.showInfoDialog = function(argument){
        if(argument.messageID === undefined){  
            var screen_height = jQuery(window).height();
            html.modals.dialog.warning.modal.find('#infoMessage').html(argument.message);
            html.modals.dialog.info.modal('show').css('margin-top',(screen_height/2)-100);
        }
        else{ 
            var screen_height = jQuery(window).height();
            html.modals.dialog.info.find('#infoMessage').html($messageList.getMessage(argument.messageID));
            if (argument.messageID === 4) html.modals.dialog.info.modal('show').css('margin-top',(screen_height/2)-250);
            else html.modals.dialog.info.modal('show').css('margin-top',(screen_height/2)-100);
        } 
    };
    userDialog.prototype.showInfoTutDialog = function(argument){
        if(argument.messageID === undefined){  
            var screen_height = jQuery(window).height();
            html.modals.dialog.warning.modal.find('#infoMessage').html(argument.message);
            html.modals.dialog.info.modal('show').css('margin-top',(screen_height/2)-100);
        }
        else{ 
            var screen_height = jQuery(window).height();
            html.modals.dialog.infoTut.find('#infoMessage').html($messageList.getMessage(argument.messageID));
            if (argument.messageID === 4) html.modals.dialog.infoTut.modal('show').css('margin-top',(screen_height/2)-250);
            else html.modals.dialog.infoTut.modal('show').css('margin-top',(screen_height/2)-100);
        } 
    };
    userDialog.prototype.showErrorDialog = function(argument){
        var screen_height = jQuery(window).height();
        html.modals.dialog.error.find('#errorLabel h2').html('Error '+argument.code);
        html.modals.dialog.error.find('#errorMessage').html($messageList.getMessage(argument.messageID));
        html.modals.dialog.error.modal('show').css('margin-top',(screen_height/2)-100);

    };
    userDialog.prototype.hideInfoDialog = function(){
        html.modals.dialog.info.modal('hide');
    };
    
    return userDialog;
});