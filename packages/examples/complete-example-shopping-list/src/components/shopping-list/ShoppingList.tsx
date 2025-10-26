import { AddItemForm } from "../new-item-form/NewItemForm.tsx";
import { ItemList } from "../item-list/ItemList.tsx";
import { shoppingListComponentDef } from "./shopping-list.component.ts";
import { useSofterChildrenPath } from "@softer-components/redux-adapter";

export const ShoppingList = ({ path = "/" }) => {
  const { newItemForm, itemList } = useSofterChildrenPath(
    path,
    shoppingListComponentDef,
  );
  return (
    <div>
      <AddItemForm path={newItemForm} />
      <ItemList path={itemList} />
    </div>
  );
};
