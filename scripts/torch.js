TorchModel = {
	object: null,
	init: function(callback){
		var loader = new THREE.OBJMTLLoader();
		loader.load( 
			"./assets/models/torch/FireTorchOBJ.OBJ",
			"./assets/models/torch/FireTorchOBJ.mtl",
			function(object){
				TorchModel.object = object;

				callback();
			});
	}
};

Torch = function(){
	this.model = TorchModel.object.clone();
	this.rotated = false;
	this.model.scale.x = 0.005;
	this.model.scale.y = 0.005;
	this.model.scale.z = 0.005

	// for some reason se prenese referenca
	// to itak na nek način čmo

	this.model.position.x = camera.position.x; 
	this.model.position.y = camera.position.y; 
	this.model.position.z = camera.position.z; 
		
	this.model.position.x -= 0.3;
	this.model.position.y -= 0.3;

	//this.model.rotation.x -= Math.PI/8;
	//this.model.rotation.z += Math.PI/8;
	
	scene.add(this.model);
};

Torch.prototype = {
	update: function(delta){
		var pos = camControls.lookAtPosition;
		var position = camControls.object.position;

		var x = position.x + (pos.x - position.x)* 0.0015;
		var y = position.y -0.25;
		var z = position.z + (pos.z - position.z)*0.0015;
		this.model.position.set(x,y,z);

		light.position.set(x-0.01,y+0.5,z-0.01);

		if(camControls.mouseLeft && !this.rotated)
		{
			camControls.attackSound.start();
			var pos = camControls.lookAtPosition;
			pos.y = -250;
			this.model.lookAt(pos);
			this.rotated = true;

			slimes.forEach(function(slime){
				var cPos = camControls.object.position.clone();
				cPos.y = 0;
				var mPos = slime.model.position;
				var d = Math.sqrt(Math.pow((cPos.x-mPos.x),2)+Math.pow((cPos.z-mPos.z),2));

				if(d < 2) {
					slime.playerAttack(camControls.attack);
				}
			})

			skeletons.forEach(function(skeleton){
				var cPos = camControls.object.position.clone();
				cPos.y = 0;
				var mPos = skeleton.model.position;
				var d = Math.sqrt(Math.pow((cPos.x-mPos.x),2)+Math.pow((cPos.z-mPos.z),2));

				if(d < 2) {
					skeleton.playerAttack(camControls.attack);
				}
			})

			var cPos = camControls.object.position.clone();
			cPos.y = 0;
			var mPos = minotaurus.model.position;
			var d = Math.sqrt(Math.pow((cPos.x-mPos.x),2)+Math.pow((cPos.z-mPos.z),2));

			if(d < 2) {
				minotaurus.playerAttack(camControls.attack);
			}
		}
		else if(!camControls.mouseLeft && this.rotated)
		{
			var pos = camControls.lookAtPosition;
			pos.y = 0;
			this.model.lookAt(pos);
			this.rotated = false;
		}
	}
}