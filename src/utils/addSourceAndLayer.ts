import { MapSource } from "src/mapRasterSources";
import { SHEET_LAYER } from "src/utils/guiMapLayersOpacity";

const addSourceAndLayer = (map: maplibregl.Map, source: MapSource) => {
  map.addSource(source.id, {
    type: "image",
    url: source.url,
    coordinates: source.coordinates,
  });

  map.addLayer({
    id: source.id,
    type: "raster",
    source: source.id,
    paint: {
      "raster-opacity": SHEET_LAYER.opacity,
    },
  });
};
export default addSourceAndLayer;
