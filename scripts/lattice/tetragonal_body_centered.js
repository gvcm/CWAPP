'use strict';

define(function() {
  return {
    originArray: [
      { x: 0,   y: 0,   z: 0   },
      { x: 0.5, y: 0.5, z: 0.5 }
    ], 
    latticeType: "body", 
    latticeSystem: "tetragonal",
    vector: { x: 1, y: 1, z: 1 },
    defaults: {
      'scaleX': 1.000,
      'scaleY': 1.500,
      'scaleZ': 1.000,
      'alpha': 90,
      'beta': 90,
      'gamma': 90
    },
    restrictions: {
      'scaleX': {
        'scaleZ': '=',
        'scaleY': '≠',
      },
      'scaleY': {
        'scaleZ': '≠',
        'scaleX': '≠'
      },
      'scaleZ': {
        'scaleX': '=',
        'scaleY': '≠'
      }, 
      'alpha': {
        '90': '='
      },
      'beta': {
        '90': '='
      },
      'gamma': {
        '90': '='
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
