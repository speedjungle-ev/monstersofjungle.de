import type { Plugin, ResolvedConfig, UserConfig } from "vite";
import { mkdirSync, writeFileSync } from "fs";
import { resolve } from "path";
import { generateDts } from "./generateDts.ts";
import { parseCollection } from "./parseCollection.ts";
import type { Types } from "./types.ts";
import { logger } from "../../src/utils/infrastructure/logger.ts";
import { buildRollupInput, buildUrlMap } from "./buildRollupInput.ts";

const PAGES_PREFIX = "src/pages/";

const DTS_OUTPUT = "plugins/sj-web-crate/sj-web-crate.d.ts";

export function sjWebCrate(options: Types): Plugin {
  const verbose = Boolean(options.verbose);
  let resolvedConfig: ResolvedConfig;
  const virtualModuleIds = new Map<string, string>();

  for (const collection of options.collections) {
    const id = `virtual:sj-web-crate/${collection.name}`;
    virtualModuleIds.set(id, `\0${id}`);
  }

  return {
    name: "sj-web-crate",
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
      const collectionName = virtualId.replace("virtual:sj-web-crate/", "");
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
          const collectionName = id.replace("\0virtual:sj-web-crate/", "");
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
        if (!config.renderPage) continue;

        const entries = parseCollection(config, resolvedConfig.root, verbose);
        const pagesDir = resolve(resolvedConfig.root, "src/pages", config.name);

        mkdirSync(pagesDir, { recursive: true });

        for (const entry of entries) {
          const html = config.renderPage(entry.data, resolvedConfig.base);
          const outPath = resolve(pagesDir, `${entry.slug}.html`);
          writeFileSync(outPath, html);
          logger(verbose, "generated page:", outPath);
        }
      }
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
