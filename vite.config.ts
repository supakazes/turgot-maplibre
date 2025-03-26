import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  base: "",
  assetsInclude: ["**/*.glb", "**/*.jpg", "**/*.jpeg"], // handle .glb files as assets
  resolve: {
    alias: {
      src: path.resolve(__dirname, "src"),
    },
  },
});
