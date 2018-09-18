// ************************************************

// NEXUS Hub Node Server
//				Jesse Allison (2018)
//
//	To Launch:
//		npm start
//		- or -
//		NODE_ENV=production sudo PORT=80 node nexusNode.js
//		(sudo is required to launch on port 80.)

// ************************************************

var sio = require('socket.io');
var publicFolder = __dirname + '/public';

var NexusHub = require('../lib/hub/hub');
var hub = new NexusHub();

// update any server settings before initialization
if (process.env.PORT) {
    hub.serverPort = process.env.PORT;
}

hub.init(sio, publicFolder);



// *********************
// Set Hub Variables if you like.

hub.currentSection = 0; // current section.
hub.sectionTitles = ["Welcome", "Preface", "Section 1", "Section 2", "End"];

// *********************



// Respond to web sockets with socket.on
hub.io.sockets.on('connection', function(socket) {
    console.log("When am I called?");
    var ioClientCounter = 0; // Can I move this outside into global vars?
    this.socket = socket;
    this.socketID = socket.id;

    hub.channel('register', null, null, function(data) {
        // TODO: iterate through data and add these properties dynamically.
        // Can add any other pertinent details to the socket to be retrieved later

        socket.username = typeof data.name !== 'undefined' ? data.name : "a_user";
        socket.userColor = typeof data.color !== 'undefined' ? data.color : "#CCCCCC";
        socket.userNote = typeof data.note !== 'undefined' ? data.note : " ";
        socket.userLocation = typeof data.location !== 'undefined' ? data.location : { x: 0.5, y: 0.5 };

        // **** Standard client setup ****
        if (socket.username == "display") {
            hub.display.id = socket.id;
            console.log("Hello display: " + hub.display.id);
        }

        if (socket.username == "controller") {
            hub.controller.id = socket.id;
            console.log("Hello Controller: " + hub.controller.id);
        }

        if (socket.username == "audioController") {
            hub.audio.id = socket.id;
            console.log("Hello Audio Controller: " + hub.audio.id);
        }

        if (socket.username == "maxController") {
            hub.audio.id = socket.id;
            console.log("Hello MaxMSP Controller: " + hub.max.id);
        }

        if (socket.username == "a_user") {
            hub.ioClients.push(socket.id);
        }

        var title = hub.getSection(hub.currentSection);

        //        socket.emit('chat', 'SERVER: You have connected. Hello: ' + username);

        // hub.sendSection(hub.currentSection, ['self']);

        // hub.io.sockets.emit('setSection', {sect: sect, title: title});
        if (socket.username == "a_user") {
            // oscClient.send('/causeway/registerUser', socket.id, socket.userColor, socket.userLocation[0],socket.userLocation[1], socket.userNote);
            if (hub.audio.id) {
                hub.io.to(hub.audio.id).emit('/causeway/registerUser', { id: socket.id, color: socket.userColor, locationX: socket.userLocation[0], locationY: socket.userLocation[1], note: socket.userNote }, 1);
                // console.log("Added New User", {id: socket.id, color: socket.userColor, locationX: socket.userLocation[0], locationY: socket.userLocation[1], note: socket.userNote});
            }
        }
    });

    socket.on('disconnect', function() {
        // hub.ioClients.remove(socket.id);	// FIXME: Remove client if they leave
        hub.io.sockets.emit('chat', 'SERVER: ' + socket.id + ' has left the building');
    });


    // Model for most nexusHub interactions create a channel and a response you want to have happen
    // TODO: remove the need for the socket.broadcast.emit and uncomment the hub.transmit as the replacement.

    hub.channel('test', 'test', ['others'], function(data) {
        console.log('Adding in a new socket.on test with data:', data);
        hub.log(`test ${data}`);
        socket.broadcast.emit('test', data);
        // hub.transmit('test', toWhom, data);
    });

    hub.channel('tap', null, ["others", "display"], function(data) {
        hub.log(`tap ${data}`);
        socket.broadcast.emit('tap', data);
        // hub.transmit('tap', toWhom, data);
    });

    // TODO: Should just demo this with tap ["others"] above.
    hub.channel('tapOthers', null, ["others"], function(data) {
        hub.log(`tapOthers ${data}`);
        socket.broadcast.emit('tapOthers', data);
        // hub.transmit('tapOthers', toWhom, data);
    });

    hub.channel('shareToggle', null, ["others"], function(data) {
        hub.log(`shareToggle ${data}`);
        socket.broadcast.emit('shareToggle', data);
        // hub.transmit('shareToggle', toWhom, data);
    });

    hub.channel('shareColor', null, ["others"], function(data) {
        hub.log(`shareColor ${data}`);
        socket.broadcast.emit('shareColor', data);
        // hub.transmit('shareColor', toWhom, data);
    });

    hub.channel('sendText', null, ["others", "display"], function(data) {
        hub.log(`sendText ${data}`);
        socket.broadcast.emit('sendText', data);
        // hub.transmit('sendText', toWhom, data);
    });

    hub.channel('triggerPitch', null, ["others", "display"], function(data) {
        hub.log(`triggerPitch ${data}`);
        socket.broadcast.emit('triggerPitch', data);
        // hub.transmit('triggerPitch', toWhom, data);
    });

    hub.channel('triggerMaxPitch', null, ["max"], function(data) {
        hub.log(`triggerMaxPitch ${data}`);
        socket.broadcast.emit('triggerMaxPitch', data);
        // hub.transmit('triggerMaxPitch', toWhom, data);
        //       if (hub.audio.id) {
        //	hub.io.to(hub.audio.id).emit('/triggerMaxPitch', { id: socket.id }, data);
        //}
    });

    hub.channel('section', null, null, function(data) {
        hub.log(`Section is now: ${data}`);
        hub.currentSection = data;
        hub.sendSection(hub.currentSection);
    });

    hub.channel('item', null, null, function(data) {
        console.log(socket.id + " tapped item: " + data);
        // TODO: Take out all the socket.broadcast.emits.
        // socket.broadcast.emit('chat', socket.id + " : " + data, 1);

        if (hub.display.id) {
            // hub.io.to(hub.display.id).emit('itemback', {phrase: data, color: socket.userColor}, 1);
            hub.io.sockets.emit('itemback', { phrase: data, color: "socket.userColor" }, 1);
        }
        if (hub.audio.id) {
            hub.io.to(hub.audio.id).emit('/item', { id: "socket.id", item: data }, 1);
            // console.log("Item", data);
        }
    });

    console.log("On Connect socket id: ", socket.id);
    hub.onConnection(socket);

});