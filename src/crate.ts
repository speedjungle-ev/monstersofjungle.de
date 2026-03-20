import { entries, slugs } from "virtual:sj-web-crate/artist";
import type { ArtistMetaData } from "./types/types";
import { getNextRadioShowDate } from "./utils/feature/get-next-radio-show-date.ts";

function resolveFeatures(data: ArtistMetaData): Partial<ArtistMetaData> {
  const features = data.features ?? [];
  console.log(data);
  return {
    attachment: features.includes("radioShow")
      ? `Next Radio Show: ${getNextRadioShowDate(Date.now()).toLocaleDateString()}`
      : (data.attachment ?? null),
  };
}

export const ARTIST_PAGE_GRID_ORDER = slugs;

const artistEntries = entries as Array<{
  slug: string;
  data: ArtistMetaData;
  body: string;
}>;

export const ARTIST_META_MAP = Object.fromEntries(
  artistEntries.map(({ slug, data }) => {
    return [slug, { ...data, ...resolveFeatures(data) }];
  }),
);
