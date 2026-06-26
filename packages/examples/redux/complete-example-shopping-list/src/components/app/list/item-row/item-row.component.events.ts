import type { EventsContract } from "@softer-components/types";

import type { ListItem } from "../../../../model";

export const uiEvents = [
  "removeItemRequested",
  "incrementRequested",
  "decrementRequested",
] as const;
export const allEvents = [...uiEvents, "initialize", "itemChanged"] as const;
export type Events = EventsContract<
  typeof allEvents,
  {
    initialize: ListItem;
  },
  typeof uiEvents
>;
