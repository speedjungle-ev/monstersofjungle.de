import elektrikearlinerData from "./data-sources/elektrikearliner.ts";
import tforceData from "./data-sources/tforce.ts";
import type { ArtistMeta } from "./types/types";

export const ARTIST_PAGE_ROUTE = "./artist-profile.html";
export const ARTIST_PAGE_GRID_ORDER = [
  "elektrikearliner",
  "tforce",
  "pukka",
  "neoniris",
  "mjungle",
  "ruby",
  "niqawa",
  "mcscrpt",
  "dylan",
];

/**
 * ARIST METADATA MAP
 * Here we map the artist to their stored data.
 * This allows for easy retrieval of artist information based on the URL
 * parameter. Add and remove artist from being displayed on the website.
 */
export const ARTIST_META_MAP: Record<string, ArtistMeta> = {
  elektrikearliner: elektrikearlinerData,
  tforce: tforceData,
};
