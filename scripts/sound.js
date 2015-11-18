Sound = function(file, playOnce){
	this.file = file;
	var ref = this;

	this.loop = !(playOnce || false);


	this.mainVolume = audioContext.createGain();
	this.mainVolume.connect(audioContext.destination);

	this.sound = {};
	this.sound.source = audioContext.createBufferSource();
	this.sound.volume = audioContext.createGain();

	this.sound.source.connect(this.mainVolume);
	this.sound.volume.connect(this.mainVolume);

	this.sound.source.loop = this.loop;

	var request = new XMLHttpRequest();
	request.open("GET", this.file, true);
	request.responseType = "arraybuffer";
	request.onload = function(e) {
		audioContext.decodeAudioData(this.response, function onSuccess(buffer) {
		    ref.sound.buffer = buffer;

		    ref.sound.source.buffer = buffer;
		    if(ref.loop) {
			    ref.sound.source.start(audioContext.currentTime);
			    ref.stop();
			} 
		}, function onFailure() {
	    	alert("Decoding the audio buffer failed");
		});
	};
	request.send();
}

Sound.prototype = {
	start: function(){
		this.mainVolume.gain.value = 1
		if(!this.loop) {
			this.sound.source = audioContext.createBufferSource();
			this.sound.source.connect(this.mainVolume);
			this.sound.source.loop = this.loop;
			this.sound.source.buffer = this.sound.buffer;
			this.sound.source.start()
		}
	},
	stop: function(){
		this.mainVolume.gain.value = 0;
	},
	setPosition: function(pos){

	},
	setListenerPosition: function(pos){

	}
};