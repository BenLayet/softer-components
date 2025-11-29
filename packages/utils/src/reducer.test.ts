import { describe, expect, it, vi } from "vitest";
import { updateSofterRootState } from "./reducer";
import { ComponentDef } from "@softer-components/types";
import { GlobalEvent } from "./utils.type";
import { listDef } from "@softer-components/types"; // TODO ask expert
import { StateManager } from "./state-manager";

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
    stateManager.getChildrenKeys = vi.fn().mockReturnValue({});
    stateManager.updateState = vi.fn();

    // WHEN
    updateSofterRootState({}, componentDef, event, stateManager);

    // THEN
    expect(stateManager.updateState).toHaveBeenCalledWith({}, [], {
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
    stateManager.updateState = vi.fn();
    stateManager.createState = vi.fn();

    // WHEN
    updateSofterRootState({}, componentDef, event, stateManager);

    // THEN
    expect(stateManager.updateState).toBeCalledTimes(0);
    expect(stateManager.createState).toBeCalledTimes(0);
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
      thenExpectsCalls: {
        updateState: [
          {
            softerRootState: {},
            path: [],
            state: {
              lastItemId: 0,
              listName: "My Shopping List",
              nextItemName: "milk",
            },
          },
        ],
      },
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
      thenExpectsCalls: {
        updateState: [
          {
            softerRootState: {},
            path: [],
            state: {
              lastItemId: 0,
              listName: "My Shopping List",
              nextItemName: "",
            },
          },
        ],
      },
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
      thenExpectsCalls: {
        updateState: [
          {
            softerRootState: {},
            path: [],
            state: {
              lastItemId: 1,
              listName: "My Shopping List",
              nextItemName: "",
            },
          },
        ],
        createState: [
          {
            softerRootState: {},
            path: [["items", "1"]],
            state: undefined,
          },
        ],
      },
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
      thenExpectsCalls: {
        updateState: [
          {
            softerRootState: {},
            path: [["items", "1"]],
            state: {
              name: "milk",
              quantity: 1,
            },
          },
        ],
      },
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
      thenExpectsCalls: {
        updateState: [
          {
            softerRootState: {},
            path: [["items", "1"]],
            state: { name: "milk", quantity: 2 },
          },
        ],
      },
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
      thenExpectsCalls: {
        updateState: [
          {
            softerRootState: {},
            path: [["items", "1"]],
            state: { name: "milk", quantity: 1 },
          },
        ],
      },
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
      thenExpectsCalls: {
        removeStateTree: [
          {
            softerRootState: {},
            path: [["items", "1"]],
          },
        ],
      },
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
        stateManager.readState = vi.fn().mockImplementation((_, path) => {
          if (path.length === 0) return listState;
          return itemState;
        });
        stateManager.getChildrenKeys = vi
          .fn()
          .mockImplementation((_state, path) => {
            if (path.length === 0) {
              return { items: listState.lastItemId > 0 ? ["1"] : [] };
            }
            return {};
          });
        stateManager.updateState = vi.fn();
        stateManager.createState = vi.fn();
        stateManager.removeStateTree = vi.fn();

        // WHEN
        updateSofterRootState({}, listDef, event as GlobalEvent, stateManager);

        // THEN
        Object.entries(expectedCalls).forEach(([method, callsArgs]) =>
          callsArgs
            .map((args: {}, index: number) => [method, args, index] as const)
            .forEach(([method, args, index]) => {
              expect(
                stateManager[method as keyof StateManager],
                `method ${method} should have been called ${index + 1} time(s) with args: ${JSON.stringify(args, null, 2)}`,
              ).toHaveBeenNthCalledWith(index + 1, ...Object.values(args));
            }),
        );
      });
    },
  );
});
