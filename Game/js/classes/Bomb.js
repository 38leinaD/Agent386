/*
 * Copyright (C) 2010 fruitfly (Daniel Platz)
 *
 * This software is available under a BSD license. Please see the LICENSE.TXT file for details.
 */

define(function(require) {
    var res = require('resources');
    var assets = require('assets');
    var audio = require('audio');

    var Bomb = Class.extend({
        init: function(level, x, y) {
            this.x = x;
            this.y = y;
            this.w = 1.0;
            this.h = 1.0;
            this.level = level;

            this.sprites = res.sprites.createBomb();
            this.currentSprite = this.sprites.default;

            this.shootDelay = 0;
            this.activated = false;
            this.exploding = false;

            var yy = y;
            while (yy > 0) {
                if (this.level.getTile(this.level.mainTileLayer, x, yy) !== null) {
                    break;
                }

                yy--;
            }

            this.minYDetect = yy + 0.2;

            this.vy = -0.1;
        },

        tick: function() {
            this.currentSprite.tick();


            if (this.activated) {
                if (this.y > this.minYDetect) {
                    this.y+=this.vy;
                }
                else if (!this.exploding) {
                    this.vy += 0.05;
                    this.currentSprite = this.sprites.explosion;
                    this.currentSprite.reset();
                    this.exploding = true;
                    audio.playSound(assets.get('assets/audio/sounds/explosion.ogg'));
                    var xx = (this.x - this.level.player.x);
                    var yy = (this.y - this.level.player.y);
                    var dist = Math.sqrt(xx*xx + yy*yy);

                    if (dist < 2.1) {
                        this.level.player.hurt(this);
                    }
                }
            }

            if (this.exploding && this.currentSprite.end) {
                this.level.removeEntity(this);
            }
        },

        activate: function() {
            this.activated = true;

            this.currentSprite = this.sprites.ticking;
            this.currentSprite.reset();
        },

        getSprite: function() {
            return this.currentSprite;
        }
    });

    return Bomb;
});