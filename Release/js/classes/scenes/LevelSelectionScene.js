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
    var Level = require('classes/Level');
    var MessageScene = require('classes/scenes/MessageScene');
    var LevelScene = require('classes/scenes/LevelScene');

    var LevelSelectionScene = Scene.extend({
        init: function(sceneManager) {
            this._super(sceneManager);

            this.fontBig = new BitmapFont('assets/fonts/04.json');
            this.fontBig.setScale(3.0);
            this.fontSmall = new BitmapFont('assets/fonts/04.json');
            this.fontSmall.setScale(1.5);
            this.maxLevel = parseInt(localStorage["maxLevel"]);
            if (localStorage["maxLevel"] == null) this.maxLevel = 0;

            this.selection = this.maxLevel;

            this.entpreller = 20;
        },

        tick: function() {
            this.entpreller--;

            if (this.entpreller <= 0) {
                if (input.isDown("DOWN")) {
                    this.selection++;
                    if (this.selection > this.maxLevel) this.selection = 0;
                    this.entpreller = 10;


                }
                else if (input.isDown("UP")) {
                    this.selection--;
                    if (this.selection < 0) this.selection = this.maxLevel;
                    console.log("UP");
                    this.entpreller = 10;

                }
                else if (input.isDown("A")) {
                    console.log("TEST");
                    this.sceneManager.scenes.pop();
                    this.sceneManager.scenes.push(new LevelScene(this.sceneManager, Level.levels[this.selection].file, Level.levels[this.selection].name));
                    this.sceneManager.scenes.push(new MessageScene(this.sceneManager, Level.levels[this.selection].name, 1000));
                    this.entpreller = 10;
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

            var textSize = this.fontBig.getSize("Select a level to play");
            res.spriteSheet.texture.bind();
            res.textureBatch.tintColor = [1.0, 1.0, 1.0, 1.0];
            res.textureBatch.begin();
            res.textureBatch.renderQuad(width/2.0 - 10 - 3, height - textSize.h - 5 - (this.selection)*1.5 - 1.7, 2.0, 2.0, res.spriteSheet.get("button_A.png").uvs);
            res.textureBatch.end();

            this.fontSmall.tintColor = [1.0, 1.0, 1.0, 1.0];

            this.fontBig.texture.bind();
            res.textureBatch.begin();
            this.fontBig.renderString(res.textureBatch, "Select a level to play", width/2.0 - textSize.w/2.0, height - textSize.h - 1, {x: 0.05, y: 0.05});
            res.textureBatch.end();

            this.fontSmall.texture.bind();
            res.textureBatch.begin();
            for (var i=0; i<=this.maxLevel; i++) {
                this.fontSmall.renderString(res.textureBatch, Level.levels[i].name, width/2.0 - 10, height - textSize.h - 5 - i*1.5, {x: 0.05, y: 0.05});
            }
            res.textureBatch.end();

            this.fontSmall.tintColor = [0.5, 0.5, 0.5, 1.0];

            this.fontSmall.texture.bind();
            res.textureBatch.begin();
            for (var i=this.maxLevel+1; i<Level.levels.length; i++) {
                this.fontSmall.renderString(res.textureBatch, Level.levels[i].name, width/2.0 - 10, height - textSize.h - 5 - i*1.5, {x: 0.05, y: 0.05});
            }
            res.textureBatch.end();
        }
    });

    return LevelSelectionScene;
});
