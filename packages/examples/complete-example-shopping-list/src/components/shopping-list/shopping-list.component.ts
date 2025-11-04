import { ComponentDef } from "@softer-components/types";
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
export const shoppingListComponentDef: ComponentDef<
  typeof initialState,
  ShoppingListEvents
> = {
  constructor: () => initialState,
  events: {
    newItemSubmitted: {},
  },
  children: {
    newItemForm: {
      ...newItemFormDef,
      listeners: [
        {
          from: "submitted",
          to: "newItemSubmitted",
          withPayload: (_: {}, name: string) => ({
            id: new Date().getTime().toString(),
            name,
          }),
        },
      ],
    },
    itemList: {
      ...itemListDef,
      commands: [
        {
          from: "newItemSubmitted",
          to: "addItemRequested",
          withPayload: (_: {}, item: Item) => item,
        },
      ],
    },
  },
};
