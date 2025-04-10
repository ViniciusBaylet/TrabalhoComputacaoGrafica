import * as THREE from 'three';
import {
    initRenderer,
    initCamera,
    initDefaultBasicLight,
    setDefaultMaterial,
    InfoBox,
    onWindowResize,
    createGroundPlaneXZ
} from "../libs/util/util.js";
import { Voxel } from './voxel.js'; // Importando a classe Voxel
import GUI from '../libs/util/dat.gui.module.js';
import { Camera } from './camera.js';


export class Builder {

    constructor(height, width) {

        this.height = height;
        this.width = width;
        console.log('Construindo ambiente...');

        // Constroi o plano
        this.plane = createGroundPlaneXZ(width, height);
        this.plane.material.opacity = 0.2;
        this.plane.material.transparent = true;
        scene.add(this.plane);

        //Constroi o plano quadriculado
        let gridHelper = new THREE.GridHelper(height, width);
        // Alinha o grid no plano XZ
        gridHelper.rotation.x = Math.PI / 2;
        this.plane.add(gridHelper);


        // Cria o cubo wireframe
        let wireframeGeometry = new THREE.BoxGeometry(1, 1, 1);
        let wireframeMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
        this.wireframe = new THREE.LineSegments(
            new THREE.EdgesGeometry(wireframeGeometry),
            wireframeMaterial
        );
        this.wireframe.position.set(0, 0.5, 0); // Altura padrão inicial
        scene.add(this.wireframe);

        this.addKeyboardControls();
        this.addGUI();

        this.currentVoxelType = 0; // Tipo inicial de voxel
        this.voxelColors = [0x00ff00, 0xffa500, 0xd3d3d3, 0x8b4513, 0xffffff]; // Cores dos tipos
    }

    addHeightIndicator(x, y, z) {
        // Procura um indicador existente na posição
        let indicatorName = `indicator-${x}-${y}-${z}`; 
        let existingIndicator = this.plane.getObjectByName(indicatorName);

        if (!existingIndicator) {
           
            let material = new THREE.LineDashedMaterial({
                color: 0x0000ff,
                dashSize: 0.2, // Define o comprimento de cada segmento visível da linha.
                gapSize: 0.01, //Define o comprimento do espaço vazio entre os segmentos.
            });
            const points = [
                //Define os dois pontos que formam a linha
                new THREE.Vector3(x, 0, z),  // Base no plano
                new THREE.Vector3(x, y, z),  // Ponto final no nível 1
            ];
            let geometry = new THREE.BufferGeometry().setFromPoints(points); 
            let line = new THREE.Line(geometry, material);
            line.computeLineDistances();
            line.name = indicatorName;
            scene.add(line);

        }
    }

    removeHeightIndicator(x, y, z) {
        let indicatorName = `indicator-${x}-${y}-${z}`;
        let indicator = scene.getObjectByName(indicatorName);
        if (indicator) {
            scene.remove(indicator);
        }
    }

    addKeyboardControls() {
        window.addEventListener('keydown', (event) => {
            const step = 1;
            switch (event.key) {
                case 'ArrowUp':
                    this.wireframe.position.z -= step;
                    break;
                case 'ArrowDown':
                    this.wireframe.position.z += step;
                    break;
                case 'ArrowLeft':
                    this.wireframe.position.x -= step;
                    break;
                case 'ArrowRight':
                    this.wireframe.position.x += step;
                    break;
                case 'PageUp':
                    this.wireframe.position.y += step;
                    break;
                case 'PageDown':
                    this.wireframe.position.y -= step;
                    break;
                case '.':
                    if (this.currentVoxelType >= 4) {
                        this.currentVoxelType = 0;
                        break;
                    }
                    this.currentVoxelType++;
                    break;
                case ',':
                    if (this.currentVoxelType <= 0) {
                        this.currentVoxelType = 4;
                        break;
                    }
                    this.currentVoxelType--;
                    break;
                case 'q':
                case 'Q': // Adicionar voxel
                    this.addHeightIndicator(this.wireframe.position.x, this.wireframe.position.y, this.wireframe.position.z);
                    const voxel = new Voxel();
                    if (this.currentVoxelType === 0) {
                        voxel.builVoxel1(
                            this.wireframe.position.x,
                            this.wireframe.position.y,
                            this.wireframe.position.z,
                        );
                        scene.add(voxel.voxel);
                        break;
                    }
                    if (this.currentVoxelType === 1) {
                        voxel.buildVoxel2(
                            this.wireframe.position.x,
                            this.wireframe.position.y,
                            this.wireframe.position.z,
                        );
                        scene.add(voxel.voxel);
                        break;
                    }
                    if (this.currentVoxelType === 2) {
                        voxel.buildVoxel3(
                            this.wireframe.position.x,
                            this.wireframe.position.y,
                            this.wireframe.position.z,
                        );
                        scene.add(voxel.voxel);
                        break;
                    }
                    if (this.currentVoxelType === 3) {
                        voxel.buildVoxel4(
                            this.wireframe.position.x,
                            this.wireframe.position.y,
                            this.wireframe.position.z,
                        );
                        scene.add(voxel.voxel);
                        break;
                    }
                    if (this.currentVoxelType === 4) {
                        voxel.buildVoxel5(
                            this.wireframe.position.x,
                            this.wireframe.position.y,
                            this.wireframe.position.z,
                        );
                        scene.add(voxel.voxel);
                        break;
                    }
                case 'e':
                case 'E': // Remover voxel
                    this.removeHeightIndicator(this.wireframe.position.x, this.wireframe.position.y, this.wireframe.position.z);
                    this.removeVoxel(
                        this.wireframe.position.x,
                        this.wireframe.position.y,
                        this.wireframe.position.z
                    );
                    break;
            }
        });
    }

