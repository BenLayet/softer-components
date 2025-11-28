import { describe, expect, it } from "vitest";

import { configureSofterStore } from "./softer-store";
import { listDef } from "../../types/src/softer-component-types.test"; // TODO ask expert
import { CHILDREN_CONTAINER_KEY, OWN_KEY } from "@softer-components/utils";

describe("configureSofterStore", () => {
  it("should create a store with initial state", () => {
    //GIVEN a root component definition with initial state and state updaters
    const initialState = { count: 0 };
    const rootComponentDef = { initialState };
    //WHEN the store is configured
    const store = configureSofterStore(rootComponentDef);

    //THEN the store should have the initial state
    expect(store.getState()).toEqual({ "☁️": { [OWN_KEY]: { count: 0 } } });
  });

  it("should create a working app", () => {
    //WHEN the store is configured
    const store = configureSofterStore(listDef); //TODO ask expert why this is sometimes red underlined

    //THEN the store should have the initial state
    const actualState = store.getState();
    expect(actualState).toEqual({
      "☁️": {
        [OWN_KEY]: {
          listName: "My Shopping List",
          nextItemName: "",
          lastItemId: 0,
        },
        [CHILDREN_CONTAINER_KEY]: {
          items: {},
        },
      },
    });

    //TODO ask expert to use useSofter (that calls useStore and useSelector) in a test component to verify it works
  });
});
