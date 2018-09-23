
# Roadmap 
Potential roadmap for the development of Nexus

## Docs

[ ] document main commands for hub.js, browserHub.js, and maxHub.js
[ ] document typical usage/approaches


## hub.js

[ ] Rooms for group and user collections
[ ] file asset upload and sharing
[ ] auto populate folders of sounds
[ ] recording from device or application to shared asset folder
[ ] Channels not explicitly (over)written automatically send based on the toWhom array
[ ] create catch-all socket.on function that simply mirrors out any information received on the specified transmit channels.
[ ] instantiate SocketIO in Hub.prototype.init instead of node file. 
[ ] type the hub.channel commands so that each element in the input list has a label. e.g. message, nickname, toWhom, data
[ ] hub.transmit to 'others' is sending to everyone.  cant use the typical socket.broadcast must use io.something..
[ ] iterate through registration user data and add these properties to the socket dynamically.

## browserHub.js
[ ] *** move default overlay into browserHub.js handling first click initiation of audio, present first instructions and select relative location if wanted.
[ ] remove default 'others' sendtype. This should be handled by the server if nothing is specified.

## maxHub.js

[ ] tidy up the basic Max 7 interface utilities
-- json to and from max lists
-- Automatic destination (toWhom)
-- specifyable destination (toWhom)
[ ] Move on to greater things...

## nexusNode

## nexusCluster

## 

## Ideal API

_Full Declaration_

	hub.channel('sharedSlider', 'sharedSlider', ['others'}, function(data) {
	    // hub.transmit('sharedSlider', null, data);
	    socket.broadcast.emit('sharedSlider', data); // just for others until a fix is made.
	});

_Simplified Declaration_
Allows for quick declaration of a channel on the server with typical usage defaults.

	hub.channel('sharedSlider')

Utilizes the defaults of
nickname: oscName
toWhom: ['null'] e.g. ['others'] unless defined by the sender in the client
callback: {hub.transmit('oscName', null, data);}

_Automatic Channel Definition_

if no channel is created on the server and an unrecognized transmission is received, it is simply passed on to the destinations array or ['others'] if none exists.

If no channel is created on the browser client but a send or transmit is used, it automatically sends the message, but it won't receive on that channel.


## Destinations

destinations can be defined for any channel, send/transmit, 

	data.destinations = ['others', 'self', 'all', 'display', 'audio', 'controller', 'max', 'user defined', 'name-user.name', 'group-group.name']
	default = ['others']

	hub.transmit(channelNickname, destinations, data);
	hub.send(channelNickname, data);

a hub.send implies no change of destination - e.g. whatever was declared upstream such as in the hub.channel definition will be used.  If no destination is specified anywhere, the default destination of ['others'] is used.

Precedence is by where the destinations are declared from lowest precedence to highest precedence. e.g. starting from the default, any declaration further down the chain will take precedence. 

data.destinationPrecedence = default ['others'] = 0, Server channel = 4, browser client channel = 3, server transmit = 2, browser client transmit = 1

## Data

Any data to send is done as a json object. If the data to be sent is a string, number, or array, it will be turned into a json object with the key of 'value' 

	hub.send('playNote', 64);
	hub.send('playNote', '64');
	hub.send('playNote', {'value'=64});

result in the same thing.

This means that retrieval on the other side is done with:

function(data) {
	let val = data.value
}

This may seem like an arbitrary constraint at first, but it standardises receiving code so that you don't access some data directly as data and some data via dot notation such as data.color or data.pitch.  


