import * as THREE from "three";
import { PointerLockControls } from '../../../build/jsm/controls/PointerLockControls.js';

export class Player {

    jumpSpeed = 10;
    onGround = true;

    radius = 0.5;
    height = 1.75;

    maxSpeed = 10;
    velocity = new THREE.Vector3();

    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100);
    controls = new PointerLockControls(this.camera, document.body);

    raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(), 0, 3);
    selectedCoords = null;

    constructor(scene) {
        this.position.set(32, 16, 32);
        scene.add(this.camera);

        document.addEventListener("keydown", this.onkeydown.bind(this));
        document.addEventListener("keyup", this.onkeyup.bind(this));

        this.boundsHelper = new THREE.Mesh(new THREE.CylinderGeometry(this.radius, this.radius, this.height, 16), new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: 0,
            wireframe: false
        }));
        scene.add(this.boundsHelper);

        const selectionMaterial = new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: 0.3,
            color: 0xffffaa
        });

        const selectionGeometry = new THREE.BoxGeometry(1.01, 1.01, 1.01);
        this.selectionHelper = new THREE.Mesh(selectionGeometry, selectionMaterial);
        scene.add(this.selectionHelper);
    }

    addVelocity(dt) {
        if (this.controls.isLocked) {
            this.controls.moveRight(this.velocity.x * dt);
            this.controls.moveForward(this.velocity.z * dt);
        }
    }

    updateBoundsHelper() {
        this.boundsHelper.position.copy(this.position);
        this.boundsHelper.position.y -= this.height / 2;
    }

    get position() {
        return this.camera.position;
    }

    onkeydown(event) {
        switch (event.code) {
            case 'KeyW':
            case 'ArrowUp':
                this.velocity.z = this.maxSpeed;
                break;
            case 'KeyS':
            case 'ArrowDown':
                this.velocity.z = -this.maxSpeed;
                break;
            case 'KeyA':
            case 'ArrowLeft':
                this.velocity.x = -this.maxSpeed;
                break;
            case 'KeyD':
            case 'ArrowRight':
                this.velocity.x = this.maxSpeed;
                break;
            case 'Space':
                if (!this.isJumping) {
                    this.isJumping = true;
                    this.jumpHeight = 1;
                    this.jumpSpeed = Math.sqrt(2 * 9.81 * this.jumpHeight);
                }
                break;
        }
    }

    onkeyup(event) {
        switch (event.code) {
            case 'KeyW':
            case 'ArrowUp':
                this.velocity.z = 0;
                break;
            case 'KeyS':
            case 'ArrowDown':
                this.velocity.z = 0;
                break;
            case 'KeyA':
            case 'ArrowLeft':
                this.velocity.x = 0;
                break;
            case 'KeyD':
            case 'ArrowRight':
                this.velocity.x = 0;
                break;
            case 'Space':
                this.velocity.y = 0;
                break;
        }
    }

    updateRaycaster(world) {
        this.raycaster.set(this.camera.position, this.camera.getWorldDirection(new THREE.Vector3()));

        const intersections = this.raycaster.intersectObjects(world.children, true);

        if (intersections.length > 0) {
            const intersection = intersections[0];

            const blockMatrix = new THREE.Matrix4();
            intersection.object.getMatrixAt(intersection.instanceId, blockMatrix);

            this.selectedCoords = new THREE.Vector3().applyMatrix4(blockMatrix);
            this.selectionHelper.position.copy(this.selectedCoords);
            this.selectionHelper.visible = true;
        } else {
            this.selectedCoords = null;
            this.selectionHelper.visible = false;
        }
    }

    update(world) {
        const surfaceHeight = world.getSurfaceHeight(this.position.x, this.position.z) + 0.9;

        if (this.isJumping) {
            this.position.y += this.jumpHeight;
            this.jumpHeight += -0.1;
            // Chegou ao chão
            if (this.position.y <= surfaceHeight) {
                this.position.y = surfaceHeight;
                this.isJumping = false;
                this.jumpSpeed = 0;
            }
        } else {
            this.position.y = surfaceHeight;
        }

        this.updateRaycaster(world);
    }
}
