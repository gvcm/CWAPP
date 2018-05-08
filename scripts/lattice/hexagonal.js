'use strict';

define(function() {
  return {
    originArray: [
      { x: 0, y: 0, z: 0 }
    ],
    latticeType: "hexagonal", 
    latticeSystem: "hexagonal",
    vector: { x: 1, y: 1, z: 1 },
    defaults: {
      'scaleX': 1.500,
      'scaleY': 1.000,
      'scaleZ': 1.500,
      'gamma': 120,
      'beta': 90,
      'alpha': 90
    },
    gridPoints: {  
    },
    restrictions: {
      'scaleZ': {
        'scaleX': '=',  
        'scaleY': '≠'  
      },
      'scaleX': {
        'scaleZ': '=',
        'scaleY': '≠'
      },
      'scaleY': {
        'scaleZ': '≠',  
        'scaleX': '≠'  
      },
      'alpha': {
        '90': '='
      },
      'beta': {
        '90': '='
      },
      'gamma': {
        '120': '='
      }
    } 
  };
});