    addGUI() {
        var controls = {
            filename: '',
            save: () => {
                this.saveFile(controls.filename);
            },
            load: () => {
                this.loadFile();
            }
        };

        let gui = new GUI();
        gui.add(controls, 'filename').name('Insira o nome');
        gui.add(controls, 'save').name('Salvar Arquivo');
        gui.add(controls, 'load').name('Carregar Arquivo');
    }

    addVoxel(x, y, z, voxelColor = undefined) {
        if (scene.getObjectByName(`voxel-${x}-${y}-${z}`)) return

        const color = voxelColor ?? this.voxelColors[this.currentVoxelType];
        const voxelGeometry = new THREE.BoxGeometry(1, 1, 1);
        const voxelMaterial = setDefaultMaterial(color);
        const voxel = new THREE.Mesh(voxelGeometry, voxelMaterial);

        voxel.position.set(x, y, z);
        voxel.name = `voxel-${x}-${y}-${z}`; // Nome único baseado na posição
        voxel.type = this.currentVoxelType;
        scene.add(voxel);
    }

    removeVoxel(x, y, z) {
        const voxelName = `voxel-${x}-${y}-${z}`;
        const voxel = scene.getObjectByName(voxelName);
        if (voxel) {
            scene.remove(voxel);
        }
    }

    getBuilder() {
        return this.plane;
    }

    saveFile(filename) {
    
        const data = scene.children.filter((voxel) => voxel.name && voxel.name.startsWith('voxel-')).map((voxel) => {
            return {
                position: voxel.position,
                color: voxel.material.color.getHex(),
                type: voxel.type
            }
        })

        const file = new Blob([JSON.stringify(data)], { type: 'application/json' })
        const link = document.createElement('a');
        link.href = URL.createObjectURL(file);
        link.download = `${filename.split('.')[0]}.json`;
        link.click();
    }

    loadFile() {

        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';

            input.onchange = (event) => {
                const file = event.target.files[0];  // Pega o arquivo selecionado
                if (file) {
                    console.log(file)
                    if (file.type !== 'application/json') return
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        JSON.parse(e.target.result).map((voxel) => {
                            voxel && this.addVoxel(
                                voxel.position.x,
                                voxel.position.y,
                                voxel.position.z,
                                voxel.color
                            );
                            this.addHeightIndicator(voxel.position.x, voxel.position.y, voxel.position.z);
                        });
                    };
                    reader.readAsText(file);
                }
            };
        input.click();

    }
}


// Variáveis iniciais
let scene, renderer, camera, material, light;
scene = new THREE.Scene();  // Criação da cena principal
renderer = initRenderer();  // Inicializa o renderizador
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Material padrão
material = setDefaultMaterial();

// Luz padrão
light = initDefaultBasicLight(scene);
light.position.set(10, 10, 10);
scene.add(light);

//Câmera padrão
const cameraManager = new Camera(renderer, scene);
camera = cameraManager.getCurrentCamera();

// Ouvir mudanças no tamanho da janela
window.addEventListener('resize', function () { onWindowResize(cameraManager.getCurrentCamera(), renderer); }, false);

// Mostrar eixos
let axesHelper = new THREE.AxesHelper(12);
//scene.add(axesHelper);

//Cria o ambiente builder
const environment = new Builder(10, 10); // Define as dimensões do plano
scene.add(environment.getBuilder());

// Função de renderização
function render() {
    requestAnimationFrame(render);

    // Atualizar o movimento da câmera
    cameraManager.update();

    // Atualiza os controles de câmera de inspeção
    if (cameraManager.isInspectionMode) {
        cameraManager.orbitControls.update(); // Atualiza os controles da câmera de inspeção
    }

    // Renderiza a cena com a câmera atual
    camera = cameraManager.getCurrentCamera();  // Atualiza a câmera ativa
    renderer.render(scene, camera);
}

// Ouve eventos de movimentação da câmera FPV
cameraManager.addMovementListeners();

render();
