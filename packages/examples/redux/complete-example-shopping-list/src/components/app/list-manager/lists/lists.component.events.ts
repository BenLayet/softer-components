import { EventsContract } from "@softer-components/types";

import { List, ListId } from "../../../../model";

export type EventName =
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
  EventName,
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
