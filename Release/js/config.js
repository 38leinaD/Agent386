/*
 * Copyright (C) 2010 fruitfly (Daniel Platz)
 *
 * This software is available under a BSD license. Please see the LICENSE.TXT file for details.
 */

define(function(require) {
    return {
        base: {
            tickDuration: 1000.0/60.0
        },
        graphics: {
            validateShaders: true
        },
        debug: {
            renderEntityBoundingBoxes: false
        }
    };
});