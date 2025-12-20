import { useSofter, useSofterEffects } from "@softer-components/redux-adapter";
import { useEffect } from "react";

import { SavedListsContract } from "./saved-lists.component.ts";
import { savedListsEffects } from "./saved-lists.effects.ts";

export const SavedLists = ({ path = "" }) => {
  const [v, d] = useSofter<SavedListsContract>(path);
  useSofterEffects(path, savedListsEffects);
  useEffect(() => {
    d.displayed();
  }, [d]);
  return (
    <div style={{ maxWidth: "300px" }}>
      <ul style={{ width: "100%" }}>
        {v.savedLists.map(list => (
          <li
            key={list.id}
            style={{ display: "flex", justifyContent: "space-between" }}
          >
            <a href="#" onClick={() => d.listClicked(list)}>
              {list.name}
            </a>{" "}
            <button
              style={{ fontSize: "0.5em" }}
              onClick={() => d.deleteClicked(list)}
            >
              X
            </button>
          </li>
        ))}
      </ul>
      {v.isLoading && <span className="spinner" />}
      {v.hasFetchError && (
        <p className="error">An error occurred while loading the lists</p>
      )}
      {v.hasFetchError && (
        <p className="error">An error occurred while deleting the list</p>
      )}
      {v.shouldDisplayCount && <p>Number of saved lists: {v.savedListCount}</p>}
    </div>
  );
};
