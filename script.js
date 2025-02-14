import * as THREE from 'three';
import { GLTFLoader } from  'GLTFLoader';
import { OrbitControls } from 'OrbitControls';
import { DRACOLoader } from 'DRACOLoader';
import { RGBELoader } from 'RGBELoader';
import { STLExporter } from 'STLExporter';

let scene, camera, renderer, chair, controls;

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 2, 5);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 10, 7);
    scene.add(light);

    new RGBELoader().load('https://threejs.org/examples/textures/equirectangular/royal_esplanade_1k.hdr', function(texture) {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        scene.environment = texture;
    });

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const loader = new GLTFLoader();
    loader.load('sofa_chair/scene.gltf', (gltf) => {
        chair = gltf.scene;
        scene.add(chair);
    });

    window.addEventListener('resize', onWindowResize);
    animate();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function changeColor(color) {
    if (!chair) return;
    chair.traverse((child) => {
        if (child.isMesh) {
            child.material.map = null; // Remove any applied texture
            child.material.color.set(color);
            child.material.needsUpdate = true;
        }
    });
}


function applyTexture() {
    if (!chair) return;
    const textureLoader = new THREE.TextureLoader();
    const woodTexture = textureLoader.load('https://threejs.org/examples/textures/wood/WoodFlooringDiffuse.jpg');
    
    chair.traverse((child) => {
        if (child.isMesh) {
            child.material.map = woodTexture;
            child.material.needsUpdate = true;
        }
    });
}

function exportModel() {
    if (!chair) return;
    const exporter = new STLExporter();
    const result = exporter.parse(chair);
    const blob = new Blob([result], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'chair_model.stl';
    link.click();
}

// Make functions available globally
window.changeColor = changeColor;
window.applyTexture = applyTexture;
window.exportModel = exportModel;

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

init();
