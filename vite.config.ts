import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  resolve: {
    alias: {
      // '@config': '/src/config',
      src: "/src",
    },
  },
});
