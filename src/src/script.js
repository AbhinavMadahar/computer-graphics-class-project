import './style.css';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'dat.gui';
import { Interaction } from 'three.interaction';

// Loading
const textureLoader = new THREE.TextureLoader();
const snakeTexture = textureLoader.load('/normal-maps/snake.png');
const obj_loader = new OBJLoader();
const mtl_loader = new MTLLoader();

// Debug
const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

/**
 * Sizes
 */
 const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

/*
 * Camera
 */
// Base camera

// const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
// camera.position.x = 0;
// camera.position.y = 0;
// camera.position.z = 25;
// scene.add(camera);

let camera;
camera = new THREE.PerspectiveCamera(75,window.innerWidth/window.innerHeight,0.1,10000);
camera.position.set(0,0,25);
scene.add(camera);

/*
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({ canvas: canvas });
//renderer.setClearColor("#DDDDDD");
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const interaction = new Interaction(renderer, scene, camera);

// Set up the skybox
let materialArray = [];
let texture_ft = new THREE.TextureLoader().load( 'https://cs428-project.s3.us-east-2.amazonaws.com/skybox/yonder_ft.jpg');
let texture_bk = new THREE.TextureLoader().load( 'https://cs428-project.s3.us-east-2.amazonaws.com/skybox/yonder_bk.jpg');
let texture_up = new THREE.TextureLoader().load( 'https://cs428-project.s3.us-east-2.amazonaws.com/skybox/yonder_up.jpg');
let texture_dn = new THREE.TextureLoader().load( 'https://cs428-project.s3.us-east-2.amazonaws.com/skybox/yonder_dn.jpg');
let texture_rt = new THREE.TextureLoader().load( 'https://cs428-project.s3.us-east-2.amazonaws.com/skybox/yonder_rt.jpg');
let texture_lf = new THREE.TextureLoader().load( 'https://cs428-project.s3.us-east-2.amazonaws.com/skybox/yonder_lf.jpg');

materialArray.push(new THREE.MeshBasicMaterial( { map: texture_ft }));
materialArray.push(new THREE.MeshBasicMaterial( { map: texture_bk }));
materialArray.push(new THREE.MeshBasicMaterial( { map: texture_up }));
materialArray.push(new THREE.MeshBasicMaterial( { map: texture_dn }));
materialArray.push(new THREE.MeshBasicMaterial( { map: texture_rt }));
materialArray.push(new THREE.MeshBasicMaterial( { map: texture_lf }));

for (let i = 0; i < 6; i++)
   materialArray[i].side = THREE.BackSide;

let skyboxGeo = new THREE.BoxGeometry( 10000, 10000, 10000);
let skybox = new THREE.Mesh( skyboxGeo, materialArray );
scene.add( skybox );  
animate();

function animate() {
    renderer.render(scene,camera);
    requestAnimationFrame(animate);
}

// Objects
const geometry = new THREE.CylinderGeometry(1, 1, 5, 64, 64, false);

// Materials
const material = new THREE.MeshStandardMaterial();
material.normalMap = snakeTexture;
material.color = new THREE.Color(0x00ff00);

// Mesh
const torso = new THREE.Mesh(geometry, material);
scene.add(torso);

// var torso;
// // Create a material for the torso (a cylinder with a sphere on top)
// mtl_loader.load('https://cs428-project.s3.us-east-2.amazonaws.com/torso.mtl', function (materials) {
//     materials.preload();
// // Load the torso (a cylinder with a sphere on top)
//   obj_loader.setMaterials(materials);
//     obj_loader.load('https://cs428-project.s3.us-east-2.amazonaws.com/torso.obj', function (object) {
//         //scene.add(object);
//         torso = object;
//         //torso.scale.set(5,5,5);
//         //torso.position.set(0,0,0);
//         //scene.add(torso);
//     });
// });

var weird_arm; 
// Create a material for the weird arm
mtl_loader.load('https://cs428-project.s3.us-east-2.amazonaws.com/arm.mtl', function (materials) {
    materials.preload();
// Load the weird arm
  obj_loader.setMaterials(materials);
    obj_loader.load('https://cs428-project.s3.us-east-2.amazonaws.com/arm.obj', function (object) {
        //scene.add(object);
        weird_arm = object;
        weird_arm.scale.set(0.1,0.1,0.1);
        weird_arm.position.set(0,0,0);
        scene.add(weird_arm);
    });
});

// Lights
const pointLight = new THREE.PointLight(0xffffff, 1.0);
pointLight.position.x = 2;
pointLight.position.y = 3;
pointLight.position.z = 4;
scene.add(pointLight);

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

const size = 10;
const divisions = 10;

// Add grid
// const gridHelper = new THREE.GridHelper( 100, 100 );
// scene.add( gridHelper );

/**
 * Animate
 */

let mouseX = 0;
let mouseY = 0;

let targetX = 0;
let targetY = 0;

const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

const radius = 7;

const onDocumentMouseMove = (event) => {
    mouseX = (event.clientX - windowHalfX);
    mouseY = (event.clientY - windowHalfY);

    const x = mouseX / window.innerWidth;
    const y = mouseY / window.innerHeight;

    // project x and y onto a sphere with radius 7
    // from mathematics, position.x ^ 2 + position.y ^ 2 + position.z^2 == radius^2

    camera.position.x = radius * Math.cos(2 * x * Math.PI);  // x moves in and out
    camera.position.y = radius * Math.sin(y * Math.PI);  // y moves up and down
    camera.position.z = radius * Math.sin(2 * x * Math.PI); // z moves left and right

    camera.lookAt(0, 0, 0);
};

document.addEventListener('keydown', (event) => {
    if (event.key === 'c') {
        document.addEventListener('mousemove', onDocumentMouseMove);
    }
});

document.addEventListener('keyup', (event) => {
    if (event.key === 'c') {
        document.removeEventListener('mousemove', onDocumentMouseMove);
    }
});

const addBodyPart = (event) => {
    const location = event.intersects[0].point;  // location of the click

    // now we create a new bodypart, which we set as just a sphere for now.
    // later, the user will be able to control what kind of bodypart to make.
    // also, this addBodyPart method is added to the new bodypart so that the user can add bodyparts on other bodyparts

    const geometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 64, 64, false);
    const bodypart = new THREE.Mesh(geometry, material);
    
    scene.add(bodypart);
    bodypart.position.set(location.x, location.y, location.z);
    bodypart.on('click', addBodyPart);
}
torso.on('click', addBodyPart);

const clock = new THREE.Clock();

const tick = () => {
    // Update Orbital Controls
     controls.update()

    // Render
    renderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);  
}

tick();
