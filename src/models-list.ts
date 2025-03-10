export interface ModelDefinition {
  id: string;
  path: string;
  origin: { lng: number; lat: number };
  rotation: number;
}

export const modelsList: ModelDefinition[] = [
  {
    id: "house-1",
    path: "/src/models/house/house.glb",
    origin: { lng: 2.369540152077093, lat: 48.8834462031036 },
    rotation: 0.9,
  },
  {
    id: "house-2",
    path: "/src/models/house/house.glb",
    origin: { lng: 2.3686339204380147, lat: 48.88446609167394 },
    rotation: 0.5,
  },
  {
    id: "house-3",
    path: "/src/models/house/house.glb",
    origin: { lng: 2.371983100211537, lat: 48.88527557732877 },
    rotation: 0.5,
  },
];
