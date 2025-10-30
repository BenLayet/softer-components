import { ListSelect } from "../list-select/ListSelect.tsx";
import { useSofter } from "@softer-components/redux-adapter";
import { appComponentDef } from "./app.component.ts";
import { ShoppingList } from "../shopping-list/ShoppingList.tsx";

export const App = ({ path }: { path: string }) => {
  const [{ isSelected, selectedListName }, {}, { listSelect, shoppingList }] =
    useSofter<typeof appComponentDef>(path);

  return (
    <div>
      <h1>Shopping List</h1>
      {isSelected ? (
        <div>
          <h2>{selectedListName}</h2>
          <ShoppingList path={shoppingList} />
        </div>
      ) : (
        <ListSelect path={listSelect} />
      )}
    </div>
  );
};
