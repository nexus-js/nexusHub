// hub.js

'use strict';

/** 
	@class hub      
	nexusHub core functions - used within node code
	```js

	hub.serverPort		// port for the server to run on. default = 3000
	hub.receive() 
	```
	
*/

// Todo: create catch-all socket.on function that simply mirrors out any information received on the specified transmit channels.

var Hub = function() {

    this.serverPort = 3000;
    this.ioClients = []; // list of clients who have logged in.
    this.currentSection = 0; // current section.
    this.sectionTitles = ["Welcome", "Preface", "Section 1", "Section 2", "Section 3", "End"];

    // Specific clients who we only want one instance of

    // Specific clients who we only want one instance of
    this.discreteClients = {
        display: {
            id: null
        },
        controller: {
            id: null
        },
        audio: {
            id: null
        },
        max: {
            id: null
        }
    }

    this.display = {
        id: ""
    };
    // conrollerID,
    this.controller = {
        id: ""
    };
    // audioID
    this.audio = {
        id: ""
    };
    // maxID
    this.max = {
        id: ""
    };

    this.channels = {};

    this.io;
}

Hub.prototype.channel = function(oscMessage, nickname, sendTypeArray, callback) {
    // console.log('channel nickname: ' + nickname);
    if (!nickname) {
        nickname = oscMessage;
    }
    // console.log('channel nickname: ' + nickname);

    // console.log("socket? ", socket.id)

    // console.log('channel sendTypeArray: ' + sendTypeArray);
    if (!Array.isArray(sendTypeArray)) {
        sendTypeArray = ['others'];
    }
    if (sendTypeArray.length == 0) {
        sendTypeArray = ['others'];
    }
    // console.log('channel sendTypeArray: ' + sendTypeArray);
    // FIXME: Don't use this yet.  It's not secure. Must be a better way.
    if (!typeof callback === "function" || typeof callback === "undefined") {
        //this.socket.on(oscMessage, callback);
        // callback = function(data) {
        //     hub.log(`tap: ${data}`);
        //     hub.transmit(nickname, sendTypeArray, data);
        // }

        // console.log("Creating Callback");
        let func = "hub.log(`" + nickname + ": ${data}`); hub.transmit('" + nickname + "', [" + sendTypeArray + "], data);";
        console.log(func);
        // callback = new Function("data", func);
        // console.log("callback function? " + typeof callback);
    }
    // console.log("channel callback", callback);

    this.channels[nickname] = { 'chan': oscMessage, 'sendTypes': sendTypeArray, 'callback': callback };

};

Hub.prototype.onConnection = function(sock) {
    console.log("onConnection");
    console.log("socket id: ", sock.id);
    for (var key in this.channels) {
        var oscMessage = this.channels[key].chan;
        console.log(oscMessage);
        if (this.channels[key].hasOwnProperty('callback')) {
            var callback = this.channels[key].callback
                // console.log(key + " -> " + callback);
            console.log("adding callback: ", key);
            sock.on(oscMessage, callback);
        }
    }
}

// Transmit functions

// others

// all

// self

// display

// controller

// audio

// max

// group

Hub.prototype.transmit = function(nickname, toWhom, data) {
    var where;
    if (toWhom instanceof String) {
        where = [toWhom];
    } else if (toWhom instanceof Array) {
        where = toWhom;
    } else if (this.channels[nickname].sendTypes instanceof Array) {
        where = this.channels[nickname].sendTypes;
    } else {
        where = ["others"];
    }

    var message = this.channels[nickname].chan;

    console.log("Channel: ", message, " Destinations: ", where);

    // where.forEach(function(destination)  // had scope issues wanting to call this.log, etc. j
    for (var i = 0; i < where.length; i++) {
        let destination = where[i];
        this.log(`checking for ${destination}`);
        if (destination == "self") socket.emit(message, data);
        // sending to all clients except sender
        // if (destination == "others") socket.broadcast.emit(message, data);
        // FIME: This sends to everyone! socket doesn't exist within this function. must find a way to use io to send to all but self
        if (destination == "others") this.io.emit(message, data);
        // sending to all clients in 'game' room except sender
        // if (destination == "group") socket.to('game').emit(data);
        // sending to all clients in namespace 'myNamespace', including sender
        // if (destination == "namespace") io.of('myNamespace').emit(data);
        // sending to individual socketid (private message)
        // if (destination == "user") socket.to( socketid ).emit(data);
        if (destination == "all") this.io.emit(message, data);

        // Individual Discrete Clients
        if (this.discreteClientCheck(destination)) {
            this.io.to(this[destination].id).emit(message, data);
        } else {
            this.log(`destination ${destination} does not exist`);
        }

    };
};

Hub.prototype.discreteClientCheck = function(whom) {
    if (this.discreteClients.hasOwnProperty(whom)) {
        this.log(`discreteClientCheck for: ${whom} :: ${this.discreteClients[whom].id ? 1 : 0}`);
        return this.discreteClients[whom].id ? 1 : 0;
    } else {
        return 0;
    }
}



// **** SECTIONS ****

// to set everyone's section to the same thing
Hub.prototype.setSection = function(sect, toWhom) {
    if (sect === 'undefined') {
        sect = this.currentSection;
    }

    var title = this.getSection(sect);
    this.io.sockets.emit('setSection', { sect: sect, title: title });

    // hub.transmit('audio')
};

// TODO: Do I still need this?
// hub.sendSection(currentSection);	 // Sets everyone's section
Hub.prototype.sendSection = function(sect, toWhom) {
    console.log("sendSection:", socket.id);
    if (sect === 'undefined') {
        sect = this.currentSection;
    }

    var title = this.getSection(sect);
    // this.io.sockets.emit('setSection', { sect: sect, title: title });
    this.transmit("setSection", toWhom, { sect: sect, title: title });

};

// Section shared from Max to UIs
Hub.prototype.shareSection = function(sect) {
    var title = this.getSection(sect);
    this.io.sockets.emit('setSection', sect, title);
};

Hub.prototype.getSection = function(sect) {
    var title = "none";

    if (sect !== 'undefined') {
        title = this.sectionTitles[sect];
    } else {
        title = this.sectionTitles[this.currentSection];
    }

    return title;
};

Hub.prototype.log = function(l) {
    console.log('Hub Log: ' + l);
};

// TODO: instantiate SocketIO here instead of node file. 
Hub.prototype.init = function(sio, publicFolder) {
    // Setup web app - using express to serve pages
    var express = require('../../nexusNode/node_modules/express');
    // var express = require('../node_modules/express');
    var http = require('http');
    var serverPort = this.serverPort;
    console.log("Port: " + this.serverPort);

    var app = express();
    app.use(express.static(publicFolder));
    console.log(publicFolder);

    // server is the node server (web app via express)
    // this code can launch the server on port 80 and switch the user id away from sudo
    // apparently this makes it more secure - if something goes awry it isn't running under the superuser.
    var server = http.createServer(app)
        .listen(serverPort, function(err) {
            if (err) return cb(err);

            var uid = parseInt(process.env.SUDO_UID); // Find out which user used sudo through the environment variable
            if (uid) process.setuid(uid); // Set our server's uid to that user
            console.log('Server\'s UID is now ' + process.getuid());
        });

    // start socket.io listening on the server
    this.io = sio.listen(server);

    console.log("Hub Helper Initialized!");
}


module.exports = Hub;