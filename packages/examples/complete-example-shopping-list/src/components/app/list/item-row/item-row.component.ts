import {
  ComponentDef,
  ComponentEventsContract,
  ExtractComponentValuesContract,
  Selectors,
} from "@softer-components/types";

import { ListItem } from "../../../../model";

// Initial state definition
type ItemRowState = ListItem;

// Events
type eventNames =
  | "initialize"
  | "removeItemRequested"
  | "incrementRequested"
  | "decrementRequested"
  | "itemChanged";

type Events = ComponentEventsContract<
  eventNames,
  {
    initialize: ListItem;
  }
>;

// selectors
const selectors = {
  listItem: state => state,
  item: state => state.item,
  id: state => state.item.id,
  name: state => state.item.name,
  quantity: state => state.quantity,
  isQuantityZero: state => state.quantity === 0,
} satisfies Selectors<ItemRowState>;

export type ItemRowContract = {
  state: ItemRowState;
  events: Events;
  children: {};
  values: ExtractComponentValuesContract<typeof selectors>;
};

// Component definition
export const itemRowDef: ComponentDef<ItemRowContract> = {
  selectors,
  uiEvents: ["removeItemRequested", "incrementRequested", "decrementRequested"],
  updaters: {
    initialize: ({ payload: listItem }) => listItem,
    incrementRequested: ({ state }) => {
      state.quantity += 1;
    },
    decrementRequested: ({ state }) => {
      if (state.quantity > 0) {
        state.quantity -= 1;
      }
    },
  },
  eventForwarders: [
    {
      from: "decrementRequested",
      to: "removeItemRequested",
      onCondition: ({ selectors }) => selectors.isQuantityZero(),
    },
    {
      from: "incrementRequested",
      to: "itemChanged",
    },
    { from: "decrementRequested", to: "itemChanged" },
  ],
};
