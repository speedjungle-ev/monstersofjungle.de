import { defineConfig } from "vite";
import { sjWebCrate } from "./plugins/sj-web-crate/plugin.ts";
import { artistPageData } from "./src/crates/artist.ts";
import { indexPageData } from "./src/pages/index.ts";

const isDev = process.env.NODE_ENV !== "production";
const base = isDev ? "" : "/monstersofjungle.de/";
export default defineConfig({
  base,
  plugins: [
    sjWebCrate({
      verbose: false,
      siteName: "Monsters of Jungle",
      locale: "de-DE",
      partialsDir: "src/partials",
      partials: {
        meta: "src/partials/head-meta.html",
        header: "src/partials/header.html",
        footer: "src/partials/footer.html",
      },
      pages: [{ match: "index.html", pageData: indexPageData }],
      crates: [
        {
          name: "artist",
          dir: "content/artists",
          requiredFields: ["artistNameLabel", "gridOrder"],
          pageTemplate: "src/layouts/artist.html",
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
