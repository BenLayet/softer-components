import { useSofter } from "@softer-components/redux-adapter";
import { ListSelectContract } from "./list-select.component";

export const ListSelect = ({ path = "" }) => {
  const [
    { name },
    { listNameChanged, createNewListClicked, openPreviousListRequested },
  ] = useSofter<ListSelectContract>(path);

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
