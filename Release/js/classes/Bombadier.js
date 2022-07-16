/*
 * Copyright (C) 2010 fruitfly (Daniel Platz)
 *
 * This software is available under a BSD license. Please see the LICENSE.TXT file for details.
 */

define(function(require) {
    var res = require('resources');
    var assets = require('assets');
    var audio = require('audio');

    var Bomb = require('classes/Bomb');

    var Bombadier = Class.extend({
        init: function(level, x, y) {
            this.x = x;
            this.y = y;
            this.w = 1.0;
            this.h = 1.0;
            this.level = level;

            this.sprites = res.sprites.createBombadier();
            this.currentSprite = this.sprites.default;

            this.shootDelay = 0;

            this.bomb = null;

            var yy = y;
            while (yy > 0) {
                if (this.level.getTile(this.level.mainTileLayer, x, yy) !== null) {
                    break;
                }

                yy--;
            }

            this.minYDetect = yy;
        },

        tick: function() {
            this.currentSprite.tick();
            this.shootDelay--;

            if (this.shootDelay <= 20 && this.bomb == null) {
                this.bomb = new Bomb(this.level, this.x, this.y - 0.2);
                this.level.entities.push(this.bomb);
            }

            var dist = Math.abs(this.level.player.x - this.x);

            if (this.level.player.x >= this.x - 2 && this.level.player.x <= this.x + 2 && this.level.player.y <= this.y && this.level.player.y >= this.minYDetect && this.shootDelay <= 0) {
               this.shoot();
            }

            if (this.shootDelay > 0 && this.currentSprite.end) {
                this.currentSprite = this.sprites.default;
                this.currentSprite.reset();
            }
        },

        shoot: function() {
            console.log("shoot");

            this.bomb.activate();
            this.bomb = null;

            audio.playSound(assets.get('assets/audio/sounds/bombadier_release.ogg'));

            this.currentSprite = this.sprites.bomb;
            this.currentSprite.reset();
            this.shootDelay = 160;
        },

        getSprite: function() {
            return this.currentSprite;
        }
    });

    return Bombadier;
});