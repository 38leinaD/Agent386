/*
 * Copyright (C) 2010 fruitfly (Daniel Platz)
 *
 * This software is available under a BSD license. Please see the LICENSE.TXT file for details.
 */

define(function(require) {
    var res = require('resources');
    var assets = require('assets');
    var audio = require('audio');

    var Sprite = require('classes/Sprite');

    function intersect(a, b) {
        var xIntersect = false;
        if (b.x >= a.x && b.x <= a.x + a.w) {
            xIntersect = true;
        }
        else if (a.x >= b.x && a.x <= b.x + b.w) {
            xIntersect = true;
        }
        if (!xIntersect) return false;

        var yIntersect = false;
        if (a.y >= b.y && a.y <= b.y + b.h) {
            yIntersect = true;
        }
        else if (b.y >= a.y && b.y <= a.y + a.h) {
            yIntersect = true;
        }

        return yIntersect;
    }

    function distance(a, b) {
        var xx = (a.x + a.w/2.0) - (b.x + b.w/2.0);
        var yy = (a.y + a.h/2.0) - (b.y + b.h/2.0);

        return Math.sqrt(xx*xx + yy*yy);
    }

    var LaserShot = Class.extend({
        init: function() {
            this.x = 0.0;
            this.y = 0.0;
            this.w = 0.2;
            this.h = 0.1;
            this.level = null;

            this.right = false;

            this.sprite = new Sprite(res.spriteSheet, [res.spriteSheet.get('lasershot.png')], [100000]);
        },

        tick: function() {
            this.sprite.tick();
            if (this.right) {
                this.x += 0.1;
            }
            else {
                this.x -= 0.1;
            }

            if (this.level.getTile(this.level.mainTileLayer, this.x + this.w/2.0, this.y + this.h/2.0) !== null) {
                var dist = distance(this, this.level.player);
                if (dist <= 5) {
                    audio.playSound(assets.get('assets/audio/sounds/laserturret_hit.ogg'), (5 - dist)/5.0);
                }
                this.level.removeEntity(this);
            }
            else if (intersect(this, this.level.player)) {
                this.level.player.hurt();
                this.level.removeEntity(this);
            }
        },


        getSprite: function() {
            return this.sprite;
        }
    });

    return LaserShot;
});