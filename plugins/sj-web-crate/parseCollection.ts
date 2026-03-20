import { resolve } from "path";
import type { CrateConfig } from "./types.ts";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "pathe";
import matter from "gray-matter";
import { logger, loggerWarn } from "../../src/utils/infrastructure/logger.ts";

export function parseCollection(
  config: CrateConfig,
  rootDir: string,
  verbose: boolean = false,
) {
  const absDir = resolve(rootDir, config.dir);

  logger(verbose, "scanning:", absDir);
  logger(verbose, "exists:", existsSync(absDir));

  if (!existsSync(absDir)) {
    throw new Error(`Directory not found: ${config.dir}`);
  }

  const allFiles = readdirSync(absDir, { withFileTypes: true });
  logger(
    verbose,
    "all files found:",
    allFiles.map((f) => f.name),
  );

  const files = allFiles
    .filter((f) => f.isFile() && f.name.endsWith(".md"))
    .map((f) => f.name);

  logger(verbose, ".md files:", files);

  if (files.length === 0) {
    loggerWarn(
      verbose,
      `No .md files found in ${config.dir} — is the path correct?`,
    );
    return [];
  }

  const parsed = files.map((filename) => {
    const slug = filename.replace(/\.md$/i, "");
    const mdPath = join(absDir, filename);

    logger(verbose, "reading:", mdPath);

    const raw = readFileSync(mdPath, "utf-8");

    logger(verbose, "raw content:", raw.slice(0, 100));

    const { data, content } = matter(raw);

    logger(verbose, "parsed slug:", slug, "| data keys:", Object.keys(data));

    const missing = (config.requiredFields ?? []).filter((f) => !(f in data));
    if (missing.length > 0) {
      throw new Error(
        `${config.dir}/${filename} is missing required fields: ${missing.join(", ")}`,
      );
    }

    return { slug, data, body: content.trim() };
  });

  logger(verbose, "total parsed:", parsed.length);

  return parsed;
}
