import type { Types } from "./types.ts";
import { join, relative, resolve } from "path";
import { existsSync, readdirSync } from "fs";
import { parseCollection } from "./parseCollection.ts";

export function buildRollupInput(
  root: string,
  options: Types,
): Record<string, string> {
  const pagesDir = resolve(root, "src/pages");
  const generatedDirs = new Set(
    options.collections.filter((c) => c.renderPage).map((c) => c.name),
  );
  const input: Record<string, string> = {};

  function scan(dir: string, prefix: string) {
    if (!existsSync(dir)) return;
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (entry.name === "templates" || entry.name === "layouts") continue;
        if (generatedDirs.has(entry.name)) continue;
        scan(join(dir, entry.name), `${prefix}${entry.name}-`);
      } else if (entry.name.endsWith(".html")) {
        const key = `${prefix}${entry.name.replace(".html", "")}`;
        input[key] = join(dir, entry.name);
      }
    }
  }

  scan(pagesDir, "");

  for (const col of options.collections.filter((c) => c.renderPage)) {
    const entries = parseCollection(col, root, false);
    for (const entry of entries) {
      input[`${col.name}-${entry.slug}`] = resolve(
        root,
        "src/pages",
        col.name,
        `${entry.slug}.html`,
      );
    }
  }

  return input;
}

export function buildUrlMap(
  root: string,
  input: Record<string, string>,
): Map<string, string> {
  const pagesDir = resolve(root, "src/pages");
  const map = new Map<string, string>();

  for (const filePath of Object.values(input)) {
    const rel = relative(pagesDir, filePath);
    const withoutExt = rel.replace(/\.html$/, "");
    const devPath = `/src/pages/${rel}`;

    if (withoutExt === "index") {
      map.set("/", devPath);
      map.set("/index", devPath);
      map.set("/index.html", devPath);
    } else {
      map.set(`/${withoutExt}`, devPath);
      map.set(`/${withoutExt}/`, devPath);
      map.set(`/${withoutExt}.html`, devPath);
    }
  }

  return map;
}
