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
  it("initialState is { count: 42 }", () => {
    expect(testStore.getValues().count()).toBe(42);
  });
  it("when increment is requested then count should be 43", async () => {
    await testStore.when({
      name: "incrementRequested",
      statePath: [],
    });
    expect(testStore.getValues().count()).toBe(43);
  });

  it("when decrement is requested then count should be 41", async () => {
    await testStore.when({
      name: "decrementRequested",
      statePath: [],
    });
    expect(testStore.getValues().count()).toBe(41);
  });
});
