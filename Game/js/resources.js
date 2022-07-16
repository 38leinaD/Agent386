/*
 * Copyright (C) 2010 fruitfly (Daniel Platz)
 *
 * This software is available under a BSD license. Please see the LICENSE.TXT file for details.
 */

define(function(require) {

    var BatchRenderer = require('classes/BatchRenderer');
    var BitmapFont = require('classes/BitmapFont');
    var Shader = require('classes/Shader');
    var VertexBuffer = require('classes/VertexBuffer');
    var TileMap = require('classes/TileMap');
    var SpriteSheet = require('classes/SpriteSheet');
    var Sprite = require('classes/Sprite');

    var resources = {
        init: function(runlevel) {
            if (runlevel === 1) {
                var colorShader = new Shader('color-vs', 'color-fs', ['uPMatrix', 'uMVMatrix', 'uColor'], ['aVertexPosition']);
                var colorVB = new VertexBuffer(100, [VertexBuffer.Position]);
                this.colorBatch = new BatchRenderer(colorShader, colorVB);
            }
            else if (runlevel === 2) {

                var textureShader = new Shader('tex-vs', 'tex-fs', ['uPMatrix', 'uMVMatrix', 'uSampler', 'uColor'], ['aVertexPosition', 'aTextureCoord']);
                var textureVB = new VertexBuffer(1000, [VertexBuffer.Position, VertexBuffer.TextureCoords]);
                this.textureBatch = new BatchRenderer(textureShader, textureVB);

                this.fontDefault = new BitmapFont('assets/fonts/04.json');

                this.tileMap = new TileMap('assets/tiles/tilemap.png');

                this.spriteSheet = new SpriteSheet('assets/sprites/sprites.json');

                this.sprites = {};

                var self = this;
                this.sprites.createAgent = function() {
                    var s = {
                        standing: new Sprite(self.spriteSheet, [
                                self.spriteSheet.get('agent_stand0.png'),
                                self.spriteSheet.get('agent_stand1.png'),
                                self.spriteSheet.get('agent_stand2.png'),
                                self.spriteSheet.get('agent_stand3.png'),
                                self.spriteSheet.get('agent_stand4.png'),
                                self.spriteSheet.get('agent_stand5.png'),
                                self.spriteSheet.get('agent_stand6.png'),
                                self.spriteSheet.get('agent_stand7.png')
                            ],
                            [120, 10, 240, 10, 120, 10, 120, 10]
                        ),
                        walking: new Sprite(self.spriteSheet, [
                                self.spriteSheet.get('agent_walk0.png'),
                                self.spriteSheet.get('agent_walk1.png'),
                                self.spriteSheet.get('agent_walk2.png'),
                                self.spriteSheet.get('agent_walk3.png')
                            ],
                            [15, 15, 15, 15]
                        ),
                        jumpingUp: new Sprite(self.spriteSheet, [
                                self.spriteSheet.get('agent_jumpUp.png')
                            ],
                            [12000]
                        ),
                        jumpingDown: new Sprite(self.spriteSheet, [
                                self.spriteSheet.get('agent_jumpDown.png')
                            ],
                            [12000]
                        ),
                        die: new Sprite(self.spriteSheet, [
                            self.spriteSheet.get('agent_dies0.png'),
                            self.spriteSheet.get('agent_dies1.png'),
                            self.spriteSheet.get('agent_dies2.png'),
                            self.spriteSheet.get('agent_dies3.png'),
                            self.spriteSheet.get('agent_dies4.png'),
                            self.spriteSheet.get('agent_dies5.png')
                        ],
                            [1, 5, 5, 5, 5, 5]
                        )
                    };
                    s.die.replay = false;

                    return s;
                }

                this.sprites.createRobot = function() {
                    return {
                        right: new Sprite(self.spriteSheet, [
                                self.spriteSheet.get('robot_right0.png'),
                                self.spriteSheet.get('robot_right1.png'),
                                self.spriteSheet.get('robot_right2.png'),
                                self.spriteSheet.get('robot_right3.png'),
                                self.spriteSheet.get('robot_right4.png'),
                                self.spriteSheet.get('robot_right5.png'),
                                self.spriteSheet.get('robot_right6.png')
                            ],
                            [10, 10, 10, 10, 10, 10, 10]
                        ),
                        left: new Sprite(self.spriteSheet, [
                                self.spriteSheet.get('robot_left0.png'),
                                self.spriteSheet.get('robot_left1.png'),
                                self.spriteSheet.get('robot_left2.png'),
                                self.spriteSheet.get('robot_left3.png'),
                                self.spriteSheet.get('robot_left4.png'),
                                self.spriteSheet.get('robot_left5.png'),
                                self.spriteSheet.get('robot_left6.png')
                            ],
                            [10, 10, 10, 10, 10, 10, 10]
                        )
                    };
                }

                this.sprites.createFlyBot = function() {
                    return {
                        default: new Sprite(self.spriteSheet, [
                            self.spriteSheet.get('fly0.png'),
                            self.spriteSheet.get('fly1.png'),
                            self.spriteSheet.get('fly2.png'),
                            self.spriteSheet.get('fly3.png'),
                            self.spriteSheet.get('fly4.png')
                        ],
                            [10, 10, 10, 10]
                        )
                    };
                }

                this.sprites.createBombadier = function() {
                    var s = {
                        default: new Sprite(self.spriteSheet, [
                            self.spriteSheet.get('bombadier0.png')
                        ],
                            [10]
                        ),
                        bomb: new Sprite(self.spriteSheet, [
                            self.spriteSheet.get('bombadier0.png'),
                            self.spriteSheet.get('bombadier1.png'),
                            self.spriteSheet.get('bombadier0.png')

                        ],
                            [10, 10, 10]
                        )
                    };
                    s.bomb.replay = false;
                    return s;
                }

                this.sprites.createBomb = function() {
                    var s = {
                        default: new Sprite(self.spriteSheet, [
                            self.spriteSheet.get('bomb0.png')
                        ],
                            [10000]
                        ),
                        ticking: new Sprite(self.spriteSheet, [
                            self.spriteSheet.get('bomb1.png'),
                            self.spriteSheet.get('bomb2.png')
                        ],
                            [10, 10]
                        ),
                        explosion: new Sprite(self.spriteSheet, [
                            self.spriteSheet.get('explosion0.png'),
                            self.spriteSheet.get('explosion1.png'),
                            self.spriteSheet.get('explosion2.png'),
                            self.spriteSheet.get('explosion3.png')
                        ],
                            [10, 10, 10, 10]
                        )
                    };

                    s.explosion.replay = false;
                    return s;
                }

                this.sprites.createFloppy = function() {
                    return {
                        default: new Sprite(self.spriteSheet, [
                            self.spriteSheet.get('floppy.png')
                        ],
                            [100000]
                        )
                    };
                }

                this.sprites.createHealth = function() {
                    return {
                        default: new Sprite(self.spriteSheet, [
                            self.spriteSheet.get('health.png')
                        ],
                            [100000]
                        )
                    };
                }

                this.sprites.createLaserTurret = function() {
                    var s = {
                        idle: new Sprite(self.spriteSheet, [
                                self.spriteSheet.get('laserturret0.png')
                            ],
                                [100000]
                        ),
                        shot: new Sprite(self.spriteSheet, [
                                self.spriteSheet.get('laserturret1.png')
                            ],
                                [10]
                        )
                    };
                    s.shot.replay = false;
                    s.idle.flippable = true;
                    s.shot.flippable = true;
                    return s;
                }
            }
        }
    };

    return resources;
});