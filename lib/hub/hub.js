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


var Hub = function() {

    this.serverPort = 3000;
    this.ioClients = []; // list of clients who have logged in.
    this.currentSection = 0; // current section.
    this.sectionTitles = ["Welcome", "Preface", "Section 1", "Section 2", "Section 3", "End"];

    // Specific clients who we only want one instance of
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

    // console.log('channel sendTypeArray: ' + sendTypeArray);
    if (!Array.isArray(sendTypeArray)) {
        sendTypeArray = ['others'];
    }
    if (sendTypeArray.length == 0) {
        sendTypeArray = ['others'];
    }
    // console.log('channel sendTypeArray: ' + sendTypeArray);

    this.channels[nickname] = { 'chan': oscMessage, 'sendTypes': sendTypeArray };

    console.log("channel callback", callback);
    if (callback) {
        // console.log("Callback Creating socket.on!")
        //this.socket.on(oscMessage, callback);
    }

};





// **** SECTIONS ****

// Todo: Add sections to correspond to organ interactions
// hub.sendSection(currentSection);	 // Sets everyone's section
Hub.prototype.sendSection = function(sect) {
    var title = this.getSection(sect);
    this.io.sockets.emit('setSection', { sect: sect, title: title });
    if (this.audio.id) {
        this.io.to(this.audio.id).emit('currentSection', { section: sect, title: title }, 1);
        // console.log("Section sent", sect);
    }
};

// Section shared from Max to UIs
Hub.prototype.shareSection = function(sect) {
    var title = this.getSection(sect);
    this.io.sockets.emit('setSection', sect, title);
};

Hub.prototype.getSection = function(sect) {
    var title = "none";

    if (sect == 'w') {
        title = this.sectionTitles[0];
    }

    if (sect == 'e') {
        title = this.sectionTitles[35];
    }

    if (sect !== 'e' && sect !== 'w') {
        sect++;
        title = this.sectionTitles[sect];
    }

    return title;
};

Hub.prototype.log = function(l) {
    console.log('Hub Log: ' + l);
};

Hub.prototype.init = function(sio, publicFolder) {
    // Setup web app - using express to serve pages
    var express = require('express');
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