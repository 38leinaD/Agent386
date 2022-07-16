/*
 * Copyright (C) 2010 fruitfly (Daniel Platz)
 *
 * This software is available under a BSD license. Please see the LICENSE.TXT file for details.
 */

define(function(require) {
    var audio = require('audio');

    var AssetLoader = Class.extend({
        init: function() {
            this.loadQueue = [];
            this.assets = {};
            this.size = 0;
            this.asyncProcesses = 0;
            this.asyncProcessesCompleted = 0;
            this.error = false;
        },

        add: function(file) {
            this.loadQueue.push(file);
            this.size++;
        },

        load: function() {
            var self = this;
            for (var i=0; i<this.loadQueue.length; i++) {
                var file = this.loadQueue[i];
                if (file.indexOf('.json') != -1) {
                    (function() { // new scope for onload-handler needed (buzzword: closure in loop)
                        self._requestFile(file, self._handleJSON);
                    })();
                }
                else if (file.indexOf('.png') != -1) {
                    (function() {
                        var image = new Image();
                        image.crossOrigin = 'anonymous';

                        image.onload = function() {
                            self._handleImage(image);
                        }
                        image.onerror = function() {
                            self.error = true;
                            self.errorFile = file;
                        }
                        image.file = file;
                        image.src = file;
                    })();
                }
                else if (file.indexOf('.ogg') != -1 || file.indexOf('.mp3') != -1) {
                    (function() {
                        self._requestFile(file, self._handleAudio, 'arraybuffer');
                    })();
                }
            }
        },

        _requestFile: function(url, handler, type) {
            var self = this;
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.file = url;
            if (type !== undefined) {
                xhr.responseType = type;
            }
            xhr.onload = function(e) {
                handler.apply(self, [e.target]);
            }
            xhr.onreadystatuschange = function() {
                if (xhr.status == 404) {
                    self.error = true;
                    self.errorFile = xhr.file;
                }
            }
            xhr.onerror = function() {
                self.error = true;
                self.errorFile = xhr.file;
            }
            xhr.on
            xhr.send();
        },

        _handleJSON: function(xhr) {
            console.log("Asset loaded: " + xhr.file);
            this.assets[xhr.file] = JSON.parse(xhr.responseText); // todo: not working in ff
            this.loadQueue.splice(this.loadQueue.indexOf(xhr.file), 1);
        },

        _handleImage: function(image) {
            console.log("Asset loaded: " + image.file);
            this.assets[image.file] = image;
            this.loadQueue.splice(this.loadQueue.indexOf(image.file), 1);
        },


        _addAsyncProcess: function() {
            this.asyncProcesses++;
        },

        _handleAudio: function(xhr) {
            this._addAsyncProcess();
            var self = this;
            audio.context.decodeAudioData(xhr.response, function(buffer) {
                self.assets[xhr.file] = buffer;
                self.asyncProcessesCompleted++;
            }, function(e) {
                self.error = true;
                self.errorFile = xhr.file;
            });
            this.loadQueue.splice(this.loadQueue.indexOf(xhr.file), 1);
        },

        update: function() {
            return this.loadQueue.length + (this.asyncProcesses - this.asyncProcessesCompleted) > 0;
        },

        hasError: function() {
            return this.error;
        },

        getErrorFile: function() {
            return this.errorFile;
        },

        getProgress: function() {
            return ((this.size) - this.loadQueue.length + this.asyncProcessesCompleted)/(this.size + this.asyncProcesses);
        },

        get: function(file) {
            var asset =  this.assets[file];
            if (asset === undefined) {
                console.error('Asset "' + file + '" requested before finished loading or not known to AssetManager.');
            }
            return asset;
        }
    });

    return AssetLoader;
});