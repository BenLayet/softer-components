import { useSofter } from "@softer-components/redux-adapter";
import { ListSelectContract } from "./list-select.component";

export const ListSelect = ({ path = "" }) => {
  const [
    { listName, savedLists },
    { listNameChanged, createNewListClicked, openPreviousListRequested },
    {},
    {},
  ] = useSofter<ListSelectContract>(path);

  return (
    <div>
      <ul>
        {savedLists.map(list => (
          <li>
            <a href="#" onClick={() => openPreviousListRequested(list.id)}>
              {list.name}
            </a>
          </li>
        ))}
      </ul>
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
    </div>
  );
};
