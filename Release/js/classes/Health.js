/*
 * Copyright (C) 2010 fruitfly (Daniel Platz)
 *
 * This software is available under a BSD license. Please see the LICENSE.TXT file for details.
 */

define(function(require) {
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

    var Health = Class.extend({
        init: function(level, x, y) {
            this.x = x;
            this.y = y;
            this.w = 1.0;
            this.h = 1.0;
            this.level = level;

            this.sprite = res.sprites.createHealth().default;
        },

        tick: function() {
            if (intersect(this, this.level.player)) {
                this.level.player.pickUp(this);
            }
        },

        getSprite: function() {
            return this.sprite;
        }
    });

    return Health;
});