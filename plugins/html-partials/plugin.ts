import type { Plugin, ResolvedConfig } from "vite";
import { readFileSync } from "fs";
import { resolve } from "path";

export function htmlPartials(): Plugin {
  let config: ResolvedConfig;

  return {
    name: "html-partials",
    configResolved(resolved) {
      config = resolved;
    },
    transformIndexHtml: {
      order: "pre",
      handler(html) {
        const base = config.base ?? "/";
        const buildDate = new Date().toLocaleDateString("de-DE");

        const header = readFileSync(
          resolve(config.root, "src/pages/templates/header.html"),
          "utf-8",
        );
        const footer = readFileSync(
          resolve(config.root, "src/pages/templates/footer.html"),
          "utf-8",
        )
          .replaceAll("{{base}}", base)
          .replace("{{buildDate}}", buildDate);

        return html
          .replace("<header></header>", `<header>\n${header}\n</header>`)
          .replace("<footer></footer>", `<footer>\n${footer}\n</footer>`);
      },
    },
  };
}