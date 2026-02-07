import { useSofter } from "@softer-components/redux-adapter";

import { Contract } from "./item-row.component";

export const ItemRow = ({ path = "" }) => {
  const [v, d] = useSofter<ItemRowContract>(path);
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
      <div
        className="horizontal"
        style={{ flexGrow: 1, justifyContent: "flex-start" }}
      >
        {v.name}
        <span style={{ marginLeft: "1em", fontSize: "0.7em" }}>
          x{v.quantity}
        </span>
      </div>
      <div className="horizontal">
        <button
          aria-label="Decrement value"
          onClick={() => d.decrementRequested()}
        >
          -
        </button>
        <button
          aria-label="Increment value"
          onClick={() => d.incrementRequested()}
        >
          +
        </button>
        <button onClick={() => d.removeItemRequested()}>X</button>
      </div>
    </div>
  );
};
