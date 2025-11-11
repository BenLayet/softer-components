import {
  ComponentDef,
  ExtractComponentChildrenContract,
  ExtractComponentValuesContract,
  Selectors,
} from "./softer-component-types";
import { Equal, Expect, ignore } from "./type-testing-utiliy-test";

/////////////////////
// ITEM
////////////////////

type ItemState = {
  name: string;
  quantity: number;
};

type ItemEvents = {
  removeRequested: { payload: string };
  incrementQuantityRequested: { payload: undefined };
  decrementQuantityRequested: { payload: undefined };
};

const selectors = {
  name: (state) => state.name,
  quantity: (state) => state.quantity,
} satisfies Selectors<ItemState>;

export type ItemContract = {
  values: ExtractComponentValuesContract<typeof selectors>;
  events: ItemEvents;
  children: {};
  state: ItemState;
};

// Type tests
ignore.unread as Expect<
  Equal<ItemContract["values"], { name: string; quantity: number }>
>;

const itemDef: ComponentDef<ItemContract> = {
  selectors,
  uiEvents: ["incrementQuantityRequested", "decrementQuantityRequested"],
  stateUpdaters: {
    incrementQuantityRequested: (state: ItemState) => ({
      ...state,
      quantity: state.quantity + 1,
    }),
    decrementQuantityRequested: (state: ItemState) => ({
      ...state,
      quantity: state.quantity - 1,
    }),
  },
  eventForwarders: [
    {
      from: "decrementQuantityRequested",
      to: "removeRequested",
      withPayload: (state: ItemState) => state.name,
      onCondition: (state: ItemState) => state.quantity <= 1,
    },
  ],
};

/////////////////////
// List
////////////////////
const initialState = {
  listName: "My Shopping List",
  nextItemName: "",
};

type ListState = typeof initialState;
type ListEvents = {
  nextItemNameChanged: { payload: string };
  nextItemSubmitted: { payload: undefined };
  addItemRequested: { payload: string };
  resetItemNameRequested: { payload: undefined };
  incrementItemQuantityRequested: { payload: string };
  createItemRequested: { payload: string };
  removeItemRequested: { payload: string };
};

const childrenComponents = {
  items: itemDef,
};

const listSelectors: Selectors<ListState> = {
  listName: (state) => state.listName,
  nextItemName: (state) => state.nextItemName,
};

export type ListContract = {
  values: ExtractComponentValuesContract<typeof listSelectors>;
  events: ListEvents;
  state: ListState;
  children: ExtractComponentChildrenContract<
    typeof childrenComponents,
    { items: "isCollection" }
  >;
};

export const listDef: ComponentDef<ListContract> = {
  initialState,
  selectors: listSelectors,
  uiEvents: ["nextItemNameChanged", "addItemRequested"],
  stateUpdaters: {
    nextItemNameChanged: (state: ListState, payload: string) => ({
      ...state,
      nextItemName: payload,
    }),
    addItemRequested: (state: ListState) => ({
      ...state,
      nextItemName: "",
    }),
  },
  eventForwarders: [
    {
      from: "nextItemSubmitted",
      to: "addItemRequested",
      withPayload: (state) => state.nextItemName.trim(),
      onCondition: (state) => state.nextItemName.trim() !== "",
    },
    {
      from: "addItemRequested",
      to: "createItemRequested",
      onCondition: (_, itemName, { items }) => !items[itemName],
    },
    {
      from: "addItemRequested",
      to: "incrementItemQuantityRequested",
      onCondition: (_, itemName, { items }) => !!items[itemName],
    },
    {
      from: "addItemRequested",
      to: "resetItemNameRequested",
    },
  ],
  childrenComponents,
  childrenConfig: {
    items: {
      isCollection: true,
      initialChildrenStates: {},
      updateOnEvents: [
        {
          type: "addItemRequested",
          newChildrenStates: (_, nextItemName) => ({
            [nextItemName]: {
              action: "create",
              initialState: { name: nextItemName, quantity: 1 },
            },
          }),
        },
        {
          type: "removeItemRequested", //TODO we could ask for theses events to have a payload of type of return value of newChildrenStates (and remove newChildrenStates)
          newChildrenStates: (_, itemName) => ({
            [itemName]: { action: "remove" },
          }),
        },
      ],
      commands: [
        {
          from: "incrementItemQuantityRequested",
          to: "incrementQuantityRequested", //TODO to: (_, itemName) => `items:${itemName}/incrementQuantityRequested`,
          childKey: (_, itemName) => itemName,
        },
      ],
      listeners: [
        {
          from: "removeRequested",
          to: "removeItemRequested",
          onCondition: (_, itemName) => !!itemName,
          withPayload: () => "test",
        },
      ],
    },
  },
};
