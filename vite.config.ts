import { defineConfig } from "vite";
import vituum from "vituum";
import nunjucks from "@vituum/vite-plugin-nunjucks";
import { sjWebCrate } from "./plugins/sj-web-crate/plugin.ts";

const isDev = process.env.NODE_ENV !== "production";
const base = isDev ? "" : "/monstersofjungle.de/";
export default defineConfig({
  base,
  plugins: [
    vituum(),
    nunjucks(),
    sjWebCrate({
      verbose: false,
      collections: [
        {
          name: "artist",
          dir: "content/artists",
          requiredFields: ["artistNameLabel", "gridOrder"],
          pageTemplate: "src/pages/artist.njk",
        },
        {
          name: "upcoming-event",
          dir: "content/events",
          requiredFields: ["flyer"],
        },
      ],
    }),
    {
      name: "log-config",
      configResolved(config) {
        console.log("options", config.optimizeDeps.rolldownOptions);
      },
    },
  ],
});
