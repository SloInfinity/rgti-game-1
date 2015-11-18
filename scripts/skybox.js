Skybox = {
	materialArray: [],
	skyGeometry: null
};

Skybox.addToScene = function () {
	this.skyGeometry = new THREE.CubeGeometry( 5000, 5000, 5000 );

	var imagePrefix = "./assets/necros_hell_";
	var directions  = ["xpos", "xneg", "ypos", "yneg", "zpos", "zneg"];
	var imageSuffix = ".JPG";

	for (var i = 0; i < 6; i++){
		var loader = new THREE.TextureLoader();
		loader.load(
			imagePrefix + directions[i] + imageSuffix ,
			function (texture) {
				Skybox.materialArray.push( 
					new THREE.MeshBasicMaterial({
						map: texture,
						side: THREE.BackSide
					})
				);

				if(Skybox.materialArray.length == 6){
					var skyMaterial = new THREE.MeshFaceMaterial( Skybox.materialArray );
					var skyBox = new THREE.Mesh( Skybox.skyGeometry, skyMaterial );
					scene.add( skyBox );
				}
			}
		);
	}
};