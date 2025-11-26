// packages/utils/src/state.test.ts
import { describe, expect, it, test, vi } from "vitest";
import { updateGlobalState } from "./reducer";
import { ComponentDef } from "@softer-components/types";
import { GlobalEvent } from "./utils.type";
import { listDef } from "../../types/src/softer-component-types.test"; // TODO ask expert
import { StateManager } from "./state-manager";
import { isNotUndefined } from "./predicate.functions";

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

    const event: GlobalEvent = {
      name: "incrementRequested",
      payload: null,
      componentPath: [],
    };

    const stateManager = {} as StateManager;
    stateManager.readState = vi.fn().mockReturnValue(initialState);
    stateManager.getChildrenNodes = vi.fn().mockReturnValue({});
    stateManager.writeState = vi.fn();

    // WHEN creating initial state tree
    updateGlobalState(componentDef, event, stateManager);

    // THEN it should create correct state structure
    expect(stateManager.writeState).toHaveBeenCalledWith([], {
      count: 1,
      name: "test",
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
    const event: GlobalEvent = {
      name: "otherEvent",
      payload: null,
      componentPath: [],
    };
    const stateManager = {} as StateManager;
    stateManager.readState = vi.fn().mockReturnValue(initialState);
    stateManager.writeState = vi.fn();

    // WHEN creating initial state tree
    updateGlobalState(componentDef, event, stateManager);

    // THEN it should create correct state structure
    // THEN it should create correct state structure
    expect(stateManager.writeState).toBeCalledTimes(0);
  });

  const tests = [
    {
      givenListState: {
        lastItemId: 0,
        listName: "My Shopping List",
        nextItemName: "",
      },
      whenEventOccurs: {
        name: "nextItemNameChanged",
        payload: "milk",
        componentPath: [],
      },
      thenExpectsCalls: [
        {
          method: "writeState",
          args: {
            path: [],
            state: {
              lastItemId: 0,
              listName: "My Shopping List",
              nextItemName: "milk",
            },
          },
        },
      ],
    },
    {
      givenListState: {
        lastItemId: 0,
        listName: "My Shopping List",
        nextItemName: "",
      },
      whenEventOccurs: {
        name: "addItemRequested",
        payload: { itemName: "milk", itemId: 1 },
        componentPath: [],
      },
      thenExpectsCalls: [
        {
          method: "writeState",
          args: {
            path: [],
            state: {
              lastItemId: 0,
              listName: "My Shopping List",
              nextItemName: "",
            },
          },
        },
      ],
    },
    {
      givenListState: {
        lastItemId: 0,
        listName: "My Shopping List",
        nextItemName: "",
      },
      whenEventOccurs: {
        name: "createItemRequested",
        payload: { itemName: "milk", itemId: 1 },
        componentPath: [],
      },
      thenExpectsCalls: [
        {
          method: "writeState",
          args: {
            path: [],
            state: {
              lastItemId: 1,
              listName: "My Shopping List",
              nextItemName: "",
            },
          },
        },
        {
          method: "writeState",
          args: {
            path: [["items", "1"]],
            state: undefined,
          },
        },
      ],
    },
    {
      givenListState: {
        lastItemId: 1,
        listName: "My Shopping List",
        nextItemName: "",
      },
      givenItemState: undefined,
      whenEventOccurs: {
        name: "initialize",
        payload: "milk",
        componentPath: [["items", "1"]],
      },
      thenExpectsCalls: [
        {
          method: "writeState",
          args: {
            path: [["items", "1"]],
            state: { name: "milk", quantity: 1 },
          },
        },
      ],
    },
    {
      givenListState: {
        lastItemId: 1,
        listName: "My Shopping List",
        nextItemName: "",
      },
      givenItemState: { name: "milk", quantity: 1 },
      whenEventOccurs: {
        name: "incrementQuantityRequested",
        payload: undefined,
        componentPath: [["items", "1"]],
      },
      thenExpectsCalls: [
        {
          method: "writeState",
          args: {
            path: [["items", "1"]],
            state: { name: "milk", quantity: 2 },
          },
        },
      ],
    },
    {
      givenListState: {
        lastItemId: 1,
        listName: "My Shopping List",
        nextItemName: "",
      },
      givenItemState: { name: "milk", quantity: 2 },
      whenEventOccurs: {
        name: "decrementQuantityRequested",
        payload: undefined,
        componentPath: [["items", "1"]],
      },
      thenExpectsCalls: [
        {
          method: "writeState",
          args: {
            path: [["items", "1"]],
            state: { name: "milk", quantity: 1 },
          },
        },
      ],
    },
    {
      givenListState: {
        lastItemId: 1,
        listName: "My Shopping List",
        nextItemName: "",
      },
      givenItemState: { name: "milk", quantity: 2 },
      whenEventOccurs: {
        name: "removeItemRequested",
        payload: 1,
        componentPath: [],
      },
      thenExpectsCalls: [
        {
          method: "removeStateTree",
          args: {
            path: [["items", "1"]],
          },
        },
      ],
    },
  ];
  tests.forEach(
    ({
      givenListState: listState,
      givenItemState: itemState,
      whenEventOccurs: event,
      thenExpectsCalls: expectedCalls,
    }) => {
      it(`should handle event: ${event.name}`, () => {
        // GIVEN a more complex component definition
        const stateManager = {} as StateManager;
        stateManager.readState = vi.fn().mockImplementation((path) => {
          if (path.length === 0) return listState;
          return itemState;
        });
        stateManager.getChildrenNodes = vi.fn().mockImplementation((path) => {
          if (path.length === 0) {
            return { items: listState.lastItemId > 0 ? ["1"] : [] };
          }
          return {};
        });
        stateManager.writeState = vi.fn();
        stateManager.removeStateTree = vi.fn();

        //WHEN changing name
        updateGlobalState(listDef, event, stateManager);

        // THEN it should create correct state structure

        expectedCalls.forEach(({ args, method }, index) => {
          expect(
            stateManager[method as keyof StateManager]
          ).toHaveBeenNthCalledWith(index + 1, ...Object.values(args));
        });
      });
    }
  );
});
