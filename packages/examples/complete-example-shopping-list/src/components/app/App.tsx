import { useSofterSingleChildrenPaths } from "@softer-components/redux-adapter";

import { AppComponentContract } from "./app.component";
import { ListManager } from "./list-manager/ListManager.tsx";
import { List } from "./list/List.tsx";

export const App = ({ path = "" }) => {
  const { listManager, list } =
    useSofterSingleChildrenPaths<AppComponentContract["children"]>(path);
  return (
    <div>
      <h1>Shopping List Example</h1>
      {listManager && <ListManager path={listManager} />}
      {list && <List path={list} />}
    </div>
  );
};
