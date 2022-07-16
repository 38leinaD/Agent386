/*
 * Copyright (C) 2010 fruitfly (Daniel Platz)
 *
 * This software is available under a BSD license. Please see the LICENSE.TXT file for details.
 */

define(function(require) {
    var assets = require('assets');

    var Texture = require('classes/Texture');

    var OFFSET = 0.001;

    var SpriteSheet = Class.extend({
        init: function(file) {
            var meta = assets.get(file);
            this.texture = new Texture(file.replace(/\.json/, '.png'));
            this.size = meta.meta.size;
            this.sprites = {};
            this.defaultScale = 2.0;
            this.defaultSpriteSize = 16.0;

            for (var key in meta.frames) {
                if (meta.frames.hasOwnProperty(key)) {
                    var spriteSrc = meta.frames[key];
                    var sprite = {
                        uvs: {
                            u1: spriteSrc.frame.x / this.size.w + OFFSET,
                            v1: (this.size.h - spriteSrc.frame.y) / this.size.h - OFFSET,
                            u2: (spriteSrc.frame.x + spriteSrc.frame.w) / this.size.w - OFFSET,
                            v2: (this.size.h - (spriteSrc.frame.y + spriteSrc.frame.h)) / this.size.h + OFFSET
                        },
                        size: {
                            w: (spriteSrc.sourceSize.w / this.defaultSpriteSize) * this.defaultScale,
                            h: (spriteSrc.sourceSize.h / this.defaultSpriteSize) * this.defaultScale
                        }
                    }
                    this.sprites[key] = sprite;
                }
            }
        },

        get: function(key) {
            return this.sprites[key];
        }
    });

    return SpriteSheet;
});