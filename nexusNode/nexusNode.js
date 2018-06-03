// ************************************************

// NEXUS Hub Node Server
//				Jesse Allison (2017)
//
//	To Launch:
//		NODE_ENV=production sudo node nexus-server.js
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


// *********************


hub.channel('tapOthers', 'tapOthers', ['others'], function(data) {
    // anything else you would like to do?
    console.log('Adding in a new socket.on', data);
})

// Respond to web sockets with socket.on
hub.io.sockets.on('connection', function(socket) {
    var ioClientCounter = 0; // Can I move this outside into global vars?

    socket.on('addme', function(data) {
        username = data.name;
        var userColor = data.color;
        var userNote = data.note;
        var userLocation = data.location;

        if (username == "display") {
            hub.display.id = socket.id;
            console.log("Hello display: " + hub.display.id);
        }

        if (username == "controller") {
            hub.controller.id = socket.id;
            console.log("Hello Controller: " + hub.controller.id);
        }

        if (username == "audio_controller") {
            hub.audio.id = socket.id;
            console.log("Hello Audio Controller: " + hub.audio.id);
        }

        if (username == "max_controller") {
            hub.audio.id = socket.id;
            console.log("Hello MaxMSP Controller: " + hub.max.id);
        }

        if (username == "a_user") {
            hub.ioClients.push(socket.id);
        }

        socket.username = username; // allows the username to be retrieved anytime the socket is used
        // Can add any other pertinent details to the socket to be retrieved later
        socket.userLocation = userLocation;
        socket.userColor = userColor;
        socket.userNote = userNote;
        // .emit to send message back to caller.
        socket.emit('chat', 'SERVER: You have connected. Hello: ' + username + " " + socket.id + 'Color: ' + socket.userColor);
        // .broadcast to send message to all sockets.
        //socket.broadcast.emit('chat', 'SERVER: A new user has connected: ' + username + " " + socket.id + 'Color: ' + socket.userColor);
        // socket.emit('bump', socket.username, "::dude::");
        var title = hub.getSection(hub.currentSection);

        if (username == "a_user") {
            //console.log("Hello:", socket.username, "currentSection:", hub.currentSection, "id:", socket.id, "userColor:", socket.userColor, "userLocation:", socket.userLocation, "userNote:", socket.userNote);
        }

        socket.emit('setSection', { sect: hub.currentSection, title: title });
        // hub.io.sockets.emit('setSection', {sect: sect, title: title});
        if (username == "a_user") {
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

    socket.on('sendchat', function(data) {
        // Transmit to everyone who is connected //
        hub.io.sockets.emit('chat', socket.username, data);
    });

    socket.on('tap', function(data) {
        // console.log("Data: ", data.inspect);
        // oscClient.send('/tapped', 1);
        socket.broadcast.emit('tapped', socket.username, 1);
    });

    socket.on('shareToggle', function(data) {
        socket.broadcast.emit('setSharedToggle', data);
    });


    socket.on('item', function(data) {
        console.log(socket.id + " tapped item: " + data);
        // TODO: Take out all the socket.broadcast.emits.
        // socket.broadcast.emit('chat', socket.id + " : " + data, 1);

        if (hub.display.id) {
            // hub.io.to(hub.display.id).emit('itemback', {phrase: data, color: socket.userColor}, 1);
            hub.io.sockets.emit('itemback', { phrase: data, color: socket.userColor }, 1);
        }
        if (hub.audio.id) {
            hub.io.to(hub.audio.id).emit('/causeway/phrase/number', { id: socket.id, item: data }, 1);
            // console.log("Item", data);
        }
    });

    socket.on('triggerPitch', function(data) {
        if (hub.audio.id) {
            hub.io.to(hub.audio.id).emit('/causeway/triggerPitch', { id: socket.id }, 1);
        }
    });

    socket.on('section', function(data) {
        console.log("Section is now: " + data);
        hub.currentSection = data;
        hub.sendSection(hub.currentSection);
    })


});