MinotaurusModel ={
	geometry: null,
	material: null,
	init: function(callback){
		var jsonLoader = new THREE.JSONLoader();
		jsonLoader.load( "./assets/models/minotaurus/minotaurus.js", function(geo, mat){
			MinotaurusModel.geometry = geo;
			MinotaurusModel.material = mat;
			callback();
		});
	}
};

Minotaurus = function () {
	this.model;
	this.name;
	this.speed = 0.2;
	this.hitPoints = 200;
	this.attack = 30;

	this.startPosition;		

	this.lastAttack = 0;

	this.sound = new LocationSound("./assets/sounds/minotaurus.mp3");

	var mesh = new THREE.Mesh( MinotaurusModel.geometry, new THREE.MeshFaceMaterial(MinotaurusModel.material));

	this.model = mesh;
	mesh.scale.x = 0.4;
	mesh.scale.y = 0.4;
	mesh.scale.z = 0.4;

	scene.add(mesh);

	//mesh.geometry.computeBoundingBox();
	//collidableMeshList.push(mesh.geometry.boundingBox);
};

Minotaurus.prototype = {
	update: function(delta){
		if(this.hitPoints <= 0)
			return;

		var cPos = camControls.object.position.clone();
		cPos.y = 0;
		var mPos = this.model.position;
		var d = Math.sqrt(Math.pow((cPos.x-mPos.x),2)+Math.pow((cPos.z-mPos.z),2));

		var actualMoveSpeed = delta * this.speed;

		if(d < 1){
			// attack
			if(new Date().getTime()-this.lastAttack > 1000){
				camControls.attackDamage(this.attack);
				this.lastAttack = new Date().getTime();
			}

			this.sound.setPosition(mPos);
			this.sound.setListenerPosition(cPos);
		} else if(d < 5){
			this.model.lookAt(cPos);

			this.model.translateZ(actualMoveSpeed);
			if(this.collision())
				this.model.translateZ(-actualMoveSpeed);

			this.sound.start();
			this.sound.setPosition(mPos);
			this.sound.setListenerPosition(cPos);
		} else {
			var d2 = Math.sqrt(Math.pow((this.startPosition.x-mPos.x),2)+Math.pow((this.startPosition.z-mPos.z),2));
			if(d2 > 0.3){
				this.model.lookAt(cPos);
				this.model.translateZ(actualMoveSpeed);
				if(this.collision())
					this.model.translateZ(-actualMoveSpeed);
				
				this.sound.start();
				this.sound.setPosition(mPos);
				this.sound.setListenerPosition(cPos);
			} else {
				this.sound.stop();
			}
		}
		
	},
	setStartPosition: function(position){
		this.startPosition = position.clone();
		this.model.position.set(position.x, position.y, position.z);
	},
	collision: function(){
		var rays = [
			new THREE.Vector3(0, 0, 1),
			new THREE.Vector3(1, 0, 1),
			new THREE.Vector3(1, 0, 0),
			new THREE.Vector3(1, 0, -1),
			new THREE.Vector3(0, 0, -1),
			new THREE.Vector3(-1, 0, -1),
			new THREE.Vector3(-1, 0, 0),
			new THREE.Vector3(-1, 0, 1)
		];
		var caster = new THREE.Raycaster();
		var collisions, i,	distance = 0.3;
		for (i = 0; i < rays.length; i += 1) {
			caster.set(this.model.position, rays[i]);
			collisions = caster.intersectObjects(collidableMeshList);
			if (collisions.length > 0 && collisions[0].distance <= distance) {
				return true;
			}
		}
		return false;
	},
	playerAttack : function (val) {
		this.hitPoints -= val;
		if(this.hitPoints <= 0)
		{
			this.sound.stop();
			scene.remove( this.model );

			win();
		}
	}
}	