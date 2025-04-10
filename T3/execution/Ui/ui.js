import { GUI } from "../../../libs/util/dat.gui.module.js";

export function setupUI(world, scene) {
  const gui = new GUI();

  const worldFolder = gui.addFolder("World");
  worldFolder.add(scene.fog, "near", 1, 200, 1).name("Fog near");
  worldFolder.add(scene.fog, "far", 1, 500, 1).name("Fog far");
  
  return gui
}
