import maplibregl from "maplibre-gl";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { TransformControls } from "three/examples/jsm/controls/TransformControls";
import { MAPTILER_KEY } from "src/constants";
import { ModelDefinition, modelsList } from "src/models-list";
import { calculateDistanceMercatorToMeters } from "src/utils/calculateDistanceMercatorToMeters";

const sceneOrigin = new maplibregl.LngLat(2.370572296723708, 48.884197153165246);

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

let transformControls: TransformControls | undefined = undefined;
// orthographic view (the lower the better)
// map.setVerticalFieldOfView(1.1);

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
    camera: new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 10000),
    scene: new THREE.Scene(),
    loadedModels: [],

    async onAdd(map, gl) {
      // In threejs, y points up
      // this.scene.rotateX(Math.PI / 2);

      // In threejs, z points toward the viewer - mirroring it such that z points along maplibre's north.
      // this.scene.scale.multiply(new THREE.Vector3(1, 1, -1));

      // We now have a scene with (x=east, y=up, z=north)

      // light coming from south-east.
      const light = new THREE.DirectionalLight(0xffffff);
      light.position.set(50, 70, -30).normalize();
      this.scene.add(light);

      // load and position models
      this.loadedModels = await Promise.all(modelsList.map(loadModel));
      this.loadedModels.forEach((model) => this.scene?.add(model));

      // Transform controls
      transformControls = new TransformControls(this.camera, map.getCanvas());
      transformControls.addEventListener("change", () => {
        renderer.render(this.scene, this.camera);
      });
      // map.dragPan.enable(false);

      transformControls.addEventListener("dragging-changed", function (event) {
        console.log("dragging-changed", event);
      });
      this.scene.add(transformControls.getHelper());

      transformControls.addEventListener("objectChange", function () {
        console.log("objectChange");
      });

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

        // bigger
        parent.scale.set(1.2, 1.2, 1.2);

        transformControls?.attach(intersectedObject);
        this.previousIntersectedObject = parent;
      } else if (this.previousIntersectedObject) {
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

    // show coordinates
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

    transformControls?.detach();
  });
}

export default modelsTerrain;
