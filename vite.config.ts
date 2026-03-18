import { defineConfig } from "vite";
import vituum from "vituum";
import { sjWebCrate } from "./src/plugins/sj-web-crate/plugin.ts";

const isDev = process.env.NODE_ENV !== "production";
const base = isDev ? "" : "/monstersofjungle.de/";
export default defineConfig({
  base,
  plugins: [
    vituum(),
    sjWebCrate({
      collections: [
        {
          name: "artist",
          dir: "src/artist",
          requiredFields: ["artistNameLabel", "gridOrder"],
        },
      ],
    }),
  ],
});
