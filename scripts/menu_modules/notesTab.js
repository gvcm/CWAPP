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
    /* This module handles the user notes.
        Each note can be connect to an atom (via IAC) or not.
        Each note may appear on the canvas.
    */
    // Variables
    var target = undefined;
    var notes = {}; 
    var cameraData = {}; // here are stored data about the camera position that each note can be related to

    var idCounter = 0;
    
    // Module References
    var $setUIValue = undefined;
    var $tooltipGenerator = undefined;
    var $disableUIElement = undefined;
    var $menuRibbon = undefined;
    var $stringEditor = undefined;
    var html = undefined; 
    var intervalTime = 3000;
    var timer;


    // Contructor //
    function notesTab(argument) {
        // Acquire Module References //
        if (!(_.isUndefined(argument.setUIValue))) $setUIValue = argument.setUIValue;
        else return false;
        if (!(_.isUndefined(argument.tooltipGenerator))) $tooltipGenerator = argument.tooltipGenerator;
        else return false;
        if (!(_.isUndefined(argument.disableUIElement))) $disableUIElement = argument.disableUIElement;
        else return false;
        if (!(_.isUndefined(argument.menuRibbon))) $menuRibbon = argument.menuRibbon;
        else return false;
        if (!(_.isUndefined(argument.stringEditor))) $stringEditor = argument.stringEditor;
        else return false;
        if (!(_.isUndefined(argument.html))) html = argument.html;
        else return false;
        
        // Inputs //
        html.notes.properties.title.on('keyup',function(){
            html.interface.screen.wrapper.find('#'+notes.activeEntry).find('.noteTitle').html(html.notes.properties.title.val() );
        });
        html.notes.other.body.on('keyup',function(){
            html.interface.screen.wrapper.find('#'+notes.activeEntry).find('.wordwrap.notes').html(html.notes.other.body.val());
        });
        html.notes.properties.opacity.html('<option>0</option><option>2</option><option>4</option><option>6</option><option>8</option><option>10</option>');
        html.notes.properties.opacity.selectpicker();
        html.notes.properties.opacity.selectpicker('val','10');
        html.notes.properties.opacity.on('change',function(){
            html.interface.screen.wrapper.find('#'+notes.activeEntry).css('-ms-filter','progid:DXImageTransform.Microsoft.Alpha(Opacity='+$stringEditor.multiply10(html.notes.properties.opacity.val())+')');
            html.interface.screen.wrapper.find('#'+notes.activeEntry).css('filter','alpha(opacity='+$stringEditor.multiply10(html.notes.properties.opacity.val())+')');
            html.interface.screen.wrapper.find('#'+notes.activeEntry).css('opacity',$stringEditor.divide10(html.notes.properties.opacity.val()));
        });
        html.notes.properties.color.spectrum({
            color: "#000000",
            allowEmpty:true,
            chooseText: "Choose",
            cancelText: "Close",
            move: function(){
                $setUIValue.setValue({
                    noteColor:{
                        publish: { id: notes.activeEntry, color: '#'+html.notes.properties.color.spectrum('get').toHex() },
                        value: '#'+html.notes.properties.color.spectrum('get').toHex()
                    }
                });
                html.interface.screen.wrapper.find('#'+notes.activeEntry).css('background-color','#'+html.notes.properties.color.spectrum('get').toHex());
                html.interface.screen.wrapper.find('#'+notes.activeEntry).find('.notes').css('background-color','#'+html.notes.properties.color.spectrum('get').toHex());
            },
            change: function(){
                $setUIValue.setValue({
                    noteColor:{
                        publish: { id: notes.activeEntry, color: '#'+html.notes.properties.color.spectrum('get').toHex() },
                        value: '#'+html.notes.properties.color.spectrum('get').toHex()
                    }
                });
                html.interface.screen.wrapper.find('#'+notes.activeEntry).css('background-color','#'+html.notes.properties.color.spectrum('get').toHex());
                html.interface.screen.wrapper.find('#'+notes.activeEntry).find('.notes').css('background-color','#'+html.notes.properties.color.spectrum('get').toHex());
            }
        });
        
        html.notes.other.saveCamera.on('click',function(){
            var value = undefined; 
            (html.notes.other.saveCamera.hasClass('active')) ? value = false : value = true;
            $setUIValue.setValue({
                saveCamera:{
                    value:value,
                    publish:{saveCamera:value, id : notes.activeEntry}
                }
            }); 
            
        });
        html.notes.other.enableParameters.on('click',function(){
            var value = undefined;
            (html.notes.other.enableParameters.hasClass('active')) ? value = false : value = true; 
            $setUIValue.setValue({
                enableParameters:{
                    value:value,
                    publish:{enableMotifParameters:value}
                }
            });  

        });
        
        $disableUIElement.disableElement({
            noteTitle:{
                value: true    
            },
            noteBody:{
                value: true    
            },
            noteOpacity:{
                value: true    
            },
            noteColor:{
                value: true    
            }
        });
        html.notes.other.table.find('tbody').sortable({
            appendTo: document.body,
            axis: 'y',
            containment: "parent",
            cursor: "move",
            items: "> tr",
            tolerance: "pointer",
            cancel: 'td.visibility'
        });
        html.notes.other.table.hide('slow');
        
        // Buttons //
        html.notes.actions.new.on('click',function(){
            if (!(html.notes.actions.new.hasClass('disabled'))){
                highlightNote(notes.activeEntry,false);
                highlightNote(addNote(),true);
                $disableUIElement.disableElement({
                    noteTitle:{
                        value: false    
                    },
                    noteBody:{
                        value: false    
                    },
                    noteOpacity:{
                        value: false    
                    },
                    noteColor:{
                        value: false 
                    },
                    newNote:{
                        value: true   
                    },
                    saveNote:{
                        value: false   
                    },
                    deleteNote:{
                        value: false   
                    }
                });
            }
        });
        html.notes.actions.save.on('click',function(){ 
            if (!(html.notes.actions.save.hasClass('disabled'))){

                $setUIValue.setValue({
                    noteVisibility:{
                        value: false,
                        other: html.notes.other.table.find('#'+notes.activeEntry)
                    }
                });
 
                if (notes[notes.activeEntry].atomNote === true) {
                    var x = parseInt(html.interface.screen.wrapper.find('#'+notes.activeEntry).css('left'),10) + parseInt(html.interface.screen.wrapper.find('#'+notes.activeEntry).css('width'),10) / 2;
                    var y = parseInt(html.interface.screen.wrapper.find('#'+notes.activeEntry).css('top'),10) + parseInt(html.interface.screen.wrapper.find('#'+notes.activeEntry).css('height'),10) / 2;
                    notes[notes.activeEntry].x = x;
                    notes[notes.activeEntry].y = y;
                    $setUIValue.setValue({
                        noteVisibility:{
                            publish: {id:notes.activeEntry, visible: false, x: x, y: y, color: notes[notes.activeEntry].color}
                        }
                    });
                }

                showCanvasNote(notes.activeEntry,false);

                var cameraToggle = (html.notes.other.saveCamera.hasClass('active')) ? true : false;
                var sceneObjsToggle = (html.notes.other.enableParameters.hasClass('active')) ? true : false;

                $setUIValue.setValue({
                    saveNoteForSystem:{
                        publish: {id:notes.activeEntry, cameraToggle : cameraToggle, sceneObjsToggle : sceneObjsToggle }
                    }
                });

                editNote({
                    title: html.notes.properties.title.val(),
                    body: html.notes.other.body.val(),
                    color: '#'+html.notes.properties.color.spectrum('get').toHex(),
                    opacity: html.notes.properties.opacity.val(),
                    atomNote: notes[notes.activeEntry].atomNote,
                    x: notes[notes.activeEntry].x,
                    y: notes[notes.activeEntry].y
                });

                $disableUIElement.disableElement({
                    noteTitle:{
                        value: true    
                    },
                    noteBody:{
                        value: true    
                    },
                    noteOpacity:{
                        value: true    
                    },
                    noteColor:{
                        value: true 
                    },
                    newNote:{
                        value: false   
                    },
                    saveNote:{
                        value: true   
                    },
                    deleteNote:{
                        value: true   
                    }
                });

                clearTimeout(timer);

                $setUIValue.setValue({
                    playerPause:{
                        value:false,
                        publish:{play:false }
                    }
                }); 
      
                $setUIValue.setValue({
                    playerPlay:{
                        value:false,
                        publish:{play:false }
                    }
                }); 
            }
        });
        html.notes.actions.delete.on('click',function(){
            if (!(html.notes.actions.delete.hasClass('disabled'))){
                $setUIValue.setValue({
                    deleteNote: { 
                        publish: {
                            id: notes.activeEntry 
                        }          
                    }  
                });
                deleteNote();
                $disableUIElement.disableElement({
                    noteTitle:{
                        value: true    
                    },
                    noteBody:{
                        value: true    
                    },
                    noteOpacity:{
                        value: true    
                    },
                    noteColor:{
                        value: true 
                    },
                    newNote:{
                        value: false   
                    },
                    saveNote:{
                        value: true   
                    },
                    deleteNote:{
                        value: true   
                    }
                });
            }
        });
          
        // player
        html.notes.other.playerSlider.slider({
            value: intervalTime/1000,
            min: intervalTime/1000,
            max: 300,
            step: 1,
            animate: true,
            slide: function(event, ui){
                html.notes.other.interval.val(ui.value); 
                intervalTime = parseInt(ui.value)*1000;
            }
        });

        html.notes.other.interval.val(intervalTime/1000);
        html.notes.other.interval.prop('disabled', true);

        html.notes.other.play.on('click',function(){
            var value = undefined; 
            (html.notes.other.play.find('a').hasClass('active')) ? value = false : value = true;

            if(value === true){ 

                $setUIValue.setValue({
                    playerPlay:{
                        value:value,
                        publish:{play:value }
                    }
                }); 
     
                $setUIValue.setValue({
                    playerPause:{
                        value:false,
                        publish:{play:false}
                    }
                }); 
 
                playerTimerFunction();
            }
            
        });
        html.notes.other.pause.on('click',function(){
            var value = undefined; 
            (html.notes.other.pause.find('a').hasClass('active')) ? value = false : value = true;

            if(value === true){ 

                clearTimeout(timer);

                $setUIValue.setValue({
                    playerPause:{
                        value:value,
                        publish:{play:value }
                    }
                }); 
      
                $setUIValue.setValue({
                    playerPlay:{
                        value:false,
                        publish:{play:false }
                    }
                }); 
            }
            
        });
        html.notes.other.repeat.on('click',function(){

            var value = undefined; 

            (html.notes.other.repeat.find('a').hasClass('active')) ? value = false : value = true;
 
            $setUIValue.setValue({
                playerRepeat:{
                    value:value,
                    publish:{repeat:value}
                }
            });  
            
        });

        html.notes.other.rewind.on('click',function(){

            var nextID = undefined;
        
            var id = notes.activeEntry;
            var newStart = false ;

            if( id === false){ 
                newStart = true;
                id = (jQuery('#'+html.notes.other.tableID+' tr:first'))[0].id ;
            };
           
            // Find Next Note //
            var table = {
                first: jQuery('#'+html.notes.other.tableID+' tr:first'),
                last: jQuery('#'+html.notes.other.tableID+' tr:last'),
                current: html.notes.other.table.find('#'+id),
                next: html.notes.other.table.find('#'+id).closest('tr').prev('tr')
            };


            if (table.next.length > 0){
                nextID = table.next[0].id; 
            }
            else{ 
                nextID = table.last[0].id; 
            }  

            // Hide Current Note //
            $setUIValue.setValue({
                noteVisibility:{
                    value: false,
                    other: html.notes.other.table.find('#'+id)
                }
            });
            if (notes[id].atomNote === true) {
                var x = parseInt(html.interface.screen.wrapper.find('#'+id).css('left'),10) + parseInt(html.interface.screen.wrapper.find('#'+id).css('width'),10) / 2;
                var y = parseInt(html.interface.screen.wrapper.find('#'+id).css('top'),10) + parseInt(html.interface.screen.wrapper.find('#'+id).css('height'),10) / 2;
                notes[id].x = x;
                notes[id].y = y;
                $setUIValue.setValue({
                    noteVisibility:{
                        publish: {id:id, visible: false, x: x, y: y, color: notes[id].color}
                    }
                });
            }
            showCanvasNote(id,false);
            

            // Show Next Note //
            $setUIValue.setValue({
                noteVisibility:{
                    value: true,
                    other: html.notes.other.table.find('#'+nextID)
                }
            });

            if (notes[nextID].atomNote === true) {  
                var x = parseInt(html.interface.screen.wrapper.find('#'+nextID).css('left'),10) + parseInt(html.interface.screen.wrapper.find('#'+nextID).css('width'),10) / 2;
                var y = parseInt(html.interface.screen.wrapper.find('#'+nextID).css('top'),10) + parseInt(html.interface.screen.wrapper.find('#'+nextID).css('height'),10) / 2;
                notes[nextID].x = x;
                notes[nextID].y = y;
                $setUIValue.setValue({
                    noteVisibility:{
                        publish: {id: nextID, visible: true, x: x, y: y, color: notes[nextID].color}
                    }
                });
            }
            showCanvasNote(nextID,true);

            $setUIValue.setValue({
                selectNote:{
                    publish: {id:nextID}
                }
            });

            selectNote(nextID);
            
        });
 
        html.notes.other.forward.on('click',function(){

            var nextID = undefined;
        
            var id = notes.activeEntry;
            var newStart = false ;

            if( id === false){ 
                newStart=true;
                id = (jQuery('#'+html.notes.other.tableID+' tr:last'))[0].id ;
            };
           
            // Find Next Note //
            var table = {
                first: jQuery('#'+html.notes.other.tableID+' tr:first'),
                last: jQuery('#'+html.notes.other.tableID+' tr:last'),
                current: html.notes.other.table.find('#'+id),
                next: html.notes.other.table.find('#'+id).closest('tr').next('tr')
            };


            if (table.next.length > 0){
                nextID = table.next[0].id; 
            }
            else { 
                nextID = table.first[0].id; 
            }  

            // Hide Current Note //
            $setUIValue.setValue({
                noteVisibility:{
                    value: false,
                    other: html.notes.other.table.find('#'+id)
                }
            });
            if (notes[id].atomNote === true) {
                var x = parseInt(html.interface.screen.wrapper.find('#'+id).css('left'),10) + parseInt(html.interface.screen.wrapper.find('#'+id).css('width'),10) / 2;
                var y = parseInt(html.interface.screen.wrapper.find('#'+id).css('top'),10) + parseInt(html.interface.screen.wrapper.find('#'+id).css('height'),10) / 2;
                notes[id].x = x;
                notes[id].y = y;
                $setUIValue.setValue({
                    noteVisibility:{
                        publish: {id:id, visible: false, x: x, y: y, color: notes[id].color}
                    }
                });
            }
            showCanvasNote(id,false);
            

            // Show Next Note //
            $setUIValue.setValue({
                noteVisibility:{
                    value: true,
                    other: html.notes.other.table.find('#'+nextID)
                }
            });

            if (notes[nextID].atomNote === true) { console.log(9);
                var x = parseInt(html.interface.screen.wrapper.find('#'+nextID).css('left'),10) + parseInt(html.interface.screen.wrapper.find('#'+nextID).css('width'),10) / 2;
                var y = parseInt(html.interface.screen.wrapper.find('#'+nextID).css('top'),10) + parseInt(html.interface.screen.wrapper.find('#'+nextID).css('height'),10) / 2;
                notes[nextID].x = x;
                notes[nextID].y = y;
                $setUIValue.setValue({
                    noteVisibility:{
                        publish: {id: nextID, visible: true, x: x, y: y, color: notes[nextID].color}
                    }
                });
            }
            showCanvasNote(nextID,true);

            $setUIValue.setValue({
                selectNote:{
                    publish: {id:nextID}
                }
            });

            selectNote(nextID);  
            
        });
    };
    var playerTimerFunction = function(){ 

        var nextID = undefined;
        
        var id = notes.activeEntry;
        var newStart = false ;

        if( id === false){ 
            newStart=true;
            id = (jQuery('#'+html.notes.other.tableID+' tr:last'))[0].id ;
        };
       
        // Find Next Note //
        var table = {
            first: jQuery('#'+html.notes.other.tableID+' tr:first'),
            last: jQuery('#'+html.notes.other.tableID+' tr:last'),
            current: html.notes.other.table.find('#'+id),
            next: html.notes.other.table.find('#'+id).closest('tr').next('tr')
        };


        if (table.next.length > 0){
            nextID = table.next[0].id; 
        }
        else if((html.notes.other.repeat.find('a').hasClass('active')) || newStart === true){ 
            nextID = table.first[0].id; 
        } 
        else{
            clearTimeout(timer);

            $setUIValue.setValue({
                playerPlay:{
                    value:false,
                    publish:{play:false }
                }
            }); 

            return;
        }

        // Hide Current Note //
        $setUIValue.setValue({
            noteVisibility:{
                value: false,
                other: html.notes.other.table.find('#'+id)
            }
        });
        if (notes[id].atomNote === true) {
            var x = parseInt(html.interface.screen.wrapper.find('#'+id).css('left'),10) + parseInt(html.interface.screen.wrapper.find('#'+id).css('width'),10) / 2;
            var y = parseInt(html.interface.screen.wrapper.find('#'+id).css('top'),10) + parseInt(html.interface.screen.wrapper.find('#'+id).css('height'),10) / 2;
            notes[id].x = x;
            notes[id].y = y;
            $setUIValue.setValue({
                noteVisibility:{
                    publish: {id:id, visible: false, x: x, y: y, color: notes[id].color}
                }
            });
        }
        showCanvasNote(id,false);
        

        // Show Next Note //
        $setUIValue.setValue({
            noteVisibility:{
                value: true,
                other: html.notes.other.table.find('#'+nextID)
            }
        });

        if (notes[nextID].atomNote === true) { console.log(9);
            var x = parseInt(html.interface.screen.wrapper.find('#'+nextID).css('left'),10) + parseInt(html.interface.screen.wrapper.find('#'+nextID).css('width'),10) / 2;
            var y = parseInt(html.interface.screen.wrapper.find('#'+nextID).css('top'),10) + parseInt(html.interface.screen.wrapper.find('#'+nextID).css('height'),10) / 2;
            notes[nextID].x = x;
            notes[nextID].y = y;
            $setUIValue.setValue({
                noteVisibility:{
                    publish: {id: nextID, visible: true, x: x, y: y, color: notes[nextID].color}
                }
            });
        }
        showCanvasNote(nextID,true);

        $setUIValue.setValue({
            selectNote:{
                publish: {id:nextID}
            }
        });

        selectNote(nextID); 
        timer = setTimeout( playerTimerFunction, intervalTime );
    };

    // Add note to Table //
    function addNote(newID,restore){
        var id = undefined;
        var atomNote = false;
        
        // Clear Forms //
        html.notes.properties.opacity.val('10');
        html.notes.other.body.val('');
        html.notes.properties.opacity.selectpicker('val','10');
        html.notes.properties.color.children().css('background','white');
        
        // Note is not related to an atom //
        if (_.isUndefined(newID)) {
            do{
                id = 'note'+idCounter;
                idCounter++;
            } while(!(_.isUndefined(notes[id])));
        } 
        // Restore Note //
        else if (_.isUndefined(restore)){
            atomNote = true;
            id = newID;
        }
        // Atom Related //
        else id = newID;
       
        html.notes.other.table.find('tbody').append('<tr id="'+id+'" class="bg-dark-gray"><td colspan="1" class="visibility"><a class="noteButton"><img src="Images/hidden-icon-sm.png" class="img-responsive" alt=""/></a></td><td colspan="4" class="selectable note-name">Untitled Note</td><td class="selectable note-color"><div class="color-picker color-picker-sm theme-02 bg-purple"><div class="color"></div></div></td></tr>');
        html.notes.other.table.show('slow');
        
        // Create Database Entry //
        notes[id] = {
            title: '',
            body: '',
            color: '#FFFFFF',
            opacity: '',
            atomNote: atomNote,
            x: 0,
            y: 0
        };
        // Create on Canvas //
        createCanvasNote(id);
         
        // Handlers //
        html.notes.other.table.find('#'+id).find('.selectable').on('click',function(){
             
            $setUIValue.setValue({
                selectNote:{
                    publish: {id:id}
                }
            });

            selectNote(id);
        });
        // Note Visibility //
        html.notes.other.table.find('#'+id).find('.noteButton').on('click', function(){
 
            var value = undefined;
            (html.notes.other.table.find('#'+id).find('.noteButton').hasClass('visible')) ? value = false : value = true;
            $setUIValue.setValue({
                noteVisibility:{
                    value: value,
                    other: html.notes.other.table.find('#'+id)
                }
            });
            if (notes[id].atomNote === true) {
                var x = parseInt(html.interface.screen.wrapper.find('#'+id).css('left'),10) + parseInt(html.interface.screen.wrapper.find('#'+id).css('width'),10) / 2;
                var y = parseInt(html.interface.screen.wrapper.find('#'+id).css('top'),10) + parseInt(html.interface.screen.wrapper.find('#'+id).css('height'),10) / 2;
                notes[id].x = x;
                notes[id].y = y;
                $setUIValue.setValue({
                    noteVisibility:{
                        publish: {id:id, visible: value, x: x, y: y, color: notes[id].color}
                    }
                });
            }
            showCanvasNote(id,value);
        });
        // Remote Hide/Show Note //
        html.notes.other.table.find('#'+id).on('hide',function(){
            if(_.isUndefined(notes[id].temp)) {
                return false;
            }
            else{
                if (notes[id].temp === true){
                    // UI //
                    $setUIValue.setValue({
                        noteVisibility:{
                            value: false,
                            other: html.notes.other.table.find('#'+id)
                        }
                    });
                    showCanvasNote(id.toString(),false);
                    notes[id].temp = undefined;
                    
                    // System //
                    var x = parseInt(html.interface.screen.wrapper.find('#'+id).css('left'),10) + parseInt(html.interface.screen.wrapper.find('#'+id).css('width'),10) / 2;
                    var y = parseInt(html.interface.screen.wrapper.find('#'+id).css('top'),10) + parseInt(html.interface.screen.wrapper.find('#'+id).css('height'),10) / 2;
                    notes[id].x = x;
                    notes[id].y = y;
                    $setUIValue.setValue({
                        noteVisibility:{
                            publish: {id:id, visible: false, x: x, y: y, color: notes[id].color}
                        }
                    });
                }
            }
        });
        
        // Initiation //
        $setUIValue.setValue({
            noteVisibility:{
                value: true,
                other: html.notes.other.table.find('#'+id)
            }
        });
        $setUIValue.setValue({
            atomNoteTable: { 
                publish: {
                    id: id,
                    add: true,
                    color : notes[id].color
                }          
            }  
        });
        if (notes[id].atomNote === true) {
            var x = parseInt(html.interface.screen.wrapper.find('#'+id).css('left'),10) + parseInt(html.interface.screen.wrapper.find('#'+id).css('width'),10) / 2;
            var y = parseInt(html.interface.screen.wrapper.find('#'+id).css('top'),10) + parseInt(html.interface.screen.wrapper.find('#'+id).css('height'),10) / 2;
            notes[id].x = x;
            notes[id].y = y;
            $setUIValue.setValue({
                noteVisibility:{
                    publish: {id:id, visible: true, x: x, y: y, color: notes[id].color}
                }
            });
        }
        showCanvasNote(id,true);
        

        return id;
    };
    // Edit note //
    function editNote(note){ 
        // Update Database //
        if (notes.activeEntry !== false) notes[notes.activeEntry] = note;
        else return false;

        // Update Title //
        if (note.title !== '') {
            html.notes.other.table.find('#'+notes.activeEntry).find('.note-name').html(note.title);
            html.interface.screen.wrapper.find('#'+notes.activeEntry).find('.noteTitle').html(note.title);
        }

        // Color, opacity and position //
        $setUIValue.setValue({
            noteColor:{
                publish: { id: notes.activeEntry, color: note.color },
                value: note.color
            }
        });
        html.interface.screen.wrapper.find('#'+notes.activeEntry).css('background-color',note.color);
        html.interface.screen.wrapper.find('#'+notes.activeEntry).find('.notes').css('background-color',note.color);
        html.interface.screen.wrapper.find('#'+notes.activeEntry).css('-ms-filter','progid:DXImageTransform.Microsoft.Alpha(Opacity='+$stringEditor.multiply10(note.opacity)+')');
        html.interface.screen.wrapper.find('#'+notes.activeEntry).css('filter','alpha(opacity='+$stringEditor.multiply10(note.opacity)+')');
        html.interface.screen.wrapper.find('#'+notes.activeEntry).css('opacity',$stringEditor.divide10(note.opacity));
        
        html.interface.screen.wrapper.find('#'+notes.activeEntry).css('left', note.x+'px');
        html.interface.screen.wrapper.find('#'+notes.activeEntry).css('top',note.y+'px');
        if(note.atomNote) {
            $setUIValue.setValue({
                noteMovement:{
                    publish: { id: notes.activeEntry, x: note.x, y: note.y }   
                }
            });
        }

        // Body //
        if (note.body !== '') html.interface.screen.wrapper.find('#'+notes.activeEntry).find('.notes').html(note.body);
        html.notes.other.table.find('#'+notes.activeEntry).find('.color').css('background',note.color);
        highlightNote(notes.activeEntry,false);
        
        // Clear Forms //
        html.notes.properties.title.val('');
        html.notes.other.body.val('');
        html.notes.properties.color.children().css('background','transparent');
    };
    // Delete note //
    function deleteNote(){
        // Update Database //
        if (notes.activeEntry !== false) {
            if (notes[notes.activeEntry].atomNote === true) {
                delete notes[notes.activeEntry];
                $setUIValue.setValue({
                    atomNoteTable: { 
                        publish: {
                            id: notes.activeEntry,
                            add: false
                        }          
                    }  
                });
                
            }
            else delete notes[notes.activeEntry];
        }
        else return false;
        
        // Remove Entry //
        html.notes.other.table.find('#'+notes.activeEntry).remove();
        deleteCanvasNote(notes.activeEntry);
        highlightNote('q',false);
        
        // Clear Forms //
        html.notes.properties.title.val('');
        html.notes.other.body.val('');
        html.notes.properties.opacity.selectpicker('val','10');
        html.notes.properties.color.children().css('background','transparent');
    };
    // Select Active Note //
    function selectNote(id){ 
        highlightNote(notes.activeEntry,false);
        html.notes.properties.title.val(notes[id].title);
        html.notes.other.body.val(notes[id].body);
        if (notes[id].color !== '') {
            html.notes.properties.color.spectrum('set',notes[id].color);
            html.notes.properties.color.children().css('background',notes[id].color);
        }
        if (notes[id].opacity !== '') html.notes.properties.opacity.selectpicker('val',notes[id].opacity);
        highlightNote(id,true);
        $disableUIElement.disableElement({
            noteTitle:{
                value: false    
            },
            noteBody:{
                value: false    
            },
            noteOpacity:{
                value: false    
            },
            noteColor:{
                value: false 
            },
            newNote:{
                value: true   
            },
            saveNote:{
                value: false   
            },
            deleteNote:{
                value: false   
            }
        });

        if (notes[id].atomNote === true) {
            var x = parseInt(html.interface.screen.wrapper.find('#'+id).css('left'),10) + parseInt(html.interface.screen.wrapper.find('#'+id).css('width'),10) / 2;
            var y = parseInt(html.interface.screen.wrapper.find('#'+id).css('top'),10) + parseInt(html.interface.screen.wrapper.find('#'+id).css('height'),10) / 2;
            notes[id].x = x;
            notes[id].y = y;
            $setUIValue.setValue({
                noteVisibility:{
                    publish: {id:id, visible: true, x: x, y: y, color: notes[id].color}
                }
            });
        }

        Object.keys(notes).forEach(function (key) {
            var visibility = (key === id);
            $setUIValue.setValue({
                noteVisibility:{
                    value: visibility,
                    other: html.notes.other.table.find('#'+key)
                }
            });
            showCanvasNote(key,visibility);
        })
        
    };
    // Highlight Table Entry //
    function highlightNote(id,state){
        var color = (state) ? 'bg-light-purple' : 'bg-dark-gray';
        html.notes.other.table.find('#'+id).removeAttr('class');
        html.notes.other.table.find('#'+id).attr('class',color);
        if (state === true) notes.activeEntry = id;
        else notes.activeEntry = false;
    };
    // Show/Hide on Canvas //
    function showCanvasNote(id,value){
        if (value === true) html.interface.screen.wrapper.find('#'+id).show();
        else html.interface.screen.wrapper.find('#'+id).hide();
    };
    // Create note on Canvas //
    function createCanvasNote(id){
        html.interface.screen.wrapper.prepend('<div id="'+id+'" class="noteWrapper"><div class="noteBar"><img class="closeNote" src="Images/close.png" /><img class="swapRight" src="Images/right.png" /><img class="swapLeft" src="Images/left.png" /><div class="noteTitle">Title</div></div><div class="wordwrap notes">'+notes[id].body+'</div></div>');
        var notepad = html.interface.screen.wrapper.find('#'+id);
        notepad.hide();
        notepad.draggable({
            scroll: false,
            drag: function(event, ui){
                var x = parseInt(ui.position.left) + parseInt(html.interface.screen.wrapper.find('#'+id).css('width'),10) / 2;
                var y = parseInt(ui.position.top) + parseInt(html.interface.screen.wrapper.find('#'+id).css('height'),10) / 2;
                notes[id].x = x;
                notes[id].y = y;
                if (notes[id].atomNote === true){
                    $setUIValue.setValue({
                        noteMovement:{
                            publish: { id: id, x: x, y: y }   
                        }
                    });
                }
            },
            containment: html.interface.screen.appContainer
        });
        // Close Note Handler //
        notepad.find('img.closeNote').on('click',function(){
            showCanvasNote(id,false);
            $setUIValue.setValue({
                noteVisibility:{
                    value: false,
                    other: html.notes.other.table.find('#'+id)
                }
            });
            if (notes[id].atomNote === true) {
                var x = parseInt(html.interface.screen.wrapper.find('#'+id).css('left'),10) + parseInt(html.interface.screen.wrapper.find('#'+id).css('width'),10) / 2;
                var y = parseInt(html.interface.screen.wrapper.find('#'+id).css('top'),10) + parseInt(html.interface.screen.wrapper.find('#'+id).css('height'),10) / 2;
                notes[id].x = x;
                notes[id].y = y;
                $setUIValue.setValue({
                    noteVisibility:{
                        publish: {id:id, visible: false, x: x, y: y, color: notes[id].color}
                    }
                });
            }
        });
        notepad.find('img.swapRight').on('click',function(){
 
            var nextID = undefined;
            
            // Find Next Note //
            var table = {
                first: jQuery('#'+html.notes.other.tableID+' tr:first'),
                last: jQuery('#'+html.notes.other.tableID+' tr:last'),
                current: html.notes.other.table.find('#'+id),
                next: html.notes.other.table.find('#'+id).closest('tr').next('tr')
            };
            
            if (table.next.length > 0) nextID = table.next[0].id;
            else nextID = table.first[0].id;

            // Hide Current Note //
            $setUIValue.setValue({
                noteVisibility:{
                    value: false,
                    other: html.notes.other.table.find('#'+id)
                }
            });
            if (notes[id].atomNote === true) {
                var x = parseInt(html.interface.screen.wrapper.find('#'+id).css('left'),10) + parseInt(html.interface.screen.wrapper.find('#'+id).css('width'),10) / 2;
                var y = parseInt(html.interface.screen.wrapper.find('#'+id).css('top'),10) + parseInt(html.interface.screen.wrapper.find('#'+id).css('height'),10) / 2;
                notes[id].x = x;
                notes[id].y = y;
                $setUIValue.setValue({
                    noteVisibility:{
                        publish: {id:id, visible: false, x: x, y: y, color: notes[id].color}
                    }
                });
            }
            showCanvasNote(id,false);
            
            // Show Next Note //
            $setUIValue.setValue({
                noteVisibility:{
                    value: true,
                    other: html.notes.other.table.find('#'+nextID)
                }
            });
            if (notes[nextID].atomNote === true) {
                var x = parseInt(html.interface.screen.wrapper.find('#'+nextID).css('left'),10) + parseInt(html.interface.screen.wrapper.find('#'+nextID).css('width'),10) / 2;
                var y = parseInt(html.interface.screen.wrapper.find('#'+nextID).css('top'),10) + parseInt(html.interface.screen.wrapper.find('#'+nextID).css('height'),10) / 2;
                notes[nextID].x = x;
                notes[nextID].y = y;
                $setUIValue.setValue({
                    noteVisibility:{
                        publish: {id:nextID, visible: true, x: x, y: y, color: notes[nextID].color}
                    }
                });
            }
            showCanvasNote(nextID,true);
        });
        notepad.find('img.swapLeft').on('click',function(){
            
            var nextID = undefined;
            
            // Find Next Note //
            var table = {
                first: jQuery('#'+html.notes.other.tableID+' tr:first'),
                last: jQuery('#'+html.notes.other.tableID+' tr:last'),
                current: html.notes.other.table.find('#'+id),
                prev: html.notes.other.table.find('#'+id).closest('tr').prev('tr')
            };
            
            if (table.prev.length > 0) nextID = table.prev[0].id;
            else nextID = table.last[0].id;

            // Hide Current Note //
            $setUIValue.setValue({
                noteVisibility:{
                    value: false,
                    other: html.notes.other.table.find('#'+id)
                }
            });
            if (notes[id].atomNote === true) {
                var x = parseInt(html.interface.screen.wrapper.find('#'+id).css('left'),10) + parseInt(html.interface.screen.wrapper.find('#'+id).css('width'),10) / 2;
                var y = parseInt(html.interface.screen.wrapper.find('#'+id).css('top'),10) + parseInt(html.interface.screen.wrapper.find('#'+id).css('height'),10) / 2;
                notes[id].x = x;
                notes[id].y = y;
                $setUIValue.setValue({
                    noteVisibility:{
                        publish: {id:id, visible: false, x: x, y: y, color: notes[id].color}
                    }
                });
            }
            showCanvasNote(id,false);
            
            // Show Next Note //
            $setUIValue.setValue({
                noteVisibility:{
                    value: true,
                    other: html.notes.other.table.find('#'+nextID)
                }
            });
            if (notes[nextID].atomNote === true) {
                var x = parseInt(html.interface.screen.wrapper.find('#'+nextID).css('left'),10) + parseInt(html.interface.screen.wrapper.find('#'+nextID).css('width'),10) / 2;
                var y = parseInt(html.interface.screen.wrapper.find('#'+nextID).css('top'),10) + parseInt(html.interface.screen.wrapper.find('#'+nextID).css('height'),10) / 2;
                notes[nextID].x = x;
                notes[nextID].y = y;
                $setUIValue.setValue({
                    noteVisibility:{
                        publish: {id:nextID, visible: true, x: x, y: y, color: notes[nextID].color}
                    }
                });
            }
            showCanvasNote(nextID,true);
            
        });
    };
    // Delete note from canvas //
    function deleteCanvasNote(id){
        html.interface.screen.wrapper.find('#'+id).remove();
    };
    // Get all notes //
    function getAtomNoteTable(){
        var table = [];
        _.each(notes, function($parameter,k){
            if ($parameter.atomNote === true) {
                var x = parseInt(html.interface.screen.wrapper.find('#'+k).css('left'),10) + parseInt(html.interface.screen.wrapper.find('#'+k).css('width'),10) / 2;
                var y = parseInt(html.interface.screen.wrapper.find('#'+k).css('top'),10) + parseInt(html.interface.screen.wrapper.find('#'+k).css('height'),10) / 2;
                notes[k].x = x;
                notes[k].y = y;
                table.push({
                    id: k,
                    x: x,
                    y: y
                });
            }
        });
        return table;
    };
    
    // Module Interface //
    // Focus note on Note Tab // 
    notesTab.prototype.moveToNote = function(id){
        $menuRibbon.switchTab('notesTab');
        // Create new note if none is specified //
        if (_.isUndefined(notes[id])) {
            highlightNote(notes.activeEntry,false);
            highlightNote(addNote(id),true);
            $disableUIElement.disableElement({
                noteTitle:{
                    value: false    
                },
                noteBody:{
                    value: false    
                },
                noteOpacity:{
                    value: false    
                },
                noteColor:{
                    value: false 
                },
                newNote:{
                    value: true   
                },
                saveNote:{
                    value: false   
                },
                deleteNote:{
                    value: false   
                }
            });
        }
        else selectNote(id);
    };
    notesTab.prototype.getAtomNoteTable = function(){
        return getAtomNoteTable();  
    };
    // Show Note on Canvas //
    notesTab.prototype.focusNote = function(id){
        if(_.isUndefined(notes[id.toString()])) return false;
        else{
            if(html.notes.other.table.find('#'+id).find('.noteButton').hasClass('visible')) return true;
            else {
                $setUIValue.setValue({
                    noteVisibility:{
                        value: true,
                        other: html.notes.other.table.find('#'+id)
                    }
                });
                showCanvasNote(id.toString(),true);
                // Mark to close
                notes[id.toString()].temp = true;
                // System //
                var x = parseInt(html.interface.screen.wrapper.find('#'+id).css('left'),10) + parseInt(html.interface.screen.wrapper.find('#'+id).css('width'),10) / 2;
                var y = parseInt(html.interface.screen.wrapper.find('#'+id).css('top'),10) + parseInt(html.interface.screen.wrapper.find('#'+id).css('height'),10) / 2;
                $setUIValue.setValue({
                    noteVisibility:{
                        publish: {id:id, visible: true, x: x, y: y, color: notes[id.toString()].color}
                    }
                });
            }
        };
    };
    notesTab.prototype.getNotes = function(){
        return notes;  
    };
    // Restore UI + Database //
    notesTab.prototype.restoreNotes = function(notesJSON){
        _.each(notesJSON, function($parameter,k){
            if (k !== 'activeEntry') {
                // Parse possible atom connection //
                var atomConnection = undefined;
                if ($parameter.atomNote === 'false') atomConnection = false;
                else atomConnection = true;

                // Add empty note and select it //
                highlightNote(notes.activeEntry,false);
                highlightNote(addNote(k,true),true);

                // Overwrite with data from the JSON file //
                editNote({ 
                    title: $parameter.title,
                    opacity: $parameter.opacity,
                    color: $parameter.color,
                    body: $parameter.body,
                    atomNote: atomConnection,
                    x: parseInt($parameter.x),
                    y: parseInt($parameter.y)
                });

                if (atomConnection) {
                    $setUIValue.setValue({
                        saveNoteForSystem:{
                            publish: {id:k, cameraToggle : true, sceneObjsToggle : true }
                        }
                    });
                }
            }
        });
    };
    notesTab.prototype.resetTable = function(){
        html.notes.other.table.find('tbody').html('');
    };
    notesTab.prototype.doSmthWithSystemCamState = function(arg){
        cameraData[arg.id] = arg ; 
    };
    return notesTab;
});