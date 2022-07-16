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

    var Tile = require('classes/Tile');

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

    function distance(a, b) {
        var xx = (a.x + a.w/2.0) - (b.x + b.w/2.0);
        var yy = (a.y + a.h/2.0) - (b.y + b.h/2.0);

        return Math.sqrt(xx*xx + yy*yy);
    }

    var Robot = Class.extend({
        init: function() {
            this.x = 0;
            this.y = 0;
            this.g = -0.02;
            this.vx = 0;
            this.vy = 0;
            this.w = 1.0;
            this.h = 1.4;
            this.level = undefined;
            this.right = false;

            this.ticker = 0;

            this.sprites = res.sprites.createRobot();
            this.currentSprite = this.sprites.right;
        },

        tick: function() {
            this.ticker ++;
            this.currentSprite.tick();

            if (intersect(this, this.level.player)) {
                this.level.player.hurt();
                return;
            }

            var dx = this.vx;
            var dy = this.vy;

            var standing = false;
            var blockedY = !this.move(0.0, dy);
            if (blockedY && this.vy < 0.0) {
                standing = true;
                this.vy = 0.0;
            }
            else if (blockedY && this.vy > 0.0) {
                this.vy = 0.0;
            }


            var dist = distance(this, this.level.player);

            if (this.ticker % 120 == 0) {
                if (dist < 12) {
                    audio.playSound(assets.get('assets/audio/sounds/robot_turn.ogg'), (12 - dist)/12.0);
                }
            }

            if (standing) {
                if (this.right && this.couldMove(this.x + this.w, this.y, 0.0, -0.1)) {
                    this.right = false;

                }
                else if (!this.right && this.couldMove(this.x - this.w, this.y, 0.0, -0.1)) {
                    this.right = true;
                }
            }

            if (this.right) {
                dx += 0.07;
            }
            else {
                dx += -0.07;
            }

            var blockedX = !this.move(dx, 0.0);

            if (blockedX && dx < 0.0) {
                this.right = true;
            }
            else if (blockedX && dx > 0.0) {
                this.right = false;
            }

            if (this.right) {
                if (this.currentSprite !==  this.sprites.right) {
                    this.currentSprite = this.sprites.right;
                    this.currentSprite.reset();
                }
            }
            else {
                if (this.currentSprite !== this.sprites.left) {
                    this.currentSprite = this.sprites.left;
                    this.currentSprite.reset();
                }
            }

            this.vy += this.g;
        },

        move: function(dx, dy) {
            if (dx != 0.0 && dy != 0.0) {
                var movedX = this.move(dx, 0.0);
                var movedY = this.move(0.0, dy);
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

        couldMove: function(posX, posY, dx, dy) {
            if (dx != 0.0 && dy != 0.0) {
                var movedX = this.couldMove(posX, posY, dx, 0.0);
                var movedY = this.couldMove(posX + dx, posY, 0.0, dy);
                return movedX && movedY;
            }

            var moved = true;
            if (dx !== 0.0) {
                if (dx > 0.0) {
                    for (var yRail = Math.floor(posY); yRail < posY + this.h; yRail++) {
                        var newX = posX + dx;
                        for (var xRail = Math.ceil(posX + this.w); xRail < newX + this.w; xRail++) {
                            var t = this.level.getTile(this.level.mainTileLayer, xRail, yRail);
                            if (t != null && t.isBlocked(Tile.Left)) {
                                var ddx = xRail - (posX + this.w);
                                if (ddx < dx) {
                                    dx = ddx;
                                    moved = false;
                                }
                            }
                        }
                    }
                }
                else {
                    for (var yRail = Math.floor(posY); yRail < posY + this.w; yRail++) {
                        var newX = posX + dx;
                        for (var xRail = Math.floor(posX); xRail > newX; xRail--) {
                            var t = this.level.getTile(this.level.mainTileLayer, xRail - 1, yRail);
                            if (t != null && t.isBlocked(Tile.Right)) {
                                var ddx = xRail - posX;
                                if (ddx > dx) {
                                    dx = ddx;
                                    moved = false;
                                }
                            }
                        }
                    }
                }
            }
            else if (dy !== 0.0) {
                if (dy > 0.0) {
                    for (var xRail = Math.floor(posX); xRail < posX + this.w; xRail++) {
                        var newY = posY + dy;
                        for (var yRail = Math.ceil(posY + this.h); yRail < newY + this.h; yRail++) {
                            var t = this.level.getTile(this.level.mainTileLayer, xRail, yRail);
                            if (t != null && t.isBlocked(Tile.Bottom)) {
                                var ddy = yRail - (posY + this.h);
                                if (ddy < dy) {
                                    dy = ddy;
                                    moved = false;
                                }
                            }
                        }
                    }
                }
                else {
                    for (var xRail = Math.floor(posX); xRail < posX + this.w; xRail++) {
                        var newY = posY + dy;
                        for (var yRail = Math.floor(posY); yRail > newY; yRail--) {
                            var t = this.level.getTile(this.level.mainTileLayer, xRail, yRail - 1);
                            if (t != null && t.isBlocked(Tile.Top)) {
                                var ddy = yRail - posY;
                                if (ddy > dy) {
                                    dy = ddy;
                                    moved = false;
                                }
                            }
                        }
                    }
                }
            }

            return moved;
        },

        getSprite: function() {
            return this.currentSprite;
        }
    });

    return Robot;
});