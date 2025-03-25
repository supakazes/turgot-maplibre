import maplibregl from "maplibre-gl";
import * as THREE from "three";

import { MAPTILER_KEY, SCENE_ORIGIN } from "src/constants";
import { modelsList } from "src/models-list";
import moveObjectWithKeys from "src/utils/moveObjectWithKeys";
import getParentGroup from "src/utils/getParentGroup";
import loadModel from "src/utils/loadModel";

let hoveredObject: THREE.Object3D | undefined | null;
let selectedObject: THREE.Object3D | undefined | null;

let imageCoordinates = [
  [2.3989055128284917, 48.84931444633858],
  [2.3439996398441565, 48.82166385552824],
  [2.295201968782578, 48.864052878215034],
  [2.3511927242244326, 48.89150953232166],
];

const map = new maplibregl.Map({
  container: "map",
  center: SCENE_ORIGIN,
  zoom: 17,
  pitch: 45,
  maxPitch: 80, // default 60
  bearing: 142.69415138998863, // rotation
  canvasContextAttributes: { antialias: true },
  style: `https://api.maptiler.com/maps/voyager/style.json?key=${MAPTILER_KEY}`,
});

// default: 36.87 || orthographic: 1.1
map.setVerticalFieldOfView(1.1);

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

async function modelsTerrain() {
  // Custom layer for a 3D model, implementing `CustomLayerInterface`
  interface CustomLayerWith3DModels extends maplibregl.CustomLayerInterface {
    camera: THREE.Camera;
    scene: THREE.Scene;
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

      threeRenderer.autoClear = false;
    },

    /**
     * raycast
     */
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

    /**
     * render
     */
    render(gl, args) {
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

      this.camera.projectionMatrix = m.multiply(l);
      threeRenderer?.resetState();
      threeRenderer?.render(this.scene, this.camera);
      map.triggerRepaint();
    },
  };

  /**
   * Event listeners
   */
  map.on("load", () => {
    map.addLayer(customLayerWith3DModels);

    map.addSource("overlay-source", {
      type: "image",
      url: "https://upload.wikimedia.org/wikipedia/commons/d/dc/Turgot_map_Paris_KU_general_map.jpg",
      coordinates: imageCoordinates as [
        [number, number],
        [number, number],
        [number, number],
        [number, number]
      ],
    });

    map.addLayer({
      id: "overlay-layer",
      type: "raster",
      source: "overlay-source",
      paint: {
        "raster-opacity": 0.3,
      },
    });
  });

  map.on("dragend", () => {
    console.log("bearing", map.getBearing());
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

  map.getCanvas().addEventListener("keydown", (e) => {
    moveObjectWithKeys(e, selectedObject, map);
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
