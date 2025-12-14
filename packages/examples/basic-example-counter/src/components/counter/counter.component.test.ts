import { givenRootComponent } from "@softer-components/utils/test-utilities";
import { describe, it } from "vitest";

import { counterComponentDef } from "./counter.component";

describe("counter.component", () => {
  it("initialState is { count: 0 }", () => {
    givenRootComponent(counterComponentDef).thenExpect([]).count.toBe(0);
  });
  it("when increment is requested then count should be + 1", () => {
    givenRootComponent(counterComponentDef)
      .when({
        name: "incrementRequested",
        componentPath: [],
        payload: undefined,
      })
      .thenExpect([])
      .count.toBe(1);
  });

  it("when decrement is requested then count should be - 1", () => {
    givenRootComponent(counterComponentDef)
      .when({
        name: "decrementRequested",
        componentPath: [],
        payload: undefined,
      })
      .thenExpect([])
      .count.toBe(-1);
  });
});
