import { useSofter } from "@softer-components/redux-adapter";

import { CounterContract } from "./counter.component";

export const Counter = ({ path = "/" }) => {
  const [{ count }, { incrementRequested, decrementRequested }] =
    useSofter<CounterContract>(path);

  return (
    <div>
      <div style={{ fontSize: "4em" }}>{count}</div>
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
      </div>
    </div>
  );
};
