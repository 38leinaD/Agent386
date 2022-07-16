/*
 * Copyright (C) 2010 fruitfly (Daniel Platz)
 *
 * This software is available under a BSD license. Please see the LICENSE.TXT file for details.
 */

define(function(require) {
    var Tile = Class.extend({
        init: function(x, y, textureRegion) {
            this.x = x;
            this.y = y;
            this.textureRegion = textureRegion;
            this.hurts = false;
            this.blocked = Tile.Top | Tile.Bottom | Tile.Left | Tile.Right;

            this.slippery = false;
        },

        isBlocked: function(side) {
            return this.blocked & side;
        }
    });

    Tile.Top = 1;
    Tile.Bottom = 2;
    Tile.Left = 4;
    Tile.Right = 8;

    return Tile;
});