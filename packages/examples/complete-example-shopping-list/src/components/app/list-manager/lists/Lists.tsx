import { useSofter } from "@softer-components/redux-adapter";

import { ListsContract } from "./lists.component";

export const Lists = ({ path = "" }) => {
  const [v, d] = useSofter<ListsContract>(path);
  return (
    <div style={{ maxWidth: "300px" }}>
      <ul style={{ width: "100%" }}>
        {v.lists.map(list => (
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
    </div>
  );
};
