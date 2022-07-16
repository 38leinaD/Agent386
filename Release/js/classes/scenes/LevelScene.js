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
    var config = require('config');
    var audio = require('audio');


    var Scene = require('classes/Scene');
    var Texture = require('classes/Texture');
    var BatchRenderer = require('classes/BatchRenderer');
    var BitmapFont = require('classes/BitmapFont');

    var SpriteSheet = require('classes/SpriteSheet');
    var Sprite = require('classes/Sprite');
    var Level = require('classes/Level');
    var Player = require('classes/Player');

    //var IntroScene = require('classes/scenes/IntroScene');
    var MessageScene = require('classes/scenes/MessageScene');

    function flipU(uvs) {
        return {
            u1: uvs.u2,
            v1: uvs.v1,
            u2: uvs.u1,
            v2: uvs.v2
        };
    }

    var LevelScene = Scene.extend({
        init: function(sceneManager, level, name, player) {
            this._super(sceneManager);

            this.texBatch = res.textureBatch;

            this.font = new BitmapFont('assets/fonts/04.json');
            this.font.setScale(0.5);

            this.ticker = 0;
            this.level = new Level(level, name);
            if (player === undefined) player = new Player();
            player.x = this.level.playerSpawn.x;
            player.y = this.level.playerSpawn.y;
            player.right = this.level.spawnRight;
            player.level = this.level;

            player.reset();

            this.level.player = player;
            this.dispatched = false;
            this.camera = {
                x: 0,
                y: 0,
                w: 20,
                h: 20*gl.viewportHeight/gl.viewportWidth,
                ratio: gl.viewportHeight/gl.viewportWidth
            };

            this.initEnd = false;
        },

        tick: function() {
            if (this.ticker == 0) {
                if (this.level.song != null) {
                    audio.playSong(assets.get("assets/audio/" + this.level.song));
                }
            }

            this.ticker++;
            this.level.tick();

            this.camera.x = this.level.player.x + this.level.player.w/2.0;
            this.camera.y = this.level.player.y + this.level.player.h/2.0;

            // Check for level bounds
            this.camera.x = Math.max(this.camera.x, this.camera.w/2.0);
            this.camera.x = Math.min(this.camera.x, this.level.width - this.camera.w/2.0);

            this.camera.y = Math.max(this.camera.y, this.camera.h/2.0);
            this.camera.y = Math.min(this.camera.y, this.level.height - this.camera.h/2.0);

            if (this.level.lost) {
                if (!this.initEnd) {
                    audio.stopSong();
                    var self = this;
                    setTimeout(function() {
                        self.sceneManager.scenes.pop();

                        var highScore = localStorage["highscore"];
                        var newHighscore = (highScore < self.level.player.score);
                        if (newHighscore) {
                            localStorage["highscore"] = self.level.player.score;
                            self.sceneManager.scenes.push(new MessageScene(self.sceneManager, "New Highscore: " + self.level.player.score, 3000, [{text: "Continue", action: null, button: 'A'}]));
                        }

                        self.sceneManager.scenes.push(new MessageScene(self.sceneManager, "Game Over!", 3000));

                    }, 3000);
                    this.initEnd = true;
                }
            }
            else if (this.level.requestRestart && !this.dispatched) {
                this.dispatched = true;
                var self = this;
                setTimeout(function() {
                    self.sceneManager.scenes.pop();
                    self.sceneManager.scenes.push(new LevelScene(self.sceneManager, self.level.levelFile, self.level.name, self.level.player));
                    self.sceneManager.scenes.push(new MessageScene(self.sceneManager, self.level.name, 2000));
                }, 3000);

            }
            else if (this.level.ended && !this.dispatched) {
                var self = this;
                this.dispatched = true;


                var nextLevelIndex = -1;

                for (var i=0; i<Level.levels.length; i++) {
                    var level = Level.levels[i];

                    if (this.level.levelFile === level.file) {
                        if (i < Level.levels.length - 1) {
                            nextLevelIndex = i + 1;
                            break;
                        }
                    }
                }

                if (localStorage["maxLevel"] == null || localStorage["maxLevel"] < nextLevelIndex) {
                    localStorage["maxLevel"] = nextLevelIndex;
                }

                setTimeout(function() {
                    audio.stopSong();

                    self.sceneManager.scenes.pop();

                    self.level.player.score += (((self.level.maxTime - Math.floor(self.level.ticker/60)) * 10));
                    if (nextLevelIndex >= 0) {
                        self.sceneManager.scenes.pop();
                        var nextLevelScene = new LevelScene(self.sceneManager, Level.levels[nextLevelIndex].file, Level.levels[nextLevelIndex].name, self.level.player);
                        self.sceneManager.scenes.push(nextLevelScene);
                        self.sceneManager.scenes.push(new MessageScene(self.sceneManager, nextLevelScene.level.name, 2000));
                        self.sceneManager.scenes.push(new MessageScene(self.sceneManager, "Level completed!\nScore: " + self.level.player.score, 3000, [{text: "Continue", action: null, button: 'A'}]));
                    }
                    else {
                        var highScore = localStorage["highscore"];
                        var newHighscore = (highScore < self.level.player.score);
                        self.sceneManager.scenes.pop();
                        if (newHighscore) {
                            localStorage["highscore"] = self.level.player.score;
                            self.sceneManager.scenes.push(new MessageScene(self.sceneManager, "New Highscore: " + self.level.player.score, 2000. [{text: "Continue", action: null, button: 'A'}]));
                            self.sceneManager.scenes.push(new MessageScene(self.sceneManager, "You won!", 3000))
                        }
                        else {
                            self.sceneManager.scenes.push(new MessageScene(self.sceneManager, "You finished the Game!\nYour Score: " + self.level.player.score+"\nHighscore: " + highScore, 5000, [{text: "Continue", action: null, button: 'A'}]));
                        }
                    }
                }, 3000);
            }
        },

        render: function() {
            //gl.clearColor(0.8, 0.8, 0.8, 1.0);
            var bg = this.level.backgroundColor;
            //gl.clearColor(1.0, 0.95, 0.8, 1.0);
            gl.clearColor(bg.r, bg.g, bg.b, 1.0);
            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

            gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
            gl.clear(gl.COLOR_BUFFER_BIT);

            var width = this.camera.w;
            var height = this.camera.h;

            mat4.ortho(this.texBatch.pMatrix, 0.0, width, 0.0, height, -10.0, 10.0);

            var text = this.level.name;
            var textSize = this.font.getSize(text);
            this.renderTiles();

            var floppyText = this.level.floppiesCollected + " of " + (this.level.floppies) + " floppies collected";
            var floppyTextSize = this.font.getSize(floppyText);

            mat4.identity(this.texBatch.mvMatrix);
            this.texBatch.tintColor = [1.0 , 1.0, 1.0, 1.0];

            this.font.texture.bind();
            this.texBatch.begin();
            this.font.renderString(this.texBatch, text, width/2.0 - textSize.w/2.0, height, {x: 0.1, y: 0.1});
            this.font.renderString(this.texBatch, floppyText, width/2.0 - floppyTextSize.w/2.0, floppyTextSize.h, {x: 0.1, y: 0.1});
            this.texBatch.end();

            var timeLeft = this.level.maxTime - Math.floor(this.level.ticker / 60);

            if (timeLeft < 15) {
                this.font.tintColor = [1.0 , 0.0, 0.0, 1.0];
            }
            else {
                this.font.tintColor = [1.0 , 1.0, 1.0, 1.0];
            }

            var timeLeftText = "Time: " + timeLeft;
            var timeLeftTextSize = this.font.getSize(timeLeftText);

            this.font.texture.bind();
            this.texBatch.begin();
            this.font.renderString(this.texBatch, timeLeftText + "\nLifes: " + this.level.player.lifes, width - 3 , height, {x: 0.1, y: 0.1});
            this.texBatch.end();

            this.texBatch.tintColor = [1.0 , 1.0, 1.0, 1.0];
            this.font.tintColor = [1.0 , 1.0, 1.0, 1.0];

            this.font.texture.bind();
            this.texBatch.begin();
            this.font.renderString(this.texBatch, "Health: ", 0.2 , 0.5, {x: 0.1, y: 0.1});
            this.texBatch.end();

            res.spriteSheet.texture.bind();
            this.texBatch.begin();
            for (var i=0; i<this.level.player.health; i++) {
                this.texBatch.renderQuad(2.2 + i*0.6, 0.1, 0.5, 0.5, res.spriteSheet.get("health.png").uvs);
            }
            this.texBatch.end();
        },
        renderTiles: function() {
            mat4.identity(this.texBatch.mvMatrix);
            mat4.translate(this.texBatch.mvMatrix, this.texBatch.mvMatrix, [-this.camera.x + this.camera.w/2.0, -this.camera.y + this.camera.h/2.0, 0.0]);

            res.tileMap.texture.bind();
            this.texBatch.begin();

            for (var y=Math.max(0, Math.floor(this.camera.y - this.camera.h/2.0)); y<Math.min(Math.ceil(this.camera.y + this.camera.h/2.0), this.level.height); y++) {
                for (var x=Math.max(0, Math.floor(this.camera.x - this.camera.w/2.0)); x<Math.min(Math.ceil(this.camera.x + this.camera.w/2.0), this.level.width); x++) {
                    var backTile = this.level.getTile(this.level.backTileLayer, x, y);
                    if (backTile !== null) {
                        this.texBatch.renderQuad(x, y, 1.0, 1.0, backTile.textureRegion.uvs);
                    }
                }
            }

            for (var y=Math.max(0, Math.floor(this.camera.y - this.camera.h/2.0)); y<Math.min(Math.ceil(this.camera.y + this.camera.h/2.0), this.level.height); y++) {
                for (var x=Math.max(0, Math.floor(this.camera.x - this.camera.w/2.0)); x<Math.min(Math.ceil(this.camera.x + this.camera.w/2.0), this.level.width); x++) {
                    var mainTile = this.level.getTile(this.level.mainTileLayer, x, y);
                    if (mainTile !== null) {
                        this.texBatch.renderQuad(x, y, 1.0, 1.0, mainTile.textureRegion.uvs);
                    }
                }
            }
            this.texBatch.end();


            var player = this.level.player;
            mat4.copy(res.colorBatch.pMatrix, this.texBatch.pMatrix);

            if (config.debug.renderEntityBoundingBoxes) {
                mat4.identity(res.colorBatch.mvMatrix);
                mat4.translate(res.colorBatch.mvMatrix, res.colorBatch.mvMatrix, [-this.level.player.x + this.camera.w/2.0, -this.level.player.y + this.camera.h/2.0, 0.0]);

                res.colorBatch.tintColor = [1.0, 0.0, 0.0, 1.0];
                res.colorBatch.begin();
                res.colorBatch.renderQuad(player.x, player.y, player.w, player.h);
                res.colorBatch.end();
            }
            var uvs = player.getSprite().getUVs();
            var size = player.getSprite().getSize();

            if (!player.right) {
                uvs = flipU(uvs);
            }

            res.spriteSheet.texture.bind();

            var alpha = 1.0;

            if (this.level.player.isInvinceble()) {
                alpha = this.ticker % 10 < 5 ? 0.0 : 1.0;
            }

            this.texBatch.tintColor = [1.0, 1.0, 1.0, alpha];
            this.texBatch.begin();
            this.texBatch.renderQuad(player.x + player.w/2.0 - size.w/2.0, player.y, size.w, size.h, uvs);
            this.texBatch.end();


            this.texBatch.tintColor = [1.0, 1.0, 1.0, 1.0];
            res.spriteSheet.texture.bind();
            this.texBatch.begin();
            for (var i=0; i<this.level.entities.length; i++) {
                this.renderEntity(this.level.entities[i]);
            }

            this.texBatch.end();
            /*
            res.tileMap.texture.bind();
            this.texBatch.begin();

            for (var y=Math.max(0, Math.floor(this.camera.y - this.camera.h/2.0)); y<Math.min(Math.ceil(this.camera.y + this.camera.h/2.0), this.level.height); y++) {
                for (var x=Math.max(0, Math.floor(this.camera.x - this.camera.w/2.0)); x<Math.min(Math.ceil(this.camera.x + this.camera.w/2.0), this.level.width); x++) {

                    var frontTile = this.level.getTile(this.level.frontTileLayer, x, y);
                    if (frontTile !== null) {
                        this.texBatch.renderQuad(x, y, 1.0, 1.0, frontTile.textureRegion.uvs);
                    }
                }
            }
            this.texBatch.end();
            */
        },

        renderEntity: function(e) {
           /* if (config.debug.renderEntityBoundingBoxes) {

                res.colorBatch.tintColor = [1.0, 0.0, 0.0, 1.0];
                res.colorBatch.begin();
                res.colorBatch.renderQuad(e.x, e.y, e.w, e.h);
                res.colorBatch.end();
            }
            */
            var uvs = e.getSprite().getUVs();
            var size = e.getSprite().getSize();
            var s = e.getSprite();

            if (s.flippable !== undefined && s.flippable == true && e.right !== undefined && !e.right) {
                uvs = flipU(uvs);
            }

            this.texBatch.renderQuad(e.x + e.w/2.0 - size.w/2.0, e.y, size.w, size.h, uvs)


        }
    });

    return LevelScene;
});