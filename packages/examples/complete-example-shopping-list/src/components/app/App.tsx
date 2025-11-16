import { ListSelect } from "../list-select/ListSelect.tsx";
import { useSofterChildrenPath } from "@softer-components/redux-adapter";
import { AppComponentContract } from "./app.component.ts";
import { List } from "../list/List.tsx";

export const App = ({ path = "" }) => {
  const { listSelect, list } =
    useSofterChildrenPath<AppComponentContract["children"]>(path);

  return (
    <div>
      <h1>Shopping List</h1>
      {list && <List path={list} />}
      {listSelect && <ListSelect path={listSelect} />}
    </div>
  );
};
