import { EventsContract } from "@softer-components/types";

import { ListItem } from "../../../../model";

type EventNames =
  | "initialize"
  | "removeItemRequested"
  | "incrementRequested"
  | "decrementRequested"
  | "itemChanged";

export type Events = EventsContract<
  EventNames,
  {
    initialize: ListItem;
  }
>;
export const uiEvents: EventNames[] = [
  "removeItemRequested",
  "incrementRequested",
  "decrementRequested",
];
