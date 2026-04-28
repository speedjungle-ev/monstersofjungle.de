import { defineConfig } from "vite";
import { sjWebCrate } from "./plugins/sj-web-crate/plugin.ts";
import { htmlPartials } from "./plugins/html-partials/plugin.ts";
import { renderArtistPage } from "./plugins/sj-web-crate/templates/renderArtistPage.ts";

const isDev = process.env.NODE_ENV !== "production";
const base = isDev ? "" : "/monstersofjungle.de/";
export default defineConfig({
  base,
  plugins: [
    htmlPartials({
      header: "src/partials/header.html",
      footer: "src/partials/footer.html",
    }),
    sjWebCrate({
      verbose: false,
      collections: [
        {
          name: "artist",
          dir: "content/artists",
          requiredFields: ["artistNameLabel", "gridOrder"],
          renderPage: renderArtistPage,
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
