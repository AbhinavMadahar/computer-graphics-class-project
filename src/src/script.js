import './style.css';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { DragControls } from 'three/examples/jsm/controls/DragControls.js';
import * as dat from 'dat.gui';
import { Interaction } from 'three.interaction';
import { ArrayCamera } from 'three';

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
    height: window.innerHeight * 0.8
};

/**
 * Camera
 */
// Base camera

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 10000);
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

for (let i = 0; i < 6; i++) {
   materialArray[i].side = THREE.BackSide;
}
let skyboxGeo = new THREE.BoxGeometry(10000, 10000, 10000);
let skybox = new THREE.Mesh( skyboxGeo, materialArray );
scene.add(skybox);  
animate();

//Set up the grass ground
const grassTex = new THREE.TextureLoader().load('https://cs428-project.s3.us-east-2.amazonaws.com/grass/grass_mesh.png'); 
grassTex.wrapS = THREE.RepeatWrapping; 
grassTex.wrapT = THREE.RepeatWrapping; 
grassTex.repeat.x = 256; 
grassTex.repeat.y = 256; 

const groundMat = new THREE.MeshBasicMaterial({ map: grassTex }); 

const groundGeo = new THREE.PlaneGeometry(400, 400); 

const ground = new THREE.Mesh(groundGeo,groundMat); 
ground.position.y = -3;
ground.rotation.x = -Math.PI/2;  
ground.doubleSided = true; 
scene.add(ground);

function animate() {
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

// Materials
const material = new THREE.MeshStandardMaterial();
material.normalMap = snakeTexture;
material.color = new THREE.Color(0x000000);

const red = document.getElementById('red');
const green = document.getElementById('green');
const blue = document.getElementById('blue');

const updateTorsoColor = (event) => {
    material.color.setRGB(red.value / 255, green.value / 255, blue.value / 255);
}

red.onchange = updateTorsoColor;
green.onchange = updateTorsoColor;
blue.onchange = updateTorsoColor;

updateTorsoColor();

const geometry = new THREE.CylinderGeometry(1, 1, 5, 64, 64, false);
const simpleTorso = new THREE.Mesh(geometry, material);
simpleTorso.on('click', addBodyPart);
scene.add(simpleTorso);
const torsos = {'simple': simpleTorso};
let torso = simpleTorso;

// Import new torso
mtl_loader.load('https://cs428-project.s3.us-east-2.amazonaws.com/torso/Project+Name.mtl', function (materials) {
    materials.preload();
    obj_loader.setMaterials(materials);
    obj_loader.load('https://cs428-project.s3.us-east-2.amazonaws.com/torso/Project+Name.obj', function (torso) {
        torso.scale.set(0.04,0.04,0.04);
        torso.position.set(-1,-1,0.5);
        torso.on('click', addBodyPart);
        torsos.horse = torsos;
    });
});

document.getElementById('torso').onchange = function (event) {
    const torsoType = this.value;
    scene.remove(torso);
    torso = torsos[torsoType].clone();
    simpleTorso.on('click', addBodyPart);
    scene.add(torso);
}

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

/**
 * Animate
 */

let mouseX = 0;
let mouseY = 0;

let targetX = 0;
let targetY = 0;

const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

let radius = 7;

const moveCamera = (event) => {
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
        document.addEventListener('mousemove', moveCamera);
    }
});

document.addEventListener('keyup', (event) => {
    if (event.key === 'c') {
        document.removeEventListener('mousemove', moveCamera);
    }
});

canvas.onwheel = (event) => {
    event.preventDefault();

    // if the radius is too small, then the user would look inside the animal, which would look buggy.
    // if the radius is too large, then the user would be unable to see the animal.
    // here, we bind the radius to only appear in an appropriate range.
    if (radius + event.deltaY * 0.01 > 10 || radius + event.deltaY * 0.01 < 3) {
        return;
    }

    camera.position.x *= (radius + event.deltaY * 0.01) / radius;
    camera.position.y *= (radius + event.deltaY * 0.01) / radius;
    camera.position.z *= (radius + event.deltaY * 0.01) / radius;

    radius += event.deltaY * 0.01;

    camera.lookAt(0, 0, 0);
};

