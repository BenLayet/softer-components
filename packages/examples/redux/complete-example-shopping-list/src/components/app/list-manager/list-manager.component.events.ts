import { EventsContract } from "@softer-components/types";

import { List } from "../../../model";

export const allEvents = [
  "emptyListCreated",
  "listSelected",
  "listNamesChanged",
];
export type Events = EventsContract<
  typeof allEvents,
  {
    emptyListCreated: List;
    listSelected: List;
    listNamesChanged: string[];
  },
  []
>;
