export interface CrateEntry {
  slug: string;
  data: Record<string, unknown>;
  body: string;
}

export interface SjWebCrateOptions {
  crates: CrateConfig[];
  partials?: PartialsConfig;
  /**
   * Site name appended to every page title: "About | {siteName}".
   * Also used as the full title for the index page.
   * Required for {{title}} injection to work.
   */
  siteName?: string;
  /**
   * Locale passed to toLocaleDateString for the {{buildDate}} token in partials.
   * Defaults to "en-EN".
   */
  locale?: string;
  /**
   * Where to write the generated .d.ts file.
   * Defaults to plugins/sj-web-crate/sj-web-crate.d.ts
   */
  dtsOutput?: string;
  /**
   * Turns on the logging from the plugin.
   */
  verbose?: boolean;
  /**
   * Default directory for {{> partialName}} resolution, relative to project root.
   * Used by singleton pages and as the fallback for crates that omit partialsDir.
   */
  partialsDir?: string;
  /**
   * Singleton pages that need build-time collection data.
   * Matched by filename in transformIndexHtml; only the matched page is processed.
   */
  pages?: PageConfig[];
}

export interface PageConfig {
  /**
   * Filename to match (e.g. "index.html"). Matched against the trailing segment
   * of the resolved page path.
   */
  match: string;
  /**
   * Called in transformIndexHtml with all parsed crate entries.
   * Returns a token map rendered into the page via processPageTokens.
   * Built-in tokens ({{title}}, {{base}}) are injected automatically.
   * Arrays trigger {{#key}}...{{/key}} block iteration; {{> partialName}}
   * renders a partial per item with {{base}} available.
   * Omit to serve the page as static HTML with only {{title}} injection.
   */
  pageData?: (
    collections: Record<string, CrateEntry[]>,
  ) => Record<string, unknown>;
}

export interface PartialsConfig {
  header?: string;
  footer?: string;
}

export interface CrateConfig {
  /**
   * The name of the crate.
   * Becomes the virtual module: virtual:sj-web-crate/<name>
   */
  name: string;
  /**
   * Path to the directory containing the markdown files.
   * Relative to the project root.
   */
  dir: string;
  /**
   * Fields that must be present in every frontmatter.
   * Build will throw if any are missing.
   */
  requiredFields?: string[];
  /**
   * Path to an HTML page template (relative to project root).
   * Tokens: {{key}} scalar, {{#key}}…{{/key}} conditional/array block,
   * {{> partialName}} inside a block renders a partial per array item.
   * Built-in tokens: {{title}}, {{base}}.
   */
  pageTemplate?: string;
  /**
   * Directory containing HTML partial files referenced via {{> partialName}}.
   * Relative to project root. Falls back to the top-level partialsDir, then
   * the same directory as pageTemplate.
   */
  partialsDir?: string;
  /**
   * Called once per entry at buildStart. Returns a flat token map used to
   * render the pageTemplate. Arrays trigger block iteration; falsy values
   * hide their block. Return a `title` key to override the default slug-derived
   * page title. Keep this as pure data — no HTML.
   */
  pageData?: (data: Record<string, unknown>) => Record<string, unknown>;
}