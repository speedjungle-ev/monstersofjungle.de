export interface SjWebCrateOptions {
  collections: CrateConfig[];
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
   * Defaults to src/sj-web-crate/sj-web-crate.d.ts
   */
  dtsOutput?: string;
  /**
   * Turns on the logging from the plugin
   */
  verbose?: boolean;
}
export interface PartialsConfig {
  header?: string;
  footer?: string;
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
   * Path to an HTML page template (relative to project root).
   * Tokens: {{key}} scalar, {{#key}}…{{/key}} conditional/array block,
   * {{> partialName}} inside a block renders a partial per array item.
   * Built-in tokens: {{title}}, {{base}}.
   */
  pageTemplate?: string;
  /**
   * Directory containing HTML partial files referenced via {{> partialName}}.
   * Relative to project root. Defaults to the same directory as pageTemplate.
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
