import { useSofter } from "@softer-components/redux-adapter";
import { CounterContract } from "./counter.component.ts";
import { useState } from "react";

export const Counter = ({ path = "/" }) => {
  const [{ count }, { incrementRequested, decrementRequested }] =
    useSofter<CounterContract>(path);

  console.log("Counter render", { path, count });
  const [test, setTest] = useState(0);
  return (
    <div className="horizontal">
      <button aria-label="Decrement value" onClick={() => decrementRequested()}>
        -
      </button>
      <label>{count}</label>
      <button aria-label="Increment value" onClick={() => incrementRequested()}>
        +
      </button>
      <button onClick={() => setTest(test + 1)}>Test: {test}</button>
    </div>
  );
};
