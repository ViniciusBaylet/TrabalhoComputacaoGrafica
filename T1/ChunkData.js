import { y0, y1 } from "./constants/chunks/map1.js";

export default class ChunkData {
  constructor() {
    this.size = 35;
    this.voxels = this.generateChunkData();
  }

  generateChunkData() {
    
    const blocks = [];

    for (let x = 0; x < this.size; x++) {
      blocks[x] = [];
      for (let y = 0; y < this.size; y++) {
        blocks[x][y] = [];
        for (let z = 0; z < this.size; z++) {
          if (y == 0) blocks[x][y][z] = y0[z][x];
          else if (y == 1) blocks[x][y][z] = y1[z][x];
          else blocks[x][y][z] = 0;
        }
      }
    }
    return blocks;
  }
}
