require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"music":[function(require,module,exports){
// music.js

/** 
	@class music      
	Web audio music helper utilizing tone.js
	```js
	music.playMotive("C4","D4","E4", "G4","G4"); 
	```
	
*/
				
var Music = function() {
	
	this.motive = {
		notes: ["C4","D4","E4","G4","G4"],
		durations: ['8n','8n','4n','8n','4n'],
		times: ['8n','8n','4n','8n','4n']
	};
	//		times: ['8n','8n','4n','8n','4n']
	this.init();
	
}

Music.prototype.playMotive = function(synth, delay) {
	var time = "+0";
	if (delay) {
		time = time + " + " + delay;
	}
	for(var i=0; i<this.motive.notes.length; i++) {
		console.log(i);
		console.log(time);
		synth.triggerAttackRelease(this.motive.notes[i], this.motive.durations[i], time);
		time = time + " + " + this.motive.times[i];
	}
}

Music.prototype.log = function() {
  console.log('muzak!');
};

Music.prototype.init = function() {
	console.log("Init!");
}


module.exports = new Music();


},{}]},{},[]);
