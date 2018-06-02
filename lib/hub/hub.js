// hub.js

'use strict';

/** 
	@class hub      
	nexusHub core functions - used within node code
	```js
	hub.receive() 
	```
	
*/

var Hub = function() {

    this.serverPort = 3000;

    //theaterID
    this.display = {
        id: ""
    };
    // conrollerID,
    this.control = {
        id: ""
    };
    //audioControllerID
    this.audioControl = {
        id: ""
    };

    this.init();

}


Hub.prototype.log = function(l) {
    console.log('Hub Log: ' + l);
};

Hub.prototype.init = function() {
    console.log("Hub Helper Initialized!");
}


module.exports = Hub;