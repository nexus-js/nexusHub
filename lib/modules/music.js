// music.js
'use strict';

/** 
	@class music      
	Web audio music helper utilizing tone.js
	```js
	music.playMotive("C4","D4","E4", "G4","G4"); 
	```
	
*/

var Music = function() {

    this.key = 'cMajor';
    this.motive = {
        notes: ["C4", "D4", "E4", "G4", "G4"],
        durations: ['8n', '8n', '4n', '8n', '4n'],
        times: ['8n', '8n', '4n', '2n', '4n']
    };
    //		times: ['8n','8n','4n','8n','4n']
    this.init();

}

Music.prototype.playMotive = function(synth, delay) {
    var time = "+0";
    if (delay) {
        time = time + " + " + delay;
    }
    for (var i = 0; i < this.motive.notes.length; i++) {
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


module.exports = Music;