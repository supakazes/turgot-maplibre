import pathMapOverview from "src/images/Turgot_map_Paris_KU_general_map.jpg";
import pathMapSheet01 from "src/images/plan/sheet_01.jpg";
import pathMapSheet02 from "src/images/plan/sheet_02.jpg";
import pathMapSheet03 from "src/images/plan/sheet_03.jpg";
import pathMapSheet04 from "src/images/plan/sheet_04.jpg";
import pathMapSheet05 from "src/images/plan/sheet_05.jpg";
import pathMapSheet06 from "src/images/plan/sheet_06.jpg";
import pathMapSheet07 from "src/images/plan/sheet_07.jpg";
import pathMapSheet08 from "src/images/plan/sheet_08.jpg";
import pathMapSheet09 from "src/images/plan/sheet_09.jpg";
import pathMapSheet10 from "src/images/plan/sheet_10.jpg";
import pathMapSheet11 from "src/images/plan/sheet_11.jpg";
import pathMapSheet12 from "src/images/plan/sheet_12.jpg";
import pathMapSheet13 from "src/images/plan/sheet_13.jpg";
import pathMapSheet14 from "src/images/plan/sheet_14.jpg";
import pathMapSheet15 from "src/images/plan/sheet_15.jpg";
import pathMapSheet16 from "src/images/plan/sheet_16.jpg";
import pathMapSheet17 from "src/images/plan/sheet_17.jpg";
import pathMapSheet18 from "src/images/plan/sheet_18.jpg";
import pathMapSheet19 from "src/images/plan/sheet_19.jpg";
import pathMapSheet20 from "src/images/plan/sheet_20.jpg";

export interface MapSource {
  id: string;
  url: string;
  coordinates: [[number, number], [number, number], [number, number], [number, number]];
}

/**
 * sheets sources
 */
