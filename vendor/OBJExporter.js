/**
 * @author mrdoob / http://mrdoob.com/
 */
 define([
     'three',
     'jquery',
     'underscore',
     'explorer',
     'unitCellExplorer',
     'motifExplorer'
 ], function(
     THREE,
     jQuery,
     _,
     Explorer,
     UnitCellExplorer,
     MotifExplorer

 ) {
    
  function OBJExporter() {
      
  };

  var globGeometries = [
    new THREE.OctahedronGeometry(1,0), 
    new THREE.OctahedronGeometry(1,1), 
    new THREE.OctahedronGeometry(1,2), 
    new THREE.OctahedronGeometry(1,3), 
    new THREE.OctahedronGeometry(1,4), 
    new THREE.OctahedronGeometry(1,5) 
  ];
   

    function roundVec(vec, resolution) {
        var vector = new THREE.Vector3();

        if (resolution === 'medium') {
            vector.set((vec.x).toFixed(10), (vec.y).toFixed(10), (vec.z).toFixed(10));
        } else if (resolution === 'low') {
            vector.set((vec.x).toFixed(7), (vec.y).toFixed(7), (vec.z).toFixed(7));
        } else {
            vector = vec.clone();
        }

        return vector;
    };

    function calcGeometry(res, object) {
        
        var geometry;
       
        if (object.name === 'plane' || object.name === 'face' || object.parent.name === 'subtractedAtom' || object.name === 'crystalSolidVoid') {

            geometry = object.geometry;
        }
        if (object.parent.name === 'atom' || object.name === 'point') {
            if (res === 'high') {
                geometry = globGeometries[5].clone();
            } else if (res === 'medium') {
                geometry = globGeometries[3].clone();
            } else { 
                geometry = globGeometries[1].clone();
            }
        } else if (object.name === 'direction') {
            geometry = new THREE.Geometry();

            object.cone.updateMatrix();
            geometry.merge(object.cone.geometry, object.cone.matrix);
        } else if (object.name === 'dirLine') {
            geometry = object.geometry;
        } else if (object.name === 'grid') {
            if (res === 'high') {
                geometry = object.geometry;
            } else if (res === 'medium') {
                geometry = new THREE.CylinderGeometry(0.01, 0.01, 0.001, 4, 1);
            } else {
                geometry = new THREE.CylinderGeometry(0.01, 0.01, 0.001, 3, 1);
            }
        }

        return geometry;
    }

    OBJExporter.prototype.parse = function ( object ) {

      var output = '';

      var indexVertex = 0;
      var indexVertexUvs = 0;
      var indexNormals = 0;

      var vertex = new THREE.Vector3();
      var normal = new THREE.Vector3();
      var uv = new THREE.Vector2();

      var i, j, k, l, m, face = [];

      var parseMesh = function ( mesh ) {

        var nbVertex = 0;
        var nbNormals = 0;
        var nbVertexUvs = 0;

        var geometry = mesh.geometry;

        var normalMatrixWorld = new THREE.Matrix3();

        if ( geometry instanceof THREE.Geometry ) {

          geometry = new THREE.BufferGeometry().setFromObject( mesh );

        }

        if ( geometry instanceof THREE.BufferGeometry ) {

          // shortcuts
          var vertices = geometry.getAttribute( 'position' );
          var normals = geometry.getAttribute( 'normal' );
          var uvs = geometry.getAttribute( 'uv' );
          var indices = geometry.getIndex();

          // name of the mesh object
          output += 'o ' + mesh.name + '\n';

          // name of the mesh material
          if ( mesh.material && mesh.material.name ) {
            output += 'usemtl ' + mesh.material.name + '\n';
          }

          // vertices

          if( vertices !== undefined ) {

            for ( i = 0, l = vertices.count; i < l; i ++, nbVertex++ ) {

              vertex.x = vertices.getX( i );
              vertex.y = vertices.getY( i );
              vertex.z = vertices.getZ( i );

              // transfrom the vertex to world space
              vertex.applyMatrix4( mesh.matrixWorld );

              // transform the vertex to export format
              output += 'v ' + vertex.x + ' ' + vertex.y + ' ' + vertex.z + '\n';

            }

          }

          // uvs

          if( uvs !== undefined ) {

            for ( i = 0, l = uvs.count; i < l; i ++, nbVertexUvs++ ) {

              uv.x = uvs.getX( i );
              uv.y = uvs.getY( i );

              // transform the uv to export format
              output += 'vt ' + uv.x + ' ' + uv.y + '\n';

            }

          }

          // normals

          if( normals !== undefined ) {

            normalMatrixWorld.getNormalMatrix( mesh.matrixWorld );

            for ( i = 0, l = normals.count; i < l; i ++, nbNormals++ ) {

              normal.x = normals.getX( i );
              normal.y = normals.getY( i );
              normal.z = normals.getZ( i );

              // transfrom the normal to world space
              normal.applyMatrix3( normalMatrixWorld );

              // transform the normal to export format
              output += 'vn ' + normal.x + ' ' + normal.y + ' ' + normal.z + '\n';

            }

          }

          // faces

          if( indices !== null ) {

            for ( i = 0, l = indices.count; i < l; i += 3 ) {

              for( m = 0; m < 3; m ++ ){

                j = indices.getX( i + m ) + 1;

                face[ m ] = ( indexVertex + j ) + '/' + ( uvs ? ( indexVertexUvs + j ) : '' ) + '/' + ( indexNormals + j );

              }

              // transform the face to export format
              output += 'f ' + face.join( ' ' ) + "\n";

            }

          } else {

            for ( i = 0, l = vertices.count; i < l; i += 3 ) {

              for( m = 0; m < 3; m ++ ){

                j = i + m + 1;

                face[ m ] = ( indexVertex + j ) + '/' + ( uvs ? ( indexVertexUvs + j ) : '' ) + '/' + ( indexNormals + j );

              }

              // transform the face to export format
              output += 'f ' + face.join( ' ' ) + "\n";

            }

          }

        } else {

          console.warn( 'THREE.OBJExporter.parseMesh(): geometry type unsupported', geometry );

        }

        // update index
        indexVertex += nbVertex;
        indexVertexUvs += nbVertexUvs;
        indexNormals += nbNormals;

      };

      var parseLine = function( line ) {

        var nbVertex = 0;

        var geometry = line.geometry;
        var type = line.type;

        if ( geometry instanceof THREE.Geometry ) {

          geometry = new THREE.BufferGeometry().setFromObject( line );

        }

        if ( geometry instanceof THREE.BufferGeometry ) {

          // shortcuts
          var vertices = geometry.getAttribute( 'position' );
          var indices = geometry.getIndex();

          // name of the line object
          output += 'o ' + line.name + '\n';

          if( vertices !== undefined ) {

            for ( i = 0, l = vertices.count; i < l; i ++, nbVertex++ ) {

              vertex.x = vertices.getX( i );
              vertex.y = vertices.getY( i );
              vertex.z = vertices.getZ( i );

              // transfrom the vertex to world space
              vertex.applyMatrix4( line.matrixWorld );

              // transform the vertex to export format
              output += 'v ' + vertex.x + ' ' + vertex.y + ' ' + vertex.z + '\n';

            }

          }

          if ( type === 'Line' ) {

            output += 'l ';

            for ( j = 1, l = vertices.count; j <= l; j++ ) {

              output += ( indexVertex + j ) + ' ';

            }

            output += '\n';

          }

          if ( type === 'LineSegments' ) {

            for ( j = 1, k = j + 1, l = vertices.count; j < l; j += 2, k = j + 1 ) {

              output += 'l ' + ( indexVertex + j ) + ' ' + ( indexVertex + k ) + '\n';

            }

          }

        } else {

          console.warn('THREE.OBJExporter.parseLine(): geometry type unsupported', geometry );

        }

        // update index
        indexVertex += nbVertex;

      };

      object.traverse( function ( child ) {

        if ( child instanceof THREE.Mesh ) {

          parseMesh( child );

        }

        if ( child instanceof THREE.Line ) {

          parseLine( child );

        }

      } );

      return output;

    }
    OBJExporter.prototype.saveOBJ = function(scene, name, resolution) {
      
      var sceneMesh;
      
      var geometry = new THREE.Geometry(); 
  
      var atomUUIDs = {};

      scene.traverse(function(object) {

          if (
              object instanceof THREE.ArrowHelper ||
              (
                  object instanceof THREE.Mesh &&
                  (
                      object.visible === true &&
                      (

                          (object.parent.name === 'subtractedAtom' && object.parent.visible === true) ||
                          object.name === 'grid' ||
                          object.name === 'plane' ||
                          object.name === 'point' ||
                          object.name === 'direction' ||
                          object.name === 'dirLine' ||
                          object.name === 'crystalSolidVoid' ||
                          object.name === 'face'
                      )
                  ) ||
                  (
                      object.parent &&
                      object.parent.visible === true &&
                      object.parent.name === 'atom' 
                  )
              )
          ) 
          { 
            if(object.geometry){
              // console.log(object.parent.position);

              object.parent.updateMatrix(); 
            object.updateMatrix();

            var g = calcGeometry(resolution, object);
            var matrix = object.matrix;
            
            if(object.parent.name === 'atom' && atomUUIDs[object.parent.uuid] === undefined){ 
              atomUUIDs[object.parent.uuid] = 1;
              
              var m = new THREE.Mesh(calcGeometry(resolution, object), new THREE.MeshPhongMaterial({ color : '#ff0000' }));
              m.position.copy(object.parent.position.clone());
              m.scale.set(object.parent.scale.x, object.parent.scale.y, object.parent.scale.z);
              m.updateMatrix(); 
              g = m.geometry.clone();
              matrix = object.parent.matrix;

            }
            else if(atomUUIDs[object.parent.uuid] !== undefined){
              return;
            }
             
              geometry.merge( g, matrix);
            }
            else{
              console.log('---')
            }
            
          } 
      });
 
      sceneMesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({ color : '#ff0000' }));
        var objString = this.parse(sceneMesh);

        if (name === undefined) {
            return objString;
        }

        var blob = new Blob([objString], {
            type: 'text/plain'
        });

        saveAs(blob, name + '.obj');

    }

    return OBJExporter;
});