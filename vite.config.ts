import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  base: "./",
  resolve: {
    alias: {
      src: path.resolve(__dirname, "src"),
    },
  },
});
