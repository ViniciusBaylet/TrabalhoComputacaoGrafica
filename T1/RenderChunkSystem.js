import ChunkData from "./ChunkData.js"; // Gerencia os dados do chunk (provavelmente contém informações sobre os voxels).
import BlockColorMap from "./constants/dictionaries/BlockColorMap.js"; // Um mapa que associa tipos de blocos a cores.
import { Voxel } from "./voxel.js";
import * as THREE from 'three';
import { setDefaultMaterial } from "../libs/util/util.js";

export default class RenderChunkSystem {
  constructor(scene, plane) {
    this.scene = scene;
    this.plane = plane;
    this.chunk = new ChunkData();
    this.canRenderTree = false;  // indica que as árvores ainda não estão prontas para renderização.
    this.treesModel = [];
    this.loadTreesAsync(); // Carrega modelos de árvores de forma assíncrona com loadTreesAsync.
    this.preloadedMash = this.createChunkMesh(this.chunk.voxels);
    this.rendered = false;
  }

  update() {
    //gambiarra pra n ficar renderizando
    if (!this.rendered) {
      const chunkMesh = this.preloadedMash;
      var p = 35 / 2;
      //chunkMesh.position.set(0, 0, 0);
      chunkMesh.position.set(-p, 0, -p);

      this.scene.add(chunkMesh);

      if (this.canRenderTree) {
        this.renderTrees(this.chunk.voxels);
      }
    }
  }

  createChunkMesh = (blocks) => {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const group = new THREE.Group();

    for (let x = 0; x < blocks.length; x++) {
      for (let y = 0; y < blocks[x].length; y++) {
        for (let z = 0; z < blocks[x][y].length; z++) {
          if (
            this.hasAdjacentType(blocks, x, y, z, 0, true) &&
            blocks[x][y][z] != 0
          ) {
            let type = blocks[x][y][z];

            if (y === 0) {
              type = 2; // Tipo para laranja
            } else if (y === 1) {
              type = 3; // Tipo para branco
            }

            const color = BlockColorMap[type];
            const material = setDefaultMaterial(color);
            const cube = new THREE.Mesh(geometry, material);
            cube.position.set(x + 0.5, y + 0.5, z + 0.5);

            group.add(cube);
          }
        }
      }
    }

    return group;
  };

  normalizeTree = (blockArray) => {
    const root = blockArray.reduce((smallY, currentBlock) =>
      currentBlock.y < smallY ? currentBlock.y : smallY
    );

    var shiftX = -root.position.x;
    var shiftZ = -root.position.z;

    blockArray = blockArray.map((block) => {
      block.position.x += shiftX;
      block.position.z += shiftZ;

      return block;
    });

    return blockArray;
  };

  //Carrega árvores de arquivos JSON de forma assíncrona, normaliza suas posições e as converte em grupos 3D (THREE.Group) para uso posterior.

  //Lê o arquivo index.json contendo a lista de arquivos de definição de árvores.
  //Para cada arquivo:
  //Carrega os blocos que definem a árvore.
  //Normaliza a posição da árvore usando normalizeTree.
  //Cria uma malha para cada bloco e adiciona ao grupo da árvore.
  //Adiciona o grupo da árvore ao array treesModel para uso futuro.

  //Esta função gerencia o carregamento dinâmico de árvores externas, permitindo o reuso de modelos. Isso facilita a adição de novos tipos de árvores sem alterar o código principal.

