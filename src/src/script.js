import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'dat.gui';
import { Interaction } from 'three.interaction';

// Loading
const textureLoader = new THREE.TextureLoader();
const snakeTexture = textureLoader.load('/normal-maps/snake.png');

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
    height: window.innerHeight * 0.8
};

/**
 * Camera
 */
// Base camera

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 7;
scene.add(camera);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const interaction = new Interaction(renderer, scene, camera);

// Objects
const geometry = new THREE.CylinderGeometry(1, 1, 5, 64, 64, false);

// Materials

const material = new THREE.MeshStandardMaterial();
material.normalMap = snakeTexture;
material.color = new THREE.Color(0x00ff00);

// Mesh
const torso = new THREE.Mesh(geometry, material);
scene.add(torso);

// Lights

const numberOfLights = 10;
for (let i = 0; i < numberOfLights; i++) {
    const pointLight = new THREE.PointLight(0xffffff, 0.4);
    pointLight.position.x = 10 * (Math.random() - 0.5);
    pointLight.position.y = 10 * (Math.random() - 0.5);
    pointLight.position.z = 10 * (Math.random() - 0.5);
    scene.add(pointLight);
}


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
// const controls = new OrbitControls(camera, canvas)
// controls.enableDamping = true

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

    // now we create a new bodypart.
    // the user can control what kind of bodypart to make by selecting one from the drop-down.
    // also, this addBodyPart method is added to the new bodypart so that the user can add bodyparts on other bodyparts

    const bodypartType = document.getElementById('bodypart-type').value;
    switch (bodypartType) {
        case 'Eye':
            // add the eyeball
            const eyeballRadius = 0.5;

            const eyeballGeometry = new THREE.SphereGeometry(eyeballRadius, 64, 64);
            const eyeballMaterial = new THREE.MeshStandardMaterial();
            eyeballMaterial.color = new THREE.Color(0xffffff);
            const eyeballMesh = new THREE.Mesh(eyeballGeometry, eyeballMaterial);
            scene.add(eyeballMesh);
            eyeballMesh.position.set(location.x, location.y, location.z);
            eyeballMesh.on('click', addBodyPart);

            // add a pupil
            const pupilGeometry = new THREE.SphereGeometry(0.1, 64, 64);
            const pupilMaterial = new THREE.MeshStandardMaterial();
            pupilMaterial.color = new THREE.Color(0x000000);
            const pupilMesh = new THREE.Mesh(pupilGeometry, pupilMaterial);
            scene.add(pupilMesh);
            // when we make the pupil, we point it towards the current camera position.
            // to implement this, we take the vector difference between the center of the eyeball and the camera position.
            // after that, we scale that vector difference so it has magnitude equal to the radius of the eyeball, and then we place the pupil at the end.
            let difference = [camera.position.x - location.x, camera.position.y - location.y, camera.position.z - location.z];
            let differenceMagnitude = Math.sqrt(difference[0] * difference[0] + difference[1] * difference[1] + difference[2] * difference[2]);
            difference = [difference[0] / differenceMagnitude,
                          difference[1] / differenceMagnitude,
                          difference[2] / differenceMagnitude];
            const pupilLocation = [location.x + difference[0] * eyeballRadius,
                                   location.y + difference[1] * eyeballRadius,
                                   location.z + difference[2] * eyeballRadius];
            pupilMesh.position.set(...pupilLocation);
            pupilMesh.on('click', addBodyPart);
            break;
    }
}
torso.on('click', addBodyPart);

const clock = new THREE.Clock();

const tick = () => {
    // Update Orbital Controls
    // controls.update()

    // Render
    renderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
}

tick();