
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
