require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"hub":[function(require,module,exports){
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


    this.socket;

    // this.init();  // FIXME: implicit init or wait to ensure socket.io and other things load?
}

Hub.prototype.registerWithServer = function() {
    // Tone.startMobile();		// May need this back - check on devices.
    console.log("Registering with nexusHub\n User: " + this.user.name);
    this.socket.emit('addme', {
        name: this.user.name,
        color: this.user.color,
        note: this.user.pitch,
        location: this.user.location
    });
    demoSound.triggerPitch();
    document.getElementsByClassName("sd")[0].style.display = 'none';
    document.getElementsByClassName("st")[0].style.display = 'block';
}
Hub.prototype.log = function(l) {
    console.log('Hub Log: ' + l);
};

Hub.prototype.init = function() {
    this.socket = io.connect(window.location.origin, {
        transports: ['websocket']
    });
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
},{}]},{},[]);
