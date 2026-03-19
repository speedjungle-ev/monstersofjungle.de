import type { Plugin, ResolvedConfig } from "vite";
import { writeFileSync } from "fs";
import { resolve } from "path";
import { generateDts } from "./generateDts.ts";
import { parseCollection } from "./parseCollection.ts";
import type { Types } from "./types.ts";
import { logger } from "../../src/utils/logger.ts";

const DTS_OUTPUT = "plugins/sj-web-crate/sj-web-crate.d.ts";

export function sjWebCrate(options: Types): Plugin {
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
        options.verbose,
      ).sort(
        (a, b) =>
          ((a.data as any).gridOrder ?? 99) - ((b.data as any).gridOrder ?? 99),
      );

      const moduleString = `
    export const entries = ${JSON.stringify(entries)};
    export const slugs = ${JSON.stringify(entries.map((e) => e.slug))};
  `;

      logger(
        options.verbose === true,
        "emitting module:",
        moduleString.slice(0, 300),
      );

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

    // Generate .d.ts after build resolves config
    buildStart() {
      const dtsPath = resolve(
        resolvedConfig.root,
        options.dtsOutput ?? DTS_OUTPUT,
      );
      writeFileSync(dtsPath, generateDts(options.collections));
    },
  };
}
