import { useSofter } from "@softer-components/redux-adapter";

import { CreateListContract } from "./create-list.component";

export const CreateList = ({ path = "" }) => {
  const [v, d] = useSofter<CreateListContract>(path);
  return (
    <div>
      <div className="horizontal">
        <form
          onSubmit={e => {
            e.preventDefault();
            d.createNewListSubmitted();
          }}
        >
          <input
            type="text"
            placeholder="Groceries, hardware store, etc."
            required
            autoFocus
            onChange={e => d.listNameChanged(e.target.value)}
          />
          <button type="submit">Create new list</button>
          {v.areErrorsVisible && (
            <div>
              {v.hasNameRequiredError && (
                <p className="error">Name should not be empty</p>
              )}
              {v.hasListAlreadyExistsError && (
                <p className="error">{v.listName} already exists</p>
              )}
              {v.hasSaveFailedError && (
                <p className="error">Error while saving...</p>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
