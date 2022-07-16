/*
 * Copyright (C) 2010 fruitfly (Daniel Platz)
 *
 * This software is available under a BSD license. Please see the LICENSE.TXT file for details.
 */

define(function(require) {
    var gl = require('gl');
    var input = require('input');
    var assets = require('assets');

    var Scene = require('classes/Scene');
    var Shader = require('classes/Shader');
    var VertexBuffer = require('classes/VertexBuffer');
    var BitmapFont = require('classes/BitmapFont');
    var Texture = require('classes/Texture');

    var DemoScene = Scene.extend({
        init: function(sceneManager) {
            this._super(sceneManager);

            this.mvMatrix = mat4.create();
            this.pMatrix = mat4.create();

            this.shader = new Shader('tex-vs', 'tex-fs', ['uPMatrix', 'uMVMatrix', 'uSampler'], ['aVertexPosition', 'aTextureCoord']);

            this.player = {
                x: 0.0,
                y: 0.0
            };

            this.vbo = new VertexBuffer(10, [VertexBuffer.Position, VertexBuffer.TextureCoords]);
            this.vbo.setData([
                -1.0,  -1.0,  0.0, 0.0, 0.0,
                1.0,  -1.0,  0.0, 1.0, 0.0
            ]);

            this.vbo.addData([
                -1.0, 1.0,  0.0, 0.0, 1.0,
                -1.0, 1.0,  0.0, 0.0, 1.0
            ]);

            this.vbo.addData([
                1.0,  -1.0,  0.0, 1.0, 0.0,
                1.0, 1.0,  0.0, 1.0, 1.0
            ]);

            this.texture = new Texture('assets/tilemap.png');
            this.font = new BitmapFont('assets/fonts/04.json');
        },

        tick: function() {
            // Speed in pixels per second
            var playerSpeed = 0.1;

            if(input.isDown('DOWN')) {
                // dt is the number of seconds passed, so multiplying by
                // the speed gives u the number of pixels to move
                this.player.y += playerSpeed;
            }

            if(input.isDown('UP')) {
                this.player.y -= playerSpeed;
            }

            if(input.isDown('LEFT')) {
                this.player.x -= playerSpeed;
            }

            if(input.isDown('RIGHT')) {
                this.player.x += playerSpeed;
            }
        },
        render: function() {

            gl.clearColor(1.0, 0.0, 0.0, 1.0);
            gl.enable(gl.DEPTH_TEST);

            gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            //gl.activeTexture(gl.TEXTURE0);
            //gl.bindTexture(gl.TEXTURE_2D, this.tex);
            this.texture.bind();

            mat4.perspective(this.pMatrix, 45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0);

            mat4.identity(this.mvMatrix);
            mat4.translate(this.mvMatrix, this.mvMatrix, [-1.5, 0.0, -7.0]);
            mat4.translate(this.mvMatrix, this.mvMatrix, [3.0 + this.player.x, 0.0 + this.player.y, 0.0]);

            gl.uniformMatrix4fv(this.shader.uniforms.uPMatrix, false, this.pMatrix);
            gl.uniformMatrix4fv(this.shader.uniforms.uMVMatrix, false, this.mvMatrix);
            gl.uniform1i(this.shader.uniforms.uSampler, 0);

            this.vbo.render(this.shader, gl.TRIANGLES);
        }
    });

    return DemoScene;
});