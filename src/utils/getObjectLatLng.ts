import * as THREE from "three";
import maplibregl from "maplibre-gl";
import { SCENE_ORIGIN } from "src/constants";

export default function getObjectLatLng(object: THREE.Object3D | null): maplibregl.LngLat {
  if (!object) return new maplibregl.LngLat(0, 0);

  // Get ThreeJS world position (x=east, z=north)
  const position = object.position;

  // Get scene origin in mercator coordinates
  const sceneOriginMercator = maplibregl.MercatorCoordinate.fromLngLat(SCENE_ORIGIN);

  // Calculate mercator offsets from meters
  // This is the reverse of the calculation in loadModel
  const mercatorPerMeter = sceneOriginMercator.meterInMercatorCoordinateUnits();
  const offsetMercatorX = position.x * mercatorPerMeter;
  const offsetMercatorZ = position.z * mercatorPerMeter;

  // Create new mercator coordinate by adding the offsets
  const objectMercator = {
    x: sceneOriginMercator.x + offsetMercatorX,
    y: sceneOriginMercator.y - offsetMercatorZ, // Negate Z since north is negative in mercator Y
    z: sceneOriginMercator.z,
  };

  // Convert back to LngLat
  return new maplibregl.MercatorCoordinate(
    objectMercator.x,
    objectMercator.y,
    objectMercator.z
  ).toLngLat();
}
