import artist from "virtual:sj-web-crate/artist";
import nextEvent from "virtual:sj-web-crate/next-event";
import type { ArtistMetaData } from "./types/types";
import { featureResolver } from "./crateFeatureResolver.ts";
import { resolve } from "path";

console.log(nextEvent);
function resolveFeatures(data: ArtistMetaData): Partial<ArtistMetaData> {
  const features = data.features ?? [];

  if (process.env.NODE_ENV !== "production") {
    // console.log(data);
  }

  const matchedFeature = features.find((feature) => feature in featureResolver);

  if (matchedFeature) {
    return {
      attachment: featureResolver[matchedFeature](),
    };
  }

  return {
    attachment: data.attachment ?? null,
  };
}

export const ARTIST_PAGE_GRID_ORDER = artist.slugs;

const artistEntries = artist.entries as Array<{
  slug: string;
  data: ArtistMetaData;
  body: string;
}>;

export const ARTIST_META_MAP = Object.fromEntries(
  artistEntries.map(({ slug, data }) => {
    return [slug, { ...data, ...resolveFeatures(data) }];
  }),
);

export const NEXT_EVENT_FLYER = import.meta.glob(
  resolve(__dirname, String(nextEvent.entries[0].data.flyer)),
  {
    eager: true,
  },
);
export const NEXT_EVENT_MESSAGE = nextEvent.entries[0].body;
