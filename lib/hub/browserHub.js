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

    // FIXME: move default overlay into Hub
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