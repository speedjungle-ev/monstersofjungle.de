import dylanData from "./artist-data/dylan.ts";
import elektrikearlinerData from "./artist-data/elektrikearliner.ts";
import mcscrptData from "./artist-data/mcscrpt.ts";
import mjungleData from "./artist-data/mjungle.ts";
import neonirisData from "./artist-data/neoniris.ts";
import niqawaData from "./artist-data/niqawa.ts";
import pukkaData from "./artist-data/pukka.ts";
import rubyData from "./artist-data/ruby.ts";
import tforceData from "./artist-data/tforce.ts";
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
  dylan: dylanData,
  elektrikearliner: elektrikearlinerData,
  mcscrpt: mcscrptData,
  mjungle: mjungleData,
  neoniris: neonirisData,
  niqawa: niqawaData,
  pukka: pukkaData,
  ruby: rubyData,
  tforce: tforceData,
};
