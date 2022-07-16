/*
 * Copyright (C) 2010 fruitfly (Daniel Platz)
 *
 * This software is available under a BSD license. Please see the LICENSE.TXT file for details.
 */

define(function(require) {

    var $ = require('lib/zepto');

    var container = document.getElementById('container');
    var canvas = document.createElement('canvas');
    container.appendChild(canvas);
    var gl = canvas.getContext("experimental-webgl");

    function resize() {
        canvas.width = $(window).width();
        canvas.height = $(window).height();
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
    }

    resize();

    $(window).on("resize", function(e) {
        resize();
    });

    return gl;
});
