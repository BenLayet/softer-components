import { useSofter, useSofterEvents } from "@softer-components/redux-adapter";
import { listSelectDef } from "./list-select.component.ts";

export const ListSelect = ({ path = "/" }) => {
  const [{ name }] = useSofter<typeof listSelectDef>(path);

  const { listNameChanged, createNewListClicked, openPreviousListRequested } =
    useSofterEvents<typeof listSelectDef>(path);
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
