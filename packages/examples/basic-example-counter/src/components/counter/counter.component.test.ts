import { describe, it, expect } from "vitest";
import { counterComponentDef } from "./counter.component";

describe("counter.component", () => {
  it("initialState is { count: 0 }", () => {
    expect(counterComponentDef.initialState).toEqual({ count: 0 });
  });

  it("selectors.count returns the state's value", () => {
    const s = { count: 42 };
    const { selectors } = counterComponentDef;
    expect(selectors.count(s)).toBe(42);
  });

  it("incrementRequested updater returns a new state with count + 1", () => {
    const prev = { count: 0 };
    const next = counterComponentDef.events.incrementRequested.stateUpdater?.(prev, undefined);
    expect(next).not.toBe(prev);
    expect(next?.count).toBe(1);
  });

  it("decrementRequested updater returns a new state with count - 1", () => {
    const prev = { count: 0 };
    const next = counterComponentDef.events.decrementRequested.stateUpdater?.(prev, undefined);
    expect(next).not.toBe(prev);
    expect(next?.count).toBe(-1);
  });
});
