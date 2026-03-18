import { join, resolve } from "path";
import { existsSync, readdirSync, readFileSync } from "fs";
import matter from "gray-matter";
import type { CrateConfig } from "./types.ts";

export function parseCollection(config: CrateConfig, rootDir: string) {
  const absDir = resolve(rootDir, config.dir);

  if (!existsSync(absDir)) {
    throw new Error(`[sj-web-crate] Directory not found: ${config.dir}`);
  }

  const folders = readdirSync(absDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  return folders.map((slug) => {
    const mdPath = join(absDir, slug, "dylan.md");

    if (!existsSync(mdPath)) {
      throw new Error(
        `[sj-web-crate] Missing index.md in ${config.dir}/${slug}/`,
      );
    }

    const raw = readFileSync(mdPath, "utf-8");
    const { data, content } = matter(raw);

    // Validate required fields
    const missing = (config.requiredFields ?? []).filter((f) => !(f in data));
    if (missing.length > 0) {
      throw new Error(
        `[sj-web-crate] ${config.dir}/${slug}/index.md is missing required fields: ${missing.join(", ")}`,
      );
    }

    return { slug, data, body: content.trim() };
  });
}
