import house from "src/models/house/house.glb";
import pontDeLaTournelle from "src/models/pont-de-la-tournelle.glb";

export interface ModelDefinition {
  id: string;
  path: string;
  origin: { lng: number; lat: number };
  rotation: number;
}

export const modelsList: ModelDefinition[] = [
  {
    id: "house-1",
    path: house,
    origin: { lng: 2.359989916741256, lat: 48.851052162943716 },
    rotation: 0.9,
  },
  {
    id: "house-2",
    path: house,
    origin: { lng: 2.362784417090552, lat: 48.85142690508661 },
    rotation: 0.5,
  },
  {
    id: "pont-de-la-tournelle",
    path: pontDeLaTournelle,
    origin: {
      lng: 2.355499886584994,
      lat: 48.85067371517877,
    },
    rotation: 1.5399999999999605,
  },
];
