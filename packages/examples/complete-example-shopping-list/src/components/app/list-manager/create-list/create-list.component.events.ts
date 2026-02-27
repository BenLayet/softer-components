import { EventsContract } from "@softer-components/types";

import { List } from "../../../../model";

export type EventName =
  | "listNameChanged"
  | "createNewListSubmitted"
  | "createNewListRequested"
  | "createNewListSucceeded"
  | "createNewListFailed"
  | "setExistingListNames";

export type Events = EventsContract<
  EventName,
  {
    setExistingListNames: string[];
    listNameChanged: string;
    createNewListRequested: string;
    createNewListSucceeded: List;
    createNewListFailed: string;
    listSelected: List;
  }
>;
