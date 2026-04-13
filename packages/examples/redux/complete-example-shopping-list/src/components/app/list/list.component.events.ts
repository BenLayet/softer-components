// Events
import { EventsContract } from "@softer-components/types";

import { ItemId, List, ListItem } from "../../../model";
import { ErrorMessage } from "./list.component.state";

export const uiEvents = [
  "nextItemNameChanged",
  "newItemSubmitted",
  "goBackClicked",
] as const;

export const allEvents = [
  ...uiEvents,
  "initialize",
  "createItemOrIncrementQuantityRequested",
  "resetNextItemNameRequested",
  "incrementItemQuantityRequested",
  "createItemRequested",
  "removeItemRequested",
  "saveRequested",
  "saveSucceeded",
  "saveFailed",
] as const;

export type Events = EventsContract<
  typeof allEvents,
  {
    initialize: List;
    nextItemNameChanged: string;
    createItemOrIncrementQuantityRequested: string;
    createItemRequested: ListItem;
    incrementItemQuantityRequested: ItemId;
    removeItemRequested: ItemId;
    saveFailed: ErrorMessage;
  },
  typeof uiEvents
>;
