import {
  TestStore,
  initTestStore,
} from "@softer-components/utils/test-utilities";
import { describe, expect, it } from "vitest";

import { CounterContract, counterDef } from "./counter.component";

describe("counter.component", () => {
  let testStore: TestStore<CounterContract>;
  beforeEach(() => {
    testStore = initTestStore(counterDef);
  });
  it("initialState is { count: 0 }", () => {
    expect(testStore.getValues().count()).toBe(0);
  });
  it("when increment is requested then count should be + 1", async () => {
    await testStore.when({
      name: "incrementRequested",
      statePath: [],
    });
    expect(testStore.getValues().count()).toBe(1);
  });

  it("when decrement is requested then count should be - 1", async () => {
    await testStore.when({
      name: "decrementRequested",
      statePath: [],
    });
    expect(testStore.getValues().count()).toBe(-1);
  });
});
