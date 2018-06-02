// ************************************************

// NEXUS Hub Node Server Cluster
//				Jesse Allison (2017)
//
//	To Launch:
//		NODE_ENV=production sudo node nexusCluster.js
//		(sudo is required to launch on port 80.)
//
// To start server with Xtra RAM - NODE_DEBUG=cluster node --max_old_space_size=4096 appCluster.js

// ************************************************

// Setup web app
//  - using express to serve pages
//  - socket.io to maintain websocket communication
//  - redis for interworker communications/data

var SERVER_PORT = 3000;


var cluster = require('cluster');
var workerNumber = require('os').cpus().length * 2;
var express = require('express');
var http = require('http');
var sio = require('socket.io');
var io; // the io
var redis = require('redis'); // Our shared memory database -- stores everything in RAM.  
var redisAdapter = require('socket.io-redis');

var serverPort = process.env.PORT || SERVER_PORT;
var workers = process.env.WORKERS || workerNumber;
var redisUrl = process.env.REDISTOGO_URL || 'redis://127.0.0.1:6379';

var app = express();
app.use(express.static(__dirname + '/public'));



// Start a worker node.  This is general setup for each node.

function start() {
    var httpServer = http.createServer(app);
    // server is the node server (web app via express)
    var server = httpServer.listen(serverPort, function(err) {
        if (err) return cb(err);

        // this code can launch the server on port 80 and switch the user id away from sudo
        // apparently this makes it more secure - if something goes awry it isn't running under the superuser.
        var uid = parseInt(process.env.SUDO_UID); // Find out which user used sudo through the environment variable
        if (uid) process.setuid(uid); // Set our server's uid to that user
        console.log('Server\'s UID is now ' + process.getuid());
    });

    io = sio.listen(server);
    io.adapter(redisAdapter({ host: 'localhost', serverPort: 6379 })); // Use redis to share socket.io info between workers
    console.log('Redis adapter started with url: ' + redisUrl);
}