// the remaining body parts need to be loaded
const bodypartDB = {
    'Eye 2': {
        materialURL: 'https://cs428-project.s3.us-east-2.amazonaws.com/eyes/%D0%B3%D0%BB%D0%B0%D0%B72_1+(2).mtl',
        objectURL: 'https://cs428-project.s3.us-east-2.amazonaws.com/eyes/%D0%B3%D0%BB%D0%B0%D0%B72_1+(2).obj',
        scale: [5, 5, 5]
    },
    'Eye 3': {
        materialURL: 'https://cs428-project.s3.us-east-2.amazonaws.com/eyes/%D0%B3%D0%BB%D0%B0%D0%B711.mtl',
        objectURL: 'https://cs428-project.s3.us-east-2.amazonaws.com/eyes/%D0%B3%D0%BB%D0%B0%D0%B711.obj',
        scale: [5, 5, 5]
    },
    'Eye 4': {
        materialURL: 'https://cs428-project.s3.us-east-2.amazonaws.com/eyes/%D0%B3%D0%BB%D0%B0%D0%B712.mtl',
        objectURL: 'https://cs428-project.s3.us-east-2.amazonaws.com/eyes/%D0%B3%D0%BB%D0%B0%D0%B712.obj',
        scale: [5, 5, 5]
    },
    'Eye 5': {
        materialURL: 'https://cs428-project.s3.us-east-2.amazonaws.com/eyes/%D0%B3%D0%BB%D0%B0%D0%B713.mtl',
        objectURL: 'https://cs428-project.s3.us-east-2.amazonaws.com/eyes/%D0%B3%D0%BB%D0%B0%D0%B713.obj',
        scale: [5, 5, 5]
    },
    'Eye 6': {
        materialURL: 'https://cs428-project.s3.us-east-2.amazonaws.com/eyes/%D0%B3%D0%BB%D0%B0%D0%B77.mtl',
        objectURL: 'https://cs428-project.s3.us-east-2.amazonaws.com/eyes/%D0%B3%D0%BB%D0%B0%D0%B77.obj',
        scale: [5, 5, 5]
    },
    'Nose 1': {
        materialURL: 'https://cs428-project.s3.us-east-2.amazonaws.com/noses/n3.mtl',
        objectURL: 'https://cs428-project.s3.us-east-2.amazonaws.com/noses/n3.obj',
        scale: [0.2, 0.2, 0.2]
    },
    'Nose 2': {
        materialURL: 'https://cs428-project.s3.us-east-2.amazonaws.com/noses/n4.mtl',
        objectURL: 'https://cs428-project.s3.us-east-2.amazonaws.com/noses/n4.obj',
        scale: [0.2, 0.2, 0.2]
    },
    'Nose 3': {
        materialURL: 'https://cs428-project.s3.us-east-2.amazonaws.com/noses/n5.mtl',
        objectURL: 'https://cs428-project.s3.us-east-2.amazonaws.com/noses/n5.obj',
        scale: [0.5, 0.5, 0.5]
    },
    'Nose 4': {
        materialURL: 'https://cs428-project.s3.us-east-2.amazonaws.com/noses/n6.mtl',
        objectURL: 'https://cs428-project.s3.us-east-2.amazonaws.com/noses/n6.obj',
        scale: [0.5, 0.5, 0.5]
    },
    'Nose 5': {
        materialURL: 'https://cs428-project.s3.us-east-2.amazonaws.com/noses/n7.mtl',
        objectURL: 'https://cs428-project.s3.us-east-2.amazonaws.com/noses/n7.obj',
        scale: [0.2, 0.2, 0.2]
    },
    'Ear 1': {
        materialURL: 'https://cs428-project.s3.us-east-2.amazonaws.com/ears/ear3.mtl',
        objectURL: 'https://cs428-project.s3.us-east-2.amazonaws.com/ears/ear3.obj',
        scale: [0.2, 0.2, 0.2]
    },
};

