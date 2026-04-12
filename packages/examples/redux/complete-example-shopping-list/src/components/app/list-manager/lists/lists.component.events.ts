import { EventsContract } from "@softer-components/types";

import { List, ListId } from "../../../../model";

export const uiEvents = [
  "listNamesChanged",
  "listClicked",
  "listSelected",
  "deleteClicked",
] as const;

export const allEvents = [
  ...uiEvents,
  "initializeRequested",
  "fetchRequested",
  "fetchSucceeded",
  "fetchFailed",
  "deleteRequested",
  "deleteSucceeded",
  "deleteFailed",
] as const;
export type Events = EventsContract<
  typeof allEvents,
  {
    fetchSucceeded: List[];
    fetchFailed: string;
    listClicked: List;
    listSelected: List;
    deleteClicked: List;
    deleteRequested: ListId;
    deleteFailed: string;
    listNamesChanged: string[];
  },
  typeof uiEvents
>;
