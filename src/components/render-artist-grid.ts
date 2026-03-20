import { html, render } from "lit-html";
import type { ArtistMetaData } from "../types/types";
import { SITE_MAP } from "../constants.ts";

export function renderArtistGrid(
  artists: Record<string, ArtistMetaData>,
  order: string[],
  targetElement: HTMLElement,
) {
  render(
    order.map(
      (slug) =>
        html`<a href="${SITE_MAP.artistDetail}?artist=${slug}">
          <img
            src="${import.meta.env.BASE_URL}talent/${slug}.png"
            alt="${artists[slug].artistNameLabel}"
          />
        </a>`,
    ),
    targetElement,
  );
}
