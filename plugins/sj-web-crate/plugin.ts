import type { Plugin, ResolvedConfig } from "vite";
import { writeFileSync, mkdirSync } from "fs";
import { resolve } from "path";
import { generateDts } from "./generateDts.ts";
import { parseCollection } from "./parseCollection.ts";
import type { Types } from "./types.ts";
import { logger } from "../../src/utils/infrastructure/logger.ts";

const DTS_OUTPUT = "plugins/sj-web-crate/sj-web-crate.d.ts";

export function sjWebCrate(options: Types): Plugin {
  const verbose = Boolean(options.verbose);
  let resolvedConfig: ResolvedConfig;
  const virtualModuleIds = new Map<string, string>();

  // Build the virtual module ID map upfront
  for (const collection of options.collections) {
    const id = `virtual:sj-web-crate/${collection.name}`;
    virtualModuleIds.set(id, `\0${id}`);
  }

  return {
    name: "sj-web-crate",
    enforce: "pre",
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

    // Watch md files during dev and invalidate on change
    configureServer(server) {
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

    // Generate .d.ts and per-entry page JSON files
    buildStart() {
      const dtsPath = resolve(
        resolvedConfig.root,
        options.dtsOutput ?? DTS_OUTPUT,
      );
      writeFileSync(dtsPath, generateDts(options.collections));

      for (const config of options.collections) {
        if (!config.pageTemplate) continue;

        const entries = parseCollection(config, resolvedConfig.root, verbose);
        const pagesDir = resolve(resolvedConfig.root, "src/pages", config.name);
        const templatePath = resolve(resolvedConfig.root, config.pageTemplate);

        mkdirSync(pagesDir, { recursive: true });

        for (const entry of entries) {
          const pageData = {
            template: templatePath,
            slug: entry.slug,
            ...entry.data,
            body: entry.body,
          };

          const outPath = resolve(pagesDir, `${entry.slug}.json`);
          writeFileSync(outPath, JSON.stringify(pageData, null, 2));
          logger(verbose, "generated page:", outPath);
        }
      }
    },
  };
}
