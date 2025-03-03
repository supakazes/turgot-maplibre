export interface ModelDefinition {
  path: string;
  origin: { lng: number; lat: number };
}

export const modelsList: ModelDefinition[] = [
  {
    path: "/src/models/barriere_saint-martin_or_rotonde_de_stalingrad/scene.gltf",
    origin: { lng: 2.3695243103564962, lat: 48.88343284527224 },
  },
  {
    path: "/src/models/matilda/scene.gltf",
    origin: { lng: 2.370598777169562, lat: 48.885831619533406 },
  },
];
