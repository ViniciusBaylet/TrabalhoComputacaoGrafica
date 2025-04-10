import * as THREE from "three";
import { OrbitControls } from '../../../build/jsm/controls/OrbitControls.js';

export class InspectionCamera {

    constructor(scene) {
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight);
        this.camera.position.set(-32, 30, -32);
        scene.add(this.camera);
    }

    update(renderer) {
        const controls = new OrbitControls(this.camera, renderer.domElement);
        controls.target.set(16, 0, 16);
        controls.update();

        controls.enableZoom = true;
        controls.minDistance = 1;
        controls.maxDistance = 100; 
    }

}

