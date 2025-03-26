export interface ModelDefinition {
  id: string;
  path: string;
  origin: { lng: number; lat: number };
  rotation: number;
}

export const modelsList: ModelDefinition[] = [
  {
    id: "house-1",
    path: "./src/models/house/house.glb",
    origin: { lng: 2.359989916741256, lat: 48.851052162943716 },
    rotation: 0.9,
  },
  {
    id: "house-2",
    path: "./src/models/house/house.glb",
    origin: { lng: 2.362784417090552, lat: 48.85142690508661 },
    rotation: 0.5,
  },
  {
    id: "house-3",
    path: "./src/models/house/house.glb",
    origin: { lng: 2.360932797829946, lat: 48.85244828197375 },
    rotation: 0.5,
  },
];
