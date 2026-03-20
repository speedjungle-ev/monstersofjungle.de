import { defineConfig } from "vite";
import vituum from "vituum";
import { sjWebCrate } from "./plugins/sj-web-crate/plugin.ts";

const isDev = process.env.NODE_ENV !== "production";
const base = isDev ? "" : "/monstersofjungle.de/";
export default defineConfig({
  base,
  plugins: [
    vituum(),
    sjWebCrate({
      verbose: false,
      collections: [
        {
          name: "artist",
          dir: "content/artists",
          requiredFields: ["artistNameLabel", "gridOrder"],
        },
      ],
    }),
  ],
});
