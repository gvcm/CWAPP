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
    // Variables //
    var target = undefined;
    var message = undefined;
    var placement = undefined;
    var xCoord = undefined;
    var yCoord = undefined;
    var other = undefined;
    
    // Element List //
    var elementList = {
        'controls_toggler': 'left',
        'latticeTab': 'left',
        'motifLI': 'left',
        'visualTab': 'left',
        'millerPI': 'left',
        'notesTab': 'left',
        'publicTab': 'left',
        'helpTab': 'left',
        'selected_lattice':'top',
        'latticePadlock':'top',
        'repeatZ':'top',
        'repeatX':'top',
        'repeatY':'top',
        'scaleZ':'top',
        'scaleX':'top',
        'scaleY':'top',
        'beta':'top',
        'alpha':'top',
        'gamma':'top',
        'motifPadlock':'left',
        'latticePreview':'top',
        'latticeAutoRefresh':'top',
        'cube_color_border':'top',
        'cube_color_filled':'top',
        'radius':'top',
        'faceOpacity':'top',
        'newPlanett':'top',
        'millerH':'top',
        'millerK':'top',
        'millerL':'top',
        'millerI':'top',
        'savePlane':'top',
        'planeOpacity':'top',
        'planeColor':'top',
        'planeName':'top',
        'deletePlanett':'top',
        'millerU':'top',
        'millerV':'top',
        'millerW':'top',
        'millerT':'top',
        'newDirectiontt':'top',
        'saveDirection':'top',
        'dirRadius':'top',
        'directionColor':'top',
        'directionName':'top',
        'deleteDirectiontt':'top',
        'atomPalettett':'top',
        'tangency':'top',
        'atomPositioningXYZ':'bottom',
        'atomPositioningABC':'bottom',
        'atomPosZ':'top',
        'atomPosZSlider':'top',
        'atomPosX':'top',
        'atomPosXSlider':'top',
        'atomPosY':'top',
        'atomPosYSlider':'top',
        'atomColor':'top',
        'atomOpacity':'top',
        'previewAtomChanges':'top',
        'saveAtomChanges':'top',
        'deleteAtom':'top',
        'cellVolume':'top',
        'cellVolumeSlider':'top',
        'meLengthA':'top',
        'meLengthB':'top',
        'meLengthC':'top',
        'meAngleA':'top',
        'meAngleB':'top',
        'meAngleG':'top',
        'wireframe':'top',
        'toon':'top',
        'flat':'top',
        'realistic':'top',
        'distortionOn':'top',
        'distortionOff':'top',
        'anaglyph':'top',
        'oculus':'top',
        '3DsideBySide':'top',
        '3DonTop':'top',
        'anaglyphCell':'top',
        'oculusCell':'top',
        '3DsideBySideCell':'top',
        '3DonTopCell':'top',
        'crystalCamTargetOn':'top',
        'crystalCamTargetOff':'top',
        'leapMotion':'top',
        'crystalClassic':'top',
        'crystalSubstracted':'top',
        'crystalSolidVoid':'top',
        'crystalGradeLimited':'top',
        'cellClassic':'top',
        'cellSubstracted':'top',
        'cellSolidVoid':'top',
        'cellGradeLimited':'top',
        'fogColor':'top',
        'fogDensity':'top',
        'fogDensitySlider':'top',
        'sounds':'top',
        'lights':'top',
        'crystalScreenColor':'top',
        'cellScreenColor':'top',
        'motifXScreenColor':'top',
        'motifYScreenColor':'top',
        'motifZScreenColor':'top',
        'autoRenderizationQuality':'top',
        'lowRenderizationQuality':'top',
        'mediumRenderizationQuality':'top',
        'highRenderizationQuality':'top',
        'lodSlider':'top',
        'lights':'top',
        'ssao':'top',
        'shadows':'top',
        'newNotett':'top',
        'noteTitle':'top',
        'noteColor':'top',
        'noteOpacity':'top',
        'noteBody':'top',
        'saveNote':'top',
        'deleteNotett':'top',
        'downloadProject':'top',
        'exportJSON':'top',
        'saveOnlinett':'top',
        'snapshotTT':'top',
        'stlTT':'top',
        'searchQuery':'top',
        'openJSON':'top',
        'motifAuto':'top',
        'motifEdge':'top',
        'saveAtomChanges':'top',
        'lockCameraIcon':'top',
        'rotAngleSection':'top',
        'reset':'top',
        'printMode':'top',
        'screenMode':'top',
        'swapBtn':'bottom',
        'oculusTracker':'top',
        'cardboard':'top',
        'saveCamera':'top',
        'enableParameters':'top'
    };
    
    var $messageList = undefined;
    var $canvasTooltip = jQuery('#canvasTooltip');
    var lattices = {
        cubic_primitive:'Cubic Simple',
        cubic_body_centered:'Cubic Body Centered',
        cubic_face_centered:'Cubic Face Centered',
        tetragonal_primitive:'Tetragonal Simple',
        tetragonal_body_centered:'Tetragonal Body Centered',
        orthorhombic_primitive:'Orthorhombic Simple',
        orthorhombic_body_centered:'Orthorhombic Body Centered',
        orthorhombic_face_centered:'Orthorhombic Face Centered',
        orthorhombic_base_centered:'Orthorhombic Base Centered',
        hexagonal_primitive:'Hexagonal Primitive',
        hexagonal:'Hexagonal',
        rhombohedral_primitive:'Rhombohedral / Trigonal',
        monoclinic_primitive:'Monoclinic Simple',
        monoclinic_base_centered:'Monoclinic Base Centered',
        triclinic_primitive:'Triclinic Simple'
    };
    var restrictions = {
        tetragonal_primitive:'a ≠ c',
        tetragonal_body_centered:'a ≠ c',
        orthorhombic_primitive:'a ≠ b ≠ c',
        orthorhombic_body_centered:'a ≠ b ≠ c',
        orthorhombic_face_centered:'a ≠ b ≠ c',
        orthorhombic_base_centered:'a ≠ b ≠ c',
        rhombohedral_primitive:'α = β = γ ≠ 90°',
        monoclinic_primitive:'β ≠ 90°, α,γ = 90°',
        monoclinic_base_centered:'β ≠ 90°, α,γ = 90°',
        triclinic_primitive:'α,β,γ ≠ 90°'
    };
    var atoms = {
        H  : 'Hydrogen',   
        He : 'Helium', 
        Li : 'Lithium',
        Be : 'Beryllium',
        B  : 'Boron',
        C  : 'Carbon',
        N  : 'Nitrogen',
        O  : 'Oxygen',
        F  : 'Fluorine',
        Ne : 'Neon',
        Na : 'Sodium',
        Mg : 'Magnesium',
        Al : 'Aluminium',
        Si : 'Silicon',
        P  : 'Phosphorus',
        S  : 'Sulfur',
        Cl : 'Chlorine',
        Ar : 'Argon',
        K  : 'Potassium',
        Ca : 'Calcium',
        Sc : 'Scandium',
        Ti : 'Titanium',
        V  : 'Vanadium',
        Cr : 'Chromium',
        Mn : 'Manganese',
        Fe : 'Iron',
        Co : 'Cobalt',
        Ni : 'Nickel',
        Cu : 'Copper',
        Zn : 'Zinc',
        Ga : 'Gallium',
        Ge : 'Germanium',
        As : 'Arsenic',
        Se : 'Selenium',
        Br : 'Bromine',
        Kr : 'Krypton',
        Rb : 'Rubidium',
        Sr : 'Strontium',
        Y  : 'Yttrium',
        Zr : 'Zirconium',
        Nb : 'Niobium',
        Mo : 'Molybdenum',
        Tc : 'Technetium',
        Ru : 'Ruthenium',
        Rh : 'Rhodium',
        Pd : 'Palladium',
        Ag : 'Silver',
        Cd : 'Cadmium',
        In : 'Indium',
        Sb : 'Antimony',
        Sn : 'Tin',
        Te : 'Tellurium',
        I  : 'Iodine',
        Xe : 'Xenon',
        Cs : 'Caesium',
        Ba : 'Barium',
        La : 'Lanthanum',
        Ce : 'Cerium',
        Pr : 'Praseodymium',
        Nd : 'Neodymium',
        Pm : 'Promethium',
        Sm : 'Samarium',
        Eu : 'Europium',
        Gd : 'Gadolinium',
        Tb : 'Terbium',
        Dy : 'Dysprosium',
        Ho : 'Holmium',
        Er : 'Erbium',
        Tm : 'Thulium',
        Yb : 'Ytterbium',
        Lu : 'Lutetium',
        Hf : 'Hafnium',
        Ta : 'Tantalum',
        W  : 'Tungsten',
        Re : 'Rhenium',
        Os : 'Osmium',
        Ir : 'Iridium',
        Pt : 'Platinum',
        Au : 'Gold',
        Hg : 'Mercury',
        Tl : 'Thallium',
        Pb : 'Lead',
        Bi : 'Bismuth',
        Po : 'Polonium',
        At : 'Astatine',
        Rn : 'Radon',
        Fr : 'Francium',
        Ra : 'Radium',
        Ac : 'Actinium',
        Th : 'Thorium',
        Pa : 'Protactinium',
        U  : 'Uranium',
        Np : 'Neptunium',
        Pu : 'Plutonium',
        Am : 'Americium',
        Cm : 'Curium',
        Bk : 'Berkelium',
        Cf : 'Californium',
        Es : 'Einsteinium',
        Fm : 'Fermium',
        Md : 'Mendelevium',
        No : 'Nobelium',
        Lr : 'Lawrencium',
        Rf : 'Rutherfordium',
        Db : 'Dubnium',
        Sg : 'Seaborgium',
        Bh : 'Bohrium',
        Hs : 'Hassium',
        Mt : 'Meitnerium',
        Ds : 'Darmstadtium',
        Rg : 'Roentgenium',
        Cn : 'Copernicium',
        Uut: 'Ununtrium',
        Fl : 'Flerovium',
        Uup: 'Ununpentium',
        Lv : 'Livermorium',
        Uus: 'Ununseptium',
        Uuo: 'Ununoctium'  
    };

    // MOBILE DETECTOR //
    var isMobile = {
        Android: function() {
            return navigator.userAgent.match(/Android/i);
        },
        BlackBerry: function() {
            return navigator.userAgent.match(/BlackBerry/i);
        },
        iOS: function() {
            return navigator.userAgent.match(/iPhone|iPad|iPod/i);
        },
        Opera: function() {
            return navigator.userAgent.match(/Opera Mini/i);
        },
        Windows: function() {
            return navigator.userAgent.match(/IEMobile/i);
        },
        any: function() {
            return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
        }
    };
    
    // Contructor //
    function tooltipGenerator(argument) {
        
        // Acquire Module References
        if (!(_.isUndefined(argument.messages))) $messageList = argument.messages;
        else return false;

        if (isMobile.any()) return false;
        
        // UI Tooltips //
        _.each(elementList, function($element, k){
            tooltipOnHover({ target: k.toString(), message: $messageList.getMessage(k.toString()), placement: $element.toString() });
        });
        
        // Check-Boxes
        tooltipOnHover({ other: jQuery('#chkbx_visualization_cell_edge').parent().parent(), message: $messageList.getMessage('cellEdge'), placement: 'top' });
        tooltipOnHover({ other: jQuery('#chkbx_visualization_cell_face').parent().parent(), message: $messageList.getMessage('cellFace'), placement: 'top' });
        //tooltipOnHover({ other: jQuery('#cameraCheckbox').parent().parent(), message: $messageList.getMessage('cameraCheckbox'), placement: 'top' });
        tooltipOnHover({ other: jQuery('#elementSymbolContainer').find('a'), message: $messageList.getMessage('elementSymbolContainer'), placement: 'top' });
        
        // Lattices Tooltips //
        _.each(lattices, function($parameter,k){
            if ( restrictions[k] === undefined ) tooltipOnHover({ target: k.toString(), message: 'CLICK TO CHOOSE A ' + $parameter + ' LATTICE TO YOUR CRYSTAL STRUCTURE.', placement: 'top' });
            else tooltipOnHover({ target: k.toString(), message: 'CLICK TO CHOOSE A ' + $parameter + ' LATTICE TO YOUR CRYSTAL STRUCTURE. RESTRICTIONS FOR YOUR LATTICE ARE ' + restrictions[k], placement: 'top' });
        });

        // Element Tooltips //
        _.each( jQuery('.periodic-table').find('.ch'), function($parameter,k){
            var iteration = jQuery($parameter);
            tooltipOnHover({ other: iteration, message: 'CLICK TO ADD A ' + iteration.html() + ' (' + atoms[iteration.html()] + ') ATOM TO YOUR MOTIFF COMPOSITION', placement: 'top' });
        });
        
        // Canvas Tooltip for system messages //
        $canvasTooltip.tooltip({
            container : 'body',
            placement : 'right',
            trigger: 'manual',
            title: 'empty',
            template: '<div class="tooltip" role="tooltip"><div class="tooltip-arrow" style="color: white; border-right-color: white;"></div><div class="tooltip-inner" style="background-color: white;"></div></div>'
        });
    };
    
    // Adds Tooltip on mouse hover //
    function tooltipOnHover(argument) {
        if (!(_.isUndefined(argument.target))) target = jQuery('#'+argument.target);
        else if (!(_.isUndefined(argument.other))) target = argument.other;
        else return false;
        if (!(_.isUndefined(argument.message))) message = argument.message;
        else return false;
        if (!(_.isUndefined(argument.placement))) placement = argument.placement;
        else return false;
        
        if (target.length > 0) {
            target.attr('data-original-title', message);
            target.tooltip({
                container : 'body',
                placement : placement,
                trigger: 'hover',
                title: message
            });
        }
        else return false;
        
        return true;  
    };
    
    // UI Interface //
    tooltipGenerator.prototype.addStaticTooltip = function(argument){
        if (!(_.isUndefined(argument.target))) target = jQuery('#'+argument.target);
        else if (!(_.isUndefined(argument.other))) target = argument.other;
        else return false;
        if (!(_.isUndefined(argument.message))) message = argument.message;
        else return false;
        if (!(_.isUndefined(argument.placement))) placement = argument.placement;
        else return false;
        
        if (target.length > 0) {
            target.attr('data-original-title', message);
            target.tooltip({
                container : 'body',
                placement : placement,
                trigger: 'manual',
                title: message
            });
        }
        else return false;
        target.tooltip('show');
        return true; 
    };
    tooltipGenerator.prototype.addOnHoverTooltip = function(argument){
        tooltipOnHover(argument);
    };
    tooltipGenerator.prototype.showTooltip = function(argument){
        if (!(_.isUndefined(argument.target))) target = jQuery('#'+argument.target);
        else return false;
        if (!(_.isUndefined(argument.message))) message = argument.message;
        else return false;
        if (!(_.isUndefined(argument.placement))) placement = argument.placement;
        else return false;
        
        if (target.length > 0) {
            target.attr('data-original-title', message);
            target.tooltip({
                container : 'body',
                placement : placement,
                trigger: 'manual',
                title: message
            });
            target.tooltip('show');
            setTimeout(function(){
                target.tooltip('hide');
            }, 2500);
        }
        else return false;
        return true;
    };
    tooltipGenerator.prototype.showTempTooltip = function(argument){
        if (!(_.isUndefined(argument.other))) target = argument.other;
        else return false;
        if (!(_.isUndefined(argument.message))) message = argument.message;
        else return false;
        if (!(_.isUndefined(argument.placement))) placement = argument.placement;
        else return false;
        
        if (target.length > 0) {
            target.attr('data-original-title', message);
            target.tooltip({
                container : 'body',
                placement : placement,
                trigger: 'manual',
                title: message
            });
            target.tooltip('show');
            setTimeout(function(){
                target.tooltip('hide');
            }, 2500);
        }
        else return false;
        return true;
    };
    tooltipGenerator.prototype.canvasTooltip = function(argument){

        if (!(_.isUndefined(argument.message))) {
            $canvasTooltip.attr('data-original-title', argument.message);
            $canvasTooltip.tooltip({
                container : 'body',
                placement : 'right',
                trigger: 'manual',
                title: argument.message,
                template: '<div class="tooltip" role="tooltip"><div class="tooltip-arrow" style="color: white; border-right-color: white;"></div><div class="tooltip-inner" style="background-color: white;"></div></div>'
            });
        }
        if (!(_.isUndefined(argument.y))) $canvasTooltip.css('top',argument.y+'px');
        if (!(_.isUndefined(argument.x))) $canvasTooltip.css('left',argument.x+'px');

        if (!(_.isUndefined(argument.show))) {
            if (argument.show === true) $canvasTooltip.tooltip('show');
            else if (argument.show === false) $canvasTooltip.tooltip('hide');
        }
        
    };
    
    return tooltipGenerator;
});