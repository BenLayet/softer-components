import { EventsContract } from "@softer-components/types";

import { List } from "../../../model";

type EventName = "emptyListCreated" | "listSelected" | "listNamesChanged";

export type Events = EventsContract<
  EventName,
  {
    emptyListCreated: List;
    listSelected: List;
    listNamesChanged: string[];
  },
  []
>;
