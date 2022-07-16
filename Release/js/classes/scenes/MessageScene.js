/*
 * Copyright (C) 2010 fruitfly (Daniel Platz)
 *
 * This software is available under a BSD license. Please see the LICENSE.TXT file for details.
 */

define(function(require) {
    var gl = require('gl');
    var input = require('input');
    var assets = require('assets');
    var res = require('resources');

    var Scene = require('classes/Scene');
    var BitmapFont = require('classes/BitmapFont');

    var MessageScene = Scene.extend({
        init: function(sceneManager, message, timeout, actions) {
            this._super(sceneManager);
            this.message = message;
            this.font = new BitmapFont('assets/fonts/04.json');
            this.font.setScale(4.0);
            this.actions = actions;
            this.timeout = timeout;
            this.inited = false;
        },

        tick: function() {
            var self = this;

            if (!this.inited) {
                if (this.actions === undefined) {
                    setTimeout(function() {
                        self.sceneManager.scenes.pop();
                    }, this.timeout);
                }
                this.inited = true;
            }

            if (this.actions != null) {
                for (var i=0; i<this.actions.length; i++) {
                    var action = this.actions[i];
                    //console.log("DOWN?" + action.button + " --> " +  input.isDown('A'));
                    if (input.isDown(action.button)) {
                        this.sceneManager.scenes.pop();
                        if (action.action != null) this.sceneManager.scenes.push(action.action);
                    }
                }
            }
        },

        render: function() {
            gl.clearColor(0.8, 0.8, 0.8, 1.0);

            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

            gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
            gl.clear(gl.COLOR_BUFFER_BIT);

            var width = 50.0;
            var height = width * (gl.viewportHeight/gl.viewportWidth);

            // Ortho Overlays
            mat4.ortho(res.textureBatch.pMatrix, 0.0, width, 0.0, height, -10.0, 10.0);
            mat4.identity(res.textureBatch.mvMatrix);

            var textSize = this.font.getSize(this.message);

            this.font.texture.bind();
            res.textureBatch.begin();
            this.font.renderString(res.textureBatch, this.message, width/2.0 - textSize.w/2.0, height/2.0 + (this.actions != null ? 4 : 0) + textSize.h/2.0, {x: 0.05, y: 0.05});
            res.textureBatch.end();

            var scale = this.font.scale;
            this.font.scale = 1.5;

            this.font.texture.bind();
            res.textureBatch.begin();
            if (this.actions != null) {
                if (this.actions.length == 1) {
                    this.font.renderString(res.textureBatch, this.actions[0].text, width/2.0 - 3, 7.0,  {x: 0.05, y: 0.05});
                }
                else if (this.actions.length == 2) {
                    this.font.renderString(res.textureBatch, this.actions[0].text, 11, 6.5,  {x: 0.05, y: 0.05});
                    this.font.renderString(res.textureBatch, this.actions[1].text, width - 15, 6.5,  {x: 0.05, y: 0.05});
                }
            }
            res.textureBatch.end();

            if (this.actions != null) {
                res.spriteSheet.texture.bind();
                res.textureBatch.tintColor = [1.0, 1.0, 1.0, 1.0];
                res.textureBatch.begin();
                if (this.actions.length == 1) {
                    res.textureBatch.renderQuad(width/2.0 - 6, 5.2, 2.0, 2.0, res.spriteSheet.get("button_" + this.actions[0].button + ".png").uvs);
                }
                else if (this.actions.length == 2) {
                    var action0 = this.actions[0];
                    var action1 = this.actions[1];
                    res.textureBatch.renderQuad(8, 5.0, 2.0, 2.0, res.spriteSheet.get("button_" + this.actions[0].button + ".png").uvs);
                    res.textureBatch.renderQuad(width - 18, 5.0, 2.0, 2.0, res.spriteSheet.get("button_" + this.actions[1].button + ".png").uvs);
                }
                res.textureBatch.end();
            }

            this.font.scale = scale;
        }
    });

    return MessageScene;
});