/*
 * Copyright (C) 2010 fruitfly (Daniel Platz)
 *
 * This software is available under a BSD license. Please see the LICENSE.TXT file for details.
 */

define(function(require) {
    var Tile = require('classes/Tile');

    var AnimatedTile = Tile.extend({
        init: function(x, y, textureRegions, durations) {
            this._super(x, y, textureRegions[0]);
            this.currentFrame = 0;
            this.textureRegions = textureRegions;
            this.durations = durations;
            this.ticker = this.durations[this.currentFrame];
        },
        tick: function() {
            this.ticker--;
            if (this.ticker == 0) {
                this.currentFrame = (this.currentFrame + 1) % this.durations.length;
                this.textureRegion = this.textureRegions[this.currentFrame];
                this.ticker = this.durations[this.currentFrame];
            }
        },

        isBlocked: function(side) {
            return this.blocked & side;
        }
    });

    return AnimatedTile;
});