import { EventsContract } from "@softer-components/types";

import { List, ListId } from "../../../../model";

export type eventNames =
  | "initializeRequested"
  | "fetchRequested"
  | "fetchSucceeded"
  | "fetchFailed"
  | "listNamesChanged"
  | "listClicked"
  | "listSelected"
  | "deleteClicked"
  | "deleteRequested"
  | "deleteSucceeded"
  | "deleteFailed";

export type Events = EventsContract<
  eventNames,
  {
    fetchSucceeded: List[];
    fetchFailed: string;
    listClicked: List;
    listSelected: List;
    deleteClicked: List;
    deleteRequested: ListId;
    deleteFailed: string;
    listNamesChanged: string[];
  }
>;
