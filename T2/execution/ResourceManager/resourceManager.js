import * as THREE from "three";
import { blocks } from "../../blocks/blocks.js";

export default class ResourceManager {
  constructor() {
    this.treeModels = [];
    this.treeModelIsLoaded = false;
  }

  async loadTreeModels() {
    try {
      const response = await fetch("../trees/index.json");
      if (!response.ok) console.log("Erro ao carregar index.json");

      const files = await response.json();
      for (const file of files) {
        const tree = await this.loadTree(file);
        if (tree) this.treeModels.push(tree);
      }
    } catch (error) {
      console.error("Erro ao carregar as árvores:", error);
    }
  }

  async loadTree(fileName) {
    try {
      const response = await fetch(`../trees/${fileName}`);
      if (!response.ok) throw new Error(`Erro ao carregar ${fileName}`);

      const data = await response.json();
      const normalized = this.normalizeTree(data);
      const model = this.normalizedToModel(normalized);
      return model;
    } catch (error) {
      console.log(`Erro ao carregar a árvore ${fileName}:`, error);
      return null;
    }
  }

  normalizeTree(blockArray) {
    const minX = Math.min(...blockArray.map((b) => b.position.x));
    const minY = Math.min(...blockArray.map((b) => b.position.y));
    const minZ = Math.min(...blockArray.map((b) => b.position.z));

    return blockArray.map((block) => ({
      ...block,
      position: {
        x: block.position.x - minX,
        y: block.position.y - minY,
        z: block.position.z - minZ
      }
    }));
  }

  normalizedToModel(normalized) {
    const tree = new THREE.Group();

    normalized.forEach((block) => {
      const blockType = Object.values(blocks).find((b) => b.id === block.type);

      if (blockType && blockType.id !== 0) { // Ignora blocos 'empty'
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const cube = new THREE.Mesh(geometry, blockType.material);
        cube.position.set(block.position.x, block.position.y, block.position.z);
        tree.add(cube);
      }
    });

    return tree;
  }

  getRandomTree() {
    if (this.treeModels.length === 0) return null;
    const index = Math.floor(Math.random() * this.treeModels.length);
    return this.treeModels[index].clone(true);
  }
}
