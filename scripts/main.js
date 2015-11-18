var container, scene, camera, renderer, stats, camControls, canvas, ambientMusic, ambientLight, audioContext;
var keyboard = new THREEx.KeyboardState();
var clock = new THREE.Clock();

var stopAnimation = false;

var light,pointLightHelper;
var minotaurus, torch;
var skeletons = [];
var slimes = [];

var lastTime = 0;
var collidableMeshList = [];

var count = 0;

var lockChangeAlert = function() {
    if(document.pointerLockElement === canvas ||
	    document.mozPointerLockElement === canvas ||
	    document.webkitPointerLockElement === canvas) {
      	camControls.freeze = false;
    } else {
      	camControls.freeze = true;
    }
}

var init = function() {
	initAudio();

	// SCENE
	scene = new THREE.Scene();

	// CAMERA
	var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
	var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 5000;
	camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
	scene.add(camera);
	for(var z = 0; z < World.maze.length; z++){
		var found = false;
		for(var x = 0; x < World.maze[z].length; x++){	
			if(World.maze[z][x] == 9){
				camera.position.set(x-World.offsetX,1.5,z-World.offsetZ);
				found=true;
				break;
			}
		}
		if(found) break;
	}
	camera.lookAt(scene.position);	

	// RENDERER
	if ( Detector.webgl )
		renderer = new THREE.WebGLRenderer( {antialias:true} );
	else
		renderer = new THREE.CanvasRenderer(); 

	renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
	container = $('#ThreeJS')[0];
	container.appendChild( renderer.domElement );

	// MOUSE TAKE-OVER
	canvas = renderer.domElement;
	canvas.requestPointerLock = canvas.requestPointerLock ||
           canvas.mozRequestPointerLock ||
           canvas.webkitRequestPointerLock;

   document.exitPointerLock = document.exitPointerLock ||
		   document.mozExitPointerLock ||
		   document.webkitExitPointerLock;

    $(canvas).click(function(event) {
        canvas.requestPointerLock();
    });
	document.addEventListener('pointerlockchange', lockChangeAlert, false);
    document.addEventListener('mozpointerlockchange', lockChangeAlert, false);
    document.addEventListener('webkitpointerlockchange', lockChangeAlert, false);

	// EVENTS
	THREEx.WindowResize(renderer, camera);
	THREEx.FullScreen.bindKey({ charCode : 'm'.charCodeAt(0) });

	// STATS
	stats = new Stats();
	stats.setMode(0)
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.bottom = '0px';
	stats.domElement.style.zIndex = 100;
	container.appendChild( stats.domElement );

	// CONTROLS
    camControls = new THREE.FirstPersonControls(camera, container);
    camControls.lookSpeed = .5;
    camControls.movementSpeed = 0.5;
    camControls.noFly = true;
    camControls.lookVertical = true;
    camControls.constrainVertical = true;
    camControls.heightSpeed = false;
    camControls.verticalMin = 1.0;
    camControls.verticalMax = 3.0;
    camControls.freeze = true;
    camControls.lon = -150;
    camControls.lat = 120;

	// light
    ambientLight = new THREE.AmbientLight(0x222222);
    scene.add(ambientLight);

	// MAP
	World.addToScene();	

	// SKYBOX
	Skybox.addToScene();	

	// MUSIC
	ambientMusic = new AmbientMusic(); // dela, mal je nadlezno :D
	ambientMusic.setVolume(65);

	// CREATURES 
	initModels();

	initGui();
};

var initModels = function(){
	MinotaurusModel.init(function(){		
		SkeletonModel.init(function(){
			SlimeModel.init(function(){
				for(var z = 0; z < World.maze.length; z++){
					for(var x = 0; x < World.maze[z].length; x++){	
						if(World.maze[z][x] == 6){
							var s = new Slime();
							s.name = "Slime" + count;
							count++;
							var pos = s.model.position;
							pos.x = x-World.offsetX;
							pos.z = z-World.offsetZ;
							s.setStartPosition(pos);

							slimes.push(s);

						} else if(World.maze[z][x] == 7){
							var s = new Skeleton();
							s.name = "Skeleton" + count;
							count++;
							var pos = s.model.position;
							pos.x = x-World.offsetX;
							pos.z = z-World.offsetZ;
							s.setStartPosition(pos);

							skeletons.push(s);
							
						} else if(World.maze[z][x] == 8){
							minotaurus = new Minotaurus();
							s.name = "Minotaurus" + count;
							count++;

							var pos = minotaurus.model.position;
							pos.x = x-World.offsetX;
							pos.z = z-World.offsetZ;
							minotaurus.setStartPosition(pos);
						}
					}
				}
			});
		});
	});

	TorchModel.init(function(){
		torch = new Torch();
	});

	light = new THREE.PointLight( 0xe85b17,1.8, 10, 0.1 );
	scene.add( light );

	pointLightHelper = new THREE.PointLightHelper( light, 0.1 );
	scene.add( pointLightHelper );
}

var initAudio = function(){
	window.AudioContext = window.AudioContext = (
		window.AudioContext ||
		window.webkitAudioContext ||
		null
	);

	if (!AudioContext) {
		throw new Error("AudioContext not supported!");
	} 

	audioContext = new AudioContext();
}

var initGui = function(){
	$("#life").html("Helth "+camControls.hitPoints);
}

var animate = function() 
{
	if(stopAnimation) {
		stopAnimation = false;
		return;
	}

    requestAnimationFrame( animate );
	render();		
	update();
}

var update = function()
{
	if(camControls.freeze){
		camControls.sound.stop();

		if(minotaurus)minotaurus.sound.stop();
		
		for(var i = 0; i < skeletons.length; i++){
			skeletons[i].sound.stop();
		}

		for(var i = 0; i < slimes.length; i++){
			slimes[i].sound.stop();
		}
		return;
	} 

	var timeNow = new Date().getTime();
	var elapsed = 0;
  	if (lastTime != 0) {
    	elapsed = timeNow - lastTime;
    }
	var delta = elapsed/60;

	camControls.update(delta);
	stats.update();

	if(minotaurus)
		minotaurus.update(delta);

	for(var i = 0; i < skeletons.length; i++){
		skeletons[i].update(delta);
	}

	for(var i = 0; i < slimes.length; i++){
		slimes[i].update(delta);
	}

	if(torch)
		torch.update(delta);

	if(pointLightHelper)
		pointLightHelper.update(delta);

	lastTime = timeNow;
}

var render = function() 
{
	renderer.render(scene, camera);
}

var gameOver = function(){
	document.exitPointerLock();
	stopAnimation = true;
	camControls.sound.stop();

	if(minotaurus)minotaurus.sound.stop();
	
	for(var i = 0; i < skeletons.length; i++){
		skeletons[i].sound.stop();
	}

	for(var i = 0; i < slimes.length; i++){
		slimes[i].sound.stop();
	}

	$("#game_over").css("display","inline");
}

var win = function(){
	document.exitPointerLock();
	stopAnimation = true;
	camControls.sound.stop();

	if(minotaurus)minotaurus.sound.stop();

	for(var i = 0; i < skeletons.length; i++){
		skeletons[i].sound.stop();
	}

	for(var i = 0; i < slimes.length; i++){
		slimes[i].sound.stop();
	}

	$("#win").css("display","inline");
}

$(document).ready(function(){
	init();
	animate();
});
