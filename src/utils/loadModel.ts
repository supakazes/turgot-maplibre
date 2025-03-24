import * as THREE from "three";
import maplibregl from "maplibre-gl";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { SCENE_ORIGIN } from "src/constants";
import { calculateDistanceMercatorToMeters } from "src/utils/calculateDistanceMercatorToMeters";
import { ModelDefinition } from "src/models-list";

const loader = new GLTFLoader();

async function loadModel(model: ModelDefinition) {
  const gltf = await loader.loadAsync(model.path);
  const loadedModel = gltf.scene;

  // Getting model x and y (in meters) relative to scene origin.
  const sceneOriginMercator = maplibregl.MercatorCoordinate.fromLngLat(SCENE_ORIGIN);
  const modelLocation = new maplibregl.LngLat(model.origin.lng, model.origin.lat);
  const modelMercator = maplibregl.MercatorCoordinate.fromLngLat(modelLocation);
  const { dEastMeter, dNorthMeter } = calculateDistanceMercatorToMeters(
    sceneOriginMercator,
    modelMercator
  );

  // position model
  loadedModel.position.set(dEastMeter, 0, dNorthMeter);
  loadedModel.rotateY(model.rotation);
  loadedModel.name = model.id;

  return loadedModel;
}

export default loadModel;
