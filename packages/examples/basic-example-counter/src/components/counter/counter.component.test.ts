import { describe, it, expect } from "vitest";
import { counterComponentDef } from "./counter.component";

describe("counter.component", () => {
  it("initialState is { value: 0 }", () => {
    expect(counterComponentDef.initialState).toEqual({ value: 0 });
  });

  it("selectors.count returns the state's value", () => {
    const s = { value: 42 };
    const { selectors } = counterComponentDef;
    expect(typeof selectors.count).toBe("function");
    expect(selectors.count(s)).toBe(42);
  });

  it("incrementRequested updater returns a new state with value + 1", () => {
    const prev = { value: 0 };
    const next = counterComponentDef.stateUpdaters.incrementRequested(prev);
    expect(next).not.toBe(prev);
    expect(next.value).toBe(1);
  });

  it("decrementRequested updater returns a new state with value - 1", () => {
    const prev = { value: 0 };
    const next = counterComponentDef.stateUpdaters.decrementRequested(prev);
    expect(next).not.toBe(prev);
    expect(next.value).toBe(-1);
  });
});
