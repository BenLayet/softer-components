import {
  ComponentContract,
  ComponentDef,
  ExtractComponentChildrenContract,
  ExtractComponentValuesContract,
  Selectors,
} from "./softer-component-types";

/////////////////////
// ITEM
////////////////////

type ItemState = {
  name: string;
  quantity: number;
};

type ItemEvents = {
  removeRequested: { payload: undefined };
  incrementQuantityRequested: { payload: undefined };
  decrementQuantityRequested: { payload: undefined };
  initialize: { payload: string };
};

const selectors = {
  name: (state) => state.name,
  quantity: (state) => state.quantity,
  isEmpty: (state) => state.quantity < 1,
} satisfies Selectors<ItemState>;

export type ItemContract = {
  values: ExtractComponentValuesContract<typeof selectors>;
  events: ItemEvents;
  children: {};
  state: ItemState;
};

const itemDef: ComponentDef<ItemContract> = {
  selectors,
  uiEvents: ["incrementQuantityRequested", "decrementQuantityRequested"],
  updaters: {
    initialize: ({ payload: name }) => ({
      name: name,
      quantity: 1,
    }),
    incrementQuantityRequested: ({ state }) => {
      state.quantity++;
    },
    decrementQuantityRequested: ({ state }) => {
      state.quantity--;
    },
  },
  eventForwarders: [
    {
      from: "decrementQuantityRequested",
      to: "removeRequested",
      onCondition: ({ selectors }) => selectors.isEmpty(),
    },
  ],
};

/////////////////////
// List
////////////////////
const initialState = {
  listName: "My Shopping List",
  nextItemName: "",
  lastItemId: 0,
};

type ListState = typeof initialState;
type ListEvents = {
  nextItemNameChanged: { payload: string };
  nextItemSubmitted: { payload: undefined };
  addItemRequested: { payload: string };
  resetItemNameRequested: { payload: undefined };
  incrementItemQuantityRequested: { payload: number };
  createItemRequested: { payload: { itemName: string; itemId: number } };
  removeItemRequested: { payload: number };
};

const childrenComponents = {
  items: itemDef,
};

const listSelectors = {
  listName: (state) => state.listName,
  nextItemName: (state) => state.nextItemName.trim(),
  nextItemId: (state) => state.lastItemId + 1,
} satisfies Selectors<ListState>;

export type ListContract = {
  state: ListState;
  values: ExtractComponentValuesContract<typeof listSelectors>;
  events: ListEvents;
  children: ExtractComponentChildrenContract<
    typeof childrenComponents,
    { items: "isCollection" }
  >;
};

export const listDef: ComponentDef<ListContract> = {
  initialState,
  selectors: listSelectors,
  uiEvents: ["nextItemNameChanged", "addItemRequested"],
  updaters: {
    nextItemNameChanged: ({ state, payload: nextItemName }) => {
      state.nextItemName = nextItemName;
    },
    addItemRequested: ({ state }) => {
      state.nextItemName = "";
    },
    createItemRequested: ({
      childrenNodes: { items },
      payload: { itemId },
      state,
    }) => {
      items.push(`${itemId}`);
      state.lastItemId = itemId;
    },
    removeItemRequested: ({
      childrenNodes: { items },
      payload: idToRemove,
    }) => {
      items.splice(items.indexOf(`${idToRemove}`), 1);
    },
  },
  eventForwarders: [
    {
      from: "nextItemSubmitted",
      to: "addItemRequested",
      withPayload: ({ selectors }) => selectors.nextItemName().trim(),
      onCondition: ({ selectors }) => selectors.nextItemName().trim() !== "",
    },
    {
      from: "addItemRequested",
      to: "createItemRequested",
      onCondition: ({ children: { items }, payload: itemName }) =>
        Object.values(items).every(
          (item) => item.selectors.name() !== itemName
        ),
      withPayload: ({ selectors, payload: itemName }) => ({
        itemName,
        itemId: selectors.nextItemId(),
      }),
    },
    {
      from: "addItemRequested",
      to: "incrementItemQuantityRequested",
      onCondition: ({ children: { items }, payload: itemName }) =>
        Object.values(items).some((item) => item.selectors.name() === itemName),
      withPayload: ({ children: { items }, payload: itemName }) =>
        Object.entries(items)
          .filter(([, item]) => item.selectors.name() === itemName)
          .map(([key]) => parseInt(key))[0],
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
      commands: [
        {
          from: "incrementItemQuantityRequested",
          to: "incrementQuantityRequested",
          toKeys: ({ payload: itemId }) => [`${itemId}`],
        },
        {
          from: "createItemRequested",
          to: "initialize",
          withPayload: ({ payload: { itemName } }) => itemName,
          toKeys: ({ payload: { itemId } }) => [`${itemId}`],
        },
      ],
      listeners: [
        {
          from: "removeRequested",
          to: "removeItemRequested",
          withPayload: ({ fromChildKey }) => parseInt(fromChildKey),
        },
      ],
    },
  },
};
