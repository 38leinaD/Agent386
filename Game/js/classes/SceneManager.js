/*
 * Copyright (C) 2010 fruitfly (Daniel Platz)
 *
 * This software is available under a BSD license. Please see the LICENSE.TXT file for details.
 */

define(function(require) {

    var SceneManager = Class.extend({
        init: function() {
            this.scenes = [];
        },

        tick: function() {
            if (this.scenes.length == 0) return;
            var i = this.scenes.length - 1;
            this.scenes[i].tick();
        },

        render: function() {
            if (this.scenes.length == 0) return;
            var i = this.scenes.length - 1;
            this.scenes[i].render();
        }
    });

    return SceneManager;
});