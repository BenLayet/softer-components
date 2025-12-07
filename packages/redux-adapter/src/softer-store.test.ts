import { describe, expect, it } from "vitest";

import { configureSofterStore } from "./softer-store";
import { CHILDREN_BRANCHES_KEY, OWN_VALUE_KEY } from "@softer-components/utils";

describe("configureSofterStore", () => {
  it("should create a store with initial state", () => {
    //GIVEN a root component definition with initial state and state updaters
    const initialState = { count: 0 };
    const rootComponentDef = { initialState };
    //WHEN the store is configured
    const store = configureSofterStore(rootComponentDef);

    //THEN the store should have the initial state
    expect(store.getState()).toEqual({
      "☁️": { [OWN_VALUE_KEY]: { count: 0 }, [CHILDREN_BRANCHES_KEY]: {} },
    });
  });
});
