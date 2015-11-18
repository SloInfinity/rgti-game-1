AmbientMusic = function(){
	this.file = "./assets/sounds/ambience.mp3";
	var ref = this;

	window.AudioContext = (
		window.AudioContext ||
		window.webkitAudioContext ||
		null
	);

	if (!AudioContext) {
		throw new Error("AudioContext not supported!");
	} 

	var ctx = new AudioContext();
	this.mainVolume = ctx.createGain();
	this.mainVolume.connect(ctx.destination);

	this.sound = {};
	this.sound.source = ctx.createBufferSource();
	this.sound.volume = ctx.createGain();

	this.sound.source.connect(this.mainVolume);
	this.sound.volume.connect(this.mainVolume);

	this.sound.source.loop = true;

	var request = new XMLHttpRequest();
	request.open("GET", this.file, true);
	request.responseType = "arraybuffer";
	request.onload = function(e) {

		ctx.decodeAudioData(this.response, function onSuccess(buffer) {
		    ref.sound.buffer = buffer;

		    ref.sound.source.buffer = buffer;
		    ref.sound.source.start(ctx.currentTime);
		}, function onFailure() {
	    	alert("Decoding the audio buffer failed");
		});
	};
	request.send();
};

AmbientMusic.prototype = {
	// 0 = mute, 100, full sound
	setVolume: function(volume){
		this.mainVolume.gain.value = (volume/100);
	}
};