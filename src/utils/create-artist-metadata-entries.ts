import { filePathToKey } from "./file-path-to-key.ts";

export function createArtistMetadataEntries<T>(
  artistsMetaData: Record<string, T>,
) {
  return Object.keys(artistsMetaData).map((filePathKey) => {
    const key = filePathToKey(filePathKey);
    return [key, artistsMetaData[filePathKey]] as [string, T];
  });
}
