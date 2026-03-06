export function normalizeArtistMetaDataKeys<T>(
  artistsMetaData: [string, T][],
  orderModel?: string[],
): Record<string, T> {
  if (!orderModel || orderModel.length === 0) {
    return artistsMetaData.reduce((acc: Record<string, T>, [k, v]) => {
      acc[k] = v;
      return acc;
    }, {});
  }

  const entryMap = new Map(artistsMetaData);
  const set = new Set(orderModel);

  const explicit: [string, T][] = orderModel
    .filter((k) => entryMap.has(k))
    .map((k) => [k, entryMap.get(k)!]);

  const rest: [string, T][] = artistsMetaData
    .filter(([k]) => !set.has(k))
    .sort(([a], [b]) => a.localeCompare(b));

  const ordered = [...explicit, ...rest];

  return ordered.reduce((acc: Record<string, T>, [k, v]) => {
    acc[k] = v;
    return acc;
  }, {});
}
