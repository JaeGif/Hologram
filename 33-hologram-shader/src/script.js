import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import GUI from 'lil-gui';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import vertexShader from './shaders/vertex.glsl';
import fragmentShader from './shaders/fragment.glsl';
/**
 * Base
 */
// Debug
let gui;
if (window.location.hash === '#debug') gui = new GUI();

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

// Loaders
const gltfLoader = new GLTFLoader();

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight + 1,
};

window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight + 1;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  25,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.set(7, 7, 7);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const rendererParameters = {};
rendererParameters.clearColor = '#1d1f2a';

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.setClearColor(rendererParameters.clearColor);
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

if (gui)
  gui.addColor(rendererParameters, 'clearColor').onChange(() => {
    renderer.setClearColor(rendererParameters.clearColor);
  });

/**
 * Material
 */

const materialParameters = {};
materialParameters.color = '#70c1ff';
if (gui)
  gui.addColor(materialParameters, 'color').onChange((color) => {
    material.uniforms.uColor.value.set(materialParameters.color);
  });

const material = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  transparent: true,
  uniforms: {
    uTime: new THREE.Uniform(0.0),
    uColor: new THREE.Uniform(new THREE.Color(materialParameters.color)),
  },
  side: THREE.DoubleSide,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
});

/**
 * Objects
 */
// Torus knot
const torusKnot = new THREE.Mesh(
  new THREE.TorusKnotGeometry(0.6, 0.25, 128, 32),
  material
);
torusKnot.position.x = 3;
scene.add(torusKnot);

// Suzanne
let suzanne = null;
gltfLoader.load('./suzanne.glb', (gltf) => {
  suzanne = gltf.scene;
  suzanne.traverse((child) => {
    if (child.isMesh) child.material = material;
  });
  suzanne.position.x = -3;

  scene.add(suzanne);
});
const tridentGroup = new THREE.Group();
scene.add(tridentGroup);
let trident = null;
gltfLoader.load('./trident.glb', (gltf) => {
  trident = gltf.scene;
  trident.traverse((child) => {
    if (child.isMesh) child.material = material;
  });
  trident.scale.set(0.04, 0.04, 0.04);
  trident.position.x = 0;
  trident.position.z = 0;

  trident.position.y = -4;
  tridentGroup.add(trident);
});

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Rotate objects
  if (suzanne) {
    suzanne.rotation.x = -elapsedTime * 0.1;
    suzanne.rotation.y = elapsedTime * 0.2;
  }

  if (tridentGroup) {
    tridentGroup.rotation.x = -elapsedTime * 0.1;
    tridentGroup.rotation.y = elapsedTime * 0.2;
  }

  torusKnot.rotation.x = -elapsedTime * 0.1;
  torusKnot.rotation.y = elapsedTime * 0.2;

  // update time
  material.uniforms.uTime.value = elapsedTime;

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
