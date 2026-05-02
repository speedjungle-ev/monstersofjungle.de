import { entries as upcomingEventEntries } from "virtual:sj-web-crate/upcoming-event";
import type { EventMetaData } from "./types/types";

const typedEventEntries = upcomingEventEntries as Array<{
  slug: string;
  data: EventMetaData;
  body: string;
}>;

const nextEvent = typedEventEntries[0];

export const NEXT_EVENT_FLYER = nextEvent?.data.flyer ?? null;
export const NEXT_EVENT_MESSAGE = nextEvent?.body ?? null;