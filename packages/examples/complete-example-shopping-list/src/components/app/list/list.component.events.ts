// Events
import { EventsContract } from "@softer-components/types";

import { ItemId, List, ListItem } from "../../../model";
import { ErrorMessage } from "./list.component.state";

type EventName =
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

export const uiEvents = [
  "nextItemNameChanged",
  "newItemSubmitted",
  "goBackClicked",
] as const satisfies EventName[];

export type Events = EventsContract<
  EventName,
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
