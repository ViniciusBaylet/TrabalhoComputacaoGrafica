import * as THREE from "three";

export const blocks = {
  empty: {
    id: 0,
    name: "empty"
  },

  grass: {
    id: 1,
    name: "grass",
    material: [
      new THREE.MeshLambertMaterial({ color: 0x807020 }), // right
      new THREE.MeshLambertMaterial({ color: 0x807020 }), // left
      new THREE.MeshLambertMaterial({ color: 0x559020 }), // top
      new THREE.MeshLambertMaterial({ color: 0x807020 }), // bottom
      new THREE.MeshLambertMaterial({ color: 0x807020 }), // front
      new THREE.MeshLambertMaterial({ color: 0x807020 })  // back
    ]
  },

  dirt: {
    id: 2,
    name: "dirt",
    material: [
      new THREE.MeshLambertMaterial({ color: 0x807020 }), // right
      new THREE.MeshLambertMaterial({ color: 0x807020 }), // left
      new THREE.MeshLambertMaterial({ color: 0x807020 }), // top
      new THREE.MeshLambertMaterial({ color: 0x807020 }), // bottom
      new THREE.MeshLambertMaterial({ color: 0x807020 }), // front
      new THREE.MeshLambertMaterial({ color: 0x807020 })  // back
    ]
  },

  stone: {
    id: 3,
    name: "stone",
    material: [
      new THREE.MeshLambertMaterial({ color: 0x808080 }), // right
      new THREE.MeshLambertMaterial({ color: 0x808080 }), // left
      new THREE.MeshLambertMaterial({ color: 0x808080 }), // top
      new THREE.MeshLambertMaterial({ color: 0x808080 }), // bottom
      new THREE.MeshLambertMaterial({ color: 0x808080 }), // front
      new THREE.MeshLambertMaterial({ color: 0x808080 })  // back
    ]
  },
  
  sapling: {
    id: 4,
    name: "sapling",
    material: [
      new THREE.MeshLambertMaterial({ color: 0x808080 }), // right
      new THREE.MeshLambertMaterial({ color: 0x808080 }), // left
      new THREE.MeshLambertMaterial({ color: 0x808080 }), // top
      new THREE.MeshLambertMaterial({ color: 0x808080 }), // bottom
      new THREE.MeshLambertMaterial({ color: 0x808080 }), // front
      new THREE.MeshLambertMaterial({ color: 0x808080 })  // back
    ]
  },

  leaves: {
    id: 5,
    name: "leaves",
    material: [
      new THREE.MeshLambertMaterial({ color: 0x00ff00 }), // right
      new THREE.MeshLambertMaterial({ color: 0x00ff00 }), // left
      new THREE.MeshLambertMaterial({ color: 0x00ff00 }), // top
      new THREE.MeshLambertMaterial({ color: 0x00ff00 }), // bottom
      new THREE.MeshLambertMaterial({ color: 0x00ff00 }), // front
      new THREE.MeshLambertMaterial({ color: 0x00ff00 })  // back
    ]
  },

  trunk: {
    id: 6,
    name: "trunk",
    material: [
      new THREE.MeshLambertMaterial({ color: 0x362511 }), // right
      new THREE.MeshLambertMaterial({ color: 0x362511 }), // left
      new THREE.MeshLambertMaterial({ color: 0x362511 }), // top
      new THREE.MeshLambertMaterial({ color: 0x362511 }), // bottom
      new THREE.MeshLambertMaterial({ color: 0x362511 }), // front
      new THREE.MeshLambertMaterial({ color: 0x362511 })  // back
    ]
  },
}
