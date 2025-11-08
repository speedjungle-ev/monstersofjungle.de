import { defineConfig } from "vite";
import path from "node:path";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
        artist: path.resolve(__dirname, "artist-profile.html"),
      },
    },
  },
});
