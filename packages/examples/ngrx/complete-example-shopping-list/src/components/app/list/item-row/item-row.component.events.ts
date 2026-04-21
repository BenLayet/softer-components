import { EventsContract } from "@softer-components/types";

import { ListItem } from "../../../../model";

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
