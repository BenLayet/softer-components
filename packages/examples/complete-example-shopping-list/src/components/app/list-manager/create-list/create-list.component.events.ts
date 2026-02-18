import { EventsContract } from "@softer-components/types";

import { List } from "../../../../model";

export type eventNames =
  | "listNameChanged"
  | "createNewListSubmitted"
  | "createNewListRequested"
  | "createNewListSucceeded"
  | "createNewListFailed"
  | "setExistingListNames";

export type Events = EventsContract<
  eventNames,
  {
    setExistingListNames: string[];
    listNameChanged: string;
    createNewListRequested: string;
    createNewListSucceeded: List;
    createNewListFailed: string;
    listSelected: List;
  }
>;
