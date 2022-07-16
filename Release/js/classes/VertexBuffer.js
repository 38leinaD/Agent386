/*
 * Copyright (C) 2010 fruitfly (Daniel Platz)
 *
 * This software is available under a BSD license. Please see the LICENSE.TXT file for details.
 */

define(function(require) {
    var gl = require('gl');

    var VertexBuffer = Class.extend({
        init: function(size, attributes) {
            this.vboId = gl.createBuffer();
            this.attributes = attributes;
            this.elementSize = 0;
            this.elementDataSize = 0;
            this.dirty = true;

            for (var i=0; i<attributes.length; i++) {
                this.elementSize += attributes[i].elements;

                if (attributes[i].type === gl.FLOAT) {
                    this.elementDataSize += attributes[i].elements * 4;
                }
                else {
                    console.error('Unsupported type "' + attributes[i].type + '"');
                }
            }

            this.buffer = new Float32Array(size * this.elementSize);
            this.bufferUse = 0;
            this.bufferSize = size;

            this.setData([]);
        },

        setData: function(data) {
            this.reset();
            this.addData(data);
        },

        addData: function(data) {
            this.buffer.set(data, this.bufferUse);
            this.bufferUse += data.length;
            this.numItems = this.bufferUse / this.elementSize;
            this.dirty = true;
        },

        reset: function() {
            this.bufferUse = 0;
            this.numItems = 0;
            this.dirty = true;
        },

        render: function(shader, mode) {
            if (mode !== gl.TRIANGLES) {
                console.error('Drawing mode "' + mode + '" not supported by VertexBuffer-class.');
            }

            if (this.numItems == 0) {
                this.dirty = 0;
                return;
            }

            gl.bindBuffer(gl.ARRAY_BUFFER, this.vboId);

            if (this.dirty) {
                gl.bufferData(gl.ARRAY_BUFFER, this.buffer, gl.STATIC_DRAW);
                this.dirty = false;
            }

            var offset = 0;
            for (var i=0; i<this.attributes.length; i++) {
                var attribute = this.attributes[i];
                gl.vertexAttribPointer(shader.attributes[attribute.name], attribute.elements, attribute.type, false, this.elementDataSize, offset);
                offset += attribute.dataSize;
            }

            shader.preRender();

            gl.drawArrays(mode, 0, this.numItems);
        }
    });

    VertexBuffer.Attribute = Class.extend({
        init: function(name, elements, type) {
            this.name = name;
            this.elements = elements;
            this.type = type;

            if (type === gl.FLOAT) {
                this.dataSize = elements * 4;
            }
            else {
                console.error('Unsupported type "' + type + '"');
            }
        }
    });

    // Convenience attributes
    VertexBuffer.Position = new VertexBuffer.Attribute('aVertexPosition', 3, gl.FLOAT);
    VertexBuffer.TextureCoords = new VertexBuffer.Attribute('aTextureCoord', 2, gl.FLOAT);

    return VertexBuffer;
});