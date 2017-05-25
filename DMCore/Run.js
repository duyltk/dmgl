$ = function (id) {
    return document.getElementById(id);
};
var defineSPHERE = 0,
    defineCUBE = 1,
    definePLANE = 2,
    defineCONTROL = 3;
	
var gl = [],
    Test,
    Plane,
    Cube,
    Sphere,
    Space,
    Camera,
    Light;
	
//Path image to load texture
var imgPathTex = [];
//[0]: Sphere, [1]:Cube, [2]:Plane

var getControl;
//1=KEYBOARD, 2=LEAPMOTION
var control_leapmotion;
//1= LEFT, 2= UP, 3 = RIGHT, 4=DOWM

//Score of game
var score = 0;

var pMatrix = mat4.create();
var mvMatrix = mat4.create();
mat4.identity(mvMatrix);

var xCube = [];
var yCube = [];

var Cube = [];

function webGLStart() {
    //create Sence so that we can contain : Camera, Light, Object,...
    Test = new DMCore.Scene('mycanvas');
    Test.addProgramShader();

    Camera = new DMCore.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10000.0);
    Camera.translate(0.0, 0, 5);
    Test.add(Camera);

    Light = new DMCore.Light();
    Light.position(0, 0, 10);
    Light.color(0.2, 0.2, 0.2);
    Light.ambient(0.8, 0.8, 0.8);
    Test.add(Light);
    
    Plane = new DMCore.Plane();
    Plane.addTexture(imgPathTex[definePLANE]);
    Plane.scale(2.4, 1.2, 1.2);
    Test.add(Plane);

    Sphere = new DMCore.Sphere();
    Sphere.addTexture(imgPathTex[defineSPHERE]);
    Sphere.scale(0.043, 0.043, 0.043);
    Sphere.translate(0, 0, 2);
    Sphere.castShadow(true);
    Test.add(Sphere);

    Space = new DMCore.Sphere();
    Space.addTexture('image/bg/Space.jpg');
    Space.scale(4, 4, 5);
    Space.translate(0, 0, 0);
    Test.add(Space);

    //calculate coordinate of each cube so that we can draw these cubes.
    latitudeBands = 6;
    var i = 0;
    for (var latNumber = 0; latNumber < latitudeBands * 2; latNumber++) {
        var theta = latNumber * Math.PI / latitudeBands;
        xCube[i] = Math.sin(theta) * 1;
        yCube[i] = Math.cos(theta) * 1;
        Cube[i] = new DMCore.Cube();
        Cube[i].addTexture(imgPathTex[defineCUBE]);
        Cube[i].translate(xCube[i], yCube[i], 0.1);
        Cube[i].scale(0.06, 0.06, 0.06);
        Cube[i].castShadow(true);
        Test.add(Cube[i]);
        i++;
    }
    
    document.onkeydown = handleKeyDown;
    document.onkeyup = handleKeyUp;
    gl = Test.gl;
    loop();
}
//Handle Controler
var currentlyPressedKeys = {};

function handleKeyDown(event) {
    currentlyPressedKeys[event.keyCode] = true;
}

function handleKeyUp(event) {
    currentlyPressedKeys[event.keyCode] = false;
}

var x = 0,
    y = 0;

//Control of Leapmotion
function leapMotion() {
    if(control_leapmotion == 0) return;
    if (control_leapmotion == 1 ) {
        
		// left key
        if (Sphere.getPositionX() > -2) {
            Sphere.translate(-0.1, 0, 0);
    
        }
    }
    if (control_leapmotion == 2) {
        // up key
        if (Sphere.getPositionY() < 1) {
            Sphere.translate(0, 0.1, 0);

        }

    }
    if (control_leapmotion == 3) {
        // right key
        if (Sphere.getPositionX() < 2) {
            Sphere.translate(0.1, 0, 0);
        }
    }
    if (control_leapmotion == 4) {
        // down key
        if (Sphere.getPositionY() > -1) {
            Sphere.translate(0, -0.1, 0);

        }
    }
}
//Control of keyboard

function handleKeys() {
    if (currentlyPressedKeys[37] ) {
		// left key
        if (Sphere.getPositionX() > -2) {
            Sphere.translate(-0.2, 0, 0);
        }
    }
    if (currentlyPressedKeys[38]) {
        // up key
        if (Sphere.getPositionY() < 1) {
            Sphere.translate(0, 0.2, 0);
        }
    }
    if (currentlyPressedKeys[39]) {
        // right key
        if (Sphere.getPositionX() < 2) {
            Sphere.translate(0.2, 0, 0);
        }
    }
    if (currentlyPressedKeys[40]) {
        // down key
        if (Sphere.getPositionY() > -1) {
            Sphere.translate(0, -0.2, 0);
        }
    }
}

var i = 0;
function check() {
    x = Sphere.getPositionX();
    y = Sphere.getPositionY();
    for (var i = 0; i < Cube.length; i++) {
        Cube[i].rotate(degToRad(angle), 0, 0, 1);
        if (x >= xCube[i] - 0.14 && x <= xCube[i] + 0.14 && y >= yCube[i] - 0.14 && y <= yCube[i] + 0.14) {
            if (Test.geometry[Cube[i].indexInGeometry] != undefined) {
                delete Test.geometry[Cube[i].indexInGeometry];
                score += 10;
                $('score').innerHTML = 'Your score: ' + score;
                if(score == latitudeBands * 20){
                    $('win').style.display = 'block';
                    $('goHome').style.display = 'block';
                }
            }
        }
    }
}
///Calculate angle that is used to rotate object
var lastTime = 0;
var angle = 0;
function degToRad(x){
    return x * Math.PI / 180;
}
function animate() {
    var timeNow = new Date().getTime();
    if (lastTime != 0) {
      var elapsed = timeNow - lastTime;
      angle = (30 * elapsed) / 1000.0;
    }
    lastTime = timeNow;
}

function loop() {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    check();
    animate();
    Test.renderWebGL();
    if (getControl == 1)
        handleKeys();
    else {        

        leapMotion();
    }
    Camera.lookat(0, -6, 6, x, y, 0, 0, 1, 0);
    requestAnimationFrame(loop);
}