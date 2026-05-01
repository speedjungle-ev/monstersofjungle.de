import type { Plugin, ResolvedConfig, UserConfig } from "vite";
import { mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, resolve } from "path";
import { generateDts } from "./application/generateDts.ts";
import { parseCollection } from "./domain/parseCollection.ts";
import type { SjWebCrateOptions } from "./domain/types.ts";
import { logger } from "./application/logger.ts";
import {
  buildRollupInput,
  buildUrlMap,
} from "./application/buildRollupInput.ts";
import { filenameToTitle } from "./application/filenameToTitle.ts";
import { processPageTokens } from "./application/processPageTokens.ts";

const PLUGIN_NAME = "sj-web-crate";
const PLUGIN_VIRTUAL_ID = "virtual:sj-web-crate/";
const PAGES_DIR = "src/pages";
const PAGES_PREFIX = `${PAGES_DIR}/`;
const DTS_OUTPUT = "plugins/sj-web-crate/sj-web-crate.d.ts";

export function sjWebCrate(options: SjWebCrateOptions): Plugin {
  const verbose = Boolean(options.verbose);
  let resolvedConfig: ResolvedConfig;
  const virtualModuleIds = new Map<string, string>();

  for (const collection of options.collections) {
    const id = `${PLUGIN_VIRTUAL_ID}${collection.name}`;
    virtualModuleIds.set(id, `\0${id}`);
  }

  return {
    name: PLUGIN_NAME,
    enforce: "pre",

    config(cfg: UserConfig) {
      const root = cfg.root ?? process.cwd();
      const input = buildRollupInput(root, options);
      return {
        build: { rollupOptions: { input } },
      };
    },

    configResolved(config) {
      resolvedConfig = config;
    },

    resolveId(id) {
      if (virtualModuleIds.has(id)) {
        return virtualModuleIds.get(id);
      }
    },

    load(id) {
      const entry = [...virtualModuleIds.entries()].find(([, v]) => v === id);
      if (!entry) return;

      const virtualId = entry[0];
      const collectionName = virtualId.replace(PLUGIN_VIRTUAL_ID, "");
      const config = options.collections.find(
        (c) => c.name === collectionName,
      )!;

      const entries = parseCollection(
        config,
        resolvedConfig.root,
        verbose,
      ).sort(
        (a, b) =>
          ((a.data as any).gridOrder ?? 99) - ((b.data as any).gridOrder ?? 99),
      );

      const moduleString = `
    export const entries = ${JSON.stringify(entries)};
    export const slugs = ${JSON.stringify(entries.map((e) => e.slug))};
  `;

      logger(verbose, "emitting module:", moduleString.slice(0, 300));

      return moduleString;
    },

    configureServer(server) {
      const input = buildRollupInput(resolvedConfig.root, options);
      const urlMap = buildUrlMap(resolvedConfig.root, input);

      server.middlewares.use((req, _res, next) => {
        if (!req.url) return next();
        const urlPath = req.url.split("?")[0].split("#")[0];
        const mapped = urlMap.get(urlPath);
        if (mapped) req.url = req.url.replace(urlPath, mapped);
        next();
      });

      for (const collection of options.collections) {
        const absDir = resolve(resolvedConfig.root, collection.dir);
        server.watcher.add(absDir);
      }

      server.watcher.on("change", (filePath) => {
        if (!filePath.endsWith(".md")) return;

        const virtualId = [...virtualModuleIds.values()].find((id) => {
          const collectionName = id.replace(`\\0${PLUGIN_VIRTUAL_ID}`, "");
          const config = options.collections.find(
            (c) => c.name === collectionName,
          )!;
          const absDir = resolve(resolvedConfig.root, config.dir);
          return filePath.startsWith(absDir);
        });

        if (virtualId) {
          const mod = server.moduleGraph.getModuleById(virtualId);
          if (mod) server.moduleGraph.invalidateModule(mod);
          server.ws.send({ type: "full-reload" });
        }
      });
    },

    buildStart() {
      const dtsPath = resolve(
        resolvedConfig.root,
        options.dtsOutput ?? DTS_OUTPUT,
      );
      writeFileSync(dtsPath, generateDts(options.collections));

      for (const config of options.collections) {
        if (!config.pageData || !config.pageTemplate) continue;

        const entries = parseCollection(config, resolvedConfig.root, verbose);
        const pagesDir = resolve(resolvedConfig.root, PAGES_DIR, config.name);
        mkdirSync(pagesDir, { recursive: true });

        const templatePath = resolve(resolvedConfig.root, config.pageTemplate);
        const shellTemplate = readFileSync(templatePath, "utf-8");
        const partialsDir = config.partialsDir
          ? resolve(resolvedConfig.root, config.partialsDir)
          : dirname(templatePath);

        for (const entry of entries) {
          const pageTokens = config.pageData(entry.data);
          const titleStem = pageTokens.title != null
            ? String(pageTokens.title)
            : entry.slug.charAt(0).toUpperCase() + entry.slug.slice(1);
          const tokens: Record<string, unknown> = {
            ...pageTokens,
            title: options.siteName ? `${titleStem} | ${options.siteName}` : titleStem,
            base: resolvedConfig.base ?? "/",
          };
          const html = processPageTokens(shellTemplate, tokens, partialsDir);
          const outPath = resolve(pagesDir, `${entry.slug}.html`);
          writeFileSync(outPath, html);
          logger(verbose, "generated page:", outPath);
        }
      }
    },

    transformIndexHtml: {
      order: "pre",
      handler(html, ctx) {
        if (options.partials) {
          const base = resolvedConfig.base ?? "/";
          const buildDate = new Date().toLocaleDateString(
            options.locale ?? "en-EN",
          );
          for (const tag of ["header", "footer"] as const) {
            const file = options.partials[tag];
            if (!file) continue;
            const content = readFileSync(
              resolve(resolvedConfig.root, file),
              "utf-8",
            )
              .replaceAll("{{base}}", base)
              .replaceAll("{{buildDate}}", buildDate);
            html = html.replace(
              `<${tag}></${tag}>`,
              `<${tag}>\n${content}\n</${tag}>`,
            );
          }
        }

        if (options.siteName && html.includes("{{title}}")) {
          const stem =
            ctx.filename
              .replace(/\.html$/, "")
              .split("/")
              .pop() ?? "index";
          html = html.replace(
            "{{title}}",
            filenameToTitle(stem, options.siteName),
          );
        }

        return html;
      },
    },

    generateBundle(_, bundle) {
      // Rewrite output paths: strip src/pages/ prefix.
      // Nested pages (e.g. artist/dylan.html) become artist/dylan/index.html for clean URLs.
      for (const oldName of Object.keys(bundle)) {
        if (!oldName.startsWith(PAGES_PREFIX) || !oldName.endsWith(".html"))
          continue;
        const rel = oldName.slice(PAGES_PREFIX.length);
        const newName = rel.includes("/")
          ? rel.replace(/\.html$/, "/index.html")
          : rel;
        const asset = bundle[oldName];
        (asset as { fileName: string }).fileName = newName;
        bundle[newName] = asset;
        delete bundle[oldName];
      }
    },
  };
}
