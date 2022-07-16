/*
 * Copyright (C) 2010 fruitfly (Daniel Platz)
 *
 * This software is available under a BSD license. Please see the LICENSE.TXT file for details.
 */

define(function(require) {
    var input = require('input');
    var res = require('resources');
    var assets = require('assets');
    var audio = require('audio');

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

    var Floppy = Class.extend({
        init: function() {
            this.x = 0;
            this.y = 0;
            this.w = 1.0;
            this.h = 1.0;
            this.level = undefined;

            this.sprites = res.sprites.createFloppy();
            this.currentSprite = this.sprites.default;

        },

        tick: function() {

            this.currentSprite.tick();

            if (intersect(this, this.level.player)) {
                this.level.floppiesCollected++;
                audio.playSound(assets.get('assets/audio/sounds/agent_pickup_floppy.ogg'));
                for (var i=0; i<this.level.entities.length; i++) {
                    if (this.level.entities[i] === this) {
                        this.level.entities.splice(i, 1);
                        break;
                    }
                }
            }
        },

        getSprite: function() {
            return this.currentSprite;
        }
    });

    return Floppy;
});