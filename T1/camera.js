import * as THREE from 'three';
import { OrbitControls } from '../build/jsm/controls/OrbitControls.js';
import { PointerLockControls } from '../build/jsm/controls/PointerLockControls.js';


export class Camera {

    constructor(renderer, scene) {
        console.log("Inicializando câmeras...");
        this.renderer = renderer;
        this.scene = scene;

        // Configurações comuns para ambas as câmeras
        this.fov = 75;
        this.aspect = window.innerWidth / window.innerHeight;
        this.near = 0.1;
        this.far = 500;

        // Câmera de inspeção (OrbitControls)
        this.inspectionCamera = new THREE.PerspectiveCamera(this.fov, this.aspect, this.near, this.far);
        this.inspectionCamera.position.set(0, 11, 30);
        this.orbitControls = new OrbitControls(this.inspectionCamera, this.renderer.domElement);
        this.orbitControls.enableDamping = true;

        // Câmera de primeira pessoa (PointerLockControls)
        this.firstPersonCamera = new THREE.PerspectiveCamera(this.fov, this.aspect, this.near, this.far);
        this.firstPersonCamera.position.set(0, 3, 9);
        this.pointerLockControls = new PointerLockControls(this.firstPersonCamera, this.renderer.domElement);
      
        //Clona as posições anteriores das câmeras para alternância entre as câmeras
        this.previousPosition = {
            inspection: this.inspectionCamera.position.clone(),
            firstPerson: this.firstPersonCamera.position.clone(),
        };

        // Define a câmera atual e o modo inicial (inspeção)
        this.currentCamera = this.inspectionCamera;
        this.isInspectionMode = true;

        // Alternar câmeras com a tecla 'C'
        window.addEventListener('keydown', (event) => {
            if (event.key.toLowerCase() === 'c') {
                this.toggleCamera();
            }
        });

        //Clicar com o botão direito do mouse
        window.addEventListener('mousedown', (event) => {
            if (event.button === 2 && !this.isJumping) { // Botão direito do mouse (2)
                this.jump();
            }
        });

        this.addMovementListeners();
    }

    toggleCamera() {
        if (this.isInspectionMode) {
            // Alterna para câmera de primeira pessoa
            this.previousPosition.inspection.copy(this.inspectionCamera.position);
            this.firstPersonCamera.position.copy(this.previousPosition.firstPerson);
            this.currentCamera = this.firstPersonCamera;
            this.pointerLockControls.lock();
            this.isInspectionMode = false;
            console.log('Modo: Primeira Pessoa');
        } else {
            // Alterna para câmera de inspeção
            this.previousPosition.firstPerson.copy(this.firstPersonCamera.position);
            this.inspectionCamera.position.copy(this.previousPosition.inspection);
            this.currentCamera = this.inspectionCamera;
            this.isInspectionMode = true;
            console.log('Modo: Inspeção');
        }
    }

    update() {
        if (this.isInspectionMode) {
            // Atualiza os controles de inspeção
            this.orbitControls.update();
        } else {
            // Atualiza a posição da câmera em primeira pessoa
            const moveSpeed = 0.1; // Velocidade de movimento
            const direction = new THREE.Vector3();
            const right = new THREE.Vector3();

            direction.normalize();

            this.firstPersonCamera.getWorldDirection(right);
            right.crossVectors(this.firstPersonCamera.up, direction); // Direção para a direita

            right.normalize();

            if (this.moveForward) {
                this.pointerLockControls.moveForward(moveSpeed);
            }
            if (this.moveBackward) {
                this.pointerLockControls.moveForward(-moveSpeed);
            }
            if (this.moveLeft) {
                this.pointerLockControls.moveRight(-moveSpeed);
            }
            if (this.moveRight) {
                this.pointerLockControls.moveRight(moveSpeed);
            }
            // Aplicando física do pulo
            if (this.isJumping) {
                this.firstPersonCamera.position.y += this.velocityY;
                this.velocityY += this.gravity;

                // Simula o chão (impede a câmera de cair indefinidamente)
                if (this.firstPersonCamera.position.y <= 3) {
                    this.firstPersonCamera.position.y = 3; // Altura inicial
                    this.isJumping = false;
                    this.velocityY = 0;
                }
            }
        }
    }

    getCurrentCamera() {
        return this.currentCamera;
    }

    // Listeners de movimento para câmera em primeira pessoa
    addMovementListeners() {
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;

        this.isJumping = false;
        this.velocityY = 0;
        this.gravity = -0.06;
        this.jumpStrength = 0.5;

        window.addEventListener('keydown', (event) => {
            if (event.key === 'w' || event.key === 'ArrowUp') this.moveForward = true;
            if (event.key === 's' || event.key === 'ArrowDown') this.moveBackward = true;
            if (event.key === 'a' || event.key === 'ArrowLeft') this.moveLeft = true;
            if (event.key === 'd' || event.key === 'ArrowRight') this.moveRight = true;
            if (event.key === ' ' && !this.isJumping) this.jump();
        });

        window.addEventListener('keyup', (event) => {
            if (event.key === 'w' || event.key === 'ArrowUp') this.moveForward = false;
            if (event.key === 's' || event.key === 'ArrowDown') this.moveBackward = false;
            if (event.key === 'a' || event.key === 'ArrowLeft') this.moveLeft = false;
            if (event.key === 'd' || event.key === 'ArrowRight') this.moveRight = false;
        });
    }

    // Função para iniciar o pulo
    jump() {
        this.isJumping = true;
        this.velocityY = this.jumpStrength;
    }
}