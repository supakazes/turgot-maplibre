export interface ModelDefinition {
  path: string;
  origin: { lng: number; lat: number };
  rotation: number;
}

export const modelsList: ModelDefinition[] = [
  {
    path: "/src/models/barriere_saint-martin_or_rotonde_de_stalingrad/scene.gltf",
    origin: { lng: 2.369540152077093, lat: 48.8834462031036 },
    rotation: 0.9,
  },
  {
    path: "/src/models/house/house.glb",
    origin: { lng: 2.3686339204380147, lat: 48.88446609167394 },
    rotation: 0.5,
  },
];
