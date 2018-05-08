'use strict';
define([
  'jquery', 
  'three',
  'explorer',
  'underscore' 
], function(
  jQuery,
  THREE,
  Explorer,
  _
) { 
 
  function NoteManager(lattice, menu, explorer, camera) { 
      
    this.lattice = lattice ; 
    this.menu = menu; 
    this.explorer = explorer;  
    this.camera = camera;  
    this.noteLinesMeshes = [];
    this.lineWeight = 1;
  };
  function updateLine (pointA, pointB, line) {
    
    if(line === undefined) return;

    var distance = pointA.distanceTo(pointB) ; 
    var dir = pointB.clone().sub(pointA).normalize().multiplyScalar(distance/2);

    var newPoint =  pointA.clone().add(dir) ;  
    var direction = new THREE.Vector3().subVectors( pointB, newPoint );
    var direcNorm = direction;
    direcNorm.normalize(); 

    var arrow = new THREE.ArrowHelper( direcNorm ,newPoint );

    line.rotation.set(arrow.rotation.x,arrow.rotation.y,arrow.rotation.z);
  
    line.scale.y = distance ; 
    line.position.set(newPoint.x,newPoint.y,newPoint.z);

  }; 
  NoteManager.prototype.setLineRadius = function(arg) {

    if(_.isUndefined(arg) || arg.radius === undefined) return;
 
    this.lineWeight = parseInt(arg.radius); 

    for (var prop in this.noteLinesMeshes) {  

      this.noteLinesMeshes[prop].scale.x = this.lineWeight;
      this.noteLinesMeshes[prop].scale.z = this.lineWeight;
    }  
  };
  NoteManager.prototype.setLineColor = function(arg) {  
    if(this.noteLinesMeshes[arg.id] === undefined){
      return;
    }
    this.noteLinesMeshes[arg.id].material.color.set( arg.color );
  };
  NoteManager.prototype.addNote = function(arg) {
    
    var _this = this;
    var scene = Explorer.getInstance().object3d; 
    var color = arg.color;

    if(arg.add === true){  
      var scene = Explorer.getInstance().object3d;
  
      var meshGeometry = new THREE.CylinderGeometry(  0.01, 0.01, 1, 8, 8 ); 

      if(color === undefined) color = '#ffffff';

      var mesh = new THREE.Mesh( meshGeometry,  new THREE.MeshBasicMaterial( {   color: color } ) );

      mesh.rotation.set(0,1,0);
      mesh.scale.z = this.lineWeight; 
      mesh.scale.x = this.lineWeight; 
      mesh.scale.y = 1; 
      mesh.position.set(0,0,0);

      this.noteLinesMeshes[arg.id] = mesh;
      this.noteLinesMeshes[arg.id].visible = false;
      scene.add(mesh);
    }
    else if(arg.add === false){
      scene.remove(this.noteLinesMeshes[arg.id]); 
    }

    for (var i = this.lattice.actualAtoms.length - 1; i >= 0; i--) { 
      if(this.lattice.actualAtoms[i].outlineMesh !== undefined){
        scene.remove(this.lattice.actualAtoms[i].outlineMesh);
        this.lattice.actualAtoms[i].outlineMesh = undefined;
      }
    };
 
    for (var prop in this.noteLinesMeshes) { 

      var id = parseInt(prop);

      if(arg.id !== id || arg.add === true){ 
        for (var j = this.lattice.actualAtoms.length - 1; j >= 0; j--) {
          
          if(this.lattice.actualAtoms[j].uniqueID === id){ 
            var outlineMaterial1 = new THREE.MeshBasicMaterial( { opacity : this.lattice.actualAtoms[j].object3d.children[0].material.opacity,color: 0x0040FF, transparent : true, side: THREE.BackSide } );
            var outlineMesh1 = new THREE.Mesh( this.lattice.actualAtoms[j].object3d.children[0].geometry.clone(), outlineMaterial1 );
            outlineMesh1.position.set(this.lattice.actualAtoms[j].object3d.position.x, this.lattice.actualAtoms[j].object3d.position.y, this.lattice.actualAtoms[j].object3d.position.z);
            
            var sc = this.lattice.actualAtoms[j].getScaledRadius();
            outlineMesh1.scale.set( sc , sc , sc );     
            outlineMesh1.scale.multiplyScalar(1.05);
            this.lattice.actualAtoms[j].outlineMesh = outlineMesh1 ;
            scene.add( this.lattice.actualAtoms[j].outlineMesh ); 
          }
        } 
      } 
    }  
    if(arg.add === false){
      this.noteLinesMeshes[arg.id] = undefined;
    }
  };
  NoteManager.prototype.updateNotesPositions = function(arg) { 
     
    this.camera.updateMatrixWorld();
    
    this.explorer.plane.object3d.lookAt(this.camera.position);
    var cameToCenterScaled = this.camera.position.clone();
    cameToCenterScaled.setLength(cameToCenterScaled.length()*0.75);
    this.explorer.plane.object3d.position.set(cameToCenterScaled.x, cameToCenterScaled.y, cameToCenterScaled.z);
    this.explorer.plane.object3d.updateMatrixWorld();

    var notes = this.menu.getAtomNoteTable();
     
    for (var i = notes.length - 1; i >= 0; i--) { 
      this.noteMove({ id : parseInt(notes[i].id), x : notes[i].x, y : notes[i].y }, 'camera');
    };

  };
 

  NoteManager.prototype.noteMove = function(arg, whatMoved) { 
 
    var _this = this;
  
    if(this.noteLinesMeshes[arg.id] === undefined){
      return;
    }
    
    var atom = _.find(_this.lattice.actualAtoms, function(a){ return a.uniqueID === arg.id; }); 

    if(atom === undefined) return;

    var atomPos = atom.object3d.position.clone();
  
    var notePos = this.findNotePoint(arg.x, arg.y); 
     
    updateLine(atomPos, notePos, this.noteLinesMeshes[arg.id]); 
 
  };
  NoteManager.prototype.noteVisibility = function(arg) {
     
    var _this = this; 
    
    arg.id = parseInt(arg.id);
    if(arg.visible === true){ 
       
      var atom = _.find(_this.lattice.actualAtoms, function(a){ return a.uniqueID === arg.id; });

      if(atom === undefined || this.noteLinesMeshes[arg.id] === undefined){
        return;
      }
 
      var atomPos = atom.object3d.position.clone();
      var notePos = this.findNotePoint(arg.x, arg.y);
      updateLine(atomPos, atomPos, this.noteLinesMeshes[arg.id]); 
      this.noteLinesMeshes[arg.id].visible = true;
    } 
    else if(arg.visible === false){
      this.noteLinesMeshes[arg.id].visible = false; 
    } 
  };
  NoteManager.prototype.visibilityOfLine = function(arg) {

  };  
  NoteManager.prototype.findNotePoint = function(x,y){  
     
    var width = jQuery('#app-container').width() ;
    var height = $(window).height() ;

    var raycaster = new THREE.Raycaster(); 

    var x_ = (x/width)*2 - 1 ;
    var y_ = -1*(y/height)*2 + 1 ;
    
    this.camera.updateMatrixWorld();
    raycaster.setFromCamera( new THREE.Vector2( x_, y_ ) , this.camera ); 
  
    var intersects = raycaster.intersectObject( this.explorer.plane.object3d );
    
    var notePos;

    if(intersects.length > 0){  
      notePos = intersects[0].point.clone() ;
    }
    else{ 
      notePos = new THREE.Vector3(0,0,0);
    }
 
    return notePos ;
 
  };  
  return NoteManager;

});
