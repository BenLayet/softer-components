import { useSofter } from "@softer-components/redux-adapter";
import { CounterContract } from "./counter.component.ts";

export const Counter = ({ path = [] }) => {
  const [{ count }, { incrementRequested, decrementRequested }] =
    useSofter<CounterContract>(path);
  return (
    <div className="horizontal">
      <button aria-label="Decrement value" onClick={() => decrementRequested()}>
        -
      </button>
      <label>{count}</label>
      <button aria-label="Increment value" onClick={() => incrementRequested()}>
        +
      </button>
    </div>
  );
};
