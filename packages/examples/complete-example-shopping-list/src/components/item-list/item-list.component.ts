import {
  ComponentDef,
  ExtractChildrenContract,
} from "@softer-components/types";
import { Item } from "../../model/Item.ts";
import { itemRowDef } from "../item-row/item-row.component.ts";

// Initial state definition
const initialState = {
  name: "",
  items: [] as Item[],
};

// Events type declaration
type ItemListEvents = {
  addItemRequested: { payload: Item };
  removeItemRequested: { payload: Item };
  addItem: { payload: Item };
};

// children
const children = {
  itemRows: itemRowDef,
};

// Component definition
export const itemListDef = {
  initialState: () => initialState,
  selectors: {
    name: state => state.name,
  },
  events: {
    addItemRequested: {
      payloadFactory: (item: Item) => item,
    },
    removeItemRequested: {
      payloadFactory: (item: Item) => item,
    },
    addItem: {
      payloadFactory: (item: Item) => item,
    },
  },
  stateUpdaters: {
    addItemRequested: (state, item: Item) => ({
      ...state,
      items: [item, ...state.items],
    }),
    removeItemRequested: (state, item: Item) => ({
      ...state,
      items: state.items.filter(i => i.id !== item.id),
    }),
  },
  children,
  childrenConfig: {
    itemRows: {
      isCollection: true,
      addOnEvent: {
        type: "addItemRequested",
        key: (state, payload) => payload.id,
      },
      removeOnEvent: {
        type: "removeItemRequested",
        key: (state, payload) => payload.id,
      },
      listeners: [
        {
          from: "removeItemRequested",
          to: "removeItemRequested",
        },
      ],
      commands: [
        {
          from: "addItemRequested",
          to: "addItemRequested",
        },
      ],
    },
  },
} satisfies ComponentDef<typeof initialState, ItemListEvents, typeof children>;

export type ItemListChildren = ExtractChildrenContract<typeof itemListDef>;
