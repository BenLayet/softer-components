import {
  ComponentDef,
  ExtractChildrenContract,
} from "@softer-components/types";
import { newItemFormDef } from "../new-item-form/new-item-form.component";
import { itemListDef } from "../item-list/item-list.component";
import { Item } from "../../model/Item.ts";

// Initial state definition
const initialState = {};

// Events type declaration
type ShoppingListEvents = {
  newItemSubmitted: { payload: Item };
};

// Component definition
export const shoppingListDef = {
  initialState: () => initialState,
  events: {
    newItemSubmitted: {
      payloadFactory: (item: Item) => item,
    },
  },
  children: {
    newItemForm: {
      componentDef: newItemFormDef,
      listeners: [
        {
          from: "newItemSubmitted",
          to: "newItemSubmitted",
        },
      ],
    },
    itemList: {
      componentDef: itemListDef,
      commands: [
        {
          from: "newItemSubmitted",
          to: "addItemRequested",
          withPayload: (_: {}, item: Item) => ({ ...item, quantity: 1 }),
        },
      ],
    },
  },
} satisfies ComponentDef<typeof initialState, ShoppingListEvents>;

export type ShoppingListChildren = ExtractChildrenContract<
  typeof shoppingListDef
>;
