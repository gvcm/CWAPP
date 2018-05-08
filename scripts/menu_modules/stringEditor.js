/*global define*/
'use strict';

// Dependecies

define([
    'jquery',
    'jquery-ui',
    'pubsub',
    'underscore'
], function(
    jQuery,
    jQuery_ui,
    PubSub, 
    _
) 
{
    // Contructor //
    function stringEditor() {
        
    };
    
    stringEditor.prototype.capitalizeFirstLetter = function(string){
        return string.charAt(0).toUpperCase() + string.slice(1);
    };
    stringEditor.prototype.translateParameter = function(string){
        switch(string){
            case 'scaleX': return 'b';
            case 'scaleY': return 'c';
            case 'scaleZ': return 'a';
            case 'alpha': return 'β';
            case 'beta': return 'α';
            case 'gamma': return 'υ';
            case 'scaleXSlider': return 'b';
            case 'scaleYSlider': return 'c';
            case 'scaleZSlider': return 'a';
            case 'alphaSlider': return 'β';
            case 'betaSlider': return 'α';
            case 'gammaSlider': return 'γ';
            default: return 'Unknown';
        }
    };
    stringEditor.prototype.inputIsInteger = function(string){
        if (!(isNaN(string))) {
            if (string.indexOf('.') === -1) return string;
        }
        return false;
    };
    stringEditor.prototype.inputIsNumber = function(string){
        var result = false;
        if (isNaN(string)) {
            if (string.indexOf(',') !== -1) {
                var temp = string.split(',');
                if (temp.length === 2) result = string.replace(',','.');
            }
            else if (string.indexOf('/') !== -1) {
                var temp = string.split('/');
                if (temp.length === 2) result = (parseFloat(temp[0])/parseFloat(temp[1])).toString();
            }
        }
        else result = string;
        return result;
    };
    stringEditor.prototype.multiply10 = function(string){
        return parseFloat(string) * 10;  
    };
    stringEditor.prototype.divide10 = function(string){
        return parseFloat(string) / 10;  
    };
    stringEditor.prototype.toLowerCase = function(string){
        return string.toLowerCase();   
    };
    
    return stringEditor;
});