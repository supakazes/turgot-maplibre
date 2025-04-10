import maplibregl from "maplibre-gl";
import * as dat from "dat.gui";
import * as THREE from "three";
import Stats from "stats.js";

import { MAPTILER_KEY, SCENE_ORIGIN } from "src/constants";
import { modelsList } from "src/models-list";
import moveObjectWithKeys from "src/utils/moveObjectWithKeys";
import getParentGroup from "src/utils/getParentGroup";
import loadModel from "src/utils/loadModel";
import { sourceMapSheets } from "src/mapRasterSources";
import guiMapLayersOpacity from "src/utils/guiMapLayersOpacity";
import addSourceAndLayer from "src/utils/addSourceAndLayer";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { DotScreenPass } from "three/examples/jsm/postprocessing/DotScreenPass";

let mapIsMoving = false;
const stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

let hoveredObject: THREE.Object3D | undefined | null;
let selectedObject: THREE.Object3D | undefined | null;

const map = new maplibregl.Map({
  container: "map",
  center: SCENE_ORIGIN,
  zoom: 16,
  pitch: 45,
  maxPitch: 80, // default 60
  bearing: 142.69415138998863, // rotation
  canvasContextAttributes: { antialias: true },
  /**
   * styles:
   * backdrop-light: black and white
   * basic-v2-light: gray and white
   * voyager: pastel
   * toner-v2-lite
   * dataviz-light
   * */
  style: `https://api.maptiler.com/maps/toner-v2-lite/style.json?key=${MAPTILER_KEY}`,
});

// default: 36.87 || orthographic: 1.1
map.setVerticalFieldOfView(1.1);
const gui = new dat.GUI({ width: 300 });

const threeRenderer = new THREE.WebGLRenderer({
  canvas: map.getCanvas(),
  context: map.getCanvas().getContext("webgl2") as WebGLRenderingContext,
  antialias: true,
});

map.addControl(
  new maplibregl.NavigationControl({
    visualizePitch: true,
    visualizeRoll: true,
    showZoom: true,
    showCompass: true,
  })
);

const scene = new THREE.Scene();
const camera = new THREE.Camera();

/**
 * Post processing
 */
var width = window.innerWidth || 1;
var height = window.innerHeight || 1;
var parameters = {
  minFilter: THREE.LinearFilter,
  magFilter: THREE.LinearFilter,
  format: THREE.RGBAFormat,
  stencilBuffer: false,
};

var renderTarget = new THREE.WebGLRenderTarget(width, height, parameters);

// todo: try without passing renderTarget (it may be unnecessary)
const effectComposer = new EffectComposer(threeRenderer, renderTarget);
effectComposer.setSize(map.getCanvas().width, map.getCanvas().height);
effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * first pass
 */
const renderPass = new RenderPass(scene, camera);
renderPass.clear = true; // ensures that each frame starts with a clean slate before rendering the new scene position, eliminating the trailing images.
effectComposer.addPass(renderPass);

/**
 * test pass
 */
const dotScreenPass = new DotScreenPass();
dotScreenPass.material.transparent = true; // background transparent
effectComposer.addPass(dotScreenPass);

async function modelsTerrain() {
  // Custom layer for a 3D model, implementing `CustomLayerInterface`
  interface CustomLayerWith3DModels extends maplibregl.CustomLayerInterface {
    raycaster: THREE.Raycaster;
    raycast: (point: { x: number; y: number }) => void;
    loadedModels: THREE.Object3D[];
    previousIntersectedObject?: THREE.Object3D;
  }

  /**
   * 3D Layer
   */
  const customLayerWith3DModels: CustomLayerWith3DModels = {
    id: "3d-models",
    type: "custom",
    renderingMode: "3d",

    raycaster: new THREE.Raycaster(),

    loadedModels: [],

    async onAdd(map, gl) {
      // In threejs, y points up
      scene.rotateX(Math.PI / 2);

      // In threejs, z points toward the viewer - mirroring it such that z points along maplibre's north.
      scene.scale.multiply(new THREE.Vector3(1, 1, -1));

      // We now have a scene with (x=east, y=up, z=north)

      // light coming from south-east.
      const light = new THREE.DirectionalLight(0xffffff);
      light.position.set(50, 70, -30).normalize();
      scene.add(light);

      // load and position models
      this.loadedModels = await Promise.all(modelsList.map(loadModel));
      this.loadedModels.forEach((model) => scene?.add(model));

      threeRenderer.autoClear = false;
    },

    /**
     * raycast
     */
    raycast({ x, y }) {
      const { width, height } = map.transform;
      const camInverseProjection = camera.projectionMatrix.clone().invert();
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

    /**
     * render
     */
    render(gl, args) {
      stats.begin();
      const sceneOriginMercator = maplibregl.MercatorCoordinate.fromLngLat(SCENE_ORIGIN, 0);

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

      camera.projectionMatrix = m.multiply(l);
      threeRenderer?.resetState();

      // threeRenderer.render(scene, camera);
      if (mapIsMoving) {
        threeRenderer.render(scene, camera);
      } else {
        effectComposer.render();
      }

      stats.end();
    },
  };

  /**
   * Map events
   */
  map.on("load", () => {
    // map overview layer
    // addSourceAndLayer(map, sourceMapOverview);

    // map sheets layers
    sourceMapSheets.forEach((source) => addSourceAndLayer(map, source));

    // 3D layer
    map.addLayer(customLayerWith3DModels);

    // gui
    guiMapLayersOpacity(gui, map);
  });

  map.on("movestart", () => {
    mapIsMoving = true;
  });
  map.on("moveend", () => {
    mapIsMoving = false;
  });

  /**
   * Map mousemove
   */
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

  /**
   * Map keydown
   */
  map.getCanvas().addEventListener("keydown", (e) => {
    moveObjectWithKeys(e, selectedObject, map);
  });

  /**
   * Map click
   */
  map.on("click", (e) => {
    const cursorLatLng = e.lngLat.wrap();
    console.log("click", cursorLatLng);

    if (hoveredObject) {
      selectedObject = hoveredObject;
    } else {
      selectedObject = null;
    }
    console.log("currentObject", hoveredObject?.name);
    navigator.clipboard.writeText(JSON.stringify([cursorLatLng.lng, cursorLatLng.lat]));
  });
}

export default modelsTerrain;
