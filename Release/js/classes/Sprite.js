/*
 * Copyright (C) 2010 fruitfly (Daniel Platz)
 *
 * This software is available under a BSD license. Please see the LICENSE.TXT file for details.
 */

define(function(require) {
    var Sprite = Class.extend({

        init: function(spriteSheet, frames, durations) {
            this.spriteSheet = spriteSheet;
            this.frames = frames;
            this.durations = durations;
            this.currentFrame = 0;
            this.ticker = 0;
            this.replay = true;
            this.end = false;
            this.stopped = false;
        },

        tick: function() {
            if (this.stopped) return;
            if (this.end) return;
            this.ticker++;
            if (this.ticker >= this.durations[this.currentFrame]) {
                this.ticker = 0;
                if (this.currentFrame == this.durations.length - 1 && !this.replay) {
                    this.end = true;
                }
                else if (this.currentFrame < this.durations.length - 1 || this.replay) {
                    this.currentFrame = (this.currentFrame + 1) % this.durations.length;
                }
            }
        },

        reset: function() {
            this.end = false;
            this.ticker = 0;
            this.currentFrame = 0;
        },

        getUVs: function() {
            return this.frames[this.currentFrame].uvs;
        },

        getSize: function() {
            return this.frames[this.currentFrame].size;
        }
    });

    return Sprite;
});