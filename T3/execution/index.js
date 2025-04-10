import * as THREE from "three";
import { World } from "./Terrain/world.js";
import Stats from "../../build/jsm/libs/stats.module.js";
import { Player } from "./Player/player.js";
import { InspectionCamera } from "./Cameras/inspectionCamera.js";
import { Physics } from "./Physics/physics.js";
import { setupUI } from "./Ui/ui.js";
import ResourceManager from "./ResourceManager/resourceManager.js";


const stats = new Stats();
document.body.appendChild(stats.dom);

// RENDERER
const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x80a0c0);
document.body.appendChild(renderer.domElement);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// SCENE
const scene = new THREE.Scene();

// FOG
scene.fog = new THREE.Fog(0x80a0e0, 50, 185);

// PLAYER 
const player = new Player(scene);

// CAMERAS
const inspectionCamera = new InspectionCamera(scene);
inspectionCamera.update(renderer);

const thirdPersonCamera = player.camera;

let currentCamera = inspectionCamera.camera;
let isInspectionMode = true;

function toggleCamera() {
  if (isInspectionMode) {
    currentCamera = thirdPersonCamera;
    player.controls.lock();
    isInspectionMode = false;
    console.log('Modo: Terceira Pessoa');
  } else {
    currentCamera = inspectionCamera.camera;
    isInspectionMode = true;
    console.log('Modo: Inspeção');
  }
}

window.addEventListener('keydown', (event) => {
  if (event.key.toLowerCase() === 'c') {
    toggleCamera();
  }
});

// WORLD
const resources = new ResourceManager();
await resources.loadTreeModels();
const world = new World(resources);
world.generate();
scene.add(world);

// PHYSICS
const physics = new Physics(scene);

// LIGHTS
let shadowHelper;
let light1;
function setUpLights() {
  light1 = new THREE.DirectionalLight();
  light1.position.set(0, 30, 70);

  // Parâmetros da sombra
  light1.castShadow = true;
  light1.shadow.mapSize.width = 256;
  light1.shadow.mapSize.height = 256;
  light1.shadow.camera.near = 0.1;
  light1.shadow.camera.far = 200;
  light1.shadow.camera.left = -40;
  light1.shadow.camera.right = 40;
  light1.shadow.camera.bottom = -40;
  light1.shadow.camera.top = 40;
  light1.shadow.bias = -0.0001;
  light1.shadow.radius = 1;
  scene.add(light1);

  // Helper de sombra para a luz direcional
  shadowHelper = new THREE.CameraHelper(light1.shadow.camera);
  shadowHelper.visible = false;
  scene.add(shadowHelper);

  const light2 = new THREE.AmbientLight();
  light2.intensity = 0.1;
  scene.add(light2);
}

// HABILITAR / DESABILITAR HELPER DE SOMBRA NA CENA
window.addEventListener("keydown", (event) => {
  if (event.key.toLowerCase() === "h") {
    event.preventDefault();
    shadowHelper.visible = !shadowHelper.visible;
    gui.domElement.style.display = "block";
  }
});

// SINCRONIZA O VOLUME DA SHADOWHELPER COM O FOG
function syncShadowWithFog() {
  light1.shadow.mapSize.width = scene.fog.far;
  light1.shadow.mapSize.height = scene.fog.far;
  light1.shadow.camera.left = -scene.fog.far / 20;
  light1.shadow.camera.right = scene.fog.far / 20;
  light1.shadow.camera.bottom = -scene.fog.far / 20;
  light1.shadow.camera.top = scene.fog.far / 20;
  light1.shadow.camera.updateProjectionMatrix();
  shadowHelper.update();
}

//CROSSHAIR
const crosshairTexture = new THREE.TextureLoader().load(
  "../textures/crosshair.png"
);
const crosshairMaterial = new THREE.SpriteMaterial({
  map: crosshairTexture,
  color: 0xffffff
});
// Sprite = indicador visual do centro da tela
const crosshair = new THREE.Sprite(crosshairMaterial);
crosshair.scale.set(0.006, 0.006, 1);
scene.add(crosshair);
function updateCrosshair() {
  if (currentCamera == player.camera) {
    const vector = new THREE.Vector3(0, 0, -1).applyQuaternion(
      currentCamera.quaternion
    );
    crosshair.position
      .copy(currentCamera.position)
      .add(vector.multiplyScalar(0.1));
  }
}

//SKY BOX
const textureLoader = new THREE.TextureLoader();
let textureEquirec = textureLoader.load("../textures/skybox3.png");
textureEquirec.mapping = THREE.EquirectangularReflectionMapping;
scene.background = textureEquirec;

// SOUND
const listener = new THREE.AudioListener();
currentCamera.add(listener);
const sound = new THREE.Audio(listener);
const audioLoader = new THREE.AudioLoader();

let audioContextStarted = false;

const startAudioContext = () => {
  if (!audioContextStarted) {
    audioContextStarted = true;
    sound.play();
  }
};

audioLoader.load("../sounds/backgroundSound.mp3", function (buffer) {
  sound.setBuffer(buffer);
  sound.setLoop(true);
  sound.setVolume(0.1);
});

window.addEventListener("keydown", (event) => {
  if (event.key.toLowerCase() === "q") {
    event.preventDefault();
    startAudioContext();
    if (sound.isPlaying) {
      sound.pause();
    } else {
      sound.play();
    }
  }
});

window.addEventListener("click", startAudioContext);

// REMOVE VOXEL
const removeSound = new THREE.Audio(listener);
const removeAudioLoader = new THREE.AudioLoader();
removeAudioLoader.load("../sounds/removeVoxelSound.mp3", function (buffer) {
  removeSound.setBuffer(buffer);
  removeSound.setVolume(1.5);
});

function onMouseDown(event) {
  if (player.controls.isLocked && player.selectedCoords) {
    world.removeBlock(
      player.selectedCoords.x,
      player.selectedCoords.y,
      player.selectedCoords.z
    );
    removeSound.play();
  }
}

window.addEventListener("mousedown", onMouseDown);

// RENDER LOOP 
let previousTime = performance.now();
function animate() {
  let currentTime = performance.now();
  let dt = (currentTime - previousTime) / 1000;
  requestAnimationFrame(animate);

  // Configurações da luz
  light1.position.set(
    player.position.x,
    player.position.y + 30,
    player.position.z + 30
  );
  light1.target.position.copy(player.position);
  light1.target.updateMatrixWorld();

  //Configurações do Player
  player.update(world);

  // Configurações da física
  physics.update(dt, player, world);

  // Configurações do Fog
  syncShadowWithFog();

  // Configurações da Mira
  updateCrosshair();

  renderer.render(scene, currentCamera);
  stats.update();

  previousTime = currentTime;
}

const gui = setupUI(world, scene);
setUpLights();
animate();
