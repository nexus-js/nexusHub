// hub.js

'use strict';

/** 
	@class hub      
	nexusHub core functions - used within node code
	```js
	hub.receive() 

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
};

Hub.prototype.log = function(l) {
    console.log('Hub Log: ' + l);
};

Hub.prototype.init = function() {
    this.socket = io.connect(window.location.origin, {
        transports: ['websocket']
    });
    console.log("Hub Helper Initialized!");
};

Hub.prototype.channel = function(oscMessage, nickname, sendTypeArray, callback) {
    console.log('channel nickname: ' + nickname);
    if (!nickname) {
        nickname = oscMessage;
    }
    console.log('channel nickname: ' + nickname);

    if (!sendTypeArray) {
        sendTypeArray = ['others'];
    }

    this.sends[nickname] = { 'chan': oscMessage, 'sendTypes': sendTypeArray };
    console.log("channel callback", callback);
    if (callback) {
        console.log("Callback Creating socket.on!")
        this.socket.on(oscMessage, callback);
    }

};

// hub.channel('item', 'item', ['audio', 'display'], function(data) {
// 	console.log("Received item: " + data);
// });

Hub.prototype.send = function(chan, data) {
    var channel = this.sends[chan].chan;
    data['sendTypes'] = this.sends[chan].sendTypes;
    console.log('send Data ', data);

    this.socket.emit(channel, data);
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