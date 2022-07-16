/*
 * Copyright (C) 2010 fruitfly (Daniel Platz)
 *
 * This software is available under a BSD license. Please see the LICENSE.TXT file for details.
 */

define(function(require) {

    var Texture = require('classes/Texture');
    var OFFSET = 0.001;
    var TileMap = Class.extend({
        init: function(file) {
            this.texture = new Texture(file);
            this.defaultTileSize = 16;
        },

        getTextureRegion: function(i) {
            var tilesPerRows = this.texture.image.width / this.defaultTileSize;
            var x = Math.floor(i % tilesPerRows);
            var y = Math.floor(i / tilesPerRows);
            return {
                uvs: {
                    u1: (x * this.defaultTileSize) / this.texture.image.width + OFFSET,
                    v1: (this.texture.image.height - y * this.defaultTileSize) / this.texture.image.height - OFFSET,
                    u2: ((x + 1) * this.defaultTileSize) / this.texture.image.width - OFFSET,
                    v2: (this.texture.image.height - (y + 1) * this.defaultTileSize) / this.texture.image.height + OFFSET
                }
            };
        }
    });

    return TileMap;
});