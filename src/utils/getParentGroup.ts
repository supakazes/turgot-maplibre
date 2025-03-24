import * as THREE from "three";

function getParentGroup(object: THREE.Object3D): THREE.Object3D {
  if (object.parent) {
    if (object.parent.type === "Scene") {
      return object;
    } else {
      return getParentGroup(object.parent);
    }
  }
  return object;
}

export default getParentGroup;
