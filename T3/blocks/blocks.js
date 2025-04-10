import * as THREE from "three";

const textureLoader = new THREE.TextureLoader();

export const textures = {
  //tipo 1
  grass: textureLoader.load("../textures/grass.png"),
  grass_side: textureLoader.load("../textures/grass_side.png"),
  //tipo 2
  dirt: textureLoader.load("../textures/dirt.png"),
  //tipo 3
  stone: textureLoader.load("../textures/stone.png"),
  //tipo 4
  tree_side: textureLoader.load("../textures/tree_side.png"),
  //tipo 5
  leaves: textureLoader.load("../textures/leaves.png"),
  //tipo 7
  sand: textureLoader.load("../textures/sand.png"),
  //tipo 8
  azalea_leaves: textureLoader.load("../textures/azalea_leaves.png"),
  //tipo 9
  jungle_tree_side: textureLoader.load("../textures/jungle_tree_side.png"),
  //tipo 10
  water: textureLoader.load("../textures/water.png")
};

export const blocks = {
  empty: {
    id: 0,
    name: "empty"
  },

  grass: {
    id: 1,
    name: "grass",
    material: [
      new THREE.MeshLambertMaterial({ map: textures.grass_side }), // right
      new THREE.MeshLambertMaterial({ map: textures.grass_side }), // left
      new THREE.MeshLambertMaterial({ map: textures.grass }), // top
      new THREE.MeshLambertMaterial({ map: textures.dirt }), // bottom
      new THREE.MeshLambertMaterial({ map: textures.grass_side }), // front
      new THREE.MeshLambertMaterial({ map: textures.grass_side })  // back
    ]
  },

  dirt: {
    id: 2,
    name: "dirt",
    material: [
      new THREE.MeshLambertMaterial({ map: textures.dirt }), // right
      new THREE.MeshLambertMaterial({ map: textures.dirt }), // left
      new THREE.MeshLambertMaterial({ map: textures.dirt }), // top
      new THREE.MeshLambertMaterial({ map: textures.dirt }), // bottom
      new THREE.MeshLambertMaterial({ map: textures.dirt }), // front
      new THREE.MeshLambertMaterial({ map: textures.dirt })  // back
    ]
  },

  stone: {
    id: 3,
    name: "stone",
    material: [
      new THREE.MeshLambertMaterial({ map: textures.stone }), // right
      new THREE.MeshLambertMaterial({ map: textures.stone }), // left
      new THREE.MeshLambertMaterial({ map: textures.stone }), // top
      new THREE.MeshLambertMaterial({ map: textures.stone }), // bottom
      new THREE.MeshLambertMaterial({ map: textures.stone }), // front
      new THREE.MeshLambertMaterial({ map: textures.stone })  // back
    ]
  },
  
  sapling: {
    id: 4,
    name: "sapling",
    material: [
      new THREE.MeshLambertMaterial({ map: textures.grass_side }), // right
      new THREE.MeshLambertMaterial({ map: textures.grass_side }), // left
      new THREE.MeshLambertMaterial({ map: textures.grass }), // top
      new THREE.MeshLambertMaterial({ map: textures.dirt }), // bottom
      new THREE.MeshLambertMaterial({ map: textures.grass_side }), // front
      new THREE.MeshLambertMaterial({ map: textures.grass_side })  // back
    ]
  },

  leaves: {
    id: 5,
    name: "leaves",
    material: [
      new THREE.MeshLambertMaterial({ 
            map: textures.leaves,
            transparent: true,
            alphaTest: 0.1 
            }), // right
      new THREE.MeshLambertMaterial({ 
            map: textures.leaves,
            transparent: true, 
            alphaTest: 0.1
            }), // left
      new THREE.MeshLambertMaterial({ 
            map: textures.leaves,
            transparent: true,
            alphaTest: 0.1
            }), // top
      new THREE.MeshLambertMaterial({ 
            map: textures.leaves,
            transparent: true,
            alphaTest: 0.1
            }), // bottom
      new THREE.MeshLambertMaterial({ 
            map: textures.leaves,
            transparent: true,
            alphaTest: 0.1
            }), // front
      new THREE.MeshLambertMaterial({ 
            map: textures.leaves,
            transparent: true, 
            alphaTest: 0.1 
            })  // back
    ]
  },

  trunk: {
    id: 6,
    name: "trunk",
    material: [
      new THREE.MeshLambertMaterial({ map: textures.tree_side }), // right
      new THREE.MeshLambertMaterial({ map: textures.tree_side }), // left
      new THREE.MeshLambertMaterial({ map: textures.tree_side }), // top
      new THREE.MeshLambertMaterial({ map: textures.tree_side }), // bottom
      new THREE.MeshLambertMaterial({ map: textures.tree_side }), // front
      new THREE.MeshLambertMaterial({ map: textures.tree_side })  // back
    ]
  },

  water: {
    id: 7,
    name: "water",
    material: [
      new THREE.MeshLambertMaterial({
            map: textures.water,
            transparent: true,
            opacity: 0.5
          }), // right
      new THREE.MeshLambertMaterial({
            map: textures.water,
            transparent: true,
            opacity: 0.5
          }), // left
      new THREE.MeshLambertMaterial({
            map: textures.water,
            transparent: true,
            opacity: 0.5 
          }), // top
      new THREE.MeshLambertMaterial({
            map: textures.water,
            transparent: true,
            opacity: 0.5
          }), // bottom
      new THREE.MeshLambertMaterial({
            map: textures.water,
            transparent: true,
            opacity: 0.5
          }), // front
      new THREE.MeshLambertMaterial({
            map: textures.water,
            transparent: true,
            opacity: 0.5
          })  // back
    ]
  },

  sand: {
    id: 8,
    name: "sand",
    material: [
      new THREE.MeshLambertMaterial({ map: textures.sand }), // right
      new THREE.MeshLambertMaterial({ map: textures.sand }), // left
      new THREE.MeshLambertMaterial({ map: textures.sand }), // top
      new THREE.MeshLambertMaterial({ map: textures.sand }), // bottom
      new THREE.MeshLambertMaterial({ map: textures.sand }), // front
      new THREE.MeshLambertMaterial({ map: textures.sand })  // back
    ]
  },
}
