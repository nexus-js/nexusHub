// hub.js

'use strict';

/** 
	@class hub      
	nexusHub core functions - used within node code
	```js
	hub.init()		// loads socket.io
	hub.register()		// registers with nexusHub server

	hub.channel(osc, channelNickname, send type array, receive e.g. callback function)		// Send type array default 'others'
	hub.send(channel, dataJSON)	// send on a created channel.
	```
	
*/

var Hub = function() {

    this.user = new User();

    this.channels = {};
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

Hub.prototype.channel = function(channel, channelNickname, destinations, callback) {
    // console.log('channel channelNickname: ' + channelNickname);
    if (!channelNickname) {
        channelNickname = channel;
    }
    // console.log('channel channelNickname: ' + channelNickname);


    // check destinations for precedence
    let destinationPrecedence;
    if (Array.isArray(destinations)) { // Browser Channel definition
        destinationPrecedence = 3;
        destinations = destinations;
    } else if (destinations instanceof String || typeof destinations === 'string') { // Browser Channel definition
        destinationPrecedence = 3;
        destinations = [destinations];
    } else { // Otherwise default definition
        destinationPrecedence = 0;
        destinations = ['others'];
    }
    // console.log('channel destinations: ' + destinations);

    // Register send
    this.channels[channelNickname] = { 'channel': channel, 'destinations': destinations, 'destinationPrecedence': destinationPrecedence };

    console.log("channel callback", callback);
    if (callback) {
        // console.log("Callback Creating socket.on!")
        this.socket.on(channel, callback);
    }

};

// hub.channel('item', 'item', ['audio', 'display'], function(data) {
// 	console.log("Received item: " + data);
// });


Hub.prototype.send = function(channelNickname, data) {
    this.log('Logging a send ', channelNickname, data);
    this.transmit(channelNickname, null, data);
};

Hub.prototype.transmit = function(channelNickname, destinations, data) {
    this.log('Logging a transmit ', channelNickname, destinations, data);
    // Does this channel exist?
    let channel;
    if (this.channels.hasOwnProperty(channelNickname)) {
        channel = this.channels[channelNickname].channel;
    } else {
        // Just send the data anyway... FIXME: Should we make a channel or keep it this way?
        channel = channelNickname;
    }

    // this.channels.hasOwnProperty(channelNickname) && this.channels[channelNickname].destinations instanceof Array

    let sendData = {};

    // Sanitized data. either leave as a json or make it one with a key of 'value'
    if (data instanceof Object || typeof data === 'object') {
        sendData = data;
    } else if (data instanceof String || typeof data === 'string' || data instanceof Number || typeof data === 'number' || Array.isArray(data)) {
        sendData['value'] = data;
    } else {
        this.log("Data is an unrecognized type: ", data);
    }

    // Set destinations & check destinations for precedence

    if (destinations == null) {
        if (this.channels.hasOwnProperty(channelNickname) && this.channels[channelNickname].destinationPrecedence == 3) { // Browser Channel definition
            sendData['destinationPrecedence'] = 3;
            sendData['destinations'] = this.channels[channelNickname].destinations;
        } else {
            // No destinations, default values baby
            sendData['destinationPrecedence'] = 0;
            sendData['destinations'] = ['others'];
        }
    } else {
        if (Array.isArray(destinations)) { // Browser client transmit definition
            sendData['destinationPrecedence'] = 1;
            sendData['destinations'] = destinations;
        } else if (destinations instanceof String || typeof destinations === 'string') { // Browser client transmit definition
            sendData['destinationPrecedence'] = 1;
            sendData['destinations'] = [destinations];
        } else if (this.channels[channelNickname].destinationPrecedence == 3) { // Browser Channel definition
            sendData['destinationPrecedence'] = 3;
            sendData['destinations'] = this.channels[channelNickname].destinations;
        } else { // otherwise default values
            sendData['destinationPrecedence'] = 0;
            sendData['destinations'] = ['others'];
        }
    }

    // console.log('send Data ', sendData);

    this.socket.emit(channel, sendData);
}

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