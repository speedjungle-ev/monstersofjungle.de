export interface Types {
  collections: CrateConfig[];
  /**
   * Where to write the generated .d.ts file.
   * Defaults to src/sj-web-crate/sj-web-crate.d.ts
   */
  dtsOutput?: string;
  /**
   * Turns on the logging from the plugin
   */
  verbose?: boolean;
}

export interface CrateConfig {
  /**
   * The name of the collection.
   * Becomes the virtual module: virtual:sj-web-crate/<name>
   */
  name: string;
  /**
   * Path to the directory containing the artist/project folders.
   * Relative to the project root.
   */
  dir: string;
  /**
   * Fields that must be present in every frontmatter.
   * Build will throw if any are missing.
   */
  requiredFields?: string[];
  /**
   * Path to a .njk template (relative to project root).
   * If set, the plugin generates one JSON page entry per collection item
   * into src/pages/<name>/<slug>.json, which the Nunjucks plugin renders
   * into dist/<name>/<slug>/index.html.
   */
  pageTemplate?: string;
}
