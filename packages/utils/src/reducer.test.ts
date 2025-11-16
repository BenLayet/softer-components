// packages/utils/src/state.test.ts
import { describe, expect, it } from "vitest";
import { updateGlobalState } from "./reducer";
import { ComponentDef } from "@softer-components/types";
import { GlobalEvent } from "./constants";
import { listDef } from "../../types/src/softer-component-types.test"; // TODO ask expert

describe("reducer tests", () => {
  it("should update simple state", () => {
    // GIVEN a simple component definition with initial state
    const initialState = { count: 0, name: "test" };
    type MyState = typeof initialState;

    const componentDef: ComponentDef<{
      state: MyState;
      events: { incrementRequested: { payload: undefined } };
      values: {};
      children: {};
    }> = {
      initialState,
      updaters: {
        incrementRequested: ({ state }) => {
          state.count++;
        },
      },
    };

    const globalState = {
      "@": initialState,
    };
    const event: GlobalEvent = {
      name: "incrementRequested",
      payload: null,
      componentPath: [],
    };

    // WHEN creating initial state tree
    updateGlobalState(componentDef, globalState, event);

    // THEN it should create correct state structure
    expect(globalState).toEqual({
      "@": { count: 1, name: "test" },
    });
  });

  it("should not change state if no relevant state updater", () => {
    // GIVEN a simple component definition with initial state
    const initialState = { count: 0, name: "test" };
    type MyState = typeof initialState;

    const componentDef: ComponentDef<{
      state: MyState;
      events: { incrementRequested: { payload: undefined } };
      values: {};
      children: {};
    }> = {
      initialState,
      updaters: {
        incrementRequested: ({ state }) => {
          state.count++;
        },
      },
    };

    const globalState = {
      "@": initialState,
    };
    const event: GlobalEvent = {
      name: "otherEvent",
      payload: null,
      componentPath: [],
    };

    // WHEN creating initial state tree
    updateGlobalState(componentDef, globalState, event);

    // THEN it should create correct state structure
    expect(globalState).toEqual({
      "@": initialState,
    });
  });

  it("should update listDef with sequence of events", () => {
    // GIVEN a more complex component definition
    const listState = {
      lastItemId: 0,
      listName: "My Shopping List",
      nextItemName: "",
    };
    const globalState = {
      "@": listState,
      "#": { items: {} },
    };

    //WHEN changing name
    updateGlobalState(listDef, globalState, {
      name: "nextItemNameChanged",
      payload: "milk",
      componentPath: [],
    });

    // THEN it should create correct state structure
    expect(globalState).toEqual({
      "@": {
        lastItemId: 0,
        listName: "My Shopping List",
        nextItemName: "milk",
      },
      "#": { items: {} },
    });

    //WHEN
    updateGlobalState(listDef, globalState, {
      name: "createItemRequested",
      payload: { itemName: "milk", itemId: 1 },
      componentPath: [],
    });

    // THEN
    expect(globalState).toEqual({
      "@": {
        lastItemId: 1,
        listName: "My Shopping List",
        nextItemName: "milk",
      },
      "#": { items: { "1": {} } },
    });

    //WHEN
    updateGlobalState(listDef, globalState, {
      name: "addItemRequested",
      payload: "milk",
      componentPath: [],
    });

    // THEN
    expect(globalState).toEqual({
      "@": {
        lastItemId: 1,
        listName: "My Shopping List",
        nextItemName: "",
      },
      "#": { items: { "1": {} } },
    });
    //WHEN
    updateGlobalState(listDef, globalState, {
      name: "initialize",
      payload: "milk",
      componentPath: [["items", "1"]],
    });

    // THEN
    expect(globalState).toEqual({
      "@": {
        lastItemId: 1,
        listName: "My Shopping List",
        nextItemName: "",
      },
      "#": {
        items: {
          "1": { "@": { name: "milk", quantity: 1 } },
        },
      },
    });

    //WHEN
    updateGlobalState(listDef, globalState, {
      name: "incrementQuantityRequested",
      payload: undefined,
      componentPath: [["items", "1"]],
    });

    // THEN
    expect(globalState).toEqual({
      "@": {
        lastItemId: 1,
        listName: "My Shopping List",
        nextItemName: "",
      },
      "#": {
        items: {
          "1": { "@": { name: "milk", quantity: 2 } },
        },
      },
    });

    //WHEN
    updateGlobalState(listDef, globalState, {
      name: "decrementQuantityRequested",
      payload: undefined,
      componentPath: [["items", "1"]],
    });

    // THEN
    expect(globalState).toEqual({
      "@": {
        lastItemId: 1,
        listName: "My Shopping List",
        nextItemName: "",
      },
      "#": {
        items: {
          "1": { "@": { name: "milk", quantity: 1 } },
        },
      },
    });

    //WHEN
    updateGlobalState(listDef, globalState, {
      name: "removeItemRequested",
      payload: 1,
      componentPath: [],
    });

    // THEN
    expect(globalState).toEqual({
      "@": {
        lastItemId: 1,
        listName: "My Shopping List",
        nextItemName: "",
      },
      "#": { items: {} },
    });
  });
});
