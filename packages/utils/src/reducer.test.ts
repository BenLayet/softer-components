import {
  ComponentDef,
  ComponentEventsContract,
  ExtractComponentChildrenContract,
  ExtractComponentValuesContract,
  Selectors,
} from "@softer-components/types";
import { describe, expect, it, vi } from "vitest";

import { GlobalEvent } from "./global-event";
import { updateSofterRootState } from "./reducer";
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
      statePath: [],
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
      statePath: [],
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
        statePath: [],
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
        statePath: [],
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
        statePath: [],
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
        statePath: [["items", "1"]],
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
        statePath: [["items", "1"]],
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
        statePath: [["items", "1"]],
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
        statePath: [],
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
        stateManager.initializeChildBranches = vi.fn();
        stateManager.reorderChildStates = vi.fn();

        // WHEN
        updateSofterRootState({}, listDef, event as GlobalEvent, stateManager);

        // THEN
        Object.entries(expectedCalls).forEach(([method, callsArgs]) =>
          callsArgs
            .map((args: {}, index: number) => [method, args, index] as const)
            .forEach(([method, args, index]: [any, any, any]) => {
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
/////////////////////
// ITEM
////////////////////

type ItemState = {
  name: string;
  quantity: number;
};

type ItemEventName =
  | "incrementQuantityRequested"
  | "decrementQuantityRequested"
  | "removeRequested"
  | "initialize";

type ItemEvents = ComponentEventsContract<
  ItemEventName,
  { initialize: string }
>;

const selectors = {
  name: state => state.name,
  quantity: state => state.quantity,
  isEmpty: state => state.quantity < 1,
} satisfies Selectors<ItemState>;

export type ItemContract = {
  values: ExtractComponentValuesContract<typeof selectors>;
  events: ItemEvents;
  children: {};
  state: ItemState;
};

const itemDef: ComponentDef<ItemContract> = {
  selectors,
  uiEvents: ["incrementQuantityRequested", "decrementQuantityRequested"],
  updaters: {
    initialize: ({ payload: name }) => ({
      name: name,
      quantity: 1,
    }),
    incrementQuantityRequested: ({ state }) => {
      state.quantity++;
    },
    decrementQuantityRequested: ({ state }) => {
      state.quantity--;
    },
  },
  eventForwarders: [
    {
      from: "decrementQuantityRequested",
      to: "removeRequested",
      onCondition: ({ values }) => values.isEmpty(),
    },
  ],
};

/////////////////////
// List
////////////////////
const initialState = {
  listName: "My Shopping List",
  nextItemName: "",
  lastItemId: 0,
};

type ListState = typeof initialState;
type ListEventName =
  | "nextItemNameChanged"
  | "addItemRequested"
  | "createItemRequested"
  | "incrementItemQuantityRequested"
  | "resetItemNameRequested"
  | "removeItemRequested"
  | "newItemSubmitted";
type ListEvents = ComponentEventsContract<
  ListEventName,
  {
    nextItemNameChanged: string;
    addItemRequested: string;
    removeItemRequested: number;
    incrementItemQuantityRequested: number;
    createItemRequested: { itemName: string; itemId: number };
  }
>;

const childrenComponents = {
  items: itemDef,
};

const listSelectors = {
  listName: state => state.listName,
  nextItemName: state => state.nextItemName.trim(),
  nextItemId: state => state.lastItemId + 1,
} satisfies Selectors<ListState>;

type ListContract = {
  state: ListState;
  values: ExtractComponentValuesContract<typeof listSelectors>;
  events: ListEvents;
  children: {
    items: ItemContract & { isCollection: true };
  };
};
const listDef: ComponentDef<ListContract, ListState> = {
  initialState,
  selectors: listSelectors,
  uiEvents: ["nextItemNameChanged", "addItemRequested"],
  updaters: {
    nextItemNameChanged: ({ state, payload: nextItemName }) => {
      state.nextItemName = nextItemName;
    },
    addItemRequested: ({ state }) => {
      state.nextItemName = "";
    },
    createItemRequested: ({
      children: { items },
      payload: { itemId },
      state,
    }) => {
      items.push(`${itemId}`);
      state.lastItemId = itemId;
    },
    removeItemRequested: ({ children: { items }, payload: idToRemove }) => {
      items.splice(items.indexOf(`${idToRemove}`), 1);
    },
  },
  eventForwarders: [
    {
      from: "newItemSubmitted",
      to: "addItemRequested",
      withPayload: ({ values }) => values.nextItemName().trim(),
      onCondition: ({ values }) => values.nextItemName().trim() !== "",
    },
    {
      from: "addItemRequested",
      to: "createItemRequested",
      onCondition: ({ childrenValues: { items }, payload: itemName }) =>
        Object.values(items).every(item => item.values.name() !== itemName),
      withPayload: ({ values, payload: itemName }) => ({
        itemName,
        itemId: values.nextItemId(),
      }),
    },
    {
      from: "addItemRequested",
      to: "incrementItemQuantityRequested",
      onCondition: ({ childrenValues: { items }, payload: itemName }) =>
        Object.values(items).some(item => item.values.name() === itemName),
      withPayload: ({ childrenValues: { items }, payload: itemName }) =>
        Object.entries(items)
          .filter(([, item]) => item.values.name() === itemName)
          .map(([key]) => parseInt(key))[0],
    },
    {
      from: "addItemRequested",
      to: "resetItemNameRequested",
    },
  ],
  childrenComponentDefs: childrenComponents,
  initialChildren: { items: [] },
  childrenConfig: {
    items: {
      commands: [
        {
          from: "incrementItemQuantityRequested",
          to: "incrementQuantityRequested",
          toKeys: ({ payload: itemId }) => [`${itemId}`],
        },
        {
          from: "createItemRequested",
          to: "initialize",
          withPayload: ({ payload: { itemName } }) => itemName,
          toKeys: ({ payload: { itemId } }) => [`${itemId}`],
        },
      ],
      listeners: [
        {
          from: "removeRequested",
          to: "removeItemRequested",
          withPayload: ({ childKey }) => parseInt(childKey),
        },
      ],
    },
  },
};
