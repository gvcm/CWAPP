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
    /* The module implements the Individual Atom Controller, which is a small panel for the atom customization. */ 
    
    // Local Variables //
    var boxWidth = 340;
    var boxHeight = 207;
    var boxOn = false;
    var html = undefined;
    var $html = undefined;
    
    // Module References //
    var $stringEditor = undefined;
    var $tooltipGenerator = undefined;
    var $setUIValue = undefined;
    var $interfaceResizer = undefined;
    var $notesTab = undefined;
    
    // Local ID //
    var $atomID = undefined;
    
    // Functions //
    function individualAtomController(argument) {
        
        // Acquire Module References //
        if (!(_.isUndefined(argument.stringEditor))) $stringEditor = argument.stringEditor;
        else return false;
        if (!(_.isUndefined(argument.setUIValue))) $setUIValue = argument.setUIValue;
        else return false;
        if (!(_.isUndefined(argument.tooltipGenerator))) $tooltipGenerator = argument.tooltipGenerator;
        else return false;
        if (!(_.isUndefined(argument.interfaceResizer))) $interfaceResizer = argument.interfaceResizer;
        else return false;
        if (!(_.isUndefined(argument.notesTab))) $notesTab = argument.notesTab;
        else return false;
        if (!(_.isUndefined(argument.html))) $html = argument.html;
        else return false;
        
        // Grab IAC object //
        html = $html.iac;
        
        // Make box draggable
        html.box.body.draggable({
            scroll: false,
            handle: '#infoHeader'
        });
        
        // Bind Event Listeners //
        html.buttons.visibility.on('click',function(){
            if (html.buttons.visibility.hasClass('notVisible')) $setUIValue.setValue({
                iacVisibility:{
                    publish:{id:$atomID,visibility:true},
                    value:true
                }
            });
            else $setUIValue.setValue({
                iacVisibility:{
                    publish:{id:$atomID,visibility:false},
                    value:false
                }
            });
        });
        html.buttons.doll.on('click',function(){
            $setUIValue.setValue({
                iacDoll:{
                    publish:{id:$atomID,dollMode:true}
                }
            });
            closeBox();
        });
        html.buttons.color.spectrum({
            color: "#000000",
            allowEmpty:true,
            chooseText: "Choose",
            cancelText: "Close",
            move: function(){
                $setUIValue.setValue({
                    iacColor:{
                        publish:{id:$atomID,color:'#'+html.buttons.color.spectrum("get").toHex()},
                        value: '#'+html.buttons.color.spectrum("get").toHex()
                    }
                });
            },
            change: function(){
                $setUIValue.setValue({
                    iacColor:{
                        publish:{id:$atomID,color:'#'+html.buttons.color.spectrum("get").toHex()},
                        value: '#'+html.buttons.color.spectrum("get").toHex()
                    }
                });
            }
        });
        html.other.opacity.on('change', function(){
            $setUIValue.setValue({
                iacOpacity:{
                    publish:{id:$atomID,opacity:$stringEditor.divide10(html.other.opacity.val())},
                    value: html.other.opacity.val()
                }
            });
        });
        html.other.opacitySlider.slider({
            value: 1,
            min: 0,
            max: 10,
            step: 0.1,
            animate: true,
            slide: function(event, ui){
                $setUIValue.setValue({
                    iacOpacity:{
                        publish:{id:$atomID,opacity:$stringEditor.divide10(ui.value)}
                    }
                });
                // Update input field //
                html.other.opacity.val(ui.value);
            }
        });
        html.box.close.on('click', function(){
            $setUIValue.setValue({
                iacClose:{
                    publish:{id:$atomID,finish:true}
                }
            });
            closeBox();
        });
        html.buttons.sound.on('click',function(){
            // Change sound Source //
            $setUIValue.setValue({
                iacSound:{
                    publish:{id:$atomID,sound:true}
                }
            });
            // Turn system sound on //
            $setUIValue.setValue({
                sounds:{
                    publish:{sounds:true},
                    value:true
                }
            });
        });
        html.buttons.notes.on('click',function(){
            // Switch to notes tab. Then, either create or focus the specific atom notes //
            $notesTab.moveToNote($atomID);
        });
        
        // Add tooltip on the sound icon //
        $tooltipGenerator.addOnHoverTooltip({target:'iacSound',placement:'top',message:"Move sound source to atom's center"});
        
        // Highlight Buttons on hover //
        html.buttons.doll.find('a').hover(function(){html.buttons.doll.find('img').attr('src','Images/doll-hover.png');},function(){html.buttons.doll.find('img').attr('src','Images/doll.png');});
        html.buttons.notes.find('a').hover(function(){html.buttons.notes.find('img').attr('src','Images/notes-icon-purple.png');},function(){html.buttons.notes.find('img').attr('src','Images/notes-icon-white.png');});
        html.buttons.sound.find('a').hover(function(){html.buttons.sound.find('img').attr('src','Images/sound-icon-hover-purple.png');},function(){html.buttons.sound.find('img').attr('src','Images/sound-icon-hover.png');});
    };
    function changeLayout(mode){
        // Single atom selection //
        if (mode === true){
            html.buttons.sound.show();
            html.buttons.notes.show();
            html.buttons.doll.show();
            html.other.symbol.show();
        }
        // Multiple atom selection //
        else{
            html.buttons.sound.hide();
            html.buttons.notes.hide();
            html.buttons.doll.hide();
            html.other.symbol.hide();
            html.other.radius.html('Multi-atom');
            html.other.radiusLabel.html('Selection:');
        }
    };
    function closeBox(){
        // Unfocus note if it's open //
        $html.notes.other.table.find('#'+$atomID).trigger('hide');
        $atomID = undefined;
        html.box.body.hide('slow');
        boxOn = false;
    };
    
    // Module Interface //
    individualAtomController.prototype.showBox = function(argument){
        
        // Atom Selection //
        var single = undefined;
        if (_.isUndefined(argument.single)) {
            closeBox();
            return false;
        }
        else single = argument.single;
        
        // Atom ID + Box Title //
        if (single === true){
            if (_.isUndefined(argument.id)) {
                closeBox();
                return false;
            }
            else {
                $atomID = argument.id;
                html.box.title.html('Atom '+$atomID);
            }
        }
        else {
            $atomID = 'selection';
            html.box.title.html('Atoms');
        }
        
        // Fix Element Class //
        if (single === true){
            if (_.isUndefined(argument.name)) {
                closeBox();
                return false;
            }
            else html.other.symbol.find('a').attr('class','ch ch-'+$stringEditor.toLowerCase(argument.name));
        }
        
        // Fix Element Name //
        if (single === true){
            if (_.isUndefined(argument.ionicIndex)) {
                closeBox();
                return false;
            }
            else {
                if (argument.ionicIndex !== '0') html.other.symbol.find('a').html('<span style="font-size:15px;">'+$stringEditor.capitalizeFirstLetter(argument.name)+'<sup>'+argument.ionicIndex+'</sup></span>');
                else html.other.symbol.find('a').html($stringEditor.capitalizeFirstLetter(argument.name));
            }
        }
        
        // Insert Atom Radius //
        if (single === true){
            if (_.isUndefined(argument.radius)) {
                closeBox();
                return false;
            }
            else html.other.radius.html(argument.radius+ ' &Aring;');
        }
        
        // Initialize Atom Color //
        if (_.isUndefined(argument.color)) {
            closeBox();
            return false;
        }
        else {
            html.buttons.color.spectrum('set',argument.color);
            html.buttons.color.children().css('background','#'+html.buttons.color.spectrum("get").toHex());
        }
        
        // Initialize Atom Opacity //
        if (_.isUndefined(argument.opacity)) {
            closeBox();
            return false;
        }
        else {
            html.other.opacity.val($stringEditor.multiply10(argument.opacity));
            html.other.opacitySlider.slider('value',$stringEditor.multiply10(argument.opacity));
        }
        
        // Apply Atom Visibility //
        if (_.isUndefined(argument.visibility)) {
            closeBox();
            return false;
        }
        else {
            if ((argument.visibility === true) && (html.buttons.visibility.hasClass('notVisible'))) html.buttons.visibility.trigger('click');
            else if ((argument.visibility === false) && (!(html.buttons.visibility.hasClass('notVisible')))) html.buttons.visibility.trigger('click');
        }
        
        // Apply layout
        changeLayout(single);
        
        // Show Box //
        html.box.body.show('slow');
        boxOn = true;
        return true;
    };
    individualAtomController.prototype.hideBox = function(){
        closeBox();
    };
    individualAtomController.prototype.moveBox = function(argument){
        var xCoord = 0, yCoord = 0;
        if (!(_.isUndefined(argument.x))) xCoord = argument.x;
        else return false;
        if (!(_.isUndefined(argument.y))) yCoord = argument.y;
        else return false;
        
        // Chech if our box will fit in the canvas in the given position //
        var fitsCanvas = $interfaceResizer.fitsCanvas({x:xCoord,y:yCoord,width:boxWidth,height:boxHeight});
        if (fitsCanvas === true) {
            html.box.body.css('left',xCoord);
            html.box.body.css('top',yCoord);
        }
        else if (fitsCanvas === 'width') {
            // Check again //
            fitsCanvas = $interfaceResizer.fitsCanvas({x:xCoord-boxWidth,y:yCoord,width:boxWidth,height:boxHeight});
            // Slide box top and left [doesn't fit horizontally and vertically] //
            if (fitsCanvas === 'height') {
                html.box.body.css('left',xCoord-boxWidth);
                html.box.body.css('top',yCoord-boxHeight);
            }
            // Slide box to the left [doesn't fit horizontally] //
            else {
                html.box.body.css('left',xCoord-boxWidth);
                html.box.body.css('top',yCoord);
            }
        }
        else if (fitsCanvas === 'height') { 
            // Slide box to the top [doesn't fit vertically] //
            html.box.body.css('left',xCoord);
            html.box.body.css('top',yCoord-boxHeight);
        }
        return true;
    };
    
    return individualAtomController;
});