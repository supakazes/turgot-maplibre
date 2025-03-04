export interface ModelDefinition {
  path: string;
  origin: { lng: number; lat: number };
  rotation: number;
}

export const modelsList: ModelDefinition[] = [
  {
    path: "/src/models/house/house.glb",
    origin: { lng: 2.369540152077093, lat: 48.8834462031036 },
    rotation: 0.9,
  },
  {
    path: "/src/models/house/house.glb",
    origin: { lng: 2.3686339204380147, lat: 48.88446609167394 },
    rotation: 0.5,
  },
  {
    path: "/src/models/house/house.glb",
    origin: { lng: 2.371983100211537, lat: 48.88527557732877 },
    rotation: 0.5,
  },
];