export const sourceMapSheets: MapSource[] = [
  {
    id: "map-sheet-01",
    url: pathMapSheet01,
    coordinates: [
      [2.3963322061435974, 48.84979870759503], // top left
      [2.383706721858289, 48.843269713728375], // top right
      [2.374712738088192, 48.851235668983264], // bottom right
      [2.3874429880834214, 48.85768682742972], // bottom left
    ],
  },
  {
    id: "map-sheet-02",
    url: pathMapSheet02,
    coordinates: [
      [2.383706721858289, 48.843269713728375], // top left
      [2.3704721566745093, 48.83649830627721], // top right
      [2.3614423542593386, 48.844404329967034], // bottom right
      [2.374712738088192, 48.851235668983264], // bottom left
    ],
  },
  {
    id: "map-sheet-03",
    url: pathMapSheet03,
    coordinates: [
      [2.3704721566745093, 48.83649830627721], // top left
      [2.35693846497486, 48.829778686262785], // top right
      [2.348141791569333, 48.83764204344351], // bottom right
      [2.3614423542593386, 48.844404329967034], // bottom left
    ],
  },
  {
    id: "map-sheet-04",
    url: pathMapSheet04,
    coordinates: [
      [2.35693846497486, 48.829778686262785], // top left
      [2.3441248547825353, 48.82338567930182], // top right
      [2.3351585301353452, 48.83122114892299], // bottom right
      [2.348141791569333, 48.83764204344351], // bottom left
    ],
  },
  {
    id: "map-sheet-05",
    url: pathMapSheet05,
    coordinates: [
      [2.3874429880834214, 48.85768682742972], // top left
      [2.374701812832541, 48.85124894312318], // top right
      [2.365488063287671, 48.85936927711879], // bottom right
      [2.378181093210628, 48.865853264938465], // bottom left
    ],
  },
  {
    id: "map-sheet-06",
    url: pathMapSheet06,
    coordinates: [
      [2.374701812832541, 48.85124894312318], // top left
      [2.3614423542593386, 48.844404329967034], // top right
      [2.352151537057921, 48.85258604938642], // bottom right
      [2.365488063287671, 48.85936927711879], // bottom left
    ],
  },
  {
    id: "map-sheet-07",
    url: pathMapSheet07,
    coordinates: [
      [2.3614423542593386, 48.844404329967034], // top left
      [2.348131466153177, 48.83764589658304], // top right
      [2.338812914360915, 48.84585393612298], // bottom right
      [2.352151537057921, 48.85258604938642], // bottom left
    ],
  },
  {
    id: "map-sheet-08",
    url: pathMapSheet08,
    coordinates: [
      [2.348131466153177, 48.83764589658304], // top left
      [2.3351585301353452, 48.83122114892299], // top right
      [2.3257350212738856, 48.839405196173544], // bottom right
      [2.338812914360915, 48.84585393612298], // bottom left
    ],
  },
  {
    id: "map-sheet-09",
    url: pathMapSheet09,
    coordinates: [
      [2.378168954424723, 48.86566587382049], // top left
      [2.3651447076940713, 48.859170844687156], // top right
      [2.35619784572782, 48.86738628754438], // bottom right
      [2.369116245186092, 48.87356052049839], // bottom left
    ],
  },
  {
    id: "map-sheet-10",
    url: pathMapSheet10,
    coordinates: [
      [2.365488063287671, 48.85936927711879], // top left
      [2.352151537057921, 48.85258604938642], // top right
      [2.342860719856504, 48.8607677688058], // bottom right
      [2.356197246086254, 48.86755099653717], // bottom left
    ],
  },
  {
    id: "map-sheet-11",
    url: pathMapSheet11,
    coordinates: [
      [2.352151537057921, 48.85258604938642], // top left
      [2.338812914360915, 48.84585393612298], // top right
      [2.329280634126235, 48.85409350695724], // bottom right
      [2.3426747174011098, 48.86081419822986], // bottom left
    ],
  },
  {
    id: "map-sheet-12",
    url: pathMapSheet12,
    coordinates: [
      [2.338812914360915, 48.84585393612298], // top left
      [2.3257350212738856, 48.839405196173544], // top right
      [2.316311512412426, 48.8475892434241], // bottom right
      [2.329389405499455, 48.85403898337354], // bottom left
    ],
  },
  {
    id: "map-sheet-13",
    url: pathMapSheet13,
    coordinates: [
      [2.368968343665758, 48.87397359893408], // top left
      [2.3561992019244826, 48.86755611519288], // top right
      [2.3468129253870984, 48.875762190858495], // bottom right
      [2.3596915891348544, 48.88218691319517], // bottom left
    ],
  },
  {
    id: "map-sheet-14",
    url: pathMapSheet14,
    coordinates: [
      [2.3562041415119666, 48.867554409331206], // top left
      [2.3426838445045632, 48.860806219816794], // top right
      [2.333140490304345, 48.86901813043764], // bottom right
      [2.346907428884837, 48.87573271595655], // bottom left
    ],
  },
  {
    id: "map-sheet-15",
    url: pathMapSheet15,
    coordinates: [
      [2.3426865157761085, 48.860815787190916], // top left
      [2.329273686214833, 48.85410050884656], // top right
      [2.319726378543237, 48.86232148676618], // bottom right
      [2.3331476273242515, 48.8690134592257], // bottom left
    ],
  },
  {
    id: "map-sheet-16",
    url: pathMapSheet16,
    coordinates: [
      [2.329272691435108, 48.85409647890489], // top left
      [2.316240396087551, 48.84759927324919], // top right
      [2.306701412054963, 48.855812685218694], // bottom right
      [2.319723253341863, 48.86232434166155], // bottom left
    ],
  },
  {
    id: "map-sheet-17",
    url: pathMapSheet17,
    coordinates: [
      [2.3596893935917933, 48.88218814801033], // top left
      [2.3468142356114186, 48.87576729904751], // top right
      [2.337922233906852, 48.88349870885267], // bottom right
      [2.3508892083926867, 48.88982596465334], // bottom left
    ],
  },
  {
    id: "map-sheet-18",
    url: pathMapSheet18,
    coordinates: [
      [2.3468142356114186, 48.87576729904751], // top left
      [2.333139758439529, 48.86902351094764], // top right
      [2.324230305752053, 48.87677922416225], // bottom right
      [2.337922233906852, 48.88349870885267], // bottom left
    ],
  },
  {
    id: "map-sheet-19",
    url: pathMapSheet19,
    coordinates: [
      [2.333135494103658, 48.86902242573814], // top left
      [2.3197226776462685, 48.86232019065895], // top right
      [2.310686259322324, 48.87006688469529], // bottom right
      [2.3242447824436567, 48.87677326368325], // bottom left
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
