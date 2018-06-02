require = (function e(t, n, r) {
    function s(o, u) { if (!n[o]) { if (!t[o]) { var a = typeof require == "function" && require; if (!u && a) return a(o, !0); if (i) return i(o, !0); var f = new Error("Cannot find module '" + o + "'"); throw f.code = "MODULE_NOT_FOUND", f } var l = n[o] = { exports: {} };
            t[o][0].call(l.exports, function(e) { var n = t[o][1][e]; return s(n ? n : e) }, l, l.exports, e, t, n, r) } return n[o].exports } var i = typeof require == "function" && require; for (var o = 0; o < r.length; o++) s(r[o]); return s })({
    "hub": [function(require, module, exports) {
        // hub.js

        'use strict';

        /** 
        	@class hub      
        	nexusHub core functions - used within node code
        	```js
        	hub.receive() 
        	```
        	
        */

        var Hub = function() {

            this.user = new User();

            this.init();

        }


        Hub.prototype.log = function(l) {
            console.log('Hub Log: ' + l);
        };

        Hub.prototype.init = function() {
            console.log("Hub Helper Initialized!");
        }



        var User = function() {
            this.id = 'none';
            this.name = "";
            this.color;
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