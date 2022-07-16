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
    var audio = require('audio');

    var Scene = require('classes/Scene');
    var Texture = require('classes/Texture');
    var BatchRenderer = require('classes/BatchRenderer');
    var BitmapFont = require('classes/BitmapFont');

    var SpriteSheet = require('classes/SpriteSheet');
    var Sprite = require('classes/Sprite');
    var Level = require('classes/Level');

    var LevelScene = require('classes/scenes/LevelScene');
    var MessageScene = require('classes/scenes/MessageScene');
    var LevelSelectionScene = require('classes/scenes/LevelSelectionScene');

    var IntroScene = Scene.extend({
        init: function(sceneManager) {
            this._super(sceneManager);

            this.font = res.fontDefault;
            this.font.setScale(2.0);

            this.spriteSheet = new SpriteSheet('assets/sprites/sprites.json');
            this.spriteWalking = new Sprite(this.spriteSheet, [
                    this.spriteSheet.get('agent_walk0.png'),
                    this.spriteSheet.get('agent_walk1.png'),
                    this.spriteSheet.get('agent_walk2.png'),
                    this.spriteSheet.get('agent_walk3.png')
                ],
                [15, 15, 15, 15]
            );

            this.spriteShoot = new Sprite(this.spriteSheet, [
                this.spriteSheet.get('agent_turn0.png'),
                this.spriteSheet.get('agent_turn1.png'),
                this.spriteSheet.get('agent_turn2.png'),
                this.spriteSheet.get('agent_turn3.png'),
                this.spriteSheet.get('agent_turn4.png')
            ],
                [5, 5, 5, 5, 5]
            );
            this.spriteShoot.replay = false;

            this.currentSprite = this.spriteWalking;

            /*var buffer = assets.get('assets/sounds/test.ogg');
                var source = audioContext.createBufferSource(); // creates a sound source
                source.buffer = buffer;                    // tell the source which sound to play
                var gainNode = audioContext.createGainNode();
                source.connect(gainNode);
                gainNode.connect(audioContext.destination);       // connect the source to the context's destination (the speakers)
                gainNode.gain.value = 0.1;
                source.noteOn(0);                          // play the source now
            */

            this.pos = {x: -5, y: -2};

            this.debugPos = {x: 0, y: 0};
            this.rotation = 0.3;

            this.hurtFade = 0.0;
            this.hurtFadeStep = 0.1;
            this.hurtAnimEnded = false;

            this.textStartPos = {x: -20, y: 3.5};
            this.textEndPos = {x: 5.0, y: 3.5};
            this.textFade = 0.0;
            this.textFadeEnded = false;

            this.restFade = 0.0;

            this.ticker = 0;
            this.shotFired = false;
            this.menuClicked = false;

        },

        tick: function() {
            this.ticker++;

            if(input.isDown('DOWN')) {
                this.debugPos.y += 0.1;
            }

            if(input.isDown('UP')) {
                this.debugPos.y -= 0.1;
            }

            if(input.isDown('LEFT')) {
                this.debugPos.x -= 0.1;
            }

            if(input.isDown('RIGHT')) {
                this.debugPos.x += 0.1;
            }

            if (this.pos.x > 7.5) {
                this.currentSprite = this.spriteShoot;

                if (this.currentSprite.currentFrame == 3 && !this.shotFired) {
                    setTimeout(function() { audio.playSound(assets.get('assets/audio/sounds/agent_gunshot.ogg')) }, 100);
                    this.shotFired = true;
                }

                if (this.currentSprite.end) {

                    if (this.hurtFade >= 0.0) {
                        this.hurtFade += this.hurtFadeStep;
                    }

                    if (this.hurtFade > 1.0) {
                        this.hurtFadeStep = - this.hurtFadeStep;
                    }

                    if (this.hurtFadeStep < 0.0 && this.hurtFade <= 0.0) {
                        this.hurtAnimEnded = true;
                    }
                }


                if (this.rotation > 0.0) {
                    this.rotation -= 0.01;
                }

                if (this.hurtAnimEnded) {
                    if (this.textFade < 1.0) {
                        this.textFade += 0.05;
                    }
                    else {
                        this.textFadeEnded = true;
                    }
                }

                if (this.textFadeEnded) {
                    if (this.restFade < 1.0) {
                        this.restFade += 0.05;
                    }

                    if (input.isDown('A')) {
                        if (!this.menuClicked) {
                            audio.playSound(assets.get('assets/audio/sounds/menu_clicked.ogg'));
                            this.menuClicked = true;
                        }

                        maxLevel = parseInt(localStorage["maxLevel"]);
                        if (localStorage["maxLevel"] == null) maxLevel = 0;

                        if (maxLevel == 0) {
                            var levelScene = new LevelScene(this.sceneManager, Level.levels[0].file, Level.levels[0].name);
                            this.sceneManager.scenes.push(levelScene);
                            this.sceneManager.scenes.push(new MessageScene(this.sceneManager, levelScene.level.name, 1000));
                        }
                        else {
                            this.sceneManager.scenes.push(new LevelSelectionScene(this.sceneManager));
                        }
                    }
                }
            }
            else {
                this.pos.x += 0.1;
            }
            this.currentSprite.tick();

        },

        render: function() {
            gl.clearColor(0.8, 0.8, 0.8, 1.0);

            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

            gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
            gl.clear(gl.COLOR_BUFFER_BIT);

            var width = 50.0;
            var height = width * (gl.viewportHeight/gl.viewportWidth);

            // Perspective
            mat4.perspective(res.textureBatch.pMatrix, 45.0, gl.viewportWidth/gl.viewportHeight, 0.1, 1000.0);
            mat4.identity(res.textureBatch.mvMatrix);

            // Agent
            mat4.translate(res.textureBatch.mvMatrix, res.textureBatch.mvMatrix, [-10.0, 2.5, -10.0]);
            mat4.rotateY(res.textureBatch.mvMatrix, res.textureBatch.mvMatrix, this.rotation);

            this.spriteSheet.texture.bind();
            res.textureBatch.tintColor = [1.0, 1.0, 1.0, 1.0];

            res.textureBatch.begin();
            res.textureBatch.renderQuadDown(this.pos.x, this.pos.y, 5.0, 5.0, this.currentSprite.getUVs());
            res.textureBatch.end();

            // Logo
            mat4.identity(res.textureBatch.mvMatrix);
            mat4.rotateY(res.textureBatch.mvMatrix, res.textureBatch.mvMatrix, -0.3);
            mat4.translate(res.textureBatch.mvMatrix, res.textureBatch.mvMatrix, [0.0, 0.0, -15.0]);

            res.textureBatch.tintColor = [1.0, 1.0, 1.0, this.restFade];


            res.textureBatch.begin();
            res.textureBatch.renderQuadDown(3.5, -3.0, 3.0, 3.0, this.spriteSheet.get("logo.png").uvs);
            res.textureBatch.end();

            // Text
            mat4.identity(res.textureBatch.mvMatrix);
            mat4.translate(res.textureBatch.mvMatrix, res.textureBatch.mvMatrix, [-10.0, 2.5, -10.0]);
            mat4.rotateY(res.textureBatch.mvMatrix, res.textureBatch.mvMatrix, 0.3);

            var textPos = {x: this.textStartPos.x + (this.textEndPos.x - this.textStartPos.x) * this.textFade, y: this.textStartPos.y + (this.textEndPos.y - this.textStartPos.y) * this.textFade };

            this.font.setScale(2.0);
            this.font.texture.bind();
            res.textureBatch.begin();
            this.font.renderString(res.textureBatch, "Agent 386", textPos.x, textPos.y, {x: 0.05, y: 0.05});
            res.textureBatch.end();

            this.font.setScale(1.4);
            res.textureBatch.begin();
            this.font.renderString(res.textureBatch, "in Operation Floppy", textPos.x + 1.0, textPos.y - 2.0, {x: 0.05, y: 0.05});
            res.textureBatch.end();

            //console.log(this.debugPos.x + ", " + this.debugPos.y);

            // Ortho Overlays
            mat4.ortho(res.textureBatch.pMatrix, 0.0, width, 0.0, height, -10.0, 10.0);
            mat4.identity(res.textureBatch.mvMatrix);

            this.spriteSheet.texture.bind();

            res.textureBatch.tintColor = [1.0, 0.0, 0.0, this.hurtFade];
            res.textureBatch.begin();
            res.textureBatch.renderQuadDown(this.debugPos.x, this.debugPos.y + height, width, height, this.spriteSheet.get("hurt.png").uvs);
            res.textureBatch.end();

            if (this.restFade >= 1.0 && this.ticker % 120 > 40) {
                var text = ">> Hit SPACE or A on your gamepad <<";
                var textSize = this.font.getSize(text);

                this.font.texture.bind();
                res.textureBatch.begin();
                this.font.renderString(res.textureBatch, text, width/2.0 - textSize.w/2.0, height/2.0 + textSize.h/2.0 - 9.0, {x: 0.1, y: 0.1});
                res.textureBatch.end();
            }

            if (this.restFade >= 1.0) {
                var text = "Developed for #1GAM";
                var textSize = this.font.getSize(text);

                var text2 = "Highscore: " + localStorage['highscore'];
                var text2Size = this.font.getSize(text2);

                this.font.texture.bind();
                res.textureBatch.begin();
                this.font.renderString(res.textureBatch, text, 1.0, textSize.h + 1.0, {x: 0.1, y: 0.1});
                this.font.renderString(res.textureBatch, text2, width/2.0 - text2Size.w/2.0, 18, {x: 0.1, y: 0.1});
                res.textureBatch.end();
            }
        }
    });

    return IntroScene;
});