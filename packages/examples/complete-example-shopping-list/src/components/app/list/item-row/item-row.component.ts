import {
  ComponentDef,
  ComponentEventsContract,
  ExtractComponentValuesContract,
  Selectors,
} from "@softer-components/types";

import { ListItem } from "../../../../model";

// Initial state definition
type State = ListItem;

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
} satisfies Selectors<State>;

type Contract = {
  events: Events;
  children: {};
  values: ExtractComponentValuesContract<typeof selectors>;
};

// Component definition
const componentDef: () => ComponentDef<Contract, State> = () => ({
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
      onCondition: ({ values }) => values.isQuantityZero(),
    },
    {
      from: "incrementRequested",
      to: "itemChanged",
    },
    { from: "decrementRequested", to: "itemChanged" },
  ],
});

// Exporting the component definition
export const itemRowDef = componentDef;
export type ItemRowContract = Contract;
