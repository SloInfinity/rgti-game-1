LocationSound = function(file){
	this.file = file;
	var ref = this;

	this.mainVolume = audioContext.createGain();
	this.mainVolume.connect(audioContext.destination);

	this.sound = {};
	this.sound.source = audioContext.createBufferSource();
	this.sound.volume = audioContext.createGain();
	this.sound.panner = audioContext.createPanner();

	this.sound.source.connect(this.sound.panner);
	this.sound.panner.connect(this.mainVolume);
	this.sound.volume.connect(this.mainVolume);

	this.sound.source.loop = true;

	var request = new XMLHttpRequest();
	request.open("GET", this.file, true);
	request.responseType = "arraybuffer";
	request.onload = function(e) {
		audioContext.decodeAudioData(this.response, function onSuccess(buffer) {
		    ref.sound.buffer = buffer;

		    ref.sound.source.buffer = buffer;
		    ref.sound.source.start(audioContext.currentTime);
		    ref.stop();
		}, function onFailure() {
	    	alert("Decoding the audio buffer failed");
		});
	};
	request.send();
}

LocationSound.prototype = {
	start: function(){
		this.mainVolume.gain.value = 0.3;
	},
	stop: function(){
		this.mainVolume.gain.value = 0;
	},
	setPosition: function(p){
		this.sound.panner.setPosition(p.x, p.y, p.z);
	},
	setListenerPosition: function(p){
		audioContext.listener.setPosition(p.x, p.y, p.z);
	},
};