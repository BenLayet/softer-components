import { createComponentDef} from "@softer-components/types";
import {
  newItemFormDef,
  NewItemFormEvents,
} from "../new-item-form/new-item-form.component";
import { itemListDef, ItemListEvents } from "../item-list/item-list.component";

type ChildrenEvents = {
  newItemForm: NewItemFormEvents;
  itemList: ItemListEvents;
};

// Component Definition
export const shoppingListComponentDef = createComponentDef<ChildrenEvents>({
  children: { newItemForm: newItemFormDef, itemList: itemListDef },
  eventForwarders: [
    {
      onEvent: "newItemForm/newItemSubmitted",
      thenDispatch:() => "itemList/addItemRequested",
    },
  ],
});
