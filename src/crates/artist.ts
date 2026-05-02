import { featureResolver } from "../crateFeatureResolver.ts";
import { scanImages } from "../../plugins/sj-web-crate/application/scanImages.ts";
import type { CrateEntry } from "../../plugins/sj-web-crate/domain/types.ts";

export function artistPageData({ data, slug }: CrateEntry): Record<string, unknown> {
  const features = (data.features ?? []) as string[];
  const matchedFeature = features.find((f) => f in featureResolver);
  const attachment = matchedFeature
    ? featureResolver[matchedFeature as keyof typeof featureResolver]()
    : (data.attachment as string | null);

  const headerImages = scanImages(slug, "artists").map((src) => ({
    src,
    alt: String(data.artistNameLabel),
  }));

  return {
    title: data.artistNameLabel,
    artistName: data.artistNameLabel,
    mixLinks: data.mixLinks ?? [],
    attachment,
    headerImages,
  };
}