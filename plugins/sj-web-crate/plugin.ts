import type { Plugin, ResolvedConfig, UserConfig } from "vite";
import { mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, resolve } from "path";
import { generateDts } from "./application/generateDts.ts";
import { parseCrate } from "./domain/parseCrate.ts";
import type { CrateEntry, SjWebCrateOptions } from "./domain/types.ts";
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
  let cachedCollections: Record<string, CrateEntry[]> = {};
  const virtualModuleIds = new Map<string, string>();

  for (const crate of options.crates) {
    const id = `${PLUGIN_VIRTUAL_ID}${crate.name}`;
    virtualModuleIds.set(id, `\0${id}`);
  }

  function parseAndSort(crate: (typeof options.crates)[number]) {
    return parseCrate(crate, resolvedConfig.root, verbose).sort(
      (a, b) =>
        ((a.data as any).gridOrder ?? 99) - ((b.data as any).gridOrder ?? 99),
    );
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
      const crateName = virtualId.replace(PLUGIN_VIRTUAL_ID, "");
      const crate = options.crates.find((c) => c.name === crateName)!;

      const entries = parseAndSort(crate);
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

      for (const crate of options.crates) {
        const absDir = resolve(resolvedConfig.root, crate.dir);
        server.watcher.add(absDir);
      }

      server.watcher.on("change", (filePath) => {
        if (!filePath.endsWith(".md")) return;

        for (const crate of options.crates) {
          const absDir = resolve(resolvedConfig.root, crate.dir);
          if (filePath.startsWith(absDir)) {
            cachedCollections[crate.name] = parseAndSort(crate);
          }
        }

        const virtualId = [...virtualModuleIds.values()].find((id) => {
          const crateName = id.replace(`\\0${PLUGIN_VIRTUAL_ID}`, "");
          const crate = options.crates.find((c) => c.name === crateName)!;
          const absDir = resolve(resolvedConfig.root, crate.dir);
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
      cachedCollections = {};
      for (const crate of options.crates) {
        cachedCollections[crate.name] = parseAndSort(crate);
      }

      const dtsPath = resolve(
        resolvedConfig.root,
        options.dtsOutput ?? DTS_OUTPUT,
      );
      writeFileSync(dtsPath, generateDts(options.crates));

      for (const crate of options.crates) {
        if (!crate.pageData || !crate.pageTemplate) continue;

        const entries = cachedCollections[crate.name];
        const pagesDir = resolve(resolvedConfig.root, PAGES_DIR, crate.name);
        mkdirSync(pagesDir, { recursive: true });

        const templatePath = resolve(resolvedConfig.root, crate.pageTemplate);
        const shellTemplate = readFileSync(templatePath, "utf-8");
        const partialsDirRaw =
          crate.partialsDir ?? options.partialsDir ?? null;
        const partialsDir = partialsDirRaw
          ? resolve(resolvedConfig.root, partialsDirRaw)
          : dirname(templatePath);

        for (const entry of entries) {
          const pageTokens = crate.pageData(entry);
          const titleStem =
            pageTokens.title != null
              ? String(pageTokens.title)
              : entry.slug.charAt(0).toUpperCase() + entry.slug.slice(1);
          const base = resolvedConfig.base ?? "/";
          const tokens: Record<string, unknown> = {
            ...pageTokens,
            title: options.siteName
              ? `${titleStem} | ${options.siteName}`
              : titleStem,
            base,
          };
          for (const key of Object.keys(tokens)) {
            const val = tokens[key];
            if (Array.isArray(val)) {
              tokens[key] = (val as Record<string, unknown>[]).map((item) => ({
                base,
                ...item,
              }));
            }
          }
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
        const base = resolvedConfig.base ?? "/";

        if (options.partials) {
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

        const stem =
          ctx.filename.replace(/\.html$/, "").split("/").pop() ?? "index";
        const pageConfig = options.pages?.find((p) =>
          ctx.filename.endsWith(p.match),
        );

        if (pageConfig?.pageData) {
          const title = options.siteName
            ? filenameToTitle(stem, options.siteName)
            : stem;
          const rawTokens = pageConfig.pageData(cachedCollections);
          const tokens: Record<string, unknown> = { title, base, ...rawTokens };
          for (const key of Object.keys(tokens)) {
            const val = tokens[key];
            if (Array.isArray(val)) {
              tokens[key] = (val as Record<string, unknown>[]).map((item) => ({
                base,
                ...item,
              }));
            }
          }
          const partialsDir = resolve(
            resolvedConfig.root,
            options.partialsDir ?? "src/partials",
          );
          html = processPageTokens(html, tokens, partialsDir);
        } else if (options.siteName && html.includes("{{title}}")) {
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