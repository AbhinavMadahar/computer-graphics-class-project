import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'dat.gui';

// Loading
const textureLoader = new THREE.TextureLoader();
const snakeTexture = textureLoader.load('/normal-maps/snake.png');

// Debug
const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

// Objects
const geometry = new THREE.CylinderGeometry(1, 1, 5, 64, 64, false);

// Materials

const material = new THREE.MeshStandardMaterial();
material.normalMap = snakeTexture;
material.color = new THREE.Color(0x00ff00);

// Mesh
const sphere = new THREE.Mesh(geometry, material);
scene.add(sphere);

// Lights

const pointLight = new THREE.PointLight(0xffffff, 1.0);
pointLight.position.x = 2;
pointLight.position.y = 3;
pointLight.position.z = 4;
scene.add(pointLight);

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
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

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 7;
scene.add(camera);

// Controls
// const controls = new OrbitControls(camera, canvas)
// controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

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
    camera.position.x = radius * Math.sin(-1 * x * Math.PI);
    camera.position.y = radius * Math.sin(y * Math.PI);
    camera.position.z = radius * Math.cos(y * Math.PI);

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

const clock = new THREE.Clock();

const tick = () => {
    const elapsedTime = clock.getElapsedTime();

    // Update objects
    sphere.rotation.y = .5 * elapsedTime;

    // Update Orbital Controls
    // controls.update()

    // Render
    renderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
}

tick();