import type { CrateEntry } from "../../plugins/sj-web-crate/domain/types.ts";

// Slug format is DD-MM-YYYY. ISO date-only strings parse as UTC, avoiding timezone shifts.
function slugToDate(slug: string): Date {
  const file = `content/events/${slug}.md`;
  const parts = slug.split("-");
  if (parts.length !== 3)
    throw new Error(`${file}: slug must be DD-MM-YYYY, got "${slug}"`);
  const [day, month, year] = parts;
  const date = new Date(`${year}-${month}-${day}`);
  if (isNaN(date.getTime()))
    throw new Error(`${file}: "${slug}" does not produce a valid date`);
  return date;
}

export function indexPageData(
  crates: Record<string, CrateEntry[]>,
): Record<string, unknown> {
  const todayIso = new Date().toISOString().slice(0, 10);

  const nextEvent = (crates["upcoming-event"] ?? [])
    .map((e) => ({ ...e, date: slugToDate(e.slug) }))
    .filter((e) => e.date.toISOString().slice(0, 10) >= todayIso)
    .sort((a, b) => a.date.getTime() - b.date.getTime())[0] ?? null;

  const nextEventDate = nextEvent?.date.toISOString().slice(0, 10) ?? null;
  const nextEventDateLabel = nextEvent
    ? new Intl.DateTimeFormat("de-DE", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      }).format(nextEvent.date)
    : null;

  return {
    artists: (crates["artist"] ?? []).map((e) => ({
      slug: e.slug,
      artistName: e.data.artistNameLabel as string,
    })),
    hasNextEvent: nextEvent !== null,
    nextEventFlyer: (nextEvent?.data as any)?.flyer ?? null,
    nextEventDate,
    nextEventDateLabel,
    nextEventBody: nextEvent?.body ?? "",
  };
}