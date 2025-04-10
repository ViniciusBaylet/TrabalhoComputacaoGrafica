import * as THREE from "three";
import { World } from "./Terrain/world.js";
import Stats from "../../build/jsm/libs/stats.module.js";
import { Player } from "./Player/player.js";
import { InspectionCamera } from "./Cameras/inspectionCamera.js";
import { ThirdPersonCamera } from "./Cameras/thirdPersonCamera.js";
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

//FOG
scene.fog = new THREE.Fog(0x80a0e0, 50, 185);

// PLAYER 
const player = new Player(scene);
player.loadGLBFile("./Player/player.glb", 0.5).then(async () => {

  // CAMERAS
  const inspectionCamera = new InspectionCamera(scene);
  inspectionCamera.update(renderer);

  const thirdPersonCamera = new ThirdPersonCamera(scene, player);

  let currentCamera = inspectionCamera.camera;
  let isInspectionMode = true;

  function toggleCamera() {
    if (isInspectionMode) {
      currentCamera = thirdPersonCamera.camera;
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

  player.asset.object.position.y = world.getSurfaceHeight(player.asset.object.position.x, player.asset.object.position.z);

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

  // RENDER LOOP 
  let previousTime = performance.now();
  function animate() {
    let currentTime = performance.now();
    let dt = (currentTime - previousTime) / 1000;
    requestAnimationFrame(animate);

    // Configurações da luz
    light1.position.set(
      player.asset.object.position.x,
      player.asset.object.position.y + 30,
      player.asset.object.position.z + 30
    );
    light1.target.position.copy(player.asset.object.position);
    light1.target.updateMatrixWorld();

    // Configurações do player
    player.update(world);
    player.updateBoundsHelper();
    thirdPersonCamera.update();
    physics.update(player, world);

    // Configurações do Fog
    syncShadowWithFog();

    renderer.render(scene, currentCamera);
    stats.update();

    previousTime = currentTime;
  }

  const gui = setupUI(world, scene);
  setUpLights();
  animate();

}).catch((error) => {
  console.log("Erro ao carregar o modelo do jogador:", error);
});
