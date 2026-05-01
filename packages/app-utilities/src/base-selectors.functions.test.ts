import { describe, expect, it } from "vitest";

import { createBaseSelectors } from "./base-selectors.functions";

describe("createBaseSelectors", () => {
  it("creates one selector per own enumerable string key", () => {
    const selectors = createBaseSelectors({
      count: 0,
      label: "Counter",
    });

    expect(Object.keys(selectors)).toEqual(["count", "label"]);
    expect(selectors.count({ count: 3, label: "X" })).toBe(3);
    expect(selectors.label({ count: 3, label: "X" })).toBe("X");
  });

  it("reads values from the runtime state, not from initialState", () => {
    const selectors = createBaseSelectors({ count: 1 });

    expect(selectors.count({ count: 42 })).toBe(42);
  });

  it("returns an empty object when initialState has no keys", () => {
    const selectors = createBaseSelectors({});

    expect(selectors).toEqual({});
  });
});
