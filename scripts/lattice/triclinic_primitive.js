'use strict';

define(function() {
  return {
    originArray: [
      { x: 0, y: 0, z: 0 }
    ], 
    latticeType: "primitive", 
    latticeSystem: "triclinic",
    vector: { x: 1, y: 1, z: 1 },
    defaults: {
      'scaleX': 1.000,
      'scaleY': 1.200,
      'scaleZ': 2.500,
      'alpha': 60,
      'beta':  70,
      'gamma': 80 
    },
    restrictions: {
      'scaleX': {
        'scaleY': '≠',
        'scaleZ': '≠'
      },
      'scaleY': {
        'scaleX': '≠',
        'scaleZ': '≠'
      },
      'scaleZ': {
        'scaleX': '≠',
        'scaleY': '≠'
      }, 
      'gamma': {
        '90': '≠',
        'beta': '≠',
        'alpha': '≠',
      },
      'beta': {
        '90': '≠',
        'alpha': '≠',
        'gamma': '≠'
      },
      'alpha': {
        '90': '≠',
        'beta': '≠',
        'gamma': '≠'
      }
    },
    gridPoints: {

      'first' : [0,0,0],
      'left'  : [1,1,0],
      'right' : [1,0,1],
      'front' : [0,1,1],
    }
  };
});
