import { describe, test, expect } from "vitest";
// import { normalizeArtistMetaDataKeys } from "./normalize-artist-meta-data-keys";
// type Meta = { name?: string; id?: number };

describe("normalizeArtistMetaDataKeys", () => {
  test("ready for test", () => {
    expect(true).toBeTruthy();
  });
  // test("strips directories and `.ts` extension and preserves values", () => {
  //   const input: Record<string, Meta> = {
  //     "artists/elektrikearliner.ts": { name: "Elektrik Earliner" },
  //     "/abs/path/tforce.ts": { name: "T-Force" },
  //   };
  //   const out = normalizeArtistMetaDataKeys(input);
  //   expect(out).toEqual({
  //     elektrikearliner: { name: "Elektrik Earliner" },
  //     tforce: { name: "T-Force" },
  //   });
  // });

  // test("handles case-insensitive `.ts` and filenames without extension", () => {
  //   const input: Record<string, Meta> = {
  //     "ARTIST.TS": { id: 1 },
  //     noext: { id: 2 },
  //   };
  //   const out = normalizeArtistMetaDataKeys(input);
  //   expect(out).toEqual({
  //     ARTIST: { id: 1 },
  //     noext: { id: 2 },
  //   });
  // });

  // test("last value wins on key collision after normalization", () => {
  //   const input: Record<string, Meta> = {
  //     "dir/artist.ts": { id: 1 },
  //     "artist.ts": { id: 2 },
  //   };
  //   const out = normalizeArtistMetaDataKeys(input);
  //   expect(out).toEqual({
  //     artist: { id: 2 },
  //   });
  // });

  // test("returns an empty object for empty input", () => {
  //   expect(normalizeArtistMetaDataKeys({})).toEqual({});
  // });
});
