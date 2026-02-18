import { EventsContract } from "@softer-components/types";

import { List } from "../../../model";

type EventNames = "emptyListCreated" | "listSelected" | "listNamesChanged";

export type Events = EventsContract<
  EventNames,
  {
    emptyListCreated: List;
    listSelected: List;
    listNamesChanged: string[];
  }
>;
