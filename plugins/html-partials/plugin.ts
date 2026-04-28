import type { Plugin, ResolvedConfig } from "vite";
import { readFileSync } from "fs";
import { resolve } from "path";

interface HtmlPartialsOptions {
  header?: string;
  main?: string;
  footer?: string;
}

export function htmlPartials(options: HtmlPartialsOptions): Plugin {
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

        const tags = ["header", "main", "footer"] as const;

        for (const tag of tags) {
          const file = options[tag];
          if (!file) continue;

          const content = readFileSync(resolve(config.root, file), "utf-8")
            .replaceAll("{{base}}", base)
            .replaceAll("{{buildDate}}", buildDate);

          html = html.replace(
            `<${tag}></${tag}>`,
            `<${tag}>\n${content}\n</${tag}>`,
          );
        }

        return html;
      },
    },
  };
}