  loadTreesAsync = () => {
    var classScope = this;
    async function loadJson() {
      try {
        const response = await fetch("./trees/index.json");
        if (!response.ok) throw new Error("Erro ao carregar index.json");

        const files = await response.json();
        const geometry = new THREE.BoxGeometry(1, 1, 1);

        for (const file of files) {
          try {
            const fileResponse = await fetch("./trees/" + file);
            if (!fileResponse.ok) throw new Error(`Erro ao carregar ${file}`);

            const data = await fileResponse.json();
            //console.log(`Conteúdo de ${file}:`, data);
            var normalized = classScope.normalizeTree(data);
            var tree = new THREE.Group();

            normalized.forEach((block) => {
              //const material = setDefaultMaterial(color);
              const material = setDefaultMaterial(
                BlockColorMap[block.type ?? 1]
              );

              const cube = new THREE.Mesh(geometry, material);
              const { x, y, z } = block.position;

              cube.position.set(x + 0.5, y + 0.5, z + 0.5);
              tree.add(cube);
            });

            //debugger;

            classScope.treesModel.push(tree);
          } catch (error) {
            console.error(`Erro ao processar o arquivo ${file}:`, error);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar os arquivos:", error);
      }

      classScope.canRenderTree = true;
    }
    loadJson();
  };

  //Posiciona árvores em locais específicos do mapa com base nos blocos marcados com o tipo 9.

  //Identifica grupos de blocos contíguos com o tipo 9 (blocos "base" das árvores) usando treeGroup.

  //Para cada grupo:
  //Calcula o centro da base da árvore (getCenter), usado como posição de plantio.
  //Seleciona aleatoriamente uma árvore disponível em treesModel usando getRandomTree.
  //Posiciona a árvore no centro calculado e a adiciona à malha predefinida (preloadedMash).

  //Esta função posiciona árvores em áreas designadas do mapa (marcadas com blocos tipo 9), criando um ambiente dinâmico e visualmente interessante.

  renderTrees = (blocks) => {
    //verifica se tem campos de arvore marcados no mapa
    const treeGroup = [];
    const treeCount = 6;
    const treeChance = Array(this.treesModel.length);
    treeChance.fill(Math.ceil(treeCount / this.treesModel.length));

    for (let x = 0; x < blocks.length; x++) {
      for (let y = 0; y < blocks[x].length; y++) {
        for (let z = 0; z < blocks[x][y].length; z++) {
          const type = blocks[x][y][z];

          if (type == 9) {
            //existe um grupo para esta posição?
            //treeGroup = grupos de pontos[ grupo de pontos [pontos{}{}{}{}] , [{}{}{}{}]]
            //cada grupo dentro do array deve ser a base 2x2 da arvore
            var groupIndex = treeGroup.findIndex((group) => {
              const isNeighbor = (p1, p2) => {
                const dx = Math.abs(p1.x - p2.x);
                const dy = Math.abs(p1.z - p2.z);

                return dx <= 1 && dy <= 1 && !(dx === 0 && dy === 0);
              };
              var r = group.some((coord) => {
                return isNeighbor(coord, { x, z });
              });
              return r;
            });
            //não encontrado => cria novo grupo
            if (groupIndex === -1) {
              var g = [];
              g.push({ x: x, y: y, z: z });
              treeGroup.push(g);
            } else {
              var g = treeGroup[groupIndex];
              g.push({ x: x, y: y, z: z });
            }
          }
        }
      }
    }

    treeGroup.forEach((group) => {
      const getCenter = (group) => {
        var sumX = 0,
          sumY = 0,
          sumZ = 0,
          numPoints = 0;
        group.forEach((point) => {
          sumX += point.x;
          sumY += point.y;
          sumZ += point.z;
        });
        numPoints = group.length;

        return {
          x: sumX / numPoints,
          y: sumY / numPoints,
          z: sumZ / numPoints
        };
      };
      var { x, y, z } = getCenter(group);

      function getRandomTree(treeModels) {
        function getRandomIndex(array) {
          return Math.floor(Math.random() * array.length - 0.0000001);
        }
        let index = -1;
        var attempt = 200;
        while (attempt > 0) {
          debugger;
          index = getRandomIndex(treeModels);
          if (treeChance[index] > 0) {
            treeChance[index] -= 1;
            return treeModels[index]?.clone(true);
          }
          attempt--;
        }

        return null;
      }
      const t = getRandomTree(this.treesModel);
      if (t) {
        t.position.set(x, y, z);
        //this.scene.add(t);
        this.preloadedMash.add(t);
      }
    });

    this.rendered = true;
    this.canRenderTree = false;
  };

  //Verifica se um bloco em (x, y, z) tem pelo menos um vizinho adjacente de um tipo específico (type).

  //Define as posições adjacentes (direita, esquerda, cima, baixo, frente e trás).
  //Itera pelas posições adjacentes e verifica se o bloco no mapa é do tipo desejado.
  //Retorna true se encontrar pelo menos um vizinho válido, caso contrário, false.

  //É utilizada para identificar blocos visíveis no chunk e determinar pontos de interesse no mapa (como blocos tipo 9 para árvores). Isso evita renderizar blocos internos e garante que as árvores sejam posicionadas corretamente.
  
  hasAdjacentType = (blocks, x, y, z, type, vertical = false) => {
    const adjacentPositions = [
      { dx: 1, dy: 0, dz: 0 }, // Direita
      { dx: -1, dy: 0, dz: 0 }, // Esquerda
      { dx: 0, dy: 1, dz: 0 }, // Cima
      { dx: 0, dy: -1, dz: 0 }, // Baixo
      { dx: 0, dy: 0, dz: 1 }, // Frente
      { dx: 0, dy: 0, dz: -1 } // Trás
    ];

    for (const { dx, dy, dz } of adjacentPositions) {
      const nx = x + dx;
      const ny = vertical ? y + dy : y;
      const nz = z + dz;
      if (
        nx >= 0 &&
        nx < blocks.length &&
        ny >= 0 &&
        ny < blocks[nx].length &&
        nz >= 0 &&
        nz < blocks[nx][ny].length
      ) {
        if (blocks[nx][ny][nz] === type) {
          return true;
        }
      }
    }
    return false;
  };
}
