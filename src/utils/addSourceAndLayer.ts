import { MapSource } from "src/mapRasterSources";

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
      "raster-opacity": 0.5,
    },
  });
};
export default addSourceAndLayer;
