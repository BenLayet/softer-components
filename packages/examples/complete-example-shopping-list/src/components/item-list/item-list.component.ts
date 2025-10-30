import { ComponentDef } from "@softer-components/types";
import { Item } from "../../model/Item.ts";
import { itemRowDef } from "../item-row/item-row.component.ts";

// Initial state definition
const initialState = {
  name: "",
  items: [] as Item[],
};

// Events type declaration
type ItemListEvents = {
  removeItemRequested: { payload: Item };
};
// Commands type declaration
type ItemListCommands = {
  addItem: { payload: Item };
};

// Component definition
export const itemListDef: ComponentDef<
  typeof initialState,
  ItemListEvents,
  ItemListCommands
> = {
  initialState,
  selectors: {
    name: state => state.name,
  },
  events: {
    addItemRequested: {
      stateUpdater: (state, item) => ({
        ...state,
        items: [item, ...state.items],
      }),
    },
    removeItemRequested: {
      stateUpdater: (state, item) => ({
        ...state,
        items: state.items.filter(i => i.id !== item.id),
      }),
    },
  },
  children: {
    itemRows: {
      ...itemRowDef,
      isCollection: true,
      getKeys: state => state.items.map(item => item.id),
      initialStateFactoryWithKey: (state, id) => ({
        item: state.items.find(i => i.id == id) as Item,
      }),
      listeners: [
        {
          from: "removeItemRequested",
          to: "removeItemRequested",
        },
      ],
    },
  },
};
