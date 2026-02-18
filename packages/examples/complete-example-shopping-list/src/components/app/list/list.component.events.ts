// Events
import { EventsContract } from "@softer-components/types";

import { ItemId, List, ListItem } from "../../../model";
import { ErrorMessage } from "./list.component.state";

type EventNames =
  | "initialize"
  | "goBackClicked"
  | "nextItemNameChanged"
  | "newItemSubmitted"
  | "createItemOrIncrementQuantityRequested"
  | "resetNextItemNameRequested"
  | "incrementItemQuantityRequested"
  | "createItemRequested"
  | "removeItemRequested"
  | "saveRequested"
  | "saveSucceeded"
  | "saveFailed";

export type Events = EventsContract<
  EventNames,
  {
    initialize: List;
    nextItemNameChanged: string;
    createItemOrIncrementQuantityRequested: string;
    createItemRequested: ListItem;
    incrementItemQuantityRequested: ItemId;
    removeItemRequested: ItemId;
    saveFailed: ErrorMessage;
  }
>;

export const uiEvents: EventNames[] = [
  "nextItemNameChanged",
  "newItemSubmitted",
  "goBackClicked",
];
