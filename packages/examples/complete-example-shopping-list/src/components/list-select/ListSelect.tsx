import { useSofter } from "@softer-components/redux-adapter";
import { ListSelectUi } from "./list-select.component.ts";

export const ListSelect = ({ path = "/" }) => {
  const [
    { name },
    { listNameChanged, createNewListClicked, openPreviousListRequested },
  ] = useSofter<ListSelectUi>(path);

  return (
    <div>
      <div className="horizontal">
        <input
          type="text"
          placeholder="New list name"
          value={name}
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
