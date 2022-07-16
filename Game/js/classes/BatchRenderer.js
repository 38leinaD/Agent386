/*
 * BatchRenderer - Convenience Renderer to draw textured quads in an efficient/batched way.
 *
 * Copyright (C) 2010 fruitfly (Daniel Platz)
 *
 * This software is available under a BSD license. Please see the LICENSE.TXT file for details.
 */

define(function(require) {
    var gl = require('gl');

    var VertexBuffer = require('classes/VertexBuffer');
    var Shader = require('classes/Shader');
    var Texture = require('classes/Texture');

    var BatchRenderer = Class.extend({
        init: function(shader, vertexBuffer) {
            this.vb = vertexBuffer
            this.shader = shader;

            this.mvMatrix = mat4.create();
            mat4.identity(this.mvMatrix);
            this.pMatrix = mat4.create();
            mat4.identity(this.pMatrix);

            this.tintColor = [1.0, 1.0, 1.0, 1.0];

            this.begun = false;
        },

        begin: function() {
            this.shader.use();

            gl.uniformMatrix4fv(this.shader.uniforms.uPMatrix, false, this.pMatrix);
            gl.uniformMatrix4fv(this.shader.uniforms.uMVMatrix, false, this.mvMatrix);

            // Optional Parameters
            if (this.shader.uniforms.uSampler !== undefined) {
                gl.uniform1i(this.shader.uniforms.uSampler, 0);
            }
            if (this.shader.uniforms.uColor !== undefined) {
                gl.uniform4fv(this.shader.uniforms.uColor, this.tintColor);
            }

            this.begun = true;
        },

        renderQuadDown: function(x, y, w, h, uvs) {


if (uvs === undefined) {
            this.vb.addData([
                x, y - h,  0.0,
                x + w, y - h,  0.0,
                x, y,  0.0,
                x, y,  0.0,
                x + w, y - h,  0.0,
                x + w, y,  0.0
            ]);
}
            else {
    this.vb.addData([
        x, y - h,  0.0,         uvs.u1, uvs.v2,
        x + w, y - h,  0.0,     uvs.u2, uvs.v2,
        x, y,  0.0,             uvs.u1, uvs.v1,
        x, y,  0.0,             uvs.u1, uvs.v1,
        x + w, y - h,  0.0,     uvs.u2, uvs.v2,
        x + w, y,  0.0,         uvs.u2, uvs.v1
    ]);
}

            /*
             var buf = [];
            buf.push(x, y - h,  0.0);
            if (this.uvs !== undefined) {
                buf.push(uvs.u1, uvs.v2);
            }

            buf.push(x + w, y - h,  0.0);
            if (this.uvs !== undefined) {
                buf.push(uvs.u2, uvs.v2);
            }

            buf.push(x, y,  0.0);
            if (this.uvs !== undefined) {
                buf.push(uvs.u1, uvs.v1);
            }

            buf.push(x, y,  0.0);
            if (this.uvs !== undefined) {
                buf.push(uvs.u1, uvs.v1);
            }

            buf.push(x + w, y - h,  0.0);
            if (this.uvs !== undefined) {
                buf.push(uvs.u2, uvs.v2);
            }

            buf.push(x + w, y,  0.0);
            if (this.uvs !== undefined) {
                buf.push(uvs.u2, uvs.v1);
            }

            this.vb.addData(buf);
            */

            if (this.vb.bufferSize - this.vb.bufferUse < 6) {
                this.end();
                this.begin();
            }
        },

        // renders with x,y defined at lower left corner; todo: refactor
        renderQuad: function(x, y, w, h, uvs) {


            if (uvs === undefined) {
                this.vb.addData([
                    x, y,  0.0,
                    x + w, y,  0.0,
                    x, y + h,  0.0,
                    x, y + h,  0.0,
                    x + w, y,  0.0,
                    x + w, y + h,  0.0
                ]);
            }
            else {
                this.vb.addData([
                    x, y,  0.0,         uvs.u1, uvs.v2,
                    x + w, y,  0.0,     uvs.u2, uvs.v2,
                    x, y + h,  0.0,             uvs.u1, uvs.v1,
                    x, y + h,  0.0,             uvs.u1, uvs.v1,
                    x + w, y,  0.0,     uvs.u2, uvs.v2,
                    x + w, y + h,  0.0,         uvs.u2, uvs.v1
                ]);
            }


            if (this.vb.bufferSize - this.vb.bufferUse < 6) {
                this.end();
                this.begin();
            }
        },

        end: function() {
            this.vb.render(this.shader, gl.TRIANGLES);
            this.vb.reset();
            this.begun = false;
        }

    });

    return BatchRenderer;
});