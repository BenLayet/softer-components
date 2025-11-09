import { useSofter } from "@softer-components/redux-adapter";
import { ItemRowUi } from "./item-row.component.ts";

export const ItemRow = ({ path = "/" }) => {
  const [{ name, quantity }, { itemRowClicked }] = useSofter<ItemRowUi>(path);
  return (
    <div
      className="clickable horizontal"
      style={{
        border: "1px dotted grey",
        minHeight: "1em",
        justifyContent: "space-between",
        padding: "0 4px",
      }}
    >
      {name}
      <span style={{ marginLeft: "1em", fontSize: "0.7em" }}>x{quantity}</span>
      <button onClick={itemRowClicked}>X</button>
    </div>
  );
};
