import { ListSelect } from "./list-select/ListSelect.tsx";
import { useSofterSingleChildrenPaths } from "@softer-components/redux-adapter";
import { AppComponentContract } from "./app.component.ts";
import { List } from "./list/List.tsx";

export const App = ({ path = "" }) => {
  const { listSelect, list } =
    useSofterSingleChildrenPaths<AppComponentContract["children"]>(path);
  return (
    <div>
      <h1>ShopShop App</h1>
      {listSelect && <ListSelect path={listSelect} />}
      {list && <List path={list} />}
    </div>
  );
};
