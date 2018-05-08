'use strict';
define([
  'jquery', 
  'three', 
  'pubsub',
  'underscore'
], function(
  jQuery, 
  THREE, 
  PubSub,
  _
) { 

  function NavArrows( scene, latticeParams, visible) {
    var width = jQuery('#app-container').width() ;
    var height = jQuery(window).height() ; 
    this.arrowLength = 8 ;  
    this.visibility = true;

    this.scene = scene ;
    this.angles = {'alpha':90, 'beta':90, 'gamma':90 }; 
    this.scales = {'aScale':1, 'bScale':1, 'cScale':1 }; 
     
    // arrows
    var arrowHcolor = '#5B3D82';

    var startA = new THREE.Vector3(0,0,0);
    var endA = new THREE.Vector3(0,0,this.arrowLength);
    var length =  startA.distanceTo(endA) ; 
    var directionA = new THREE.Vector3().subVectors( endA,  startA).normalize();
    this.arrowA = new THREE.ArrowHelper( directionA , startA, length , arrowHcolor , undefined, this.arrowLength/10);

    var startB = new THREE.Vector3(0,0,0);
    var endB = new THREE.Vector3(this.arrowLength,0,0);
    var length =  startB.distanceTo(endB) ; 
    var directionB = new THREE.Vector3().subVectors( endB,  startB).normalize();
    this.arrowB = new THREE.ArrowHelper( directionB , startB, length , arrowHcolor , undefined, this.arrowLength/10);

    var startC = new THREE.Vector3(0,0,0);
    var endC = new THREE.Vector3(0,this.arrowLength,0);
    var length =  startC.distanceTo(endC) ; 
    var directionC = new THREE.Vector3().subVectors( endC,  startC).normalize();
    this.arrowC = new THREE.ArrowHelper( directionC, startC, length , arrowHcolor, undefined, this.arrowLength/10);
  
    scene.add( this.arrowC ); 
    scene.add( this.arrowB ); 
    scene.add( this.arrowA );  
    
    this.startOfAxis = new THREE.Mesh( new THREE.SphereGeometry( 0.15, 8,8), new THREE.MeshBasicMaterial({color: 0xFFFFBE}));
    scene.add(this.startOfAxis);

    // a,b,c lengths
     
    this.aScale = makeTextSprite( 
        "  a : 1 ",  
        { 
            fontsize: this.arrowLength*6, 
            fontface: "Arial", 
            borderColor: {r:0, g:128, b:255, a:1.0},     
            fontColor: {r:111, g:98, b:153, a:1.0},
            fontStyle: ' ' 
        } 
    );
    this.aScale.position.set(1.5,-1.5,this.arrowLength+0.5);
    scene.add( this.aScale  );
    
    this.bScale = makeTextSprite( 
        "        b : 1 ",  
        { 
            fontsize: this.arrowLength*6, 
            fontface: "Arial", 
            borderColor: {r:0, g:0, b:255, a:1.0},     
            fontColor: {r:111, g:98, b:153, a:1.0},
            fontStyle: ' '  
        } 
    );
    this.bScale.position.set(this.arrowLength+2,-1,0);
    scene.add( this.bScale  );

    this.cScale = makeTextSprite( 
        "       c : 1 ",  
        { 
            fontsize: this.arrowLength*6, 
            fontface: "Arial", 
            borderColor: {r:0, g:0, b:255, a:1.0},     
            fontColor: {r:111, g:98, b:153, a:1.0},
            fontStyle: ' '  
        } 
    );
    this.cScale.position.set(0,this.arrowLength-0.5,0);
    scene.add( this.cScale  );
  
    // angles and their curves
     
    var medianAlpha = median( new THREE.Vector3(endC.x/5, endC.y/5, endC.z/5), new THREE.Vector3(endB.x/5, endB.y/5, endB.z/5) );
    medianAlpha.setLength(medianAlpha.length()*1.2);

    this.alphaCurve = curve(
        10, 
        new THREE.Vector3(endC.x/5, endC.y/5, endC.z/5          ),  
        medianAlpha,  
        new THREE.Vector3(endB.x/5, endB.y/5, endB.z/5          ),  
        0xDFD2DF
    );  

    var medianBeta = median( new THREE.Vector3(endC.x/5, endC.y/5, endC.z/5), new THREE.Vector3(endA.x/5, endA.y/5, endA.z/5) );
    medianBeta.setLength(medianBeta.length()*1.2);
    this.betaCurve = curve(
        10, 
        new THREE.Vector3(endC.x/5, endC.y/5, endC.z/5),  
        medianBeta,  
        new THREE.Vector3(endA.x/5, endA.y/5, endA.z/5),  
        0xDFD2DF 
    );

    var medianGamma = median( new THREE.Vector3(endA.x/5, endA.y/5, endA.z/5), new THREE.Vector3(endB.x/5, endB.y/5, endB.z/5) );
    medianGamma.setLength(medianGamma.length()*1.2);
    this.gammaCurve = curve(
        10, 
        new THREE.Vector3(endA.x/5, endA.y/5, endA.z/5          ),  
        medianGamma,  
        new THREE.Vector3(endB.x/5, endB.y/5, endB.z/5          ),  
        0xDFD2DF
    );
    scene.add(this.alphaCurve);
    scene.add(this.betaCurve);
    scene.add(this.gammaCurve);

    this.beta = makeTextSprite( 
        "    α : 90° ",  
        {   fontsize: this.arrowLength*6 , 
            fontface: "Arial", 
            borderColor: {r:0, g:0, b:255, a:1.0},     
            fontColor: {r:223, g:210, b:223, a:1.0} 
        } 
    );
    this.beta.position.set(medianAlpha.x + 5, medianAlpha.y, medianAlpha.z);
    scene.add( this.beta );
    
    this.alpha = makeTextSprite( 
        "β : 90° ", 
        {   fontsize: this.arrowLength*6 , 
            fontface: "Arial", 
            borderColor: {r:0, g:0, b:255, a:1.0},     
            fontColor: {r:223, g:210, b:223, a:1.0} 
        } 
    );  
    this.alpha.position.set(medianBeta.x - 2, medianBeta.y - 0.5, medianBeta.z);
   scene.add( this.alpha );
    
    this.gamma = makeTextSprite( 
        "    γ : 90° ", 
        {   fontsize: this.arrowLength*6 , 
            fontface: "Arial", 
            borderColor: {r:0, g:0, b:255, a:1.0}, 
            fontColor: {r:223, g:210, b:223, a:1.0}  
        } 
    );
    this.gamma.position.set(medianGamma.x + 2.5, medianGamma.y - 3, medianGamma.z + 2);
    scene.add( this.gamma );

    this.setVisibility(visible);
    
};
NavArrows.prototype.setVisibility = function(bool) {
    if(bool === undefined){
        bool = this.visibility;
    }
    this.visibility = bool;
    
    this.aScale.visible = bool;
    this.bScale.visible = bool;
    this.cScale.visible = bool;

    this.alpha.visible = bool;
    this.beta.visible = bool;
    this.gamma.visible = bool;

    this.arrowA.visible = bool;
    this.arrowB.visible = bool;
    this.arrowC.visible = bool;

    this.alphaCurve.visible = bool;
    this.betaCurve.visible = bool;
    this.gammaCurve.visible = bool;

    this.startOfAxis.visible = bool; 

};
NavArrows.prototype.updateLengths = function(params) {
    var l = this.arrowLength ;
    var _this = this;  
 
    if(params.scaleZ !== undefined) this.scales.aScale = (parseFloat(params.scaleZ)).toFixed(1);  
    if(params.scaleX !== undefined) this.scales.bScale  = (parseFloat(params.scaleX)).toFixed(1);   
    if(params.scaleY !== undefined) this.scales.cScale = (parseFloat(params.scaleY)).toFixed(1);   

    var scene = this.scene ;
   
    // sprites
    if(params.scaleZ !== undefined)  { 
        this.scene.remove(this.aScale); 
        this.aScale = makeTextSprite( 
            "  a : "+this.scales.aScale,  
            {   fontsize: this.arrowLength*6, 
                fontface: "Arial", 
                borderColor:  {r:0, g:128, b:255, a:1.0},     
                fontColor:  {r:111, g:98, b:153, a:1.0},
                fontStyle: ' '  
            } 
        ); 
        scene.add( this.aScale  );
    }
    if(params.scaleX !== undefined)  { 
        this.scene.remove(this.bScale);
        this.bScale = makeTextSprite( 
            "      b : "+this.scales.bScale,  
            {   fontsize: this.arrowLength*6, 
                fontface: "Arial", 
                borderColor: {r:0, g:0, b:255, a:1.0},     
                fontColor: {r:111, g:98, b:153, a:1.0},
                fontStyle: ' '  
            } 
        );
        this.bScale.position.set(this.arrowLength+0.5,-1,0);
        scene.add( this.bScale  );
    }
    if(params.scaleY !== undefined)  { 
        this.scene.remove(this.cScale);
        this.cScale = makeTextSprite( 
            "    c : "+this.scales.cScale,  
            {   fontsize: this.arrowLength*6, 
                fontface: "Arial", 
                borderColor: {r:0, g:128, b:5, a:1.0},     
                fontColor: {r:111, g:98, b:153, a:1.0},
                fontStyle: ' '  
            }  
        );  
        this.cScale.position.set(0,8,0);
        scene.add( this.cScale  );
    }

};
NavArrows.prototype.updateAngles = function(angle) {
    var l = this.arrowLength ;
    var _this = this; 
    var matrix;
 
    if(angle.alpha !== undefined) _this.angles.alpha = (parseInt(angle.alpha)).toFixed(1);   
    if(angle.beta  !== undefined) _this.angles.beta  = (parseInt(angle.beta)).toFixed(1);   
    if(angle.gamma !== undefined) _this.angles.gamma = (parseInt(angle.gamma)).toFixed(1);   
  
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
    this.arrowA.setLength(l, undefined, this.arrowLength/10);

    var startC = new THREE.Vector3(0,0,0); 
    var directionC = new THREE.Vector3().subVectors(endC,  startC).normalize(); 
    this.arrowC.position.set(startC.x, startC.y, startC.z);
    this.arrowC.setDirection(directionC.normalize()); 
    this.arrowC.setLength(l, undefined, this.arrowLength/10);
    
    var cPos = directionC.setLength(l);
    var aPos = directionA.setLength(l);

    // sprites
    this.aScale.position.set(aPos.x +2, aPos.y - 1.5, aPos.z + 1.5); // (0,-1.5,this.arrowLength+0.5);
    
    this.cScale.position.set(cPos.x + 2, cPos.y-0.5 , cPos.z );  
    this.bScale.position.set(this.arrowLength + 3,-1,0); 
 
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
        0xDFD2DF
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
        0xDFD2DF 
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
        0xDFD2DF
    );  
    this.scene.add(this.gammaCurve);

    // sprites
    if(angle.beta !== undefined)  { 
        this.scene.remove(this.beta);
        this.beta = makeTextSprite( 
            "    α : "+_this.angles.beta+"° ", 
            {     fontsize: this.arrowLength*6 , 
                fontface: "Arial", 
                borderColor: {r:0, g:0, b:255, a:1.0},     
                fontColor: {r:223, g:210, b:223, a:1.0} 
            } 
        );
        this.beta.position.set(medianAlpha.x + 5, medianAlpha.y  , medianAlpha.z);
        this.scene.add( this.beta );
    }
    if(angle.alpha  !== undefined)  {  
        this.scene.remove(this.alpha);
        this.alpha = makeTextSprite( 
            "β : "+_this.angles.alpha+"° ", 
            {   fontsize: this.arrowLength*6 , 
                fontface: "Arial", 
                borderColor: {r:255, g:5, b:5, a:1.0},     
                fontColor: {r:223, g:210, b:223, a:1.0} 
            } 
        );  
        this.alpha.position.set(medianBeta.x -2, medianBeta.y - 0.5 , medianBeta.z);
        this.scene.add( this.alpha );
    }
    if(angle.gamma !== undefined)  {  
        this.scene.remove(this.gamma);
        this.gamma = makeTextSprite( 
            "      γ : "+_this.angles.gamma+"° ", 
            {   fontsize: this.arrowLength*6 , 
                fontface: "Arial", 
                borderColor: {r:255, g:5, b:5, a:1.0}, 
                fontColor: {r:223, g:210, b:223, a:1.0}  
            } 
        );
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

    var spline = new THREE.CatmullRomCurve3([
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
  function makeTextSprite( message, parameters ) { 
    if ( parameters === undefined ) parameters = {};
    
    var fontStyle = parameters.hasOwnProperty("fontStyle") ?  parameters["fontStyle"] : " italic "; 
    var fontface = parameters.hasOwnProperty("fontface") ?  parameters["fontface"] : "Open Sans"; // not found 
    var fontsize = parameters.hasOwnProperty("fontsize") ? parameters["fontsize"] : 18; 
    var borderThickness = parameters.hasOwnProperty("borderThickness") ?   parameters["borderThickness"] : 0; 
    var borderColor = parameters.hasOwnProperty("borderColor") ? parameters["borderColor"] : { r:0, g:0, b:0, a:1.0 }; 
    var backgroundColor = parameters.hasOwnProperty("backgroundColor") ? parameters["backgroundColor"] : { r:255, g:255, b:255, a:0};
  
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    context.font = fontStyle + fontsize + "px " + fontface;
      
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
    texture.minFilter = THREE.NearestFilter;
    texture.needsUpdate = true;

    var spriteMaterial = new THREE.SpriteMaterial( 
      { map: texture, transparent:true, opacity:1 } );
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
