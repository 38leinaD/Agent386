/*
 * Copyright (C) 2010 fruitfly (Daniel Platz)
 *
 * This software is available under a BSD license. Please see the LICENSE.TXT file for details.
 */

define(function(require) {
    var res = require('resources');
    var assets = require('assets');
    var audio = require('audio');
    var LaserShot = require('classes/LaserShot');

    var LaserTurret = Class.extend({
        init: function() {
            this.x = 0.0;
            this.y = 0.0;
            this.w = 1.0;
            this.h = 1.0;
            this.level = null;

            this.right = false;

            this.sprites = res.sprites.createLaserTurret();
            this.currentSprite = this.sprites.idle;

            this.shootDelay = 0;
        },

        tick: function() {
            this.currentSprite.tick();
            this.shootDelay--;

            var dist = Math.abs(this.level.player.x - this.x);

            if (this.level.player.y <= this.y + 1.0 && this.level.player.y + this.level.player.h >= this.y + 1.0 && this.shootDelay <= 0) {
                if (!this.right && this.level.player.x < this.x && dist < 10 && dist > 1.0) {
                    this.shoot();
                }
                else if (this.right && this.level.player.x > this.x && dist < 10 && dist > 1.0) {
                    this.shoot();
                }
            }

            if (this.shootDelay > 0 && this.currentSprite.end) {
                this.currentSprite = this.sprites.idle;
                this.currentSprite.reset();
            }
        },

        shoot: function() {
            console.log("shoot");
            var laserShot = new LaserShot();
            laserShot.x = this.x + (this.right ? 0.6 : -0.6);
            laserShot.y = this.y + 1.25;
            laserShot.level = this.level;
            laserShot.right = this.right;

            this.level.entities.push(laserShot);

            var dist = Math.abs(this.level.player.x - this.x);
            if (dist <= 5) {
                audio.playSound(assets.get('assets/audio/sounds/laserturret_shot.ogg'), (5 - dist)/5.0);
            }
            this.currentSprite = this.sprites.shot;
            this.currentSprite.reset();
            this.shootDelay = 120;
        },

        getSprite: function() {
            return this.currentSprite;
        }
    });

    return LaserTurret;
});