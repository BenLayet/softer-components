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
  children: {
    itemRows: {
      componentDef: itemRowDef,
      isCollection: true,
      getKeys: state => state.items.map(item => item.id),
      protoState: (state, id) => state.items.find(i => i.id == id),
      listeners: [
        {
          from: "removeItemRequested",
          to: "removeItemRequested",
        },
      ],
    },
  },
} satisfies ComponentDef<typeof initialState, ItemListEvents>;

export type ItemListChildren = ExtractChildrenContract<typeof itemListDef>;
