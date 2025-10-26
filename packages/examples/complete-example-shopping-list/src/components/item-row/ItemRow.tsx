import { useSofter } from "@softer-components/redux-adapter";
import { itemRowDef } from "./item-row.component.ts";

export const ItemRow = ({ path = "/" }) => {
  const [{ name }, { itemRowClicked }] = useSofter(path, itemRowDef);
  return (
    <div className="clickable" onClick={() => itemRowClicked()}>
      {name}
    </div>
  );
};