const loadBodyPart = async (type) => {
    if (!bodypartDB[type].cached) {
        const {materialURL, objectURL, scale} = bodypartDB[type];
        const materials = await mtl_loader.loadAsync(materialURL);
        materials.preload();
        obj_loader.setMaterials(materials);
        const bodypart = await obj_loader.loadAsync(objectURL);
        bodypartDB[type].cached = bodypart;
    }

    return bodypartDB[type].cached.clone();
}

const makeBodyPart = async (type, location) => {
    // the simple eye is drawn here with two spheres
    switch (type) {
        case 'Eye 1':
            // add the eyeball
            const eyeballRadius = 0.5;

            const eyeballGeometry = new THREE.SphereGeometry(eyeballRadius, 64, 64);
            const eyeballMaterial = new THREE.MeshStandardMaterial();
            eyeballMaterial.color = new THREE.Color(0xffffff);
            const eyeballMesh = new THREE.Mesh(eyeballGeometry, eyeballMaterial);
            eyeballMesh.position.set(location.x, location.y, location.z);
            eyeballMesh.on('click', addBodyPart);

            // add a pupil
            const pupilGeometry = new THREE.SphereGeometry(0.1, 64, 64);
            const pupilMaterial = new THREE.MeshStandardMaterial();
            pupilMaterial.color = new THREE.Color(0x000000);
            const pupilMesh = new THREE.Mesh(pupilGeometry, pupilMaterial);
            // when we make the pupil, we point it towards the current camera position.
            // to implement this, we take the vector difference between the center of the eyeball and the camera position.
            // after that, we scale that vector difference so it has magnitude equal to the radius of the eyeball, and then we place the pupil at the end.
            let difference = [camera.position.x - location.x, camera.position.y - location.y, camera.position.z - location.z];
            let distanceToCamera = Math.sqrt(difference[0] * difference[0] + difference[1] * difference[1] + difference[2] * difference[2]); 
            difference = [difference[0] / distanceToCamera,
                          difference[1] / distanceToCamera,
                          difference[2] / distanceToCamera];
            const pupilLocation = [location.x + difference[0] * eyeballRadius,
                                   location.y + difference[1] * eyeballRadius,
                                   location.z + difference[2] * eyeballRadius];
            pupilMesh.position.set(...pupilLocation);
            pupilMesh.on('click', addBodyPart);

            return [eyeballMesh, pupilMesh];
    }

    const {scale} = bodypartDB[type];
    const bodypart = await loadBodyPart(type);
    bodypart.scale.set(...scale);
    bodypart.position.set(location.x, location.y, location.z);
    return [bodypart];
};

const bodyparts = [];
function addBodyPart(event) {
    const location = event.intersects[0].point;  // location of the click

    // now we create a new bodypart.
    // the user can control what kind of bodypart to make by selecting one from the drop-down.
    // also, this addBodyPart method is added to the new bodypart so that the user can add bodyparts on other bodyparts

    const bodypartType = document.getElementById('bodypart-type').value;
    const newBodyPart = makeBodyPart(bodypartType, location).then(bodypart => {
        bodyparts.push(bodypart);

        for (let component of bodypart) {
            scene.add(component);
        }
    });
}

let previewBodypart;
document.addEventListener('mousemove', async function (event) {
    if (!document.getElementById('preview').checked) {
        return;
    }

    if (previewBodypart) {
        for (let component of previewBodypart) {
            scene.remove(component);
        }
    }

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    
    mouse.x = (event.layerX / canvas.width) * 2 - 1;
	mouse.y = - (event.layerY / canvas.height) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children);
    
    const bodypartType = document.getElementById('bodypart-type').value;
    previewBodypart = await makeBodyPart(bodypartType, intersects[0].point);
    for (let component of previewBodypart) {
        scene.add(component);
    }
});

// the undo button removes the last body part
document.getElementById('undo').onclick = (event) => {
    for (let component of bodyparts.pop()) {
        scene.remove(component);
    }
};