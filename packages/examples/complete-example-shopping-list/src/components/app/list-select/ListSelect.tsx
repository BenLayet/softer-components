import { useSofter, useSofterEffects } from "@softer-components/redux-adapter";
import { ListSelectContract } from "./list-select.component.ts";
import { SavedLists } from "./saved-lists/SavedLists.tsx";
import { listSelectEffects } from "./list-select.effects.ts";

export const ListSelect = ({ path = "" }) => {
  const [v, d, c] = useSofter<ListSelectContract>(path);
  useSofterEffects(path, listSelectEffects);
  return (
    <div>
      <p style={{ textAlign: "start", width: "300px" }}>
        All lists ({v.savedListsCount})
      </p>
      <SavedLists path={c.savedLists} />
      <div className="horizontal">
        <form
          onSubmit={e => {
            e.preventDefault();
            d.createNewListClicked();
          }}
        >
          <input
            type="text"
            placeholder="New list name"
            value={v.listName}
            required
            autoFocus
            onChange={e => d.listNameChanged(e.target.value)}
          />
          {v.hasNameRequiredError && <p className="error">Name is required</p>}
          {v.hasListAlreadyExistsError && (
            <p className="error">{v.listName} already exists</p>
          )}
          <button type="submit">Create new list</button>
          {v.hasSaveFailedError && (
            <p className="error">Error while saving...</p>
          )}
        </form>
      </div>
    </div>
  );
};
