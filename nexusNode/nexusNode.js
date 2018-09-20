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
// Set Hub Variables  or add more if you like.

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
            hub.discreteClients.display.id = socket.id;
            console.log("Hello display: " + hub.display.id);
        }

        if (socket.username == "controller") {
            hub.controller.id = socket.id;
            hub.discreteClients.controller.id = socket.id;
            console.log("Hello Controller: " + hub.controller.id);
        }

        if (socket.username == "audioController") {
            hub.audio.id = socket.id;
            hub.discreteClients.audio.id = socket.id;
            console.log("Hello Audio Controller: " + hub.audio.id);
        }

        if (socket.username == "maxController") {
            hub.audio.id = socket.id;
            hub.discreteClients.audio.id = socket.id;
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

    // Traditional socket assignments work just fine
    socket.on('disconnect', function() {
        // hub.ioClients.remove(socket.id);	// FIXME: Remove client if they leave
        hub.log('SERVER: ' + socket.id + ' has left the building');
    });


    // Model for most nexusHub interactions create a channel and a response you want to have happen
    // TODO: remove the need for the socket.broadcast.emit and uncomment the hub.transmit as the replacement.

    hub.channel('test', 'test', ['others'], function(data) {
        console.log('Adding in a new socket.on test with data:', data);
        hub.log(`test ${data}`);
        hub.transmit('test', null, data);
    });

    hub.channel('tap', null, ["others", "display"], function(data) {
        hub.log(`tap ${data}`);
        hub.transmit('tap', null, data);
        //  socket.broadcast.emit('tap', data);  // just for others until a fix is made.
    });

    // Don't use auto callback creation yet, it's not secure.
    // hub.channel('tap', null, ["others", "display", "audio"]);

    // TODO: Should just demo this with tap ["others"] above.
    hub.channel('tapOthers', null, ["others"], function(data) {
        hub.log(`tapOthers ${data}`);
        hub.transmit('tapOthers', null, data);
        // socket.broadcast.emit('tapOthers', data);
    });

    hub.channel('shareToggle', null, ["others"], function(data) {
        hub.log(`shareToggle ${data}`);
        hub.transmit('shareToggle', null, data);
    });

    hub.channel('sharedSlider', null, null, function(data) {
        // hub.transmit('sharedSlider', null, data);
        socket.broadcast.emit('sharedSlider', data);
    });

    hub.channel('shareColor', null, ["others"], function(data) {
        hub.log(`shareColor ${data}`);
        hub.transmit('shareColor', null, data);
    });

    hub.channel('sendText', null, ["others", "display"], function(data) {
        hub.log(`sendText ${data}`);
        hub.transmit('sendText', null, data);
    });

    hub.channel('triggerPitch', null, ["others", "display"], function(data) {
        hub.log(`triggerPitch ${data}`);
        hub.transmit('triggerPitch', null, data);
    });

    hub.channel('triggerMaxPitch', null, ["max"], function(data) {
        hub.log(`triggerMaxPitch ${data}`);
        hub.transmit('triggerMaxPitch', null, data);
    });

    hub.channel('section', null, null, function(data) {
        hub.log(`Section is now: ${data}`);
        hub.currentSection = data;
        hub.sendSection(hub.currentSection);
    });

    hub.channel('item', null, null, function(data) {
        console.log(socket.id + " tapped item: " + data);
        // This could be done with the sendTypes array, but if you want to overwrite what is being sent, here you go:
        if (hub.discreteClientCheck('display')) {
            hub.io.to(hub.discreteClients['display'].id).emit('itemback', { phrase: data, color: "socket.userColor" }, 1);
        }
        if (hub.discreteClientCheck('audio')) {
            hub.io.to(hub.discreteClients[audio].id).emit('/item', { id: "socket.id", item: data }, 1);
        }
        hub.transmit('itemback', null, data);
    });

    console.log("On Connect socket id: ", socket.id);
    hub.onConnection(socket);

});