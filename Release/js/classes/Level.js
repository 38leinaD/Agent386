/*
 * Copyright (C) 2010 fruitfly (Daniel Platz)
 *
 * This software is available under a BSD license. Please see the LICENSE.TXT file for details.
 */

define(function(require) {
    var assets = require('assets');
    var res = require('resources');
    var audio = require('audio');

    var Tile = require('classes/Tile');
    var AnimatedTile = require('classes/AnimatedTile');
    var Robot = require('classes/Robot');
    var Floppy = require('classes/Floppy');
    var LaserTurret = require('classes/LaserTurret');
    var FlyBot = require('classes/FlyBot');
    var Bombadier = require('classes/Bombadier');
    var Health = require('classes/Health');

    function getTiledLayer(tiled, layerName) {
        for (var i=0; i<tiled.layers.length; i++) {
            var layer = tiled.layers[i];
            if (layer.name === layerName) {
                return layer;
            }
        }
    }

    var Level = Class.extend({
        init: function(file, name) {
            var tiled = assets.get('assets/levels/' + file);
            this.width = tiled.width;
            this.height = tiled.height;
            var tileSize = tiled.tilewidth;
            var tiledMainLayer = getTiledLayer(tiled, 'main');
            this.mainTileLayer = new Array(tiledMainLayer.data.length);

            var tiledBackLayer = getTiledLayer(tiled, 'back');
            this.backTileLayer = new Array(tiledBackLayer.data.length);

            var tiledFrontLayer = getTiledLayer(tiled, 'front');
            this.frontTileLayer = new Array(tiledFrontLayer.data.length);

            this.entities = [];
            this.tickers = [];
            this.floppiesCollected = 0;
            this.floppies = 0;
            this.lost = false;
            this.ended = false;
            this.ticker = 0;
            this.levelFile = file;
            this.spawnRight = true;

            this.requestRestart = false;
            this.name = name;
            this.song = tiled.properties.song;
            this.maxTime = tiled.properties.maxTime;
            var color = parseInt(tiled.properties.backgroundColor.substring(2, tiled.properties.backgroundColor.length), 16);

            this.backgroundColor = {
                r: ((color & 0xff0000) >> 16)/255.0,
                g: ((color & 0x00ff00) >> 8)/255.0,
                b: (color & 0x0000ff)/255.0,
                a: 1.0
            };

            for (var i=0; i<tiledMainLayer.data.length; i++) {
                var tile = null;
                var code = tiledMainLayer.data[i];
                var x = Math.floor(i % this.width);
                var y = this.height - 1 - Math.floor(i / this.width);
                if (code > 0) {
                    var props = tiled.tilesets[0].tileproperties[""+(code-1)];
                    var blocks = Tile.Top | Tile.Bottom | Tile.Left | Tile.Right;
                    tile = new Tile(x, y, res.tileMap.getTextureRegion(code - 1));

                    if (props !== undefined && props.blocks !== undefined) {
                        blocks = 0;
                        if (props.blocks.indexOf('l') >= 0) {
                            blocks |= Tile.Left;
                        }
                        else if (props.blocks.indexOf('r') >= 0) {
                            blocks |= Tile.Right;
                        }
                        else if (props.blocks.indexOf('t') >= 0) {
                            blocks |= Tile.Top;
                        }
                        else if (props.blocks.indexOf('b') >= 0) {
                            blocks |= Tile.Bottom;
                        }
                        tile.blocked = blocks;
                    }
                    if(props !== undefined) {
                        if (props.hurts !== undefined) {
                            tile.hurts = true;
                        }
                        else if (props.slippery !== undefined) {
                            tile.slippery = true;
                        }
                    }

                }
                this.mainTileLayer[y * this.width + x] = tile;
            }

            for (var i=0; i<tiledBackLayer.data.length; i++) {
                var tile = null;
                var code = tiledBackLayer.data[i];
                var x = Math.floor(i % this.width);
                var y = this.height - 1 - Math.floor(i / this.width);
                if (code > 0) {
                    var props = tiled.tilesets[0].tileproperties[""+(code-1)];
                    if (props !== undefined && props.animate !== undefined) {
                        var durations = props.durations.split(',');
                        var frames = props.frames;
                        var regions = [];
                        for (var j=0; j<frames; j++) {
                            regions.push(res.tileMap.getTextureRegion(code - 1 + j));
                        }
                        tile = new AnimatedTile(x, y, regions, durations);
                        this.tickers.push(tile);
                    }
                    else {
                        tile = new Tile(x, y, res.tileMap.getTextureRegion(code - 1));
                    }
                }
                this.backTileLayer[y * this.width + x] = tile;
            }

            for (var i=0; i<tiledFrontLayer.data.length; i++) {
                var tile = null;
                var code = tiledFrontLayer.data[i];
                var x = Math.floor(i % this.width);
                var y = this.height - 1 - Math.floor(i / this.width);
                if (code > 0) {

                    tile = new Tile(x, y, res.tileMap.getTextureRegion(code - 1));
                }
                this.frontTileLayer[y * this.width + x] = tile;
            }

            var tiledObjectsLayer = getTiledLayer(tiled, 'objects');

            for (var i=0; i<tiledObjectsLayer.objects.length; i++) {
                var tiledObject = tiledObjectsLayer.objects[i];
                if (tiledObject.name === 'player_spawn') {
                    this.playerSpawn = {
                        x: tiledObject.x / tileSize,
                        y: this.height - 1 - tiledObject.y / tileSize
                    }

                    if (tiledObject.properties !== undefined && tiledObject.properties.orientation !== undefined) {
                        this.spawnRight = (tiledObject.properties.orientation === "right" ? true : false);
                    }
                    console.log('spawn added (right: ' +this.spawnRight + ')');
                }
                else if (tiledObject.name === 'robot') {
                    var robot = new Robot();
                    robot.level = this;
                    robot.x = tiledObject.x / tileSize;
                    robot.y = this.height - 1 - tiledObject.y / tileSize;
                    console.log("robot added");
                    this.entities.push(robot);
                }
                else if (tiledObject.name === 'flybot') {
                    var flybot = new FlyBot();
                    flybot.level = this;
                    flybot.x = tiledObject.x / tileSize;
                    flybot.y = this.height - 1 - tiledObject.y / tileSize;
                    console.log("flybot added");
                    this.entities.push(flybot);
                }
                else if (tiledObject.name === 'bombadier') {
                    var bombadier = new Bombadier(this, tiledObject.x / tileSize, this.height - 1 - tiledObject.y / tileSize);
                    console.log("bombadier added");
                    this.entities.push(bombadier);
                }
                else if (tiledObject.name === 'health') {
                    var health = new Health(this, tiledObject.x / tileSize, this.height - 1 - tiledObject.y / tileSize);
                    console.log("health added");
                    this.entities.push(health);
                }
                else if (tiledObject.name === 'floppy') {
                    var floppy = new Floppy();
                    floppy.level = this;
                    floppy.x = tiledObject.x / tileSize;
                    floppy.y = this.height - 1 - tiledObject.y / tileSize;
                    console.log("floppy added");
                    this.entities.push(floppy);

                    this.floppies++;
                }
                else if (tiledObject.name === 'laserturret') {
                    var laser = new LaserTurret();
                    laser.level = this;
                    laser.x = tiledObject.x / tileSize;
                    laser.y = this.height - 1 - tiledObject.y / tileSize;

                    if (tiledObject.properties.orientation !== undefined) {
                        if (tiledObject.properties.orientation === 'left') {
                            laser.right = false;
                        }
                        else {
                            laser.right = true;
                        }
                    }

                    console.log("laser added");
                    this.entities.push(laser);
                }
            }


        },

        getTile: function(layer, x, y) {
            return layer[Math.floor(y) * this.width + Math.floor(x)];
        },

        removeEntity: function(e) {
            for (var i=0; i<this.entities.length; i++) {
                if (this.entities[i] === e) {
                    this.entities.splice(i, 1);
                    break;
                }
            }
        },

        tick: function() {
            this.ticker++;

            if (this.floppiesCollected === this.floppies) {
                this.ended = true;
                return;
            }

            if (this.ticker / 60 >= this.maxTime && !this.ended) {
                this.player.die();
            }

            this.player.tick();
            for (var i=0; i<this.entities.length; i++) {
                this.entities[i].tick();
            }
            for (var i=0; i<this.tickers.length; i++) {
                this.tickers[i].tick();
            }
        },

        gameOver: function() {
            this.lost = true;
            this.ended = true;
            audio.playSound(assets.get('assets/audio/sounds/gameover.ogg'));
        },

        restart: function() {
            this.ended = true;
            this.requestRestart = true;

            audio.playSound(assets.get('assets/audio/sounds/gameover.ogg'));
        }

    });

    Level.levels = [
        { name: 'Intro', file: 'intro.json' },
        { name: 'In the chambers', file: 'chambers.json' },
        { name: 'Slime', file: 'slime.json' },
        { name: 'The Garden', file: 'garden.json' },
        { name: 'Construction', file: 'construction.json' },
        { name: 'Junction', file: 'junction.json' },
        { name: 'The long run', file: 'longrun.json' },
        { name: 'Skyscraper', file: 'skyscraper.json' },
        { name: 'Entering the Mansion', file: 'mansion.json' }
    ];

    return Level;
});