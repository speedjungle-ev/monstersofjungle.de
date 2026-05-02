import type { CrateEntry } from "../../plugins/sj-web-crate/domain/types.ts";

export function indexPageData(
  crates: Record<string, CrateEntry[]>,
): Record<string, unknown> {
  return {
    artists: (crates["artist"] ?? []).map((e) => ({
      slug: e.slug,
      artistName: e.data.artistNameLabel as string,
    })),
  };
}