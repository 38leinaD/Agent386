/*
 * Copyright (C) 2010 fruitfly (Daniel Platz)
 *
 * This software is available under a BSD license. Please see the LICENSE.TXT file for details.
 */

define(function(require) {
    var assets = require('assets');

    var Texture = require('classes/Texture');

    var BitmapFont = Class.extend({
        init: function(font) {
            this.shader = null;
            this.scale = 1.0;
            this.fnt = assets.get(font);
            this.texture = new Texture(font.replace(/\.json/, '.png'));

            this.tintColor = [1.0, 1.0, 1.0, 1.0];
            this.shadowColor = [0.4, 0.4, 0.4, 1.0];

            this.initFnt(this.fnt);
        },

        initFnt: function(fnt) {
            this.chars = new Array(256);

            var size = fnt.info.size;
            this.lineHeight = fnt.common.lineHeight / size;
            this.base = fnt.common.base / size;

            var imgSize = this.texture.getSize();
            for (var i=0; i<fnt.char.length; i++) {
                var charSrc = fnt.char[i];
                var char = {};
                char.width = charSrc.width/size;
                char.height = charSrc.height/size;
                char.xOffset = charSrc.xoffset/size;
                char.yOffset = charSrc.yoffset/size;
                char.xAdvance = charSrc.xadvance/size;
                char.uvs = {
                    u1: charSrc.x / imgSize.w,
                    v1: (imgSize.h - charSrc.y) / imgSize.h,
                    u2: (charSrc.x + charSrc.width) / imgSize.w,
                    v2: (imgSize.h - (charSrc.y + charSrc.height)) / imgSize.h
                };

                this.chars[charSrc.id] = char;
            }
        },

        setShader: function(shader) {
            this.shader = shader;
        },

        setScale: function(scale) {
            this.scale = scale;
        },

        setTintColor: function(color) {
            this.tintColor = color;
        },

        setShadowColor: function(color) {
            this.shadowColor = color;
        },

        _renderString: function(batch, str, x, y, offset) {
            var cursor = {"x": x, "y": y};

            if (offset === undefined) {
                offset = { "x": 0.0, "y": 0.0 };
            }
            else {
                offset.x *= this.scale;
                offset.y *= this.scale;
            }

            for (var i=0; i<str.length; i++) {
                var cc = str.charCodeAt(i);

                if (cc == 10) {
                    cursor.x = x;
                    cursor.y -= this.lineHeight * this.scale;
                }
                else {
                    var charData = this.chars[cc];
                    var uvs = charData.uvs;

                    batch.renderQuadDown(cursor.x + offset.x + charData.xOffset * this.scale, cursor.y - offset.y - (charData.yOffset) * this.scale, charData.width * this.scale, charData.height * this.scale, charData.uvs);
                    cursor.x += charData.xAdvance * this.scale;
                }
            }
        },

        getSize: function(str) {
            var w = 0.0;
            var max = {w: 0.0, h: 0.0};

            for (var i=0; i<str.length; i++) {
                var cc = str.charCodeAt(i);

                if (cc == 10) {
                    w = 0;
                    max.h += this.lineHeight * this.scale;
                }
                else {
                    var charData = this.chars[cc];
                    w += charData.xAdvance * this.scale;
                    if (w > max.w) {
                        max.w = w;
                    }
                }
            }

            max.h += this.lineHeight * this.scale;

            return max;
        },

        renderString: function(batch, str, x, y, offset) {
            this.texture.bind();

            var savedTintcolor = batch.tintColor;
            if (offset !== undefined) {
                batch.end();
                batch.tintColor = this.shadowColor;
                batch.begin();
                this._renderString(batch, str, x, y, offset);
            }
            batch.end();
            batch.tintColor = this.tintColor;
            batch.begin();
            this._renderString(batch, str, x, y);
            batch.end();
            batch.tintColor = savedTintcolor;
            batch.begin();
        }
    });

    return BitmapFont;
});