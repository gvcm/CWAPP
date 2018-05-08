'use strict';

function crystalWalkState() {

  // private variables using closure
  var currentLoadedLattice = undefined;

  var latticeParameters = {
    grid : {
      visible : true,
      color : '#FFFFFF'
    },
    points : undefined
  }
  // return methods to access private variables
  return { 
    setLatticePoints : function (points) {
      if(points){
        latticeParameters.points = points;
      }
    },
    getLatticePoints : function () {
      return latticeParameters.points;
    },
    getLatticeParameters : function (lattice) {
      return latticeParameters;
    },
    setCurrentLoadedLattice : function (lattice) {
      if(lattice){
        currentLoadedLattice = lattice;
      }
    },
    getCurrentLoadedLattice : function (lattice) {
      return currentLoadedLattice;
    } 
  };
};
