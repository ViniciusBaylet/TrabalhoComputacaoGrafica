import * as THREE from "three";

export class ThirdPersonCamera {

    constructor(scene, player) {
        this.scene = scene;
        this.player = player;

        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.scene.add(this.camera);
    }

    update() {
        const playerPosition = this.player.asset.object.position;
        const playerQuaternion = this.player.asset.object.quaternion;
    
        const offset = new THREE.Vector3(0, 1, -5);
        offset.applyQuaternion(playerQuaternion); 
    
        const desiredPosition = new THREE.Vector3().copy(playerPosition).add(offset);
    
        this.camera.position.lerp(desiredPosition, 0.1); 
    
        const lookAtTarget = new THREE.Vector3().copy(playerPosition);
        this.camera.lookAt(lookAtTarget);
    }
    
}