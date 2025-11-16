import {
  ComponentDef,
  ExtractComponentValuesContract,
} from "@softer-components/types";
import { Item } from "../../model/Item.ts";
// Initial state definition
type ItemRowState = { item?: Item; quantity: number };

// Events type declaration
type ItemRowEvents = {
  initialize: { payload: Item };
  removeItemRequested: { payload: undefined };
  incrementRequested: { payload: undefined };
  decrementRequested: { payload: undefined };
};

const selectors = {
  name: (state: ItemRowState) => state.item?.name,
  quantity: (state: ItemRowState) => state.quantity,
};

export type ItemRowContract = {
  state: ItemRowState;
  events: ItemRowEvents;
  children: {};
  values: ExtractComponentValuesContract<typeof selectors>;
};

// Component definition
export const itemRowDef: ComponentDef<ItemRowContract> = {
  selectors,
  uiEvents: ["removeItemRequested", "incrementRequested", "decrementRequested"],
  updaters: {
    initialize: ({ state, payload: item }) => {
      state.item = item;
      state.quantity = 1;
    },
  },
};
