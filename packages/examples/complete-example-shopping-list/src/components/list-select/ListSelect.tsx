import { useSofter } from "@softer-components/redux-adapter";
import { ListSelectContract } from "./list-select.component";

export const ListSelect = ({ path = "" }) => {
  const [
    { listName },
    { listNameChanged, createNewListClicked, openPreviousListRequested },
  ] = useSofter<ListSelectContract>(path);

  return (
    <div>
      <div className="horizontal">
        <form
          onSubmit={e => {
            e.preventDefault();
            createNewListClicked();
          }}
        >
          <input
            type="text"
            placeholder="New list name"
            value={listName}
            onChange={e => listNameChanged(e.target.value)}
          />
          <button type="submit">Create new list</button>
        </form>
      </div>
      <button onClick={() => openPreviousListRequested()}>
        Open previous list
      </button>
    </div>
  );
};
