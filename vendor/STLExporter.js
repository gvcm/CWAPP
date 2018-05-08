/**
 * Based on https://github.com/mrdoob/three.js/blob/a72347515fa34e892f7a9bfa66a34fdc0df55954/examples/js/exporters/STLExporter.js
 * Tested on r68 and r70
 * @author jcarletto / https://github.com/jcarletto27
 * @author kjlubick / https://github.com/kjlubick
 * @author kovacsv / http://kovacsv.hu/
 * @author mrdoob / http://mrdoob.com/
 * edited by Thanos Saringelos
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
    function STLExporter() {
        THREE.STLExporter = function() {};

        THREE.STLExporter.prototype = {

            constructor: THREE.STLExporter,

            parse: (function() {

                var vector = new THREE.Vector3();
                var normalMatrixWorld = new THREE.Matrix3();

                return function parse(scene, resolution) {

                    var atomUUIDs = {};

                    var triangles = 0;
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
                                    atomUUIDs[object.parent.uuid] === undefined &&
                                    object.parent.name === 'atom'

                                )
                            )
                        )

                        {
                            atomUUIDs[object.parent.uuid] = object.parent.uuid;
                            var tempGeom = calcGeometry(resolution, object);
                            triangles += tempGeom.faces.length;
                        } 
                    });

                    atomUUIDs = {};

                    var offset = 80; // skip header
                    var bufferLength = triangles * 2 + triangles * 3 * 4 * 4 + 80 + 4;
                    var arrayBuffer = new ArrayBuffer(bufferLength);
                    var output = new DataView(arrayBuffer);
                    output.setUint32(offset, triangles, true);
                    offset += 4;

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
                                    atomUUIDs[object.parent.uuid] === undefined &&
                                    object.parent.name === 'atom'

                                )
                            )
                        )

                        {

                            atomUUIDs[object.parent.uuid] = object.parent.uuid;

                            var geometry = object.geometry;

                            object.updateMatrix();
                            geometry = calcGeometry(resolution, object);

                            var matrixWorld = object.matrixWorld;

                            var vertices = geometry.vertices;
                            var faces = geometry.faces;

                            normalMatrixWorld.getNormalMatrix(matrixWorld);

                            for (var i = 0, l = faces.length; i < l; i++) {

                                var face = faces[i];

                                vector.copy(face.normal).applyMatrix3(normalMatrixWorld).normalize();

                                output.setFloat32(offset, vector.x, true);
                                offset += 4; // normal
                                output.setFloat32(offset, vector.y, true);
                                offset += 4;
                                output.setFloat32(offset, vector.z, true);
                                offset += 4;

                                var indices = [face.a, face.b, face.c];

                                for (var j = 0; j < 3; j++) {

                                    vector.copy(vertices[indices[j]]).applyMatrix4(matrixWorld);

                                    output.setFloat32(offset, vector.x, true);
                                    offset += 4; // vertices
                                    output.setFloat32(offset, vector.y, true);
                                    offset += 4;
                                    output.setFloat32(offset, vector.z, true);
                                    offset += 4;

                                }

                                output.setUint16(offset, 0, true);
                                offset += 2; // attribute byte count

                            }
                        }
                    });

                    return output;

                };

            }())

        };

    }

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
                geometry = object.geometry;
            } else if (res === 'medium') {
                geometry = new THREE.SphereGeometry(object.geometry.parameters.radius, 16, 16);
            } else {
                geometry = new THREE.SphereGeometry(object.geometry.parameters.radius, 16, 8);
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
    STLExporter.prototype.saveSTL = function(scene, name, resolution) {


        var exporter = new THREE.STLExporter();
        var stlString = exporter.parse(scene, resolution);

        if (name === undefined) {
            return stlString;
        }

        var blob = new Blob([stlString], {
            type: 'text/plain'
        });

        saveAs(blob, name + '.stl');

    }

    return STLExporter;
});

var BinaryStlWriter = (function() {
    var that = {};

    var writeVector = function(dataview, offset, vector, isLittleEndian) {
        offset = writeFloat(dataview, offset, vector.x, isLittleEndian);
        offset = writeFloat(dataview, offset, vector.y, isLittleEndian);
        return writeFloat(dataview, offset, vector.z, isLittleEndian);
    };

    var writeFloat = function(dataview, offset, float, isLittleEndian) {
        dataview.setFloat32(offset, float, isLittleEndian);
        return offset + 4;
    };

    var geometryToDataView = function(geometry) {
        var tris = geometry.faces;
        var verts = geometry.vertices;

        var isLittleEndian = true; // STL files assume little endian, see wikipedia page

        var bufferSize = 84 + (50 * tris.length);
        var buffer = new ArrayBuffer(bufferSize);
        var dv = new DataView(buffer);
        var offset = 0;

        offset += 80; // Header is empty

        dv.setUint32(offset, tris.lengtb, isLittleEndian);
        offset += 4;

        for (var n = 0; n < tris.length; n++) {
            offset = writeVector(dv, offset, tris[n].normal, isLittleEndian);
            offset = writeVector(dv, offset, verts[tris[n].a], isLittleEndian);
            offset = writeVector(dv, offset, verts[tris[n].b], isLittleEndian);
            offset = writeVector(dv, offset, verts[tris[n].c], isLittleEndian);
            offset += 2; // unused 'attribute byte count' is a Uint16
        }

        return dv;
    };

    var save = function(geometry, filename) {
        var dv = geometryToDataView(geometry);
        var blob = new Blob([dv], {
            type: 'application/octet-binary'
        });

        // FileSaver.js defines `saveAs` for saving files out of the browser
        saveAs(blob, filename);
    };

    that.save = save;
    return that;
}());