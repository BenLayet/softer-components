import { useSofterSingleChildrenPaths } from "@softer-components/redux-adapter";

import { AppContract } from "./app.component";
import { ListManager } from "./list-manager/ListManager";
import { List } from "./list/List";

export const App = ({ path = "" }) => {
  const { listManager, list } =
    useSofterSingleChildrenPaths<AppContract["children"]>(path);
  return (
    <div>
      <h1>Shopping List</h1>
      {listManager && <ListManager path={listManager} />}
      {list && <List path={list} />}
    </div>
  );
};
