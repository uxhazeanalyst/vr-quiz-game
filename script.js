import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { XRButton } from 'three/examples/jsm/webxr/XRButton.js';

// Scene, Camera, and Renderer
const canvas = document.getElementById('globe');
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 2);

// Light
const light = new THREE.AmbientLight(0xffffff, 1);
scene.add(light);

// Globe
const globeGeometry = new THREE.SphereGeometry(1, 64, 64);
const globeMaterial = new THREE.MeshStandardMaterial({
    map: new THREE.TextureLoader().load('assets/earth.jpg'), // Earth texture
});
const globe = new THREE.Mesh(globeGeometry, globeMaterial);
scene.add(globe);

// Controls for desktop
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Add VR Button
document.body.appendChild(XRButton.createButton(renderer));

// Quiz Regions
const regions = [
    { name: "London", coordinates: [51.505, -0.09], dialect: "British English" },
    { name: "Paris", coordinates: [48.8566, 2.3522], dialect: "French" },
    { name: "New York", coordinates: [40.7128, -74.0060], dialect: "American English" },
    { name: "Tokyo", coordinates: [35.6895, 139.6917], dialect: "Japanese" },
];

let currentRegion;

// Convert geographic coordinates to 3D globe position
function latLonToVector3(lat, lon, radius = 1) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);

    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);

    return new THREE.Vector3(x, y, z);
}

// Place markers on the globe
function placeMarker(lat, lon) {
    const markerGeometry = new THREE.SphereGeometry(0.02, 16, 16);
    const markerMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const marker = new THREE.Mesh(markerGeometry, markerMaterial);

    const position = latLonToVector3(lat, lon, 1.02);
    marker.position.copy(position);
    scene.add(marker);
    return marker;
}

// Show a random region
function showRandomRegion() {
    currentRegion = regions[Math.floor(Math.random() * regions.length)];
    const { coordinates } = currentRegion;

    // Center the view on the region
    const target = latLonToVector3(coordinates[0], coordinates[1], 1.02);
    controls.target.copy(target);

    // Place a marker on the region
    placeMarker(coordinates[0], coordinates[1]);

    document.getElementById('question').textContent = `What dialect is spoken in the region displayed?`;
}

showRandomRegion();

// Handle quiz submissions
document.getElementById('submit').addEventListener('click', () => {
    const userAnswer = document.getElementById('answer').value.trim().toLowerCase();
    const correctAnswer = currentRegion.dialect.toLowerCase();

    if (userAnswer === correctAnswer) {
        document.getElementById('result').textContent = "Correct!";
        showRandomRegion();
    } else {
        document.getElementById('result').textContent = `Wrong! The correct answer is ${currentRegion.dialect}.`;
    }

    document.getElementById('answer').value = '';
});

// Animation loop
function animate() {
    controls.update();
    renderer.setAnimationLoop(() => {
        renderer.render(scene, camera);
    });
}
animate();
