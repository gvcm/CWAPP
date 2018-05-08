/*jslint browser: true*/
/*global define*/
'use strict';

define([
  'three', 
  'pubsub',
  'underscore'
], function(
  THREE, 
  PubSub,
  _
) { 

  function NavArrows( scene, latticeParams) {
    var width = jQuery('#app-container').width() ;
    var height = jQuery(window).height() ; 
    this.arrowLength =  (height/100)  ; 
    this.scene = scene ;
    this.angles = {'alpha':90, 'beta':90, 'gamma':90 }; 
     
    // arrows
    var startA = new THREE.Vector3(0,0,0);
    var endA = new THREE.Vector3(0,0,this.arrowLength);
    var length =  startA.distanceTo(endA) ; 
    var directionA = new THREE.Vector3().subVectors( endA,  startA).normalize();
    this.arrowA = new THREE.ArrowHelper( directionA , startA, length , "#045FB4", 1, 0.3);

    var startB = new THREE.Vector3(0,0,0);
    var endB = new THREE.Vector3(this.arrowLength,0,0);
    var length =  startB.distanceTo(endB) ; 
    var directionB = new THREE.Vector3().subVectors( endB,  startB).normalize();
    this.arrowB = new THREE.ArrowHelper( directionB , startB, length , "#FF0000", 1, 0.3);

    var startC = new THREE.Vector3(0,0,0);
    var endC = new THREE.Vector3(0,this.arrowLength,0);
    var length =  startC.distanceTo(endC) ; 
    var directionC = new THREE.Vector3().subVectors( endC,  startC).normalize();
    this.arrowC = new THREE.ArrowHelper( directionC, startC, length , "#04B404", 1, 0.3);
  
    scene.add( this.arrowC ); 
    scene.add( this.arrowB ); 
    scene.add( this.arrowA );  
    
    var startOfAxis = new THREE.Mesh( new THREE.SphereGeometry( 0.15, 8,8), new THREE.MeshBasicMaterial({color: 0xFFFFBE}));
    scene.add(startOfAxis);

    // a,b,c lengths
    var aLabel = THREE.TextureLoader( "Images/a.png" );  
    var aMaterial = new THREE.SpriteMaterial( { map: aLabel, color: 0xffffff, fog: true } );
    this.spriteA = new THREE.Sprite( aMaterial );
     
    this.spriteA.position.set(0,-1,this.arrowLength+0.5);
    this.spriteA.scale.set(1.8,1.8,1.8);
    scene.add( this.spriteA );

    var bLabel = THREE.TextureLoader( "Images/b.png" );
    var bMaterial = new THREE.SpriteMaterial( { map: bLabel, color: 0xffffff, fog: true } );
    this.spriteB = new THREE.Sprite( bMaterial );
     
    this.spriteB.position.set(this.arrowLength+0.5,0,0);
    this.spriteB.scale.set(1.8,1.8,1.8);
    scene.add( this.spriteB );

    var cLabel = THREE.TextureLoader( "Images/c.png" );  
    var cMaterial = new THREE.SpriteMaterial( { map: cLabel, color: 0xffffff, fog: true } );
    this.spriteC = new THREE.Sprite( cMaterial );
     
    this.spriteC.position.set(0,this.arrowLength+0.5,0);
    this.spriteC.scale.set(1.8,1.8,1.8);
    scene.add( this.spriteC );

    // angles and their curves
     
    var medianAlpha = median( new THREE.Vector3(endC.x/5, endC.y/5, endC.z/5), new THREE.Vector3(endB.x/5, endB.y/5, endB.z/5) );
    medianAlpha.setLength(medianAlpha.length()*1.2);

    this.alphaCurve = curve(
        10, 
        new THREE.Vector3(endC.x/5, endC.y/5, endC.z/5          ),  
        medianAlpha,  
        new THREE.Vector3(endB.x/5, endB.y/5, endB.z/5          ),  
        0xEE8D05
    );  

    var medianBeta = median( new THREE.Vector3(endC.x/5, endC.y/5, endC.z/5), new THREE.Vector3(endA.x/5, endA.y/5, endA.z/5) );
    medianBeta.setLength(medianBeta.length()*1.2);
    this.betaCurve = curve(
        10, 
        new THREE.Vector3(endC.x/5, endC.y/5, endC.z/5),  
        medianBeta,  
        new THREE.Vector3(endA.x/5, endA.y/5, endA.z/5),  
        0xEFA0FEE 
    );

    var medianGamma = median( new THREE.Vector3(endA.x/5, endA.y/5, endA.z/5), new THREE.Vector3(endB.x/5, endB.y/5, endB.z/5) );
    medianGamma.setLength(medianGamma.length()*1.2);
    this.gammaCurve = curve(
        10, 
        new THREE.Vector3(endA.x/5, endA.y/5, endA.z/5          ),  
        medianGamma,  
        new THREE.Vector3(endB.x/5, endB.y/5, endB.z/5          ),  
        0xF4D1AA
    );
    scene.add(this.alphaCurve);
    scene.add(this.betaCurve);
    scene.add(this.gammaCurve);

    this.beta = makeTextSprite( "              α : 90° ", 
      { fontsize: 40, fontface: "Arial", borderColor: {r:0, g:0, b:255, a:1.0},     fontColor: {r:238, g:141, b:5, a:1.0} } );
    this.beta.position.set(medianAlpha.x, medianAlpha.y, medianAlpha.z);
    scene.add( this.beta );
    
    this.alpha = makeTextSprite( "  β : 90° ", 
      { fontsize: 40, fontface: "Arial", borderColor: {r:0, g:0, b:255, a:1.0},     fontColor: {r:255, g:25, b:117, a:1.0} } );  
    this.alpha.position.set(medianBeta.x, medianBeta.y - 0.5, medianBeta.z);
   scene.add( this.alpha );
    
    this.gamma = makeTextSprite( "         γ : 90° ", 
      { fontsize: 40, fontface: "Arial", borderColor: {r:239, g:160, b:254, a:1.0}, fontColor: {r:244, g:209, b:170, a:1.0}  } );
    this.gamma.position.set(medianGamma.x + 2, medianGamma.y - 3, medianGamma.z + 2);
    scene.add( this.gamma );

  };
  NavArrows.prototype.updateAngles = function(angle) {
    var l = this.arrowLength ;
    var _this = this; 
    var matrix;
 
    if(angle.alpha !== undefined) _this.angles.alpha = parseInt(angle.alpha);  
    if(angle.beta  !== undefined) _this.angles.beta  = parseInt(angle.beta);  
    if(angle.gamma !== undefined) _this.angles.gamma = parseInt(angle.gamma);  
  
    var endA = new THREE.Vector3(0,0,l);  
    var endC = new THREE.Vector3(0,l,0); 
      
    _.each(_this.angles, function(angle, a ) {
        var argument ={};
        argument[a] = angle;
        matrix = transformationMatrix(argument);
        endA.applyMatrix4(matrix);
        endC.applyMatrix4(matrix);
    });
    
    var startA = new THREE.Vector3(0,0,0);  
    var directionA = new THREE.Vector3().subVectors(endA,  startA).normalize(); 
    this.arrowA.position.set(startA.x, startA.y, startA.z);
    this.arrowA.setDirection(directionA.normalize()); 
    this.arrowA.setLength(l);

    var startC = new THREE.Vector3(0,0,0); 
    var directionC = new THREE.Vector3().subVectors(endC,  startC).normalize(); 
    this.arrowC.position.set(startC.x, startC.y, startC.z);
    this.arrowC.setDirection(directionC.normalize()); 
    this.arrowC.setLength(l);
    
    var cPos = directionC.setLength(l);
    var aPos = directionA.setLength(l);

    // sprites
    this.spriteA.position.set(aPos.x, aPos.y, aPos.z + 1);
    this.spriteC.position.set(cPos.x, cPos.y + 1, cPos.z );

    // curves 
 
    this.scene.remove(this.alphaCurve);
    var medianAlpha = median( new THREE.Vector3(endC.x/5, endC.y/5, endC.z/5), new THREE.Vector3(this.arrowLength/5, 0, 0) );
    medianAlpha.setLength(medianAlpha.length()*1.2);
    this.alphaCurve = 
    curve(
        10, 
        new THREE.Vector3(endC.x/5, endC.y/5, endC.z/5    ),  
        medianAlpha,  
        new THREE.Vector3(this.arrowLength/5, 0, 0        ),  
        0xEE8D05
    );  
    this.scene.add(this.alphaCurve);

    this.scene.remove(this.betaCurve);
    var medianBeta = median(new THREE.Vector3(endC.x/5, endC.y/5, endC.z/5), new THREE.Vector3(endA.x/5, endA.y/5, endA.z/5) );
    medianBeta.setLength(medianBeta.length()*1.2);
    this.betaCurve = 
    curve(
        10, 
        new THREE.Vector3(endC.x/5, endC.y/5, endC.z/5),  
        medianBeta,  
        new THREE.Vector3(endA.x/5, endA.y/5, endA.z/5),  
        0xEFA0FEE 
    ); 
    this.scene.add(this.betaCurve); 

    this.scene.remove(this.gammaCurve);
    var medianGamma = median( new THREE.Vector3(endA.x/5, endA.y/5, endA.z/5), new THREE.Vector3(this.arrowLength/5, 0, 0 ) );
    medianGamma.setLength(medianGamma.length()*1.2);
    this.gammaCurve = 
    curve(
        10, 
        new THREE.Vector3(endA.x/5, endA.y/5, endA.z/5          ),  
        medianGamma,  
        new THREE.Vector3(this.arrowLength/5, 0, 0          ),  
        0xF4D1AA
    );  
    this.scene.add(this.gammaCurve);

    // sprites
    if(angle.beta !== undefined)  { 
        this.scene.remove(this.beta);
        this.beta = makeTextSprite( "              α : "+angle.beta+"° ", 
          { fontsize: 40, fontface: "Arial", borderColor: {r:0, g:0, b:255, a:1.0},     fontColor: {r:238, g:141, b:5, a:1.0} } );
        this.beta.position.set(medianAlpha.x, medianAlpha.y  , medianAlpha.z);
        this.scene.add( this.beta );
    }
    if(angle.alpha  !== undefined)  {  
        this.scene.remove(this.alpha);
        this.alpha = makeTextSprite( "β : "+angle.alpha+"° ", 
          { fontsize: 40, fontface: "Arial", borderColor: {r:0, g:0, b:255, a:1.0},     fontColor: {r:255, g:25, b:117, a:1.0} } );  
        this.alpha.position.set(medianBeta.x, medianBeta.y - 0.5 , medianBeta.z);
        this.scene.add( this.alpha );
    }
    if(angle.gamma !== undefined)  {  
        this.scene.remove(this.gamma);
        this.gamma = makeTextSprite( "         γ : "+angle.gamma+"° ", 
          { fontsize: 40, fontface: "Arial", borderColor: {r:239, g:160, b:254, a:1.0}, fontColor: {r:244, g:209, b:170, a:1.0}  } );
        this.gamma.position.set(medianGamma.x + 2, medianGamma.y - 3, medianGamma.z + 2);
        this.scene.add( this.gamma ); 
    }

};
function median(v1,v2){
    var x = (v1.x+v2.x)/2;
    var y = (v1.y+v2.y)/2;
    var z = (v1.z+v2.z)/2;
    return (new THREE.Vector3(x,y,z));
}
var transformationMatrix = function(parameter) {
      
    // According to wikipedia model
    var ab = Math.tan((90 - ((parameter.beta) || 90)) * Math.PI / 180);
    var ac = Math.tan((90 - (parameter.gamma || 90)) * Math.PI / 180);
    var xy = 0;
    var zy = 0;
    var xz = 0;
    var bc = Math.tan((90 - (( parameter.alpha) || 90)) * Math.PI / 180);

    var sa = parameter.scaleX || 1; 
    var sb = parameter.scaleY || 1;
    var sc = parameter.scaleZ || 1; 
    
    var m = new THREE.Matrix4();
    m.set(
      sa, ab, ac,  0,
      xy, sb, zy,  0,
      xz, bc, sc,  0,
       0,  0,  0,  1
    );
    return m;
  };
  function curve(numPoints, a, b, c , mat){
    // smooth my curve over this many points

    var spline = new THREE.SplineCurve3([
       a, b, c
    ]);

    var material = new THREE.LineBasicMaterial({
        color: mat,
    });

    var geometry = new THREE.Geometry();
    var splinePoints = spline.getPoints(numPoints);

    for(var i = 0; i < splinePoints.length; i++){
        geometry.vertices.push(splinePoints[i]);  
    }

    var line = new THREE.Line(geometry, material);
    return line;
  }
  function makeTextSprite( message, parameters )
  {
    if ( parameters === undefined ) parameters = {};
    
    var fontface = parameters.hasOwnProperty("fontface") ?  parameters["fontface"] : "Arial"; 
    var fontsize = parameters.hasOwnProperty("fontsize") ? parameters["fontsize"] : 18; 
    var borderThickness = parameters.hasOwnProperty("borderThickness") ?   parameters["borderThickness"] : 0; 
    var borderColor = parameters.hasOwnProperty("borderColor") ? parameters["borderColor"] : { r:0, g:0, b:0, a:1.0 }; 
    var backgroundColor = parameters.hasOwnProperty("backgroundColor") ? parameters["backgroundColor"] : { r:255, g:255, b:255, a:0};
  
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    context.font = " bold " + fontsize + "px " + fontface;
      
    // get size data (height depends only on font size)
    var metrics = context.measureText( message );
    var textWidth = metrics.width;
    
    // background color
    context.fillStyle   = "rgba(" + backgroundColor.r + "," + backgroundColor.g + ","  + backgroundColor.b + "," + backgroundColor.a + ")";
    // border color
    context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + ","  + borderColor.b + "," + borderColor.a + ")";

    context.lineWidth = borderThickness;
    //roundRect(context, borderThickness/2, borderThickness/2, textWidth + borderThickness, fontsize * 1.4 + borderThickness, 6);
    // 1.4 is extra height factor for text below baseline: g,j,p,q.
    
    // text color 
    context.fillStyle = "rgba("+parameters.fontColor.r+", "+parameters.fontColor.g+", "+parameters.fontColor.b+", 1.0)";

    context.fillText( message, borderThickness, fontsize + borderThickness);
    
    // canvas contents will be used for a texture
    var texture = new THREE.Texture(canvas) 
    texture.needsUpdate = true;

    var spriteMaterial = new THREE.SpriteMaterial( 
      { map: texture, useScreenCoordinates: false, transparent:true, opacity:1 } );
    var sprite = new THREE.Sprite( spriteMaterial );
    sprite.scale.set(10,5,1.0);
    return sprite;  
  }

  // function for drawing rounded rectangles
  function roundRect(ctx, x, y, w, h, r) 
  {
    ctx.beginPath();
    ctx.moveTo(x+r, y);
    ctx.lineTo(x+w-r, y);
    ctx.quadraticCurveTo(x+w, y, x+w, y+r);
    ctx.lineTo(x+w, y+h-r);
    ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
    ctx.lineTo(x+r, y+h);
    ctx.quadraticCurveTo(x, y+h, x, y+h-r);
    ctx.lineTo(x, y+r);
    ctx.quadraticCurveTo(x, y, x+r, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();   
  }
  return NavArrows;
  
});
