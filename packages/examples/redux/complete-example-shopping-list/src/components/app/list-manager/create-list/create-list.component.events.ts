import { EventsContract } from "@softer-components/types";

import { List } from "../../../../model";

export const uiEvents = ["createNewListSubmitted", "listNameChanged"] as const;
export const allEvents = [
  ...uiEvents,
  "createNewListRequested",
  "createNewListSucceeded",
  "createNewListFailed",
  "setExistingListNames",
] as const;
export type Events = EventsContract<
  typeof allEvents,
  {
    setExistingListNames: string[];
    listNameChanged: string;
    createNewListRequested: string;
    createNewListSucceeded: List;
    createNewListFailed: string;
    listSelected: List;
  },
  typeof uiEvents
>;
