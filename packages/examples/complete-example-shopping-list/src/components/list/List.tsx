import { useSofter } from "@softer-components/redux-adapter";
import { ItemRow } from "../item-row/ItemRow.tsx";
import { ListContract } from "./list.component.ts";

export const List = ({ path = "" }) => {
  const [
    { nextItemName },
    { nextItemSubmitted, nextItemNameChanged },
    { items },
  ] = useSofter<ListContract>(path);
  return (
    <div>
      <form
        onSubmit={e => {
          e.preventDefault();
          nextItemSubmitted();
        }}
      >
        <input
          type="text"
          value={nextItemName}
          onChange={e => nextItemNameChanged(e.target.value)}
        />
        <button type="submit">Add Item</button>
      </form>
      <div style={{ maxWidth: "500px" }}>
        {items.map(path => (
          <ItemRow key={path} path={path} />
        ))}
      </div>
    </div>
  );
};
