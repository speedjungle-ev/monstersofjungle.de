import { entries as artistEntries, slugs as artistSlugs } from "virtual:sj-web-crate/artist";
import { entries as upcomingEventEntries } from "virtual:sj-web-crate/upcoming-event";
import type { ArtistMetaData, EventMetaData } from "./types/types";
import { featureResolver } from "./crateFeatureResolver.ts";

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

export const ARTIST_PAGE_GRID_ORDER = artistSlugs;

const typedArtistEntries = artistEntries as Array<{
  slug: string;
  data: ArtistMetaData;
  body: string;
}>;

export const ARTIST_META_MAP = Object.fromEntries(
  typedArtistEntries.map(({ slug, data }) => {
    return [slug, { ...data, ...resolveFeatures(data) }];
  }),
);

const typedEventEntries = upcomingEventEntries as Array<{
  slug: string;
  data: EventMetaData;
  body: string;
}>;

const nextEvent = typedEventEntries[0];

export const NEXT_EVENT_FLYER = nextEvent?.data.flyer ?? null;
export const NEXT_EVENT_MESSAGE = nextEvent?.body ?? null;