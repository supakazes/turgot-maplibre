import { sourceMapSheets } from "src/mapRasterSources";

export const SHEET_LAYER = {
  opacity: 0.5,
};

function guiMapLayersOpacity(gui: dat.GUI, map: maplibregl.Map) {
  const opacityFolder = gui.addFolder("Raster Layers Opacity");

  // opacityFolder
  //   .add(SHEET_LAYER, "opacity", 0, 1, 0.01)
  //   .name("Map Overview")
  //   .onChange((value) => {
  //     map.setPaintProperty("map-overview", "raster-opacity", value);
  //   });

  opacityFolder
    .add(SHEET_LAYER, "opacity", 0, 1, 0.01)
    .name("Map Sheets")
    .onChange((value) => {
      sourceMapSheets.forEach((source) => {
        map.setPaintProperty(source.id, "raster-opacity", value);
      });
    });

  opacityFolder.open();
}

export default guiMapLayersOpacity;