if (cluster.isMaster) {

    console.log('start cluster with %s workers', workers - 1);
    workers--;
    for (var i = 0; i < workers; ++i) {
        var worker = cluster.fork();
        console.log('worker %s started.', worker.process.pid);
    }

    cluster.on('death', function(worker) {
        console.log('worker %s died. restart...', worker.process.pid);
    });


} else {

    // Kickoff a Worker!
    start();

    var redisClient = redis.createClient();
    // redisClient.lpush("markov", markovJoined);
    //
    // redisClient.lindex("markov", 0, function (err, data) {
    // 	// io.sockets.emit('chat', data);
    // 	// console.log(data);
    // })
    // redisClient.llen(listName, handleLength);
    // var markovItem = redisClient.LINDEX("markovArray", 0);
    //
    // for (var i=0; i < redisClient.LLEN("markovArray");i++) {
    // 	markovArray[i] = JSON.parse redisClient.LGET("markovArray", i);
    // }

    //	client.sscan(
    //	    "itemsset",
    //	    cursor,
    //	    'MATCH', '*'+idata+'*',
    //	    'COUNT', '10',
    //	    function(err, res) {
    //
    //				redisClient.on("error", function (err) {
    //				    console.log("Redis Error " + err);
    //				});
    //			...}





    // *********************
    // Global Variables!

    var ioClients = []; // list of clients who have logged in.
    var currentSection = 0; // current section.
    redisClient.set("currentSection", currentSection);
    // Specific clients who we only want one of.
    var theaterID,
        conrollerID,
        audioControllerID;

    // *********************



    // Respond to web sockets with socket.on
    io.sockets.on('connection', function(socket) {
        var ioClientCounter = 0; // Can I move this outside into global vars?

        socket.on('addme', function(data) {
            username = data.name;
            var userColor = data.color;
            var userNote = data.note;
            var userLocation = data.location;

            if (username == "theater") {
                theaterID = socket.id;
                redisClient.set("theaterID", theaterID);
                console.log("Hello Theater: " + theaterID);
            }

            if (username == "controller") {
                controllerID = socket.id;
                redisClient.set("controllerID", controllerID);
                console.log("Hello Controller: " + controllerID);
            }

            if (username == "audio_controller") {
                audioControllerID = socket.id;
                redisClient.set("audioControllerID", audioControllerID);
                console.log("Hello Audio Controller: " + audioControllerID);
            }

            if (username == "a_user") {
                ioClients.push(socket.id);
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

            // Redis server to get the shared currentSection
            redisClient.get('currentSection', function(err, reply) {
                currentSection = reply;
                if (currentSection) {
                    var title = getSection(currentSection);
                    socket.emit('setSection', { sect: currentSection, title: title });
                    // socket.emit("section", num);
                }
            });

            if (username == "a_user") {
                //console.log("Hello:", socket.username, "currentSection:", currentSection, "id:", socket.id, "userColor:", socket.userColor, "userLocation:", socket.userLocation, "userNote:", socket.userNote);
            }

            // io.sockets.emit('setSection', {sect: sect, title: title});
            if (username == "a_user") {
                // oscClient.send('/causeway/registerUser', socket.id, socket.userColor, socket.userLocation[0],socket.userLocation[1], socket.userNote);
                redisClient.get('audioControllerID', function(err, reply) {
                    audioControllerID = reply;
                    if (audioControllerID) {
                        io.to(audioControllerID).emit('/causeway/registerUser', { id: socket.id, color: socket.userColor, locationX: socket.userLocation[0], locationY: socket.userLocation[1], note: socket.userNote }, 1);
                    }
                });
            }
        });


        socket.on('disconnect', function() {
            // ioClients.remove(socket.id);	// FIXME: Remove client if they leave
            io.sockets.emit('chat', 'SERVER: ' + socket.id + ' has left the building');
        });

        socket.on('sendchat', function(data) {
            // Transmit to everyone who is connected //
            io.sockets.emit('chat', socket.username, data);
        });

        socket.on('tap', function(data) {
            // console.log("Data: ", data.inspect);
            // oscClient.send('/tapped', 1);
            socket.broadcast.emit('tapped', socket.username, 1);
        });

        socket.on('interactionTrail', function(data) {
            console.log("Received interactionTrail: " + data);
            // send somewhere?  perhaps theatre?
            redisClient.lpush("interactionTrail", data); // Store for some other time...
        })

        socket.on('shareToggle', function(data) {
            socket.broadcast.emit('setSharedToggle', data);
        });

        socket.on('location', function(data) {
            if (data) {
                // oscClient.send('/location', data[0], data[1]);
            }
        });

        socket.on('item', function(data) {
            console.log(socket.id + " tapped item: " + data);
            // TODO: Take out all the socket.broadcast.emits.
            // socket.broadcast.emit('chat', socket.id + " : " + data, 1);

            redisClient.get('theaterID', function(err, reply) {
                theaterID = reply;
                if (theaterID) {
                    io.sockets.emit('itemback', { phrase: data, color: socket.userColor }, 1);
                }
            });

            redisClient.get('audioControllerID', function(err, reply) {
                audioControllerID = reply;
                if (audioControllerID) {
                    io.to(audioControllerID).emit('/causeway/phrase/number', { id: socket.id, item: data }, 1);
                    // console.log("Item", data);
                }
            });
        });

        socket.on('nextChord', function(data) {
            redisClient.get('audioControllerID', function(err, reply) {
                audioControllerID = reply;
                if (audioControllerID) {
                    io.to(audioControllerID).emit('/causeway/nextChord', { id: socket.id }, 1);
                }
            });
            socket.broadcast.emit('triggerNextChord', data);
        });

        socket.on('triggerCauseway', function(data) {
            redisClient.get('audioControllerID', function(err, reply) {
                audioControllerID = reply;
                if (audioControllerID) {
                    io.to(audioControllerID).emit('/causeway/triggerCauseway', { id: socket.id }, 1);
                }
            });
        });

        socket.on('triggerPitch', function(data) {
            redisClient.get('audioControllerID', function(err, reply) {
                audioControllerID = reply;
                if (audioControllerID) {
                    io.to(audioControllerID).emit('/causeway/triggerPitch', { id: socket.id }, 1);
                }
            });
        });

        socket.on('triggerBBCollapse', function(data) {
            redisClient.get('audioControllerID', function(err, reply) {
                audioControllerID = reply;
                if (audioControllerID) {
                    io.to(audioControllerID).emit('/causeway/triggerBBCollapse', { id: socket.id }, 1);
                }
            });
            socket.broadcast.emit('triggerBBCollapse', data);
        });

        socket.on('triggerSmolder', function(data) {
            redisClient.get('audioControllerID', function(err, reply) {
                audioControllerID = reply;
                if (audioControllerID) {
                    io.to(audioControllerID).emit('/causeway/triggerSmolder', { id: socket.id }, 1);
                }
            });
            socket.broadcast.emit('triggerSmolder', data);
        });

        socket.on('triggerWhoBrought', function(data) {
            redisClient.get('audioControllerID', function(err, reply) {
                audioControllerID = reply;
                if (audioControllerID) {
                    io.to(audioControllerID).emit('/causeway/triggerWhoBrought', { id: socket.id }, 1);
                }
            });
            socket.broadcast.emit('triggerWhoBrought', data);
        });

        socket.on('triggerCollide', function(data) {
            redisClient.get('audioControllerID', function(err, reply) {
                audioControllerID = reply;
                if (audioControllerID) {
                    io.to(audioControllerID).emit('/causeway/triggerCollide', { id: socket.id }, 1);
                }
            });
            socket.broadcast.emit('triggerCollide', data);
        });

        socket.on('triggerCricket', function(data) {
            redisClient.get('audioControllerID', function(err, reply) {
                audioControllerID = reply;
                if (audioControllerID) {
                    io.to(audioControllerID).emit('/causeway/triggerCricket', { id: socket.id }, 1);
                }
            });
            socket.broadcast.emit('triggerCricket', data);
        });

        socket.on('triggerSequins', function(data) {
            redisClient.get('audioControllerID', function(err, reply) {
                audioControllerID = reply;
                if (audioControllerID) {
                    io.to(audioControllerID).emit('/causeway/triggerSequins', { id: socket.id }, 1);
                }
            });
            socket.broadcast.emit('triggerSequins', data);
        });

        socket.on('triggerBreath', function(data) {
            redisClient.get('audioControllerID', function(err, reply) {
                audioControllerID = reply;
                if (audioControllerID) {
                    io.to(audioControllerID).emit('/causeway/triggerBreath', { id: socket.id }, 1);
                }
            });
            socket.broadcast.emit('triggerBreath', data);
        });

        socket.on('triggerSonnet', function(data) {
            redisClient.get('audioControllerID', function(err, reply) {
                audioControllerID = reply;
                if (audioControllerID) {
                    io.to(audioControllerID).emit('/causeway/triggerSonnet', { id: socket.id }, 1);
                }
            });
            socket.broadcast.emit('triggerSonnet', data);
        });

        socket.on('section', function(data) {
            console.log("Section is now: " + data);
            currentSection = data;
            redisClient.set("currentSection", currentSection);
            sendSection(currentSection);
        })

        // *********************
        // Functions for handling stuff

        // **** SECTIONS ****
        var sectionTitles = ["Welcome", "Preface", "Section 1", "Section 2", "Section 3",
            "Section 4", "Section 5", "Section 6", "Section 7", "Section 8", "Section 9",
            "Section 10", "Section 11", "Section 12", "Section 13", "Section 14", "Section 15",
            "Section 16", "Section 17", "Section 18", "Section 19", "Section 20", "Section 21",
            "Section 22", "Section 23", "Section 24", "Section 25", "Section 26", "Section 27",
            "Section 28", "Section 29", "Section 30", "Section 31", "Section 32", "Section 33",
            "End"
        ];

        // Todo: Add sections to correspond to organ interactions
        // sendSection(currentSection);	 // Sets everyone's section
        sendSection = function(sect) {
            var title = getSection(sect);
            io.sockets.emit('setSection', { sect: sect, title: title });

            redisClient.get('audioControllerID', function(err, reply) {
                audioControllerID = reply;
                if (audioControllerID) {
                    io.to(audioControllerID).emit('/causeway/currentSection', { section: sect, title: title }, 1);
                    // console.log("Section sent", sect);
                }
            });
        };

        // Section shared from Max to UIs
        shareSection = function(sect) {
            var title = getSection(sect);
            io.sockets.emit('setSection', sect, title);
        };

        getSection = function(sect) {
            var title = "none";

            if (sect == 'w') {
                title = sectionTitles[0];
            }

            if (sect == 'e') {
                title = sectionTitles[35];
            }

            if (sect !== 'e' && sect !== 'w') {
                sect++;
                title = sectionTitles[sect];
            }

            return title;
        };

        // pick a random user from those still connected and return the user
        getRandomUser = function() {
            var randomUser = Math.floor(Math.random() * ioClients.length);
            var user = io.sockets.socket(ioClients[randomUser]);
            return user;
        };

        getNextUser = function() {
            // console.log("ioClients Length: ", ioClients.length);
            // console.log("io.sockets.socket length: ", io.sockets.socket.length);
            var user = io.sockets.socket(ioClients[ioClientCounter]);
            ioClientCounter = ioClientCounter + 1;
            if (ioClientCounter >= ioClients.length) {
                ioClientCounter = 0;
            }
            // console.log("Username ", user.username);

            return user;
        };

    });

    function getRandomColor() {
        var letters = '0123456789ABCDEF'.split('');
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }


}