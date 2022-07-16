/*
 * Copyright (C) 2010 fruitfly (Daniel Platz)
 *
 * This software is available under a BSD license. Please see the LICENSE.TXT file for details.
 */

define(function(require) {

    var gl = require('gl');
    var config = require('config');

    function getShader(gl, id) {
        var shaderScript = document.getElementById(id);
        if (!shaderScript) {
            return null;
        }

        var str = "";
        var k = shaderScript.firstChild;
        while (k) {
            if (k.nodeType == 3) {
                str += k.textContent;
            }
            k = k.nextSibling;
        }

        var shader;
        if (shaderScript.type == "x-shader/x-fragment") {
            shader = gl.createShader(gl.FRAGMENT_SHADER);
        } else if (shaderScript.type == "x-shader/x-vertex") {
            shader = gl.createShader(gl.VERTEX_SHADER);
        } else {
            return null;
        }

        gl.shaderSource(shader, str);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert(gl.getShaderInfoLog(shader));
            return null;
        }

        return shader;
    }

    var Shader = Class.extend({
        init: function(vertexShaderName, fragementShaderName, uniforms, attributes) {
            var fragmentShader = getShader(gl, fragementShaderName);
            var vertexShader = getShader(gl, vertexShaderName);

            this.shaderProgram = gl.createProgram();
            gl.attachShader(this.shaderProgram, vertexShader);
            gl.attachShader(this.shaderProgram, fragmentShader);
            gl.linkProgram(this.shaderProgram);

            if (!gl.getProgramParameter(this.shaderProgram, gl.LINK_STATUS)) {
                alert("Could not initialise shaders.");
            }

            gl.useProgram(this.shaderProgram);

            this.attributes = {};
            for (var i=0; i<attributes.length; i++) {
                this.attributes[attributes[i]] = gl.getAttribLocation(this.shaderProgram, attributes[i]);
                gl.enableVertexAttribArray(this.attributes[attributes[i]]);
            }

            this.uniforms = {};
            for (var i=0; i<uniforms.length; i++) {
                this.uniforms[uniforms[i]] = gl.getUniformLocation(this.shaderProgram, uniforms[i]);
            }
        },

        use: function() {
            gl.useProgram(this.shaderProgram);
        },

        preRender: function() {
            if (config.graphics.validateShaders) {
                gl.validateProgram(this.shaderProgram);
                if (!gl.getProgramParameter(this.shaderProgram, gl.VALIDATE_STATUS)) {
                    alert("Shader validation failed.");
                }
            }
        }
    });

    return Shader;
});