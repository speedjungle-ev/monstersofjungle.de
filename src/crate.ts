import { entries, slugs } from "virtual:sj-web-crate/artist";
import type { ArtistMetaData } from "./types/types";
import { featureResolver } from "./crateFeatureResolver.ts";

function resolveFeatures(data: ArtistMetaData): Partial<ArtistMetaData> {
  const features = data.features ?? [];

  if (process.env.NODE_ENV !== "production") {
    console.log(data);
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
