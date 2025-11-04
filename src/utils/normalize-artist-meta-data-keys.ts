import { filePathToKey } from "./file-path-to-key.ts";

export function normalizeArtistMetaDataKeys<T>(
  artistsMetaData: Record<string, T>,
): Record<string, T> {
  return Object.keys(artistsMetaData).reduce(
    (acc: Record<string, T>, filePathKey) => {
      acc[filePathToKey(filePathKey)] = artistsMetaData[filePathKey];
      return acc;
    },
    {},
  );
}
