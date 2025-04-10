import * as THREE from "three";
import { SimplexNoise } from "../../../build/jsm/math/SimplexNoise.js";
import { RNG } from "./rng.js";
import { blocks } from "../../blocks/blocks.js";

const geometry = new THREE.BoxGeometry();

export class World extends THREE.Group {

  data = [];

  static instance = new World();

  params = {
    seed: 0,

    chunkSize: {
      width: 100,
      height: 20
    },

    terrain: {
      scale: 30,
      magnitude: 0.5,
      offset: 0.2,
    },
  };

  constructor(resources) {
    super();
    this.size = {
      width: this.params.chunkSize.width,
      height: this.params.chunkSize.height
    }
    this.resourceManager = resources;
    this.trees = [];
  }

  generate() {
    this.initializeTerrain();
    this.generateTerrain();
    this.generateMeshes();

    this.generateTrees();
  }

  initializeTerrain() {
    this.data = [];
    for (let x = 0; x < this.size.width; x++) {
      const slice = [];
      for (let y = 0; y < this.size.height; y++) {
        const row = [];
        for (let z = 0; z < this.size.width; z++) {
          row.push({
            id: blocks.empty.id,
            instanceId: null
          });
        }
        slice.push(row);
      }
      this.data.push(slice);
    }
  }

  generateTerrain() {
    const rng = new RNG(this.params.seed);
    const simplex = new SimplexNoise(rng);
    for (let x = 0; x < this.size.width; x++) {
      for (let z = 0; z < this.size.width; z++) {

        const value = simplex.noise(
          x / this.params.terrain.scale,
          z / this.params.terrain.scale);

        const scaledNoise = this.params.terrain.offset + this.params.terrain.magnitude * value;

        let height = Math.floor(this.size.height * scaledNoise);

        height = Math.max(0, Math.min(height, this.size.height - 1));

        for (let y = 0; y <= this.size.height; y++) {
          if (y < height - 4) {
            this.setBlockId(x, y, z, blocks.stone.id);
          } else if (y < height - 1) {
            this.setBlockId(x, y, z, blocks.dirt.id);
          } else if (y === height) {
            const surfaceChance = rng.random();
            if (surfaceChance < 0.0005) {
              this.setBlockId(x, y, z, blocks.sapling.id); // pedra na superfície
            } else {
              this.setBlockId(x, y, z, blocks.grass.id); // grama padrão
            }
          } else {
            this.setBlockId(x, y, z, blocks.empty.id);
          }
        }
      }
    }
  }

  // generateMeshes() {
  //   this.clear();

  //   const maxCount = this.size.width * this.size.width * this.size.height;
  //   const mesh = new THREE.InstancedMesh(geometry, material, maxCount);
  //   mesh.count = 0;

  //   const matrix = new THREE.Matrix4();

  //   for (let x = 0; x < this.size.width; x++) {
  //     for (let y = 0; y < this.size.height; y++) {
  //       for (let z = 0; z < this.size.width; z++) {
  //         const blockId = this.getBlock(x, y, z).id;
  //         const blockType = Object.values(blocks).find(x => x.id === blockId);
  //         const instanceId = mesh.count;

  //         //if (blockId !== 0)
  //         if (blockId !== blocks.empty.id && !this.isBlockCovered(x, y, z)) {
  //           matrix.setPosition(x, y, z);
  //           mesh.setMatrixAt(instanceId, matrix);
  //           mesh.setColorAt(instanceId, new THREE.Color(blockType.color));
  //           this.setBlockInstanceId(x, y, z, instanceId);
  //           mesh.count++;
  //         }
  //       }
  //     }
  //   }
  //   mesh.castShadow = true;
  //   mesh.receiveShadow = true;
  //   this.add(mesh);
  // }

  generateMeshes() {
    this.clear();

    const maxCount = this.size.width * this.size.width * this.size.height;

    // Creating a lookup table where the key is the block id
    const meshes = {};
    Object.values(blocks)
      .filter(blockType => blockType.id !== blocks.empty.id)
      .forEach(blockType => {
        const mesh = new THREE.InstancedMesh(geometry, blockType.material, maxCount);
        mesh.name = blockType.id;
        mesh.count = 0;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        meshes[blockType.id] = mesh;
      });

    const matrix = new THREE.Matrix4();
    for (let x = 0; x < this.size.width; x++) {
      for (let y = 0; y < this.size.height; y++) {
        for (let z = 0; z < this.size.width; z++) {
          const blockId = this.getBlock(x, y, z).id;

          if (blockId === blocks.empty.id) continue;

          const mesh = meshes[blockId];
          const instanceId = mesh.count;

          if (!this.isBlockCovered(x, y, z)) {
            matrix.setPosition(x, y, z);
            mesh.setMatrixAt(instanceId, matrix);
            this.setBlockInstanceId(x, y, z, instanceId);
            mesh.count++;
          }
        }
      }
    }

    this.add(...Object.values(meshes));
  }

  getBlock(x, y, z) {
    if (this.atLimits(x, y, z)) {
      return this.data[x][y][z];
    } else {
      return null;
    }
  }

  setBlockId(x, y, z, id) {
    if (this.atLimits(x, y, z)) {
      this.data[x][y][z].id = id;
    }
  }

  setBlockInstanceId(x, y, z, instanceId) {
    if (this.atLimits(x, y, z)) {
      this.data[x][y][z].instanceId = instanceId;
    }
  }

  atLimits(x, y, z) {
    if (x >= 0 && x < this.size.width &&
      y >= 0 && y < this.size.height &&
      z >= 0 && z < this.size.width) {
      return true;
    } else {
      return false;
    }
  }

  isBlockCovered(x, y, z) {
    const up = this.getBlock(x, y + 1, z)?.id ?? blocks.empty.id;
    const down = this.getBlock(x, y - 1, z)?.id ?? blocks.empty.id;
    const left = this.getBlock(x + 1, y, z)?.id ?? blocks.empty.id;
    const right = this.getBlock(x - 1, y, z)?.id ?? blocks.empty.id;
    const forward = this.getBlock(x, y, z + 1)?.id ?? blocks.empty.id;
    const back = this.getBlock(x, y, z - 1)?.id ?? blocks.empty.id;

    if (up === blocks.empty.id ||
      down === blocks.empty.id ||
      left === blocks.empty.id ||
      right === blocks.empty.id ||
      forward === blocks.empty.id ||
      back === blocks.empty.id) {
      return false;
    } else {
      return true;
    }
  }

  getSurfaceHeight(x, z) {
    x = Math.floor(x);
    z = Math.floor(z);
    if (x < 0 || x >= this.size.width || z < 0 || z >= this.size.width) return 0;

    for (let y = this.size.height - 1; y >= 0; y--) {
      const block = this.getBlock(x, y, z);
      if (block.id !== blocks.empty.id) {
        return y + 1.32; // Um pouco acima da superfície
      }
    }
    return 0;
  }

  generateTrees() {
    for (let x = 0; x < this.size.width; x++) {
      for (let z = 0; z < this.size.width; z++) {
        for (let y = 0; y < this.size.height; y++) {
          if (this.data[x][y][z].id === blocks.sapling.id) {
            this.createTree(x, y, z);
          }
        }
      }
    }
  }

  createTree(x, y, z) {
    const tree = this.resourceManager.getRandomTree();
    tree.position.set(x, y, z);

    tree.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    this.add(tree);
    this.trees.push(tree);
  }
}