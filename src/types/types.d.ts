import type { MixListLink } from "../components/MixList.ts";

export type ArtistMeta = {
  artistNameLabel: string;
  mixLinks: MixListLink[];
  attachment?: string;
};
