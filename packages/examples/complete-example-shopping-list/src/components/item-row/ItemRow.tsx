import { useSofter } from "@softer-components/redux-adapter";
import { ItemRowContract } from "./item-row.component.ts";

export const ItemRow = ({ path = "" }) => {
  const [
    { name, quantity },
    { removeItemRequested, decrementRequested, incrementRequested },
  ] = useSofter<ItemRowContract>(path);
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
        {name}
        <span style={{ marginLeft: "1em", fontSize: "0.7em" }}>
          x{quantity}
        </span>
      </div>
      <div className="horizontal">
        <button
          aria-label="Decrement value"
          onClick={() => decrementRequested()}
        >
          -
        </button>
        <button
          aria-label="Increment value"
          onClick={() => incrementRequested()}
        >
          +
        </button>
        <button onClick={() => removeItemRequested()}>X</button>
      </div>
    </div>
  );
};
