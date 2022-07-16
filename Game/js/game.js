/*
 * Copyright (C) 2010 fruitfly (Daniel Platz)
 *
 * This software is available under a BSD license. Please see the LICENSE.TXT file for details.
 */

var requestAnimFrame = (function(){
    return window.requestAnimationFrame       ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        window.oRequestAnimationFrame      ||
        window.msRequestAnimationFrame     ||
        function(callback){
            window.setTimeout(callback, 1000 / 60);
        };
})();

if (localStorage["highscore"] == null) {
    localStorage["highscore"] = 1000;
}

define(function(require) {
    var $ = require('lib/zepto');
    var input = require('input');
    var config = require('config');
    var SceneManager = require('classes/SceneManager');
    var LoadScene = require('classes/scenes/LoadScene');

    var res = require('resources');
    res.init(1);

    var sceneManager = new SceneManager();
    sceneManager.scenes.push(new LoadScene(sceneManager));

    // Pause and unpause
    function pause() {
        running = false;
    }

    function unpause() {
        running = true;
        then = Date.now();
        main();
    }

    var accumulatedTime = 0;

    function update(dt) {
        accumulatedTime += dt;
        while (accumulatedTime >= config.base.tickDuration) {
            tick();
            accumulatedTime -= config.base.tickDuration;
        }
    };

    function tick() {
        sceneManager.tick();
    }
    // Draw everything
    function render() {
        sceneManager.render();
    };

    // The main game loop
    function main() {
        if(!running) {
            return;
        }

        var now = Date.now();
        var dt = (now - then);

        update(dt);
        render();

        then = now;
        requestAnimFrame(main);
    };

    // Don't run the game when the tab isn't visible
    window.addEventListener('focus', function() {
        unpause();
    });

    window.addEventListener('blur', function() {
        pause();
    });

    var then = Date.now();
    var running = true;
    main();
});
