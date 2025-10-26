import { useSofterChildrenPath } from "@softer-components/redux-adapter";
import { itemListDef } from "./item-list.component";
import { ItemRow } from "../item-row/ItemRow.tsx";

export const ItemList = ({ path = "/" }) => {
  const { itemRows } = useSofterChildrenPath(path, itemListDef);
  return (
    <>
      {itemRows.map(path => (
        <ItemRow key={path} path={path} />
      ))}
    </>
  );
};
