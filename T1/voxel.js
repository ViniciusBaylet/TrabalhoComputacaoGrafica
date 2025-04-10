import * as THREE from 'three';
import {
    initRenderer,
    initDefaultBasicLight,
    setDefaultMaterial,
    InfoBox,
    onWindowResize,
} from "../libs/util/util.js";
import BlockColorMap from './constants/dictionaries/BlockColorMap.js';


export class Voxel {

    constructor() {

        this.voxel;
        this.voxelGeometry = new THREE.BoxGeometry(1, 1, 1);

    }

    builVoxel1(x, y, z) {

        const voxel1Material = setDefaultMaterial(0x00ff00);

        this.voxel = new THREE.Mesh(this.voxelGeometry, voxel1Material);
        this.voxel.position.x = x;
        this.voxel.position.y = y;
        this.voxel.position.z = z;
        this.voxel.name = `voxel-${x}-${y}-${z}`;
        this.voxel.type = 1;
    }

    buildVoxel2(x, y, z) {

        const voxel2Material = setDefaultMaterial(0xffa500);

        this.voxel = new THREE.Mesh(this.voxelGeometry, voxel2Material);
        this.voxel.position.x = x;
        this.voxel.position.y = y;
        this.voxel.position.z = z;
        this.voxel.name = `voxel-${x}-${y}-${z}`;
        this.voxel.type = 2;


    }

    buildVoxel3(x, y, z) {

        const voxel3Material = setDefaultMaterial(0xd3d3d3);
        this.voxel = new THREE.Mesh(this.voxelGeometry, voxel3Material);
        this.voxel.position.x = x;
        this.voxel.position.y = y;
        this.voxel.position.z = z;
        this.voxel.name = `voxel-${x}-${y}-${z}`;
        this.voxel.type = 3;

    }

    buildVoxel4(x, y, z) {

        const voxel4Material = setDefaultMaterial(0x654321);

        this.voxel = new THREE.Mesh(this.voxelGeometry, voxel4Material);
        this.voxel.position.x = x;
        this.voxel.position.y = y;
        this.voxel.position.z = z;
        this.voxel.name = `voxel-${x}-${y}-${z}`;
        this.voxel.type = 4;


    }

    buildVoxel5(x, y, z) {

        const voxel5Material = setDefaultMaterial(0x056105);

        this.voxel = new THREE.Mesh(this.voxelGeometry, voxel5Material);
        this.voxel.position.x = x;
        this.voxel.position.y = y;
        this.voxel.position.z = z;
        this.voxel.name = `voxel-${x}-${y}-${z}`;
        this.voxel.type = 5;

    }

    buildVoxel(x ,y ,z ,type){
        const color = BlockColorMap[type];
        const voxelMaterial = setDefaultMaterial(color);

        this.voxel = new THREE.Mesh(this.voxelGeometry, voxelMaterial);
        this.voxel.position.x = x;
        this.voxel.position.y = y;
        this.voxel.position.z = z;
        this.voxel.name = `voxel-${x}-${y}-${z}`;

        this.voxel.type = type;

    }

    getFoundation() {
        return this.voxel;
    }

}
