import { useSofterChildrenPath } from "@softer-components/redux-adapter";
import { ItemRow } from "../item-row/ItemRow.tsx";
import { ItemListChildren } from "./item-list.component";

export const ItemList = ({ path = "/" }) => {
  const { itemRows } = useSofterChildrenPath<ItemListChildren>(path);
  return (
    <div style={{ maxWidth: "200px" }}>
      {itemRows.map(path => (
        <ItemRow key={path} path={path} />
      ))}
    </div>
  );
};
