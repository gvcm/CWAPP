/*global define*/
'use strict';

// Dependecies

define([
    'jquery',
    'jquery-ui',
    'pubsub',
    'underscore',
    'niceScroll'
], function(
    jQuery,
    jQuery_ui,
    PubSub, 
    _,
    niceScroll
) 
{
    
    /* This module takes care of: 
        - resizing/readjustment of the app's menu 
        - the canvas HTML elements 
        - creating the scrollbars 
        - adding the highlight effect on UI elements
        - the progress bar
    */
    
    // Variables //
    var canvasHeight = undefined;
    var canvasWidth = undefined;
    var screenHeight = undefined;
    var screenWidth = undefined;
    var resizedOnce = false;
    var $viewport = false;
    var $animating = undefined;
    var $animating2 = undefined;
    var autoZoom = true;
    var menuHidden = false;
    var flipped = false;

    // Menu //
    var $menuWidth = undefined;
    var $naviWidth = undefined;
    var $scrollBarWidth = undefined;
    
    // FORCE LOADING SCREEN //
    var $force = false;
    
    // Module References //
    var $tooltipGenerator = undefined;
    var $messages = undefined;
    var html = undefined;
    
    // Contructor //
    function interfaceResizer(argument) {
        
        // Acquire Module References //
        if (!(_.isUndefined(argument.tooltipGenerator))) $tooltipGenerator = argument.tooltipGenerator;
        else return false;
        if (!(_.isUndefined(argument.messages))) $messages = argument.messages;
        else return false;
        if (!(_.isUndefined(argument.html))) html = argument.html;
        else return false;

        // Initiation values //
        $menuWidth = html.interface.sidebar.contents.width();
        $naviWidth = html.interface.sidebar.navi.width();
        $scrollBarWidth = html.interface.sidebar.menu.width() - $menuWidth - $naviWidth;

        // Create scrollbars //
        html.interface.screen.scrollBars.niceScroll({
            cursorcolor: "#999",
            cursorwidth: "10px",
            cursorborder: "0px solid black",
            cursoropacitymax: 0.5,
            horizrailenabled: false
        });
        
        // Cancel Animation (Highlight Effect) //
        html.interface.screen.body.on('click', function(){
            if (!(_.isUndefined($animating))){
                if ($animating.hasClass('stop')){
                    $animating.removeClass('highlight');
                    $animating.removeClass('animating');
                    $animating.removeClass('stop');
                    $animating.stop();
                }
                if ($animating.hasClass('animating')) $animating.addClass('stop');
                if ($animating.hasClass('highlight')) $animating.addClass('animating');
            }
        });
        
        // Add tooltip on the swap button //
        $tooltipGenerator.addOnHoverTooltip({
            target: 'swapButton',
            message: $messages.getMessage(32),
            placement: 'left'
        });
        
        // Window //
        jQuery(window).ready(function(){
            // Hide Progress bar and then show canvas and menu //
            //if($force === false) html.interface.progress.wrapper.hide(2000);
            html.interface.screen.body.css('background-color','black');
            html.interface.screen.wrapper.show();
            html.interface.sidebar.menu.show();
        });
        jQuery(window).resize(function() { resizeScene(); });
        jQuery(window).on('change update', function(){
            init_dimensions();
            html.interface.screen.bravaisModal.on('shown.bs.modal', function()
            {
                init_dimensions();
            });
        });
        jQuery(document).ready(function(){
            init_dimensions();
            resizeScene();
            if($(window).width() < 450 || $(window).height() < 450){
                if ( $(window).width() < $(window).height() ){
                    // html.interface.canvas.cardBoard.hide();
                    flipped = false;

                }
                else flipped = true;
                jQuery('#controls_toggler').tooltip('destroy');
            }
        });
        // window.mobileAndTabletcheck = function() {
        //   var check = false;
        //   (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
        //   return check;
        // };
          
        
        // Strech Progress Bar all over the screen //
        refreshDimensions();
        html.interface.progress.wrapper.width(screenWidth);
        html.interface.progress.wrapper.height(screenHeight);    
        
        // Init Labels //
        this.showCanvasXYZLabels(false);
    };
    // Refresh canvas and screen width/height //
    function refreshDimensions(){
        screenHeight = jQuery(window).height();
        screenWidth = jQuery(window).width();
        canvasHeight = html.interface.screen.appContainer.height();
        canvasWidth = html.interface.screen.appContainer.width();   
    };
    // Re-apply match-height on certain UI elements // 
    function init_dimensions(){
        jQuery('.mh_controls').matchHeight();
        jQuery('.mh_pnd_para_box').matchHeight();
        jQuery('.mh_lattice_length_para_box').matchHeight();
        jQuery('.mh_bravais_lattice_block').matchHeight({byRow: false});
        jQuery('.mh_bravais_lattice_block').find('.bravais-lattice-block').matchHeight({byRow: false});
        jQuery('.mh_bravais_lattice_block').find('.block-image').matchHeight({byRow: false});
    };
    // Re-adjust canvases + HTML elements //
    function resizeScene(){
        // Calculate current screen size.
        refreshDimensions();
        // Calculate canvas resizing amount and adjust menu if auto-zoom is enabled //
        var canvasResize = 0;
        var x = 0;
        if (html.interface.sidebar.menu.hasClass('controls-open')) {
            adjustMenu(true);
            canvasResize = screenWidth - ($naviWidth + $menuWidth);
            x = ($naviWidth + $menuWidth);
        }
        else if (menuHidden) {
            adjustMenu(false);
            canvasResize = screenWidth;
            x = 0;
        }
        else {
            adjustMenu(false);
            canvasResize = screenWidth - $naviWidth;
            x = $naviWidth;
        }

        // Resize canvasses and slowly fade in.
        html.interface.screen.wrapper.width(canvasResize);
        html.interface.screen.wrapper.fadeIn(800);
        html.interface.screen.appContainer.width(canvasResize);
        html.interface.progress.wrapper.width(screenWidth);
        html.interface.canvas.appLogo.width(canvasResize);
        html.interface.sidebar.menuInner.height(screenHeight);
        
        // Resize Atom Radius Slider
        html.interface.canvas.atomRadiusSlider.width((screenWidth-x)*0.18);
        html.interface.canvas.atomRadiusSlider.css('left',(screenWidth-x)*0.08);

        // Resize labels
        _.each(html.interface.canvas.xyz, function($parameter,k){
            $parameter.css('width',screenWidth*0.015); 
            $parameter.css('height',screenWidth*0.015); 
        });
        _.each(html.interface.canvas.abc, function($parameter,k){
            $parameter.css('width',screenWidth*0.015); 
            $parameter.css('height',screenWidth*0.015); 
        });
        
        // Cardboard//
        if (flipped){
            // Go to Vertical //
            if (screenHeight > screenWidth) {
                
                // html.interface.canvas.cardBoard.hide();
                html.interface.canvas.showIcon.show();
                
                // Get off cardboard mode //
                // html.interface.canvas.cardBoard.removeClass('active');
                // html.interface.canvas.cardBoard.find('img').attr('src','Images/stereoscope-switch-icon-03-hover.png');
                PubSub.publish('menu.cardboard', {toggle : false});
                flipped = false;
 
            }
        }
        else {
            // Go to Horizontal //
            if (screenHeight < screenWidth){
                html.interface.canvas.cardBoard.show();
                if(html.interface.canvas.cardBoard.hasClass('active')){
                   
                    PubSub.publish('menu.cardboard', {toggle : true});
                }
                flipped = true;
            }
        }
                
        // Render unit cell viewport //
        if ($viewport === true ) {
            html.interface.canvas.unitCellRenderer.width(html.interface.screen.appContainer.width()/5);
            html.interface.canvas.unitCellRendererMouse.width(html.interface.screen.appContainer.width()/5);
            html.interface.canvas.unitCellRenderer.height(screenHeight/5);
            html.interface.canvas.unitCellRendererMouse.height(screenHeight/5);
        }
    };
    // Resize Menu (zoom in/out) //
    function transformMenu(percentage,open){
        // Transform HTML //
        html.interface.sidebar.menuContainer.css('-webkit-transform','scale('+percentage+')');
        html.interface.sidebar.menuContainer.css('-webkit-transform-origin','0 0');
        html.interface.sidebar.menuContainer.css('transform','scale('+percentage+')');
        html.interface.sidebar.menuContainer.css('transform-origin','0 0');
        // Update scrollbar //
        updateScrollbar();
        var iconH = percentage * 0.7;
        html.interface.canvas.menuMobile.css('-webkit-transform','scale('+iconH+')');
        html.interface.canvas.menuMobile.css('-webkit-transform-origin','0 0');
        html.interface.canvas.menuMobile.css('transform','scale('+iconH+')');
        html.interface.canvas.menuMobile.css('transform-origin','0 0');

        // Calculate key values //
        $menuWidth = html.interface.sidebar.contents.width() * percentage;
        $naviWidth = html.interface.sidebar.navi.width() * percentage;
        $scrollBarWidth = html.interface.sidebar.menu.width() - $menuWidth - $naviWidth;
        if(open !== true) html.interface.sidebar.menu.css('right', -($menuWidth + $scrollBarWidth));
    };
    // Choose a zoom value depending on the current screen width //
    function adjustMenu(open){
        if (autoZoom === true){
            var zoom = 1;
            if (screenWidth > 1400) zoom = 1;
            else if (screenWidth > 1200) zoom = 0.9;
            else if (screenWidth > 1000) zoom = 0.8;
            else zoom = 0.7;
            transformMenu(zoom,open);
        }   
    };
    function updateScrollbar(){
        /*var elem = html.interface.sidebar.menuContainer, scaledHeight = elem[0].getBoundingClientRect().height;
        elem.parents(".mCSB_container").css({
            "height": elem.outerHeight()!==scaledHeight ? scaledHeight : "auto"
        }); 
        html.interface.screen.body.mCustomScrollbar('update'); */
        html.interface.screen.scrollBars.getNiceScroll().resize();
    };
    
    // Module Interface //
    // Transforms Menu (zoom in/out) //
    interfaceResizer.prototype.transformMenu = function(percentage){
        transformMenu(percentage,true);
        // Force Resize //
        window.dispatchEvent(new Event('resize'));
    };
    // Transforms any HTML element //
    interfaceResizer.prototype.transform = function(argument){
        argument.selector.css('-webkit-transform','scale('+argument.percentage+')');
        argument.selector.css('-webkit-transform-origin','0 0');
        argument.selector.css('transform','scale('+argument.percentage+')');
        argument.selector.css('transform-origin','0 0');
    };
    // Checks if an HTML element fits inside the canvas //
    interfaceResizer.prototype.fitsCanvas = function(argument){
        refreshDimensions();
        if ( (argument.x + argument.width) > canvasWidth ) return 'width';
        if ( (argument.y + argument.height) > canvasHeight ) return 'height';
        return true;
    };
    // Checks if an HTML element fits inside the screen //
    interfaceResizer.prototype.fitsScreen = function(argument){
        refreshDimensions();
        if ( (argument.x + argument.width) > screenWidth ) return 'width';
        if ( (argument.y + argument.height) > screeHeight ) return 'height';
        return false;
    };
    // Slides Menu to the right //
    interfaceResizer.prototype.closeMenu = function(){
        html.interface.sidebar.toggler.find('.img-close').fadeOut('fast', function()
        {
            html.interface.sidebar.toggler.find('.img-open').fadeIn('fast')
        });
        html.interface.screen.wrapper.fadeOut('slow');
        var shiftRight = $menuWidth - $naviWidth;
        html.interface.sidebar.menu.animate({'right': -shiftRight }, 500, function()
        {
            html.interface.sidebar.menu.removeClass('controls-open');
            html.interface.sidebar.menu.addClass('controls-close');
            window.dispatchEvent(new Event('resize'));
        });
    };
    // Slide Menu to the left //
    interfaceResizer.prototype.openMenu = function(tab){
        if( !( tab.hasClass('toggle_menu') ) ){
            if( !( tab.parent().hasClass('disabled') ) ){
                html.interface.sidebar.toggler.find('.img-open').fadeOut('fast', function()
                {
                    html.interface.sidebar.toggler.find('.img-close').fadeIn('fast')
                });
                if (! (html.interface.sidebar.menu.hasClass('controls-open')) ) {
                    html.interface.screen.wrapper.fadeOut('slow');
                    html.interface.sidebar.menu.animate({'right': -$scrollBarWidth}, 500, function()
                    {
                        html.interface.sidebar.menu.removeClass('controls-close');
                        html.interface.sidebar.menu.addClass('controls-open');
                        window.dispatchEvent(new Event('resize'));
                    });
                }
            }
        }
        setTimeout(function(){
            updateScrollbar();
        },300);
    };
    // Hide/Show xyz labels //
    interfaceResizer.prototype.showCanvasXYZLabels = function(state){
        if (state === false) _.each(html.interface.canvas.xyz, function($parameter,k){ $parameter.addClass('hiddenLabel'); });
        else _.each(html.interface.canvas.xyz, function($parameter,k){ $parameter.removeClass('hiddenLabel'); });
    };
    // Hide/Show abc labels //
    interfaceResizer.prototype.showCanvasABCLabels = function(state){
        if (state === false) _.each(html.interface.canvas.abc, function($parameter,k){ $parameter.addClass('hiddenLabel'); });
        else _.each(html.interface.canvas.abc, function($parameter,k){ $parameter.removeClass('hiddenLabel'); });
    };
    // Hide/Show Unit Cell Viewport //
    interfaceResizer.prototype.viewport = function(state){
        $viewport = state;
    };
    // Reset and show Progress Bar //
    interfaceResizer.prototype.resetProgressBar = function(title,force) {
        html.interface.progress.wrapper.find('.progressLabel').text(title);
        html.interface.progress.wrapper.show();
        if (!(_.isUndefined(force))) $force = force;
    };
    // Hide Progress Bar //
    interfaceResizer.prototype.progressBarFinish = function(force){
        if (!(_.isUndefined(force))) {
            $force = false;
            if (force === 'force') html.interface.progress.wrapper.fadeOut('slow');
            else if (force === 'ready') jQuery(window).ready(function(){ html.interface.progress.wrapper.hide(2000); });
        }
        else if ($force === false) html.interface.progress.wrapper.fadeOut('slow');
    };
    // Highlight HTML element (creates a white pulse around it) //
    interfaceResizer.prototype.highlightElement = function(argument){
        jQuery('#'+argument.id).addClass('highlight');
        $animating = jQuery('#'+argument.id);
    };
    // Highlight HTML element fot tutorial //
    interfaceResizer.prototype.tutorialElementOn = function(argument){
        argument.obj.addClass('highlight animating');
        $animating = argument.obj;
    };
    interfaceResizer.prototype.tutorialElementOnSecond = function(argument){
        argument.obj.addClass('highlight animating');
        $animating2 = argument.obj;
    };
    // Dehighlight HTML element for tutorial //
    interfaceResizer.prototype.tutorialElementOff = function(){
        if (!(_.isUndefined($animating))){
            if ($animating.hasClass('stop')){
                $animating.removeClass('highlight');
                $animating.removeClass('animating');
                $animating.removeClass('stop');
                $animating.stop();
            }
            if ($animating.hasClass('animating')) $animating.addClass('stop');
            if ($animating.hasClass('highlight')) $animating.addClass('animating');
        }
        if (!(_.isUndefined($animating2))){
            $animating2.removeClass('highlight');
            $animating2.removeClass('animating');
            $animating2.removeClass('stop');
            $animating2.stop();
        }
    };
    // Pick new label position inside the canvas //
    interfaceResizer.prototype.moveLabel = function(argument){
        var x = argument['xCoord'] - ( parseFloat(html.interface.canvas.xyz.xLabel.css('width')) / 2);
        var y = argument['yCoord'] - ( parseFloat(html.interface.canvas.xyz.xLabel.css('height')) / 2);
        switch(argument['label']){
            case 'x':
                html.interface.canvas.xyz.xLabel.css('left',x);
                html.interface.canvas.xyz.xLabel.css('top',y);
                break;
            case 'y':
                html.interface.canvas.xyz.yLabel.css('left',x);
                html.interface.canvas.xyz.yLabel.css('top',y);
                break;
            case 'z':
                html.interface.canvas.xyz.zLabel.css('left',x);
                html.interface.canvas.xyz.zLabel.css('top',y);
                break;
            case 'a':
                html.interface.canvas.abc.aLabel.css('left',x);
                html.interface.canvas.abc.aLabel.css('top',y);
                break;
            case 'b':
                html.interface.canvas.abc.bLabel.css('left',x);
                html.interface.canvas.abc.bLabel.css('top',y);
                break;
            case 'c':
                html.interface.canvas.abc.cLabel.css('left',x);
                html.interface.canvas.abc.cLabel.css('top',y);
                break;
        }  
    };
    // Change Progress Bar Title //
    interfaceResizer.prototype.editProgressBarTitle = function(title){
        html.interface.progress.bar.siblings('.progressLabel').text(title);  
    };
    // Enable auto-zoom feature //
    interfaceResizer.prototype.autoZoom = function(state){
        autoZoom = state;  
    };
    // Hide/Show Menu //
    interfaceResizer.prototype.hideMenu = function(state){

        jQuery(document).ready(function(){ 
  
            if (state === false) {
                menuHidden = false;
                html.interface.sidebar.menu.show();
                html.interface.canvas.menuMobile.hide();
                window.dispatchEvent(new Event('resize'));
            }
            else if (state === true) {
                menuHidden = true;
                html.interface.sidebar.menu.hide();
                html.interface.canvas.menuMobile.show();
                window.dispatchEvent(new Event('resize'));
            }

        });

       
    };
    
    return interfaceResizer;
});