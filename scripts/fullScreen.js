
'use strict';

define([  
  'underscore'
], function( 
  _
) { 

  function FullScreen() {
    //this.screenWidth =  ;
    //this.screenHeight =  ; 

    this.fsapi = (function (undefined) {
      var dom, enter, exit, fullscreen

      // support for entering fullscreen
      dom = document.createElement('img');
      if ('requestFullscreen' in dom) {
          enter = 'requestFullscreen' // W3C proposal
      }
      else if ('requestFullScreen' in dom) {
          enter = 'requestFullScreen' // mozilla proposal
      }
      else if ('webkitRequestFullScreen' in dom) {
          enter = 'webkitRequestFullScreen' // webkit
      }
      else if ('mozRequestFullScreen' in dom) {
          enter = 'mozRequestFullScreen' // firefox
      }
      else {
          enter = undefined // not supported in this browser
      }

      // support for exiting fullscreen
      if ('exitFullscreen' in document) {
          exit = 'exitFullscreen' // W3C proposal
      }
      else if ('cancelFullScreen' in document) {
          exit = 'cancelFullScreen' // mozilla proposal
      }
      else if ('webkitCancelFullScreen' in document) {
          exit = 'webkitCancelFullScreen' // webkit
      }
      else if ('mozCancelFullScreen' in document) {
          exit = 'mozCancelFullScreen' // firefox
      }
      else {
          exit = undefined // not supported in this browser
      }

      // support for detecting when in fullscreen
      if ('fullscreen' in document) {
          fullscreen = 'fullscreen' // W3C proposal
      }
      else if ('fullScreen' in document) {
          fullscreen = 'fullScreen' // mozilla proposal
      }
      else if ('webkitIsFullScreen' in document) {
          fullscreen = 'webkitIsFullScreen' // webkit
      }
      else if ('mozFullScreen' in document) {
          fullscreen = 'mozFullScreen' // firefox
      }
      else {
          fullscreen = undefined // not supported in this browser
      }

      return {
          enter      : enter,
          exit       : exit,
          fullscreen : fullscreen
      }
    }());
 
  };

  FullScreen.prototype.fs = function(element){

    var element = (element) ? document.getElementById(element) : document.body;
    
    if (this.fsapi.enter && this.fsapi.exit && this.fsapi.fullscreen) {
      if (document[this.fsapi.fullscreen]) {
        document[this.fsapi.exit]();
        setTimeout(function () {
            element.className = ''
        }, 0);
      }
      else {
        element[this.fsapi.enter]();
        setTimeout(function () {
            element.className = 'fullscreen'
        }, 0);
      }
    }
  };
 
  return FullScreen;
  
});
