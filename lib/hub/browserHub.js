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
	
	this.user = new User();

    this.init();

}


Hub.prototype.log = function(l) {
    console.log('Hub Log: ' + l);
};

Hub.prototype.init = function() {
    console.log("Hub Helper Initialized!");
}



var User = function () {
	this.id = 'none';
	this.name = "";
	this.color;
	this.location = {
		x: 0,
		y: 0
	};
	this.note = "";
	this.pitch = 60;
}


module.exports = Hub;