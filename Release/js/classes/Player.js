/*
 * Copyright (C) 2010 fruitfly (Daniel Platz)
 *
 * This software is available under a BSD license. Please see the LICENSE.TXT file for details.
 */

define(function(require) {
    var input = require('input');
    var res = require('resources');
    var audio = require('audio');
    var assets = require('assets');

    var Tile = require('classes/Tile');
    var Health = require('classes/Health');

    var Player = Class.extend({
        init: function() {
            this.x = 0;
            this.y = 0;
            this.g = -0.02;
            this.vx = 0;
            this.vy = 0;
            this.w = 0.9;
            this.h = 1.9;
            this.level = undefined;
            this.right = true;
            this.standing = false;
            this.jumpDelay = 0;
            this.score = 0;
            this.lifes = 3;
            this.health = 2;

            this.invincebleTimer = 0;

            this.sprites = res.sprites.createAgent();
            this.currentSprite = this.sprites.standing;
        },

        isInvinceble: function() {
           return this.invincebleTimer > 0;
        },

        tick: function() {

            this.currentSprite.tick();


            if (this.invincebleTimer > 0) {
                this.invincebleTimer--;
            }

            var dx = this.vx;
            var dy = this.vy;

            var oldStanding = this.standing;

            var blockedY = !this.move(0.0, dy);
            if (blockedY && this.vy < 0.0) {
                this.standing = true;
                this.vy = 0.0;
            }
            else if (blockedY && this.vy > 0.0) {
                this.vy = 0.0;
            }

            if (this.health > 0 && input.isDown('LEFT')) {
                dx -= 0.1;
            }
            else if (this.health > 0 && input.isDown('RIGHT')) {
                dx += 0.1;
            }


            if (!oldStanding && this.standing ) {
                this.jumpDelay = 10;
            }

            if (this.standing) {
                this.jumpDelay--;
            }

            if (this.health <= 0 && this.standing && this.currentSprite != this.sprites.die) {
                this.currentSprite = this.sprites.die;
                this.currentSprite.reset();
            }

            if (this.health > 0 && (input.isDown('A') || input.isDown('UP')) && this.standing && this.jumpDelay <= 0) {
                this.vy = 0.45;
                this.standing = false;
                audio.playSound(assets.get('assets/audio/sounds/agent_jump.ogg'));
            }

            var blockedX = !this.move(dx, 0.0);

            if (this.vy !== 0.0) {
                if (this.vy > 0.0) {
                    if (this.currentSprite !==  this.sprites.jumpingUp) {
                        this.currentSprite = this.sprites.jumpingUp;
                        this.currentSprite.reset();
                    }
                }
                else if (this.vy < 0.0) {
                    if (this.currentSprite !==  this.sprites.jumpingDown) {
                        this.currentSprite = this.sprites.jumpingDown;
                        this.currentSprite.reset();
                    }
                }
            }
            else if (dx !== 0.0) {
                if (this.currentSprite !==  this.sprites.walking) {
                    this.currentSprite = this.sprites.walking;
                    this.currentSprite.reset();
                }
            }
            else if (this.health > 0) {
                if (this.currentSprite !== this.sprites.standing) {
                    this.currentSprite = this.sprites.standing;
                    this.currentSprite.reset();
                }
            }

            if (dx > 0.0) {
                this.right = true;
            }
            else if (dx < 0.0) {
                this.right = false;
            }

            if (this.standing) {
                var tile = this.level.getTile(this.level.mainTileLayer, this.x + this.w/2.0, this.y - 1);
                if (tile != null && tile.slippery) {
                    if (this.right) {
                        this.vx += 0.01;
                        this.vx = Math.min(0.09, this.vx);
                    }
                    else {
                        this.vx -= 0.01;
                        this.vx = Math.max(-0.09, this.vx);
                    }
                }
                else if (tile != null && !tile.slippery) {

                    if (this.vx > 0.0) {
                        if (this.vx <= 0.01) this.vx = 0.0;
                        else this.vx -= 0.01;
                    }
                    else if (this.vx < 0.0) {
                        if (this.vx >= -0.01) this.vx = 0.0;
                        else this.vx += 0.01;
                    }
                }
            }

            this.checkDamage();

            this.vy += this.g;
        },

        checkDamage: function() {
            for (var y=Math.floor(this.y); y<Math.ceil(this.y+this.h); y++) {
                for (var x=Math.floor(this.x); x<Math.ceil(this.x+this.w); x++) {
                    var t = this.level.getTile(this.level.mainTileLayer, x, y);
                    if (t !== null && t.hurts) {
                        this.hurt();
                    }
                }
            }
        },

        move: function(dx, dy) {
            if (dx != 0.0 && dy != 0.0) {
                var movedX = move(dx, 0.0);
                var movedY = move(0.0, dy);
                return movedX && movedY;
            }

            var moved = true;
            if (dx !== 0.0) {
                if (dx > 0.0) {
                    for (var yRail = Math.floor(this.y); yRail < this.y + this.h; yRail++) {
                        var newX = this.x + dx;
                        for (var xRail = Math.ceil(this.x + this.w); xRail < newX + this.w; xRail++) {
                            var t = this.level.getTile(this.level.mainTileLayer, xRail, yRail);
                            if (t != null && t.isBlocked(Tile.Left)) {
                                var ddx = xRail - (this.x + this.w);
                                if (ddx < dx) {
                                    dx = ddx;
                                    moved = false;
                                }
                            }
                        }
                    }
                }
                else {
                    for (var yRail = Math.floor(this.y); yRail < this.y + this.w; yRail++) {
                        var newX = this.x + dx;
                        for (var xRail = Math.floor(this.x); xRail > newX; xRail--) {
                            var t = this.level.getTile(this.level.mainTileLayer, xRail - 1, yRail);
                            if (t != null && t.isBlocked(Tile.Right)) {
                                var ddx = xRail - this.x;
                                if (ddx > dx) {
                                    dx = ddx;
                                    moved = false;
                                }
                            }
                        }
                    }
                }
                this.x += dx;
            }
            else if (dy !== 0.0) {
                if (dy > 0.0) {
                    for (var xRail = Math.floor(this.x); xRail < this.x + this.w; xRail++) {
                        var newY = this.y + dy;
                        for (var yRail = Math.ceil(this.y + this.h); yRail < newY + this.h; yRail++) {
                            var t = this.level.getTile(this.level.mainTileLayer, xRail, yRail);
                            if (t != null && t.isBlocked(Tile.Bottom)) {
                                var ddy = yRail - (this.y + this.h);
                                if (ddy < dy) {
                                    dy = ddy;
                                    moved = false;
                                }
                            }
                        }
                    }
                }
                else {
                    for (var xRail = Math.floor(this.x); xRail < this.x + this.w; xRail++) {
                        var newY = this.y + dy;
                        for (var yRail = Math.floor(this.y); yRail > newY; yRail--) {
                            var t = this.level.getTile(this.level.mainTileLayer, xRail, yRail - 1);
                            if (t != null && t.isBlocked(Tile.Top)) {
                                var ddy = yRail - this.y;
                                if (ddy > dy) {
                                    dy = ddy;
                                    moved = false;
                                }
                            }
                        }
                    }
                }
                this.y += dy;
            }

            if (this.x < 0.0) {
                this.x = 0.0;
                moved = false;
            }
            else if (this.x + this.w >= this.level.width) {
                this.x = this.level.width - this.w;
                moved = false;
            }

            if (this.y < 0.0) {
                this.y = 0.0;
                moved = false;
            }
            else if (this.y + this.h >= this.level.height) {
                this.y = this.level.height - this.h;
                moved = false;
            }

            return moved;
        },

        hurt: function(obj) {
            if (this.isInvinceble()) return;
            if (this.health <= 0) return;
            audio.playSound(assets.get('assets/audio/sounds/agent_hurt.ogg'));
            this.health--;
            if (this.health == 0) {
                this.die();
            }
            else if (this.health < 0) {

            }
            else {
                if (obj === undefined) {
                    this.vy = 0.4;
                }
                else {
                    var blastDir = {x: this.x - obj.x, y: this.y - obj.y};
                    var length = Math.sqrt(blastDir.x * blastDir.x + blastDir.y * blastDir.y);
                    blastDir.x /= length;
                    blastDir.y /= length;
                    this.vx = blastDir.x * 0.2;
                    this.vy = blastDir.y * 0.2;
                }
                this.invincebleTimer = 120;
            }
        },

        die: function() {
            this.lifes--;
            audio.stopSong();
            if (this.lifes == 0) {
                this.level.gameOver();
            }
            else {
                this.level.restart();
            }
        },

        reset: function() {
            this.standing = false;
            this.jumpDelay = 0;
            this.invincebleTimer = 0;

            if (this.health <= 0) {
                this.health = 2;
            }
        },

        pickUp: function(item) {
            if (item instanceof Health) {
                if (this.health < 3) {
                    this.health++;
                    audio.playSound(assets.get('assets/audio/sounds/pick_up_health.ogg'));
                }
            }

            this.level.removeEntity(item);
        },

        getSprite: function() {
            return this.currentSprite;
        }
    });

    return Player;
});