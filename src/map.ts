import maplibregl, { AddLayerObject } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const MAPTILER_KEY = "Lr1q5wml4SB6TlSXbQrJ";

const models: { path: string; origin: { lng: number; lat: number } }[] = [
  {
    path: "/src/models/barriere_saint-martin_or_rotonde_de_stalingrad/scene.gltf",
    origin: { lng: 2.3695243103564962, lat: 48.88343284527224 },
  },
  {
    path: "/src/models/matilda/scene.gltf",
    origin: { lng: 2.370598777169562, lat: 48.885831619533406 },
  },
];

const buildings3DLayer: AddLayerObject = {
  id: "3d-buildings",
  source: "openmaptiles",
  "source-layer": "building",
  type: "fill-extrusion",
  minzoom: 15,
  filter: ["!=", ["get", "hide_3d"], true],
  paint: {
    "fill-extrusion-color": [
      "interpolate",
      ["linear"],
      ["get", "render_height"],
      0,
      "lightgray",
      200,
      "royalblue",
      400,
      "lightblue",
    ],
    "fill-extrusion-height": [
      "interpolate",
      ["linear"],
      ["zoom"],
      15,
      0,
      16,
      ["get", "render_height"],
    ],
    "fill-extrusion-base": ["case", [">=", ["get", "zoom"], 16], ["get", "render_min_height"], 0],
  },
};

const getModelMatrix = (modelOrigin) => {
  // parameters to ensure the model is georeferenced correctly on the map

  const modelAltitude = 0;
  const modelRotate = [Math.PI / 2, 0, 0];

  const modelAsMercatorCoordinate = maplibregl.MercatorCoordinate.fromLngLat(
    modelOrigin,
    modelAltitude
  );

  // transformation parameters to position, rotate and scale the 3D model onto the map
  const modelTransform = {
    translateX: modelAsMercatorCoordinate.x,
    translateY: modelAsMercatorCoordinate.y,
    translateZ: modelAsMercatorCoordinate.z,
    rotateX: modelRotate[0],
    rotateY: modelRotate[1],
    rotateZ: modelRotate[2],
    /* Since our 3D model is in real world meters, a scale transform needs to be
     * applied since the CustomLayerInterface expects units in MercatorCoordinates.
     */
    scale: modelAsMercatorCoordinate.meterInMercatorCoordinateUnits(),
  };
  const rotationX = new THREE.Matrix4().makeRotationAxis(
    new THREE.Vector3(1, 0, 0),
    modelTransform.rotateX
  );
  const rotationY = new THREE.Matrix4().makeRotationAxis(
    new THREE.Vector3(0, 1, 0),
    modelTransform.rotateY
  );
  const rotationZ = new THREE.Matrix4().makeRotationAxis(
    new THREE.Vector3(0, 0, 1),
    modelTransform.rotateZ
  );

  return new THREE.Matrix4()
    .makeTranslation(
      modelTransform.translateX,
      modelTransform.translateY,
      modelTransform.translateZ
    )
    .scale(new THREE.Vector3(modelTransform.scale, -modelTransform.scale, modelTransform.scale))
    .multiply(rotationX)
    .multiply(rotationY)
    .multiply(rotationZ);
};

const Map = () => {
  // Map
  const map = new maplibregl.Map({
    container: "map", // container id
    style: `https://api.maptiler.com/maps/basic-v2/style.json?key=${MAPTILER_KEY}`,
    center: [2.3694596857951638, 48.88353262931881],
    zoom: 17, // starting zoom
    pitch: 45,
    bearing: -17.6,
    canvasContextAttributes: { antialias: true },
  });

  // configuration of the custom layer for a 3D model per the CustomLayerInterface
  const modelsLayer: AddLayerObject = {
    id: "map3dLayer",
    type: "custom",
    renderingMode: "3d",
    onAdd(map, gl) {
      this.camera = new THREE.Camera();
      this.scene = new THREE.Scene();

      // light 1
      const directionalLight = new THREE.DirectionalLight(0xffffff);
      directionalLight.position.set(0, -70, 100).normalize();
      this.scene.add(directionalLight);

      // light 2
      const directionalLight2 = new THREE.DirectionalLight(0xffffff);
      directionalLight2.position.set(0, 70, 100).normalize();
      this.scene.add(directionalLight2);

      // load models
      const loader = new GLTFLoader();

      models.forEach((model) =>
        loader.load(model.path, (gltf) => {
          this.scene.add(gltf.scene);
        })
      );

      this.map = map;
      (gltf) => {
        this.scene.add(gltf.scene);
      };
      // render
      this.renderer = new THREE.WebGLRenderer({
        canvas: map.getCanvas(),
        context: gl,
        antialias: true,
      });

      this.renderer.autoClear = false;
    },
    render(gl, args) {
      const mainMatrix = new THREE.Matrix4().fromArray(args.defaultProjectionData.mainMatrix);

      const model0Matrix = getModelMatrix(models[0].origin);
      const model1Matrix = getModelMatrix(models[1].origin);

      // Set projection matrix and render model 0
      this.camera.projectionMatrix = mainMatrix.multiply(model0Matrix);
      this.renderer.resetState();
      this.renderer.render(this.scene, this.camera);

      // Set projection matrix and render model 1
      this.camera.projectionMatrix = mainMatrix.multiply(model1Matrix);
      this.renderer.resetState();
      this.renderer.render(this.scene, this.camera);

      this.map.triggerRepaint();
    },
  };

  map.on("load", () => {
    // Insert the layer beneath any symbol layer.
    const layers = map.getStyle().layers;

    let lastSymbolLayerId;
    for (let i = 0; i < layers.length; i++) {
      if (layers[i].type === "symbol" && layers[i].layout["text-field"]) {
        lastSymbolLayerId = layers[i].id;
        break;
      }
    }

    map.addSource("openmaptiles", {
      url: `https://api.maptiler.com/tiles/v3/tiles.json?key=${MAPTILER_KEY}`,
      type: "vector",
    });

    map.addLayer(buildings3DLayer, lastSymbolLayerId);
  });

  map.on("style.load", () => {
    map.addLayer(modelsLayer);
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
};

export default Map;
