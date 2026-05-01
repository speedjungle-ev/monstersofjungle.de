import { defineConfig } from "vite";
import { sjWebCrate } from "./plugins/sj-web-crate/plugin.ts";
import { artistPageData } from "./src/collections/artist.ts";

const isDev = process.env.NODE_ENV !== "production";
const base = isDev ? "" : "/monstersofjungle.de/";
export default defineConfig({
  base,
  plugins: [
    sjWebCrate({
      verbose: false,
      siteName: "Monsters of Jungle",
      locale: "de-DE",
      partials: {
        header: "src/partials/header.html",
        footer: "src/partials/footer.html",
      },
      collections: [
        {
          name: "artist",
          dir: "content/artists",
          requiredFields: ["artistNameLabel", "gridOrder"],
          pageTemplate: "src/layouts/artist.html",
          partialsDir: "src/partials",
          pageData: artistPageData,
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
