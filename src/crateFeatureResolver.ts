import { radioShow } from "./scripts/attachments/radioShow.ts";
import type { ArtistFeature } from "./types/types";

export const featureResolver: Record<ArtistFeature, any> = {
  radioShow,
};
