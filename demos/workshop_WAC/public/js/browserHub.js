require = (function() {
    function r(e, n, t) {
        function o(i, f) {
            if (!n[i]) {
                if (!e[i]) { var c = "function" == typeof require && require; if (!f && c) return c(i, !0); if (u) return u(i, !0); var a = new Error("Cannot find module '" + i + "'"); throw a.code = "MODULE_NOT_FOUND", a }
                var p = n[i] = { exports: {} };
                e[i][0].call(p.exports, function(r) { var n = e[i][1][r]; return o(n || r) }, p, p.exports, r, e, n, t)
            }
            return n[i].exports
        }
        for (var u = "function" == typeof require && require, i = 0; i < t.length; i++) o(t[i]);
        return o
    }
    return r
})()({
    "hub": [function(require, module, exports) {
        // hub.js

        'use strict';

        /** 
        	@class hub      
        	nexusHub core functions - used within node code
        	```js
        	hub.init()		// loads socket.io
        	hub.register()		// registers with nexusHub server
	
        	hub.channel(osc, nickname, send type array, receive e.g. callback function)		// Send type array default 'others'
        	hub.send(channel, dataJSON)	// send on a created channel.
        	```
        	
        */

        var Hub = function() {

            this.user = new User();

            this.sends = {};
            this.socket;

            // this.init();  // FIXME: implicit init or wait to ensure socket.io and other things load?
        }

        Hub.prototype.register = function() {
            // Tone.startMobile();		// May need this back - check on devices.
            console.log("Registering with nexusHub\n User: " + this.user.name);
            // Just send the this.user object so other people can 
            this.socket.emit('register', this.user);
        };

        Hub.prototype.log = function(l) {
            console.log('Hub Log: ' + l);
        };

        Hub.prototype.init = function() {
            this.socket = io.connect(window.location.origin, {
                transports: ['websocket']
            });
            console.log("nexusHub Initialized!");
        };

        Hub.prototype.channel = function(oscMessage, nickname, sendTypeArray, callback) {
            // console.log('channel nickname: ' + nickname);
            if (!nickname) {
                nickname = oscMessage;
            }
            // console.log('channel nickname: ' + nickname);

            // console.log('channel sendTypeArray: ' + sendTypeArray);
            if (!Array.isArray(sendTypeArray)) {
                sendTypeArray = ['others'];
            }
            if (sendTypeArray.length == 0) {
                sendTypeArray = ['others'];
            }
            // console.log('channel sendTypeArray: ' + sendTypeArray);

            this.sends[nickname] = { 'chan': oscMessage, 'sendTypes': sendTypeArray };
            console.log("channel callback", callback);
            if (callback) {
                // console.log("Callback Creating socket.on!")
                this.socket.on(oscMessage, callback);
            }

        };

        // hub.channel('item', 'item', ['audio', 'display'], function(data) {
        // 	console.log("Received item: " + data);
        // });

        Hub.prototype.send = function(chan, data) {
            var channel = this.sends[chan].chan;
            let sendData = {};
            if (data instanceof String || typeof data === 'string') {
                sendData['value'] = data;
            } else {
                sendData = data;
            }
            sendData['sendTypes'] = this.sends[chan].sendTypes;
            // console.log('send Data ', sendData);

            this.socket.emit(channel, sendData);
        };
        // // FIXME: Which pattern is better?
        // hub.send.item({
        // 	item: numClicked
        // });
        // hub.send('item', {
        // 	item: numClicked
        // });


        var User = function() {
            this.id = 'none';
            this.name = "a_user";
            this.color = 'blue';
            this.location = {
                x: 0,
                y: 0
            };
            this.note = "";
            this.pitch = 60;
        }


        module.exports = Hub;
    }, {}]
}, {}, []);