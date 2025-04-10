import * as THREE from "three";
import { GLTFLoader } from '../../../build/jsm/loaders/GLTFLoader.js';
import { getMaxSize } from "../../../libs/util/util.js";

export class Player {

    radius = 0.5;
    height = 0.7;

    constructor(scene) {
        this.scene = scene;

        this.asset = {
            object: null,
            loaded: false,
        };
        this.moveDirection = new THREE.Vector3();
        this.movingForward = false;
        this.movingBackward = false;
        this.turn = false;
        this.isJumping = false;

        window.addEventListener('keyup', (event) => {
            this.onKeyUp(event);
        });

        window.addEventListener('keydown', (event) => {
            this.onKeyDown(event);
        });

        this.boundsHelper = new THREE.Mesh(new THREE.CylinderGeometry(this.radius, this.radius, this.height, 16), new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: 0.0,
            wireframe: false
         }));
        this.scene.add(this.boundsHelper);
    }

    loadGLBFile(file, desiredScale) {
        return new Promise((resolve, reject) => {
            let loader = new GLTFLoader();
            loader.load(file, (gltf) => {
                this.asset.object = gltf.scene;
                this.asset.object.traverse(function (child) {
                    if (child.isMesh) {
                        child.castShadow = true;
                    }
                });

                this.asset.object = this.normalizeAndRescale(this.asset.object, desiredScale);

                this.asset.object.updateMatrixWorld(true);

                this.asset.object.position.set(32, this.height, 32);

                this.asset.loaded = true;

                this.scene.add(this.asset.object);

                this.mixer = new THREE.AnimationMixer(this.asset.object);

                gltf.animations.forEach((clip) => {
                    this.mixer.clipAction(clip).play();
                });

                const box = new THREE.Box3().setFromObject(this.asset.object);
                const size = new THREE.Vector3();
                box.getSize(size);
                const center = new THREE.Vector3();
                box.getCenter(center);

                resolve();
            }, null, (error) => {
                reject(error);
            });
        });
    }

    normalizeAndRescale(obj, newScale) {
        var scale = getMaxSize(obj);

        obj.scale.set(newScale * (1.0 / scale),
            newScale * (1.0 / scale),
            newScale * (1.0 / scale));
        return obj;
    }

    calculateForwardDirection(object) {
        const forward = new THREE.Vector3(0, 0, 1);
        forward.applyQuaternion(object.quaternion);
        forward.y = 0;
        forward.normalize();
        return forward;
    }

    calculateBackwardDirection(object) {
        const backward = new THREE.Vector3(0, 0, -1);
        backward.applyQuaternion(object.quaternion);
        backward.y = 0;
        backward.normalize();
        return backward;
    }

    onKeyDown(event) {
        switch (event.key) {
            case 'w':
            case 'ArrowUp':
                if (!this.movingForward) {
                    this.moveDirection.copy(this.calculateForwardDirection(this.asset.object));
                    this.movingForward = true;
                }
                break;
            case 's':
            case 'ArrowDown':
                if (!this.movingBackward) {
                    this.moveDirection.copy(this.calculateBackwardDirection(this.asset.object));
                    this.movingBackward = true;
                }
                break;
            case 'a':
            case 'ArrowLeft':
                // Gira o personagem para a esquerda
                this.asset.object.rotation.y += THREE.MathUtils.degToRad(45);
                this.turn = true;
                if (this.movingForward === true) {
                    this.moveDirection.copy(this.calculateForwardDirection(this.asset.object));
                } else if (this.movingBackward === true) {
                    this.moveDirection.copy(this.calculateBackwardDirection(this.asset.object));
                }
                break;
            case 'd':
            case 'ArrowRight':
                // Gira o personagem para a direita
                this.asset.object.rotation.y -= THREE.MathUtils.degToRad(45);
                this.turn = true;
                if (this.movingForward === true) {
                    this.moveDirection.copy(this.calculateForwardDirection(this.asset.object));
                } else if (this.movingBackward === true) {
                    this.moveDirection.copy(this.calculateBackwardDirection(this.asset.object));
                }
                break;
            case ' ':
                if (!this.isJumping) {
                    this.isJumping = true;
                    this.jumpHeight = 0.3;
                    this.jumpSpeed = Math.sqrt(2 * 9.81 * this.jumpHeight);
                }
                break;
        }
    }

    onKeyUp(event) {
        switch (event.key) {
            case 'w':
            case 's':
            case 'ArrowUp':
            case 'ArrowDown':
                this.movingForward = false;
                this.movingBackward = false;
                break;
        }
    }

    updateBoundsHelper() {
        this.boundsHelper.position.copy(this.asset.object.position);
        this.boundsHelper.position.y -= this.height / 2;
    }

    update(world) {
    
        const surfaceHeight = world.getSurfaceHeight(this.asset.object.position.x, this.asset.object.position.z);

        if (this.isJumping) {
            this.asset.object.position.y += this.jumpSpeed / 20;
            this.jumpSpeed += -0.1;
            this.mixer.update(0.07);
            // Chegou ao chão
            if (this.asset.object.position.y <= surfaceHeight) {
                this.asset.object.position.y = surfaceHeight;
                this.isJumping = false;
                this.jumpSpeed = 0;
            }
        }

        if (!this.isJumping && this.asset.object.position.y > surfaceHeight + 0.1) {
            this.asset.object.position.y -= 0.2;
        } else if (!this.isJumping) {
            this.asset.object.position.y = THREE.MathUtils.lerp(
                this.asset.object.position.y,
                surfaceHeight,
                0.2
            );
        }

        if (this.movingForward) {
            this.moveDirection.copy(this.calculateForwardDirection(this.asset.object));
            this.asset.object.position.add(this.moveDirection.multiplyScalar(0.1));
            this.mixer.update(0.07);
        }
        if (this.movingBackward) {
            this.moveDirection.copy(this.calculateBackwardDirection(this.asset.object));
            this.asset.object.position.add(this.moveDirection.multiplyScalar(0.1));
            this.mixer.update(0.07);
        }
    }

}
