import * as THREE from "three";
import maplibregl from "maplibre-gl";

import getObjectLatLng from "src/utils/getObjectLatLng";

const moveObjectWithKeys = (
  e: KeyboardEvent,
  selectedObject: THREE.Object3D | undefined | null,
  map: maplibregl.Map
) => {
  map.keyboard.enable();

  const selectedInfo = document.getElementById("selected-object");

  if (selectedObject && selectedInfo) {
    // prevent map navigation
    map.keyboard.disable();

    switch (e.key) {
      case "ArrowUp":
        selectedObject?.translateZ(-1);
        break;
      case "ArrowDown":
        selectedObject?.translateZ(1);
        break;
      case "ArrowLeft":
        if (e.shiftKey) {
          selectedObject?.rotateY(0.01);
        } else {
          selectedObject?.translateX(-1);
        }
        break;
      case "ArrowRight":
        if (e.shiftKey) {
          selectedObject?.rotateY(-0.01);
        } else {
          selectedObject?.translateX(1);
        }
        break;
      case "Escape":
        selectedObject = null;
        break;
      default:
        break;
    }

    const geoCoords = getObjectLatLng(selectedObject);

    const cursorLatLng = JSON.stringify(
      {
        rotation: {
          y: selectedObject?.rotation.y,
        },
        geoCoordinates: {
          lng: geoCoords.lng,
          lat: geoCoords.lat,
        },
      },
      null,
      2
    );
    selectedInfo.innerHTML = `${cursorLatLng}`;
  }
};

export default moveObjectWithKeys;
