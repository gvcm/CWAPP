'use strict';
define([
  'jquery',  
  'underscore'
], function(  
  jQuery,
  _
) { 

  function SceneResizer(crystalRenderer, motifRenderer, unitCellRenderer, hudDisplayFactor, dollEditor, hudCube) {
    
    var _this = this;
      
    this.crystalRenderer = crystalRenderer ;
    this.unitCellRenderer = unitCellRenderer ;
    this.motifRenderer = motifRenderer ;   
    this.hudDisplayFactor = hudDisplayFactor ;  
    this.dollEditor = dollEditor ;  
    this.hudCube = hudCube ;   
    this.ucViewPortActive = false;
    this.lastState = 'default';
       
  };
    
  SceneResizer.prototype.resize = function(state, dimensions){
    var width = (dimensions) ? dimensions.width : jQuery('#app-container').width() ;
    var height = (dimensions) ? dimensions.height : $(window).height() ;
    var fullWidth =  $(window).width();
    var fullHeight =  $(window).height();
    
    var _this = this;
     
    if( state === 'oculusCrystal'){
      
      this.crystalRenderer.changeContainerDimensions(fullWidth , fullHeight );
      this.unitCellRenderer.changeContainerDimensions(0,0);
      this.motifRenderer.changeContainerDimensions(0,0);
      $('#appLogo').css('display','none');
       
      $('.axesLabel').addClass('hiddenLabel');

      $('#topRowTableCaption').css('display','none');
        
      $('#crystalRenderer').width(fullWidth);
      $('#crystalRenderer').height(fullHeight);
        
      $('#crystalRendererMouse').width(fullWidth);
      $('#crystalRendererMouse').height(fullHeight);
        
      $('#crystalRendererCaption').width(0);
      $('#crystalRendererCaption').height(0);

      $('#unitCellRendererCaption').width(0);
      $('#unitCellRendererCaption').height(0);
         
      $('#motifRenderer').width(0); 
      $('#motifRenderer').height(0);

      $('#motifPosX').css( "width", 0 );
      $('#motifPosX').css( "height", 0 );

      $('#motifPosY').css( "width", 0 );
      $('#motifPosY').css( "height", 0 );

      $('#motifPosZ').css( "width", 0 );
      $('#motifPosZ').css( "height", 0 );
        
      $('#motifScreenTableCaption').css('display','none');
        
      $('#motifPosXCaption').css( "width", 0 );
      $('#motifPosXCaption').css( "height", 0 );

      $('#motifPosYCaption').css( "width", 0 );
      $('#motifPosYCaption').css( "height", 0 );

      $('#motifPosZCaption').css( "width", 0 );
      $('#motifPosZCaption').css( "height", 0 ); 
    }
    else if( state === 'motifScreen'){
      // to be removed
      jQuery('#motifVisibilityInUC').show();
      this.crystalRenderer.changeContainerDimensions(width/2, height/2);
      this.unitCellRenderer.changeContainerDimensions(width/2, height/2);
      this.motifRenderer.changeContainerDimensions(width, height/2);
        
      $('.axesLabel').addClass('hiddenLabel');
      if ( !($('#atomRadiusSliderContainer').hasClass('disabled')) ) {
        jQuery('#atomRadius').parent().toggleClass('lightThemeActive');
        if (jQuery('#atomRadiusSliderContainer').hasClass('disabled') ) jQuery('#atomRadiusSliderContainer').show('slow');
        else jQuery('#atomRadiusSliderContainer').hide('slow');
        jQuery('#atomRadiusSliderContainer').toggleClass('disabled');
      }
        
      $('#appLogo').css('display','none');
      $('#lockCameraIcon').css('display','block');

      $('#topRowTableCaption').css('display','table');
        
      $('#crystalRenderer').width(width/2);
      $('#crystalRenderer').height(height/2);
        
      $('#crystalRendererMouse').width(width/2);
      $('#crystalRendererMouse').height(height/2); 
      
      $('#crystalRendererCaption').width((width/2)-16);
      $('#crystalRendererCaption').height((height/2)-8);
      $('#crystalRendererCaption').css('left',width/2);

      $('#unitCellRenderer').removeClass('viewport');
      $('#unitCellRendererMouse').removeClass('viewport');
        
      $('#unitCellRenderer').width(width/2);
      $('#unitCellRenderer').height(height/2);
        
      $('#unitCellRendererMouse').width(width/2);
      $('#unitCellRendererMouse').height(height/2);
        
      $('#unitCellRendererCaption').width((width/2)-8);
      $('#unitCellRendererCaption').height((height/2)-8);

      $('#motifRenderer').width(width);
      $('#motifRenderer').height(height/2);
      $('#motifRenderer').css( "top", height/2 );
        
      $('#motifScreenTableCaption').css('display','table');

      $('#motifPosX').css( "width", width/3 );
      $('#motifPosX').css( "height", height/2 );

      $('#motifPosY').css( "width", width/3 );
      $('#motifPosY').css( "height", height/2 );

      $('#motifPosZ').css( "width", width/3 );
      $('#motifPosZ').css( "height", height/2 );
        
      $('#motifPosXCaption').css( "width", width/3 );
      $('#motifPosXCaption').css( "height", height/2 );

      $('#motifPosYCaption').css( "width", width/3 );
      $('#motifPosYCaption').css( "height", height/2 );

      $('#motifPosZCaption').css( "width", width/3 );
      $('#motifPosZCaption').css( "height", height/2 );
 
      $('#hudRendererCube').width((0.5 * 1.5 * width) / this.hudDisplayFactor);
      $('#hudRendererCube').height((0.5 * 1.5 * height) / this.hudDisplayFactor); 
    }
    else{
      jQuery('#motifVisibilityInUC').hide();
      if(this.ucViewPortActive === false){
        this.unitCellRenderer.changeContainerDimensions(0,0);
      }
      else{
        this.unitCellRenderer.changeContainerDimensions(width/5,height/5);
      }
      
      this.motifRenderer.changeContainerDimensions(0,0);
        
      if ($('#xyzAxes').parent().hasClass('lightThemeActive')){
          $('#xLabel').removeClass('hiddenLabel');
          $('#yLabel').removeClass('hiddenLabel');
          $('#zLabel').removeClass('hiddenLabel');
      }
      if ($('#abcAxes').parent().hasClass('lightThemeActive')){
          $('#aLabel').removeClass('hiddenLabel');
          $('#bLabel').removeClass('hiddenLabel');
          $('#cLabel').removeClass('hiddenLabel');
      }
        
      $('#appLogo').css('display','block');
      $('#lockCameraIcon').css('display','none');

      $('#topRowTableCaption').css('display','none');
        
      $('#crystalRenderer').width(width);
      $('#crystalRenderer').height(height);
        
      $('#crystalRendererMouse').width(width);
      $('#crystalRendererMouse').height(height);
        
      $('#crystalRendererCaption').width(0);
      $('#crystalRendererCaption').height(0);

      if (!$('#unitCellRenderer').hasClass('viewport')){
          if (this.ucViewPortActive === true) {
                $('#unitCellRenderer').addClass('viewport');
                $('#unitCellRendererMouse').addClass('viewport');
                $('#unitCellRenderer').width(width/5);
                $('#unitCellRendererMouse').width(width/5);
                $('#unitCellRenderer').height(height/5);
                $('#unitCellRendererMouse').height(height/5);
          } 
          else{
              $('#unitCellRenderer').width(0);
              $('#unitCellRenderer').height(0);
              $('#unitCellRendererMouse').width(0);
              $('#unitCellRendererMouse').height(0);
          }
      }
      
      $('#unitCellRendererCaption').width(0);
      $('#unitCellRendererCaption').height(0);
        
      $('#motifRenderer').width(0); 
      $('#motifRenderer').height(0);

      $('#motifPosX').css( "width", 0 );
      $('#motifPosX').css( "height", 0 );

      $('#motifPosY').css( "width", 0 );
      $('#motifPosY').css( "height", 0 );

      $('#motifPosZ').css( "width", 0 );
      $('#motifPosZ').css( "height", 0 );
        
      $('#motifScreenTableCaption').css('display','none');
        
      $('#motifPosXCaption').css( "width", 0 );
      $('#motifPosXCaption').css( "height", 0 );

      $('#motifPosYCaption').css( "width", 0 );
      $('#motifPosYCaption').css( "height", 0 );

      $('#motifPosZCaption').css( "width", 0 );
      $('#motifPosZCaption').css( "height", 0 );
      
      $('#hudRendererCube').width(width/this.hudDisplayFactor);
      $('#hudRendererCube').height(height/this.hudDisplayFactor);

      // for oculus exit
      if(this.lastState === 'oculusCrystal'){
        
      }
       
      this.crystalRenderer.changeContainerDimensions(width, height);
    }
    this.lastState = state;

    setTimeout(_this.dollEditor.rePosition.bind(_this.dollEditor),100);
  };
  SceneResizer.prototype.showViewport = function(arg){ 
    var width = jQuery('#app-container').width() ;
    var height = $(window).height() ;
    if(arg.viewport === 'unitCell'){
      if(arg.active === true){
        this.ucViewPortActive = true;
        $('#unitCellRenderer').addClass('viewport');
        $('#unitCellRendererMouse').addClass('viewport');
        $('#unitCellRenderer').width(width/5);
        $('#unitCellRendererMouse').width(width/5);
        $('#unitCellRenderer').height(height/5);
        $('#unitCellRendererMouse').height(height/5);
        this.unitCellRenderer.changeContainerDimensions(width/5, height/5);
      }
      else if(arg.active === false){
        this.ucViewPortActive = false;
        $('#unitCellRenderer').removeClass('viewport');
        $('#unitCellRendererMouse').removeClass('viewport');
        $('#unitCellRenderer').width(0);
        $('#unitCellRendererMouse').width(0);
        $('#unitCellRenderer').height(0);
        $('#unitCellRendererMouse').height(0);
        this.unitCellRenderer.changeContainerDimensions(0, 0);
      }
    }
  };
  SceneResizer.prototype.toScreenPositionCube = function(obj){ 
    var camera = this.crystalRenderer.hudCameraCube;
    var obj = this.hudCube.cube;

    var vector = new THREE.Vector3();
    var width = jQuery('#hudRendererCube').width() ;
    var height = jQuery('#hudRendererCube').height() ; 

    // TODO: need to update this when resize window
    var widthHalf = 0.5*width;
    var heightHalf = 0.5*height;
    
    obj.updateMatrixWorld();
    vector.setFromMatrixPosition(obj.matrixWorld);
    vector.project(camera);
    
    vector.x = ( vector.x * widthHalf ) + widthHalf;
    vector.y = - ( vector.y * heightHalf ) + heightHalf;
    
    return { 
        x: vector.x,
        y: vector.y
    };

  };

  return SceneResizer;
  
});
