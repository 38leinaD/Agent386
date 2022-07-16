/*
 * Copyright (C) 2010 fruitfly (Daniel Platz)
 *
 * This software is available under a BSD license. Please see the LICENSE.TXT file for details.
 */

define(function(require) {
    var gl = require('gl');
    var assets = require('assets');
    var res = require('resources');

    var Level = require('classes/Level');
    var Scene = require('classes/Scene');
    var DemoScene = require('classes/scenes/DemoScene');
    var IntroScene = require('classes/scenes/IntroScene');
    var LevelScene = require('classes/scenes/LevelScene');
    var MessageScene = require('classes/scenes/MessageScene');
    var LevelSelectionScene = require('classes/scenes/LevelSelectionScene');

    var Shader = require('classes/Shader');
    var VertexBuffer = require('classes/VertexBuffer');

    var LoadScene = Scene.extend({
        init: function(sceneManager) {
            this._super(sceneManager);

            this.batch = res.colorBatch;

            this.progress = 0.0;
            this.errorPrinted = false;
            this.timerSet = false;
        },

        tick: function() {

            if (assets.hasError()) {
                if (!this.errorPrinted) {
                    this.progress = 1.0;
                    this.errorPrinted = true;
                    setTimeout(function() {
                        alert('Error while loading "' + assets.getErrorFile() + '"');
                    }, 100);
                }
                return;
            }

            this.progress = assets.getProgress();

            if (!assets.update() && !this.timerSet) {
                var self = this;
                self.timerSet = true;
                setTimeout(function() {
                    res.init(2);
                    self.sceneManager.scenes.pop();
                    self.sceneManager.scenes.push(new IntroScene(self.sceneManager));
                    //self.sceneManager.scenes.push(new LevelSelectionScene(self.sceneManager));
                    //self.sceneManager.scenes.push(new LevelScene(self.sceneManager, Level.levels[3].file, Level.levels[3].name));
                    /*self.sceneManager.scenes.push(new MessageScene(self.sceneManager, "TEST 123", 5000,
                        [{text: "Continue", action: null, button: 'A'}]));*/
                }, 500);
            }
        },

        render: function() {
            gl.clearColor(0.0, 0.0, 0.0, 1.0);

            gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
            gl.clear(gl.COLOR_BUFFER_BIT);

            var height = gl.viewportHeight/gl.viewportWidth;

            mat4.ortho(this.batch.pMatrix, 0.0, 1.0, 0.0, height, 0.0, 10.0);
            mat4.identity(this.batch.mvMatrix);

            this.batch.tintColor = [0.1, 0.1, 0.1, 1.0];
            this.batch.begin();
            this.batch.renderQuadDown(0.2, height/2.0 + 0.05, 0.6, 0.1);
            this.batch.end();

            if (assets.hasError()) {
                this.batch.tintColor = [1.0, 0.0, 0.0, 1.0];
            }
            else {
                this.batch.tintColor = [1.0, 1.0, 1.0, 1.0];
            }

            this.batch.begin();
            this.batch.renderQuadDown(0.2, height/2.0 + 0.05, 0.6 * this.progress, 0.1);
            this.batch.end();
        }
    });

    return LoadScene;
});