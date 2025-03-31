function guiMapLayersOpacity(gui: dat.GUI, map: maplibregl.Map) {
  const layer = {
    opacity: 0,
  };

  const opacityFolder = gui.addFolder("Raster Layers Opacity");

  opacityFolder
    .add(layer, "opacity", 0, 1, 0.01)
    .name("Map Overview")
    .onChange((value) => {
      map.setPaintProperty("map-overview", "raster-opacity", value);
    });

  opacityFolder
    .add(layer, "opacity", 0, 1, 0.01)
    .name("Map Sheets")
    .onChange((value) => {
      map.setPaintProperty("map-sheet-16", "raster-opacity", value);
      map.setPaintProperty("map-sheet-20", "raster-opacity", value);
    });

  opacityFolder.open();
}

export default guiMapLayersOpacity;
