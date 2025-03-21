import maplibregl from "maplibre-gl";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { MAPTILER_KEY } from "src/constants";
import { ModelDefinition, modelsList } from "src/models-list";
import { calculateDistanceMercatorToMeters } from "src/utils/calculateDistanceMercatorToMeters";

const sceneOrigin = new maplibregl.LngLat(2.370572296723708, 48.884197153165246);
let hoveredObject: THREE.Object3D | undefined | null;
let selectedObject: THREE.Object3D | undefined | null;

function getObjectLatLng(object: THREE.Object3D): maplibregl.LngLat {
  if (!object) return new maplibregl.LngLat(0, 0);

  // Get ThreeJS world position (x=east, z=north)
  const position = object.position;

  // Get scene origin in mercator coordinates
  const sceneOriginMercator = maplibregl.MercatorCoordinate.fromLngLat(sceneOrigin);

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

const map = new maplibregl.Map({
  container: "map",
  center: sceneOrigin,
  zoom: 17,
  pitch: 45,
  maxPitch: 80, // default 60
  bearing: -17.6, // rotation
  canvasContextAttributes: { antialias: true },
  style: `https://api.maptiler.com/maps/voyager/style.json?key=${MAPTILER_KEY}`,
});

// orthographic view (the lower the better)
map.setVerticalFieldOfView(1.1);

const renderer = new THREE.WebGLRenderer({
  canvas: map.getCanvas(),
  context: map.getCanvas().getContext("webgl2") as WebGLRenderingContext,
  antialias: true,
});

const loader = new GLTFLoader();

async function loadModel(model: ModelDefinition) {
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
  loadedModel.name = model.id;

  return loadedModel;
}

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
    raycaster: THREE.Raycaster;
    raycast: (point: { x: number; y: number }) => void;
    loadedModels: THREE.Object3D[];
    previousIntersectedObject?: THREE.Object3D;
  }

  const customLayerWith3DModels: CustomLayerWith3DModels = {
    id: "3d-models",
    type: "custom",
    renderingMode: "3d",

    raycaster: new THREE.Raycaster(),
    camera: new THREE.Camera(),
    scene: new THREE.Scene(),
    loadedModels: [],

    async onAdd(map, gl) {
      // In threejs, y points up
      this.scene.rotateX(Math.PI / 2);

      // In threejs, z points toward the viewer - mirroring it such that z points along maplibre's north.
      this.scene.scale.multiply(new THREE.Vector3(1, 1, -1));

      // We now have a scene with (x=east, y=up, z=north)

      // light coming from south-east.
      const light = new THREE.DirectionalLight(0xffffff);
      light.position.set(50, 70, -30).normalize();
      this.scene.add(light);

      // load and position models
      this.loadedModels = await Promise.all(modelsList.map(loadModel));
      this.loadedModels.forEach((model) => this.scene?.add(model));

      renderer.autoClear = false;
    },

    raycast({ x, y }) {
      const { width, height } = map.transform;
      const camInverseProjection = this.camera.projectionMatrix.clone().invert();
      const cameraPosition = new THREE.Vector3().applyMatrix4(camInverseProjection);
      const mousePosition = new THREE.Vector3(
        (x / width) * 2 - 1,
        1 - (y / height) * 2,
        1
      ).applyMatrix4(camInverseProjection);
      const viewDirection = mousePosition.sub(cameraPosition).normalize();

      this.raycaster.set(cameraPosition, viewDirection);

      // calculate objects intersecting the picking ray
      var intersects = this.raycaster.intersectObjects(this.loadedModels, true);
      if (intersects.length) {
        const intersectedObject = intersects[0].object as THREE.Mesh;
        const parent = getParentGroup(intersectedObject);
        hoveredObject = parent;

        // bigger
        parent.scale.set(1.2, 1.2, 1.2);

        this.previousIntersectedObject = parent;
      } else if (this.previousIntersectedObject) {
        hoveredObject = null;
        // Reset scale
        this.previousIntersectedObject.scale.set(1, 1, 1);
        this.previousIntersectedObject = undefined;
      }
    },

    render(gl, args) {
      const sceneOriginMercator = maplibregl.MercatorCoordinate.fromLngLat(sceneOrigin, 0);

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
    // raycast
    customLayerWith3DModels.raycast(e.point);

    console.log("selectedObject", selectedObject?.name);

    // show coordinates
    const coordinatesElement = document.getElementById("coordinates");
    if (coordinatesElement) {
      const cursorLatLng = JSON.stringify(e.lngLat.wrap(), null, 2);
      coordinatesElement.innerHTML = `${cursorLatLng}`;
    }
  });

  document.addEventListener("keydown", (e) => {
    // prevent map navigation
    map.stop();

    switch (e.key) {
      case "ArrowUp":
        selectedObject?.translateZ(-1);
        break;
      case "ArrowDown":
        selectedObject?.translateZ(1);
        break;
      case "ArrowLeft":
        if (e.shiftKey) {
          selectedObject?.rotateY(0.1);
        } else {
          selectedObject?.translateX(-1);
        }
        break;
      case "ArrowRight":
        if (e.shiftKey) {
          selectedObject?.rotateY(-0.1);
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

    // show selected object infos
    const selectedObjectElement = document.getElementById("selected-object");
    if (selectedObject && selectedObjectElement) {
      const geoCoords = getObjectLatLng(selectedObject);

      const cursorLatLng = JSON.stringify(
        {
          rotation: {
            y: selectedObject.rotation.y,
          },
          geoCoordinates: {
            lng: geoCoords.lng,
            lat: geoCoords.lat,
          },
        },
        null,
        2
      );
      selectedObjectElement.innerHTML = `${cursorLatLng}`;
    }
  });

  map.on("click", (e) => {
    const cursorLatLng = e.lngLat.wrap();
    console.log("click", cursorLatLng);

    if (hoveredObject) {
      selectedObject = hoveredObject;
    } else {
      selectedObject = null;
    }
    console.log("currentObject", hoveredObject?.name);
    navigator.clipboard.writeText(JSON.stringify(cursorLatLng));
  });
}

export default modelsTerrain;
