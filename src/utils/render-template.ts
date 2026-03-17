import { render } from "lit-html";
import { unsafeHTML } from "lit-html/directives/unsafe-html.js";
import { html } from "lit-html";

/**
 * Fetches an HTML template file and renders it into the given element.
 * The HTML file should contain only the inner markup (no doctype/html/body).
 *
 * Usage:
 *   await renderTemplate("/templates/site-header.html", headerEl);
 *   The file should be inside `pages` directory. Remember all filas in `pages`
 *   are served as static assets. So you can use URL path to access them.
 */
export async function renderTemplate(
  templatePath: string,
  target: HTMLElement,
): Promise<void> {
  const response = await fetch(templatePath);
  if (!response.ok) {
    console.error(`Failed to load template: ${templatePath}`);
    return;
  }
  const markup = await response.text();
  render(html`${unsafeHTML(markup)}`, target as HTMLElement);
}
