import { useSofter, useSofterEffects } from "@softer-components/redux-adapter";

import { ItemRow } from "./item-row/ItemRow.tsx";
import { ListContract } from "./list.component.ts";
import { listEffects } from "./list.effects.ts";

export const List = ({ path = "" }) => {
  const [v, d, _, c] = useSofter<ListContract>(path);
  useSofterEffects(path, listEffects);
  return (
    <div>
      <p style={{ textAlign: "start", width: "300px" }}>
        <a className="clickable" onClick={() => d.goBackClicked()}>
          All lists
        </a>{" "}
        &gt;&gt; {v.name}
      </p>
      <form
        onSubmit={e => {
          e.preventDefault();
          d.newItemSubmitted();
        }}
      >
        <input
          type="text"
          value={v.nextItemName}
          autoFocus
          onChange={e => d.nextItemNameChanged(e.target.value)}
        />
        <button type="submit">Add Item</button>
      </form>
      <div style={{ maxWidth: "500px" }}>
        {c.itemRows.map(path => (
          <ItemRow key={path} path={path} />
        ))}
      </div>
      {v.hasSaveFailedError && (
        <p className="error">Error while saving the list </p>
      )}
      {v.isSaving && <span className="spinner" />}
    </div>
  );
};
