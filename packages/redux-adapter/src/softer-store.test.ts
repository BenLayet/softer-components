import { describe, expect, it } from "vitest";

import { configureSofterStore } from "./softer-store";
import { listDef } from "../../types/src/softer-component-types.test"; // TODO ask expert

describe("configureSofterStore", () => {
  it("should create a store with initial state", () => {
    //GIVEN a root component definition with initial state and state updaters
    const initialState = { count: 0 };
    type MyState = typeof initialState;
    const rootComponentDef = { initialState };
    //WHEN the store is configured
    const store = configureSofterStore(rootComponentDef);

    //THEN the store should have the initial state
    expect(store.getState()).toEqual({ "☁️": { "@": { count: 0 } } });
  });

  it("should create a working app", () => {
    //WHEN the store is configured
    const store = configureSofterStore(listDef);

    //THEN the store should have the initial state
    expect(store.getState()).toEqual({ "☁️": { "@": { count: 0 } } });
  });
});
