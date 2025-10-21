import { counterComponentDef } from "./counter.component.ts";
import { useSofter } from "@softer-components/redux-adapter";

export const Counter = ({ path = "/" }) => {
  const [selectors, events] = useSofter(path, counterComponentDef);
  return (
    <div className="horizontal">
      <button
        aria-label="Decrement value"
        onClick={() => events.decrementRequested()}
      >
        -
      </button>
      <label>{selectors.count}</label>
      <button
        aria-label="Increment value"
        onClick={() => events.incrementRequested()}
      >
        +
      </button>
    </div>
  );
};
