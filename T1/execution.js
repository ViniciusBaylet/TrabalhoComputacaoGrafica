import * as THREE from "three";
import { Camera } from "./camera.js"; // Importando a classe Camera
import {
  initRenderer,
  initDefaultBasicLight,
  setDefaultMaterial,
  onWindowResize,
  createGroundPlaneXZ,
  createGroundPlaneWired
} from "../libs/util/util.js";
import RenderChunkSystem from "./RenderChunkSystem.js";

// Variáveis iniciais
let scene, renderer, camera, material, light;
scene = new THREE.Scene(); // Criação da cena principal
renderer = initRenderer(); // Inicializa o renderizador
renderer.setClearColor(0x80a0e0);

// Criar material básico e luz
material = setDefaultMaterial();
light = initDefaultBasicLight(scene);
//light.position.set(-20, 30, 30);
scene.add(light); 


// Inicializa o gerenciamento de câmeras
const cameraManager = new Camera(renderer, scene);
camera = cameraManager.getCurrentCamera();

// Ouvir mudanças no tamanho da janela
window.addEventListener(
  "resize",
  function () {
    onWindowResize(cameraManager.getCurrentCamera(), renderer);
  },
  false
);

let axesHelper = new THREE.AxesHelper(12);
//scene.add(axesHelper);

// create the ground plane
let plane = createGroundPlaneXZ(35, 35);
plane.position.set(17.5, 0, 17.5);
plane.material.color = new THREE.Color(0x00ff00); 
scene.add(plane);
var chunk = new RenderChunkSystem(scene, plane);

// Função de renderização
function render() {
  //scene.clear();

  cameraManager.update();
  if (cameraManager.isInspectionMode) {
    cameraManager.orbitControls.update();
  }

  chunk.update();
  camera = cameraManager.getCurrentCamera();
  renderer.render(scene, camera);

  requestAnimationFrame(render);
}

cameraManager.addMovementListeners();

render();
