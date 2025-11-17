import { ListSelect } from "../list-select/ListSelect.tsx";
import { useSofter } from "@softer-components/redux-adapter";
import { AppComponentContract } from "./app.component.ts";
import { List } from "../list/List.tsx";

export const App = ({ path = "" }) => {
  const [{}, { backClicked }, { listSelect, list }] =
    useSofter<AppComponentContract>(path);

  return (
    <div>
      <h1>Shopping List</h1>
      {listSelect && <ListSelect path={listSelect} />}
      {list && (
        <div>
          <a href="#" onClick={() => backClicked()}>
            Back to list selection
          </a>
          <List path={list} />
        </div>
      )}
    </div>
  );
};
