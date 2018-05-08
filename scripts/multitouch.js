'use strict';
define([
  'jquery' 
], function(
  jQuery  
) { 
   
  function Multitouch(domElement, keyboard, crystalScene, crystalOrbit, camera) {
 
    var touchstart = this.touchstart.bind(this) ;  
    var touchmove  = this.touchmove.bind(this) ;  
    var touchend   = this.touchend.bind(this) ;  

    // document.getElementById('crystalRendererMouse').addEventListener( 'touchstart', touchstart, true ); 
    // document.getElementById('crystalRendererMouse').addEventListener( 'touchmove' , touchmove,  true ); 
    // document.getElementById('crystalRendererMouse').addEventListener( 'touchend'  , touchend,   true ); 
    
    this.keyboard = keyboard;
    this.lastFingersPosition = { x : 0, y : 0 };
    this.touchDevice = false;
    this.crystalScene = crystalScene;
    this.firstTapOnAtom = { identity : undefined, latticeIndex: undefined, time : undefined};
    this.firstTapOutsideAtom = { tapped : false, time : undefined};
    this.crystalOrbit = crystalOrbit;
    this.camera = camera;
    this.container = 'crystalRendererMouse';
  }; 
   
  Multitouch.prototype.touchend = function( event ) {
    this.fingersPosition = { x : 0, y : 0 };

  }; 
  function getCrystalAtoms(scene) {  
 
    var crystalObjs = [] ;

    scene.traverse(function (object) {

      if ( 
        (object.name === 'point' ) || 
        (object.name === 'atom' && object.latticeIndex !== '-') || 
        ( object.name === 'atom' && 
          object.latticeIndex === '-' && 
          object.visible === true )  
      ) {   
        for (var i = 0; i < object.children.length; i++) {  
          crystalObjs.push(object.children[i]);
        };  
      }
    });

    return crystalObjs;
  };
  Multitouch.prototype.touchstart = function( event ) {
    
    var _this = this;
    
    this.touchDevice = true;

    switch ( event.touches.length ) {

      case 1:  
        this.lastFingersPosition = { x : event.touches[ 0 ].pageX, y : event.touches[ 0 ].pageY };
        
        var raycaster = new THREE.Raycaster(); 
        var mouse = new THREE.Vector2(); 
        mouse.x = (event.touches[ 0 ].pageX/ $('#'+this.container).width()) * 2 - 1;
        mouse.y = -(event.touches[ 0 ].pageY / $('#'+this.container).height()) * 2 + 1;

        raycaster.setFromCamera( mouse, this.camera );  
        var crystalobjsIntersects = raycaster.intersectObjects( getCrystalAtoms(this.crystalScene.object3d) );

        if(crystalobjsIntersects.length > 0){
          var identity = crystalobjsIntersects[0].object.parent.identity;
          var latticeIndex = crystalobjsIntersects[0].object.parent.latticeIndex;
         
          if(this.firstTapOnAtom.identity !== undefined && this.firstTapOnAtom.identity === identity && this.firstTapOnAtom.latticeIndex === latticeIndex){
            this.crystalOrbit.control.target.copy(crystalobjsIntersects[0].object.parent.position.clone());
            clearTimeout(this.firstTapOnAtom.time);
          }
          else{ 
            this.firstTapOnAtom.identity = identity;
            this.firstTapOnAtom.latticeIndex = latticeIndex;

            this.firstTapOnAtom.time = setTimeout(function(){ 
              _this.firstTapOnAtom.identity = undefined;
              _this.firstTapOnAtom.latticeIndex = undefined;
            },
            500);

          }
        }
        else{
          // user tapped outside

          if(this.firstTapOutsideAtom.tapped === true){
            this.crystalOrbit.control.target.copy(new THREE.Vector3());
          }
          else{
            this.firstTapOutsideAtom.tapped = true;
            this.firstTapOutsideAtom.time = setTimeout(function(){ 
              _this.firstTapOutsideAtom.tapped = false; 
            },
            500);
          }

        }

        break;

    }
   
  
  };
  Multitouch.prototype.touchmove = function( event ) {
      
    switch ( event.touches.length ) {

      case 1: // one-fingered touch 
   
        var x = event.touches[ 0 ].pageX - this.lastFingersPosition.x ;
        var y = this.lastFingersPosition.y - event.touches[ 0 ].pageY ; 
        break;

      case 2: // two-fingered touch: WASD
        var x = event.touches[ 0 ].pageX - this.lastFingersPosition.x ;
        var y = this.lastFingersPosition.y - event.touches[ 0 ].pageY ;
          
        break;

      case 3: // three-fingered touch: UP/DOWN

        var x = event.touches[ 0 ].pageX - this.lastFingersPosition.x ;
        var y = this.lastFingersPosition.y - event.touches[ 0 ].pageY ;
         
        break;
   
    }
    
    this.lastFingersPosition = { x : event.touches[ 0 ].pageX, y : event.touches[ 0 ].pageY };

  }
  Multitouch.prototype.onDocumentMouseUp  = function(event){  
      
  }; 

  return Multitouch;
  
});  
