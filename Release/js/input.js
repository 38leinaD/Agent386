/*
 * Copyright (C) 2010 fruitfly (Daniel Platz)
 *
 * This software is available under a BSD license. Please see the LICENSE.TXT file for details.
 */

var ___INPUT = null;

define(function(require) {
    var pressedKeys = {};

    var gamepadSupport = !!navigator.webkitGetGamepads || !!navigator.webkitGamepads;
    var gamepad = undefined;

    var audio = require('audio');

    var ticking = false;

    function startPolling() {
        if (!ticking) {
            ticking = true;
            tick();
        }
    }

    function stopPolling() {
        ticking = false;
    }

    function tick() {
        pollStatus();
        scheduleNextTick();
    }

    function scheduleNextTick() {

        if (ticking) {
            if (window.requestAnimationFrame) {
                window.requestAnimationFrame(tick);
            } else if (window.mozRequestAnimationFrame) {
                window.mozRequestAnimationFrame(tick);
            } else if (window.webkitRequestAnimationFrame) {
                window.webkitRequestAnimationFrame(tick);
            }
        }
    }

    startPolling();

    function pollStatus() {
        var newGamepad = navigator.webkitGetGamepads && navigator.webkitGetGamepads()[0];
        if (newGamepad !== gamepad) {
            console.log("new gamepad connect");
            gamepad = newGamepad;
        }


        if (gamepad !== undefined) {

            if (gamepad.buttons[12] >= 0.5) {
                pressedKeys['UP'] = true;
            }
            else {
                pressedKeys['UP'] = false;
            }


            if (gamepad.buttons[13] >= 0.5) {
                pressedKeys['DOWN'] = true;
            }
            else {
                pressedKeys['DOWN'] = false;
            }


            if (gamepad.buttons[14] >= 0.5) {
                pressedKeys['LEFT'] = true;
            }
            else {
                pressedKeys['LEFT'] = false;
            }


            if (gamepad.buttons[15] >= 0.5) {
                pressedKeys['RIGHT'] = true;
            }
            else {
                pressedKeys['RIGHT'] = false;
            }



            if (gamepad.buttons[0] >= 0.5) {
                pressedKeys['A'] = true;
            }
            else {
                pressedKeys['A'] = false;
            }

            if (gamepad.buttons[1] >= 0.5) {
                pressedKeys['B'] = true;
            }
            else {
                pressedKeys['B'] = false;
            }
        }
    }

    function setKey(event, status) {
        var code = event.keyCode;
        var key;

        switch(code) {
        case 32: // Space
            key = 'A'; break;
        case 37:
            key = 'LEFT'; break;
        case 38:
            key = 'UP'; break;
        case 39:
            key = 'RIGHT'; break;
        case 40:
            key = 'DOWN'; break;
        default:
            // Convert ASCII codes to letters
            key = String.fromCharCode(event.keyCode);
        }
        pressedKeys[key] = status;
    }

    document.addEventListener('keydown', function(e) {
        if (audio.isSuspended()) {
            audio.resume();
        }
        setKey(e, true);
        e.preventDefault();
        e.stopImmediatePropagation();
        return false;
    });

    document.addEventListener('keyup', function(e) {
        setKey(e, false);
        e.preventDefault();
        e.stopImmediatePropagation();
        return false;
    });

    window.addEventListener('blur', function() {
        pressedKeys = {};
        e.preventDefault();
        e.stopImmediatePropagation();
        return false;
    });


    if (___INPUT == null) {
        ___INPUT =  {
            isDown: function(key) {
                return pressedKeys[key];
            }
        };
    }

    return ___INPUT;

});