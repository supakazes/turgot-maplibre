import pathMapOverview from "src/images/Turgot_map_Paris_KU_general_map.jpg";
import pathMapSheet16 from "src/images/plan/sheet_16.jpg";
import pathMapSheet20 from "src/images/plan/sheet_20.jpg";

export interface MapSource {
  id: string;
  url: string;
  coordinates: [[number, number], [number, number], [number, number], [number, number]];
}

/**
 * map overview
 */
export const sourceMapOverview: MapSource = {
  id: "map-overview",
  url: pathMapOverview,
  coordinates: [
    [2.3989055128284917, 48.84931444633858], // top left
    [2.3439996398441565, 48.82166385552824], // top right
    [2.295201968782578, 48.864052878215034], // bottom right
    [2.3511927242244326, 48.89150953232166], // bottom left
  ],
};

/**
 * sheets sources
 */
export const sourceMapSheets: MapSource[] = [
  {
    id: "map-sheet-16",
    url: pathMapSheet16,
    coordinates: [
      [2.3292824300853, 48.85408708986108], // top left
      [2.3162456475627096, 48.84760492559468], // top right
      [2.3067023283321078, 48.85581305618609], // bottom right
      [2.3197292629912454, 48.86231455602578], // bottom left
    ],
  },
  {
    id: "map-sheet-20",
    url: pathMapSheet20,
    coordinates: [
      [2.31974225916872, 48.86231371468983], // top left
      [2.306700394418499, 48.855815277139044], // top right
      [2.29763368088868, 48.86360942824825], // bottom right
      [2.3106789944888533, 48.87005772736015], // bottom left
    ],
  },
];
