import type { EventsContract } from "@softer-components/types";

import type { List } from "../../../model";

export const allEvents = [
  "emptyListCreated",
  "listSelected",
  "listNamesChanged",
] as const;
export type Events = EventsContract<
  typeof allEvents,
  {
    emptyListCreated: List;
    listSelected: List;
    listNamesChanged: string[];
  },
  []
>;
