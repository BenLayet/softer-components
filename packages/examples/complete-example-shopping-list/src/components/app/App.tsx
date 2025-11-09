import { ListSelect } from "../list-select/ListSelect.tsx";
import { ShoppingList } from "../shopping-list/ShoppingList.tsx";
import { useSofterChildrenPath } from "@softer-components/redux-adapter";
import { AppChildrenContract } from "./app.component.ts";

export const App = ({ path }: { path: string }) => {
  const { listSelect, shoppingList } =
    useSofterChildrenPath<AppChildrenContract>(path);

  return (
    <div>
      <h1>Shopping List</h1>
      {shoppingList && <ShoppingList path={shoppingList} />}
      {listSelect && <ListSelect path={listSelect} />}
    </div>
  );
};
