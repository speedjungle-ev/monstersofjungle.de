import { entries, slugs } from "virtual:sj-web-crate/artists";
import type { ArtistMeta } from "./types/types";

export const ARTIST_PAGE_GRID_ORDER = slugs;
export const ARTIST_PAGE_ROUTE = "./artist-details.html";

export const ARTIST_META_MAP = Object.fromEntries(
  entries.map(({ slug, data }) => {
    const meta = data as ArtistMeta;
    return [
      slug,
      {
        ...meta,
        attachment: meta.radioShow
          ? `Next Show: ${getNextRadioShowDate(Date.now()).toLocaleDateString()}`
          : (meta.attachment ?? null),
      },
    ];
  }),
);
