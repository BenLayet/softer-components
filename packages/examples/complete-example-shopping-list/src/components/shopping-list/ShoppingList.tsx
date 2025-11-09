import { NewItemForm } from "../new-item-form/NewItemForm.tsx";
import { ItemList } from "../item-list/ItemList.tsx";
import { useSofterChildrenPath } from "@softer-components/redux-adapter";
import { ShoppingListChildren } from "./shopping-list.component.ts";

export const ShoppingList = ({ path = "/" }) => {
  const { newItemForm, itemList } =
    useSofterChildrenPath<ShoppingListChildren>(path);
  return (
    <div>
      <NewItemForm path={newItemForm} />
      <ItemList path={itemList} />
    </div>
  );
};
