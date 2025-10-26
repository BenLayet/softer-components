import { useSofter } from "@softer-components/redux-adapter";
import { listSelectComponentDef } from "./list-select.component.ts";

export const ListSelect = ({ path = "/" }) => {
  const [
    { listName },
    { listNameChanged, createNewListClicked, openPreviousListRequested },
  ] = useSofter(path, listSelectComponentDef);
  return (
    <div>
      <div className="horizontal">
        <input
          type="text"
          placeholder="New list name"
          value={listName}
          onChange={e => listNameChanged(e.target.value)}
        />
        <button onClick={() => createNewListClicked()}>Create new list</button>
      </div>
      <button onClick={() => openPreviousListRequested}>
        Open previous list
      </button>
    </div>
  );
};
