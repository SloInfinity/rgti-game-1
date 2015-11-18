SkeletonModel = {
	geometry: null,
	material: null,
	init: function(callback){
		var jsonLoader = new THREE.JSONLoader();
		jsonLoader.load( "./assets/models/skeleton/skeleton.js", function(geo, mat){
			SkeletonModel.geometry = geo;
			SkeletonModel.material = mat;
			callback();
		});
	}
};

Skeleton = function () {
	this.model;
	this.name;
	this.speed = 0.2;
	this.hitPoints = 50;
	this.attack = 10;

	this.startPosition;	

	this.lastAttack = 0;

	this.sound = new LocationSound("./assets/sounds/skeleton.mp3");
	
	var mesh = new THREE.Mesh( SkeletonModel.geometry, new THREE.MeshLambertMaterial({ color: 0xccaaaa }));

	this.model = mesh;
	mesh.scale.x = 0.3;
	mesh.scale.y = 0.3;
	mesh.scale.z = 0.3;

	scene.add(mesh);
};

Skeleton.prototype = {
	update: function(delta){
		if(this.hitPoints <= 0)
			return;

		var cPos = camControls.object.position.clone();
		cPos.y = 0;
		var mPos = this.model.position;
		var d = Math.sqrt(Math.pow((cPos.x-mPos.x),2)+Math.pow((cPos.z-mPos.z),2));

		var actualMoveSpeed = delta * this.speed;	

		if(d < 2){
			// attack
			if(new Date().getTime()-this.lastAttack > 1000){
				camControls.attackDamage(this.attack);
				this.lastAttack = new Date().getTime();
			}

			this.sound.setPosition(mPos);
			this.sound.setListenerPosition(cPos);
		} else if(d < 7){
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
			return;
		}
	}
};