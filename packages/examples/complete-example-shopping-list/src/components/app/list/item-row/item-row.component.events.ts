import { EventsContract } from "@softer-components/types";

import { ListItem } from "../../../../model";

type EventName =
  | "initialize"
  | "removeItemRequested"
  | "incrementRequested"
  | "decrementRequested"
  | "itemChanged";

export const uiEvents = [
  "removeItemRequested",
  "incrementRequested",
  "decrementRequested",
] as const satisfies EventName[];

export type Events = EventsContract<
  EventName,
  {
    initialize: ListItem;
  },
  typeof uiEvents
>;
