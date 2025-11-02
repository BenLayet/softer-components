import { ListSelect } from "../list-select/ListSelect.tsx";
import { ShoppingList } from "../shopping-list/ShoppingList.tsx";

export const App = ({ path }: { path: string }) => {
  const { listSelect, shoppingList } = useSofterChildren<AppComponentUi>(path);

  return (
    <div>
      <h1>Shopping List</h1>
      {shoppingList && <ShoppingList path={shoppingList} />}
      {listSelect && <ListSelect path={listSelect} />}
    </div>
  );
};
