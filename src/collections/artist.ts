import { featureResolver } from "../crateFeatureResolver.ts";

export function artistPageData(data: Record<string, unknown>): Record<string, unknown> {
  const features = (data.features ?? []) as string[];
  const matchedFeature = features.find((f) => f in featureResolver);
  const attachment = matchedFeature
    ? featureResolver[matchedFeature as keyof typeof featureResolver]()
    : (data.attachment as string | null);

  return {
    title: data.artistNameLabel,
    artistName: data.artistNameLabel,
    mixLinks: data.mixLinks ?? [],
    attachment,
  };
}