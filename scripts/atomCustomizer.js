'use strict';

define([
  'three',
  'explorer',
  'underscore'
], function(
  THREE,
  Explorer,
  _
) { 
 
  function AtomCustomizer(lattice, soundMachine, dollEditor, menu, crystalOrbit, crystalScene) { 
      
    this.lattice = lattice ;
    this.soundMachine = soundMachine ;
    this.menu = menu;
    this.dollEditor = dollEditor;
    this.multiAtomIDs = [];
    this.singleAtom;
    this.editMode = 'multi';
    this.menuIsOpen = false;
    this.crystalOrbit = crystalOrbit;
    this.crystalScene = crystalScene;
  };
 
  AtomCustomizer.prototype.atomJustClicekd = function(atom_, ctrl){ 

    var _this = this;

    if(this.dollEditor.dollOn === true){
      return;
    } 

    if(ctrl === true){
      
      if(this.editMode === 'single'){
        this.closeAtomMenu();
      }

      this.editMode = 'multi';

      var atomID = _.find(this.multiAtomIDs, function(id){ return id === atom_.uniqueID; });

      var atom = _.findWhere(_this.lattice.actualAtoms, {'uniqueID' : atom_.uniqueID});

      if(atom === undefined){
        atom = _.findWhere(_this.lattice.cachedAtoms, {'uniqueID' : atom_.uniqueID});
      }

      if(atomID === undefined){
        this.multiAtomIDs.push(atom.uniqueID);
        atom.cachedColor = atom.color; 
        atom.setColorMaterial(0xCC2EFA); 
      }
      else{
        var index = this.multiAtomIDs.indexOf(atomID); 
        if (index > -1) {
          this.multiAtomIDs.splice(index, 1);
        }
        atom.setColorMaterial(atom.cachedColor);

        if(this.multiAtomIDs.length === 0){
          this.menu.closeAtomCustomizer();
        }
      } 

      if(this.menuIsOpen === true){  
        return;
      }
      else{
        var arg = {   
          'color' : '#CC2EFA',
          'opacity' : 1,
          'visibility' : true,
          'single' : !ctrl
        }   
        this.menu.openAtomCustomizer(arg);
      }
    }
    else{ 
       
      if(this.singleAtom !== undefined){
        this.singleAtom.setColorMaterial();
        this.closeAtomMenu();
        this.menu.closeAtomCustomizer();
        return;
      }
      else{ 
        this.closeAtomMenu();

        this.multiAtomIDs.splice(0);
        this.editMode = 'single';
        atom_.cachedColor = atom_.color;
        atom_.setColorMaterial(0xCC2EFA); 

        this.singleAtom = atom_ ;

        var arg = {
          'name' : atom_.elementName,
          'ionicIndex' : atom_.ionicIndex,
          'radius' : atom_.radius,
          'color' : atom_.color,
          'opacity' : atom_.opacity,
          'visibility' : atom_.visibility, 
          'id' : atom_.uniqueID,
          'single' : !ctrl
        } 
        
        this.menu.openAtomCustomizer(arg);
      }
    }

    this.menuIsOpen = true;

  };

  AtomCustomizer.prototype.closeAtomMenu = function(arg){ 

    var _this = this;

    for (var i = this.lattice.actualAtoms.length - 1; i >= 0; i--) {
      var c = this.lattice.actualAtoms[i].object3d.children[0].material.color;
      if(c.r !== 1 && c.g !== 0 && c.b !== 0){ 
        this.lattice.actualAtoms[i].setColorMaterial(this.lattice.actualAtoms[i].cachedColor);
      }
    }
    for (var i = this.lattice.cachedAtoms.length - 1; i >= 0; i--) { 
      var c = this.lattice.cachedAtoms[i].object3d.children[0].material.color;
      if(c.r !== 1 && c.g !== 0 && c.b !== 0){ 
        this.lattice.cachedAtoms[i].setColorMaterial(this.lattice.cachedAtoms[i].cachedColor);
      }
    }
 
    this.singleAtom = undefined;

    this.multiAtomIDs.splice(0); 
    this.menuIsOpen = false;
  };
  AtomCustomizer.prototype.customizeAtom = function(arg){ 
    var _this = this;
   
    if(arg.finish !== undefined){
      this.closeAtomMenu(arg);
      return;
    } 

    var arr = [];

    if(this.editMode === 'single'){ 
      arr.push(arg.id);
    }
    else if(this.editMode === 'multi'){
      arr = this.multiAtomIDs.slice();
    }

    for (var i = arr.length - 1; i >= 0; i--) {

      var atom = _.findWhere(_this.lattice.actualAtoms, {'uniqueID' : arr[i]});
      if(atom === undefined){
        atom = _.findWhere(_this.lattice.cachedAtoms, {'uniqueID' : arr[i]});
      }
      
      if(atom === undefined){
        return;
      }

      if(arg.opacity !== undefined){
        atom.setOpacity(parseFloat(arg.opacity));
      }
      else if(arg.color !== undefined){
        var col = arg.color;
        if(col.charAt(0) !== '#'){
          col = '#'+col;
        }
        atom.setColorMaterial(col);
        atom.cachedColor = (col);
      }
      else if(arg.visibility !== undefined){  
        atom.setVisibility( arg.visibility); 
      }
      else if(arg.dollMode !== undefined){
        var pos = this.crystalOrbit.camera.position.clone();
        pos.setLength(pos.length() - 1);
        this.crystalScene.movingCube.position.set(pos.x, pos.y, pos.z);
        this.dollEditor.dollMode(atom.object3d);
        this.dollEditor.dollOn = true; 
      } 
      else if(arg.sound !== undefined){ 
        this.soundMachine.atomSourcePos = atom.object3d.position.clone();
      } 
    } 
  };
  return AtomCustomizer;

});
