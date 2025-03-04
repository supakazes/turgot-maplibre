import maplibregl, { AddLayerObject } from "maplibre-gl";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
// import { TransformControls } from "three/examples/jsm/controls/TransformControls";
import { MAPTILER_KEY } from "src/constants";
import { ModelDefinition, modelsList } from "src/models-list";
import { calculateDistanceMercatorToMeters } from "src/utils/calculateDistanceMercatorToMeters";

const sceneOrigin = new maplibregl.LngLat(2.3694596857951638, 48.88353262931881);

const map = new maplibregl.Map({
  container: "map",
  center: sceneOrigin,
  zoom: 18,
  pitch: 45,
  maxPitch: 80, // default 60
  bearing: -17.6, // rotation
  canvasContextAttributes: { antialias: true },
  style: `https://api.maptiler.com/maps/voyager/style.json?key=${MAPTILER_KEY}`,
});

const renderer = new THREE.WebGLRenderer({
  canvas: map.getCanvas(),
  context: map.getCanvas().getContext("webgl2") as WebGLRenderingContext,
  antialias: true,
});

async function loadModel(model: ModelDefinition) {
  const loader = new GLTFLoader();
  const gltf = await loader.loadAsync(model.path);
  const loadedModel = gltf.scene;

  // Getting model x and y (in meters) relative to scene origin.
  const sceneOriginMercator = maplibregl.MercatorCoordinate.fromLngLat(sceneOrigin);
  const modelLocation = new maplibregl.LngLat(model.origin.lng, model.origin.lat);
  const modelMercator = maplibregl.MercatorCoordinate.fromLngLat(modelLocation);
  const { dEastMeter, dNorthMeter } = calculateDistanceMercatorToMeters(
    sceneOriginMercator,
    modelMercator
  );

  // position model
  loadedModel.position.set(dEastMeter, 0, dNorthMeter);
  loadedModel.rotateY(model.rotation);

  return loadedModel;
}

async function modelsTerrain() {
  // Add zoom and rotation controls to the map.
  map.addControl(
    new maplibregl.NavigationControl({
      visualizePitch: true,
      visualizeRoll: true,
      showZoom: true,
      showCompass: true,
    })
  );

  // Custom layer for a 3D model, implementing `CustomLayerInterface`
  interface CustomLayerWith3DModels extends maplibregl.CustomLayerInterface {
    camera: THREE.Camera;
    scene: THREE.Scene;
  }

  const customLayerWith3DModels: CustomLayerWith3DModels = {
    id: "3d-models",
    type: "custom",
    renderingMode: "3d",
    camera: new THREE.Camera(),
    scene: new THREE.Scene(),

    async onAdd(map, gl) {
      // In threejs, y points up
      this.scene.rotateX(Math.PI / 2);

      // In threejs, z points toward the viewer - mirroring it such that z points along maplibre's north.
      this.scene.scale.multiply(new THREE.Vector3(1, 1, -1));

      // We now have a scene with (x=east, y=up, z=north)

      const light = new THREE.DirectionalLight(0xffffff);
      // Making it just before noon - light coming from south-east.
      light.position.set(50, 70, -30).normalize();
      this.scene.add(light);

      // Axes helper to show how threejs scene is oriented.
      const axesHelper = new THREE.AxesHelper(60);
      this.scene.add(axesHelper);

      // load and position models
      const loadedModels = await Promise.all(modelsList.map(loadModel));
      loadedModels.forEach((model) => this.scene?.add(model));

      renderer.autoClear = false;
    },

    render(gl, args) {
      const offsetFromCenterElevation = map.queryTerrainElevation(sceneOrigin) || 0;
      const sceneOriginMercator = maplibregl.MercatorCoordinate.fromLngLat(
        sceneOrigin,
        offsetFromCenterElevation
      );

      const sceneTransform = {
        translateX: sceneOriginMercator.x,
        translateY: sceneOriginMercator.y,
        translateZ: sceneOriginMercator.z,
        scale: sceneOriginMercator.meterInMercatorCoordinateUnits(),
      };

      const m = new THREE.Matrix4().fromArray(args.defaultProjectionData.mainMatrix);
      const l = new THREE.Matrix4()
        .makeTranslation(
          sceneTransform.translateX,
          sceneTransform.translateY,

          sceneTransform.translateZ
        )
        .scale(
          new THREE.Vector3(sceneTransform.scale, -sceneTransform.scale, sceneTransform.scale)
        );

      this.camera.projectionMatrix = m.multiply(l);
      renderer?.resetState();
      renderer?.render(this.scene, this.camera);
      map.triggerRepaint();
    },
  };

  map.on("load", () => {
    map.addLayer(customLayerWith3DModels);
  });

  map.on("mousemove", (e) => {
    const coordinatesElement = document.getElementById("coordinates");
    if (coordinatesElement) {
      const cursorLatLng = JSON.stringify(e.lngLat.wrap());
      coordinatesElement.innerHTML = `${cursorLatLng}`;
    }
  });

  map.on("click", (e) => {
    const cursorLatLng = e.lngLat.wrap();
    console.log("click", cursorLatLng);
    navigator.clipboard.writeText(JSON.stringify(cursorLatLng));
  });
}

export default modelsTerrain;
