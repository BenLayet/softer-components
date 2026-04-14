import { ComponentDef, EventsContract } from "@softer-components/types";
import { INPUTTED_BY_USER, TreeStateManager } from "@softer-components/utils";
import { describe, expect, it } from "vitest";

import { SofterNgrxEventMapper } from "./softer-ngrx-event-mapper";
import { createSofterReducer } from "./softer-ngrx-reducer";

describe("createSofterReducer", () => {
  const PREFIX = "☁️/";
  const eventMapper = new SofterNgrxEventMapper(PREFIX);

  describe("with a simple counter component", () => {
    const stateManager = new TreeStateManager();
    const initialState = { count: 0 };
    type CounterState = typeof initialState;

    const counterDef: ComponentDef<
      {
        events: EventsContract<
          ["incremented", "decremented", "setCountRequested"]
        >;
      },
      CounterState
    > = {
      initialState,
      allEvents: ["incremented", "decremented", "setCountRequested"],
      uiEvents: ["incremented", "decremented", "setCountRequested"],
      stateUpdaters: {
        incremented: ({ state }) => {
          state.count++;
        },
        decremented: ({ state }) => {
          state.count--;
        },
        setCountRequested: ({ state, payload }) => {
          state.count = payload as number;
        },
      },
    };

    it("returns initial state when state is undefined", () => {
      const reducer = createSofterReducer(
        stateManager,
        counterDef as ComponentDef,
        eventMapper,
      );

      const state = reducer(undefined, { type: "@@INIT" });

      expect(stateManager.readState(state, [])).toEqual({ count: 0 });
    });

    it("ignores non-softer actions", () => {
      const reducer = createSofterReducer(
        stateManager,
        counterDef as ComponentDef,
        eventMapper,
      );

      const initialState = reducer(undefined, { type: "@@INIT" });
      const nextState = reducer(initialState, { type: "[Other] action" });

      expect(nextState).toBe(initialState); // Same reference, no change
    });

    it("handles incremented action", () => {
      const reducer = createSofterReducer(
        stateManager,
        counterDef as ComponentDef,
        eventMapper,
      );

      const state1 = reducer(undefined, { type: "@@INIT" });
      const state2 = reducer(state1, {
        type: `☁️/${INPUTTED_BY_USER}/incremented`,
      });

      expect(stateManager.readState(state2, [])).toEqual({ count: 1 });
    });

    it("handles decremented action", () => {
      const reducer = createSofterReducer(
        stateManager,
        counterDef as ComponentDef,
        eventMapper,
      );

      const state1 = reducer(undefined, { type: "@@INIT" });
      const state2 = reducer(state1, {
        type: `☁️/${INPUTTED_BY_USER}/incremented`,
      });
      const state3 = reducer(state2, {
        type: `☁️/${INPUTTED_BY_USER}/incremented`,
      });
      const state4 = reducer(state3, {
        type: `☁️/${INPUTTED_BY_USER}/decremented`,
      });

      expect(stateManager.readState(state4, [])).toEqual({ count: 1 });
    });

    it("handles action with payload", () => {
      const reducer = createSofterReducer(
        stateManager,
        counterDef as ComponentDef,
        eventMapper,
      );

      const state1 = reducer(undefined, { type: "@@INIT" });
      const state2 = reducer(state1, {
        type: `☁️/${INPUTTED_BY_USER}/setCountRequested`,
        payload: 42,
      });

      expect(stateManager.readState(state2, [])).toEqual({ count: 42 });
    });

    it("produces immutable state updates", () => {
      const reducer = createSofterReducer(
        stateManager,
        counterDef as ComponentDef,
        eventMapper,
      );

      const state1 = reducer(undefined, { type: "@@INIT" });
      const state2 = reducer(state1, {
        type: `☁️/${INPUTTED_BY_USER}/incremented`,
      });

      expect(state1).not.toBe(state2);
      expect(stateManager.readState(state1, [])).toEqual({ count: 0 });
      expect(stateManager.readState(state2, [])).toEqual({ count: 1 });
    });
  });

  describe("with nested components", () => {
    const stateManager = new TreeStateManager();
    const itemInitialState = { name: "", quantity: 0 };
    type ItemState = typeof itemInitialState;

    const itemDef: ComponentDef<
      { events: EventsContract<["setQuantity"]> },
      ItemState
    > = {
      initialState: itemInitialState,
      allEvents: ["setQuantity"],
      uiEvents: ["setQuantity"],
      stateUpdaters: {
        setQuantity: ({ state, payload }) => {
          state.quantity = payload as number;
        },
      },
    };

    const listInitialState = { name: "Shopping List" };
    type ListState = typeof listInitialState;

    const listDef: ComponentDef<
      {
        events: EventsContract<["rename", "addItem"]>;
        children: {
          items: {
            events: EventsContract<["setQuantity"]>;
            type: "collection";
          };
        };
      },
      ListState
    > = {
      initialState: listInitialState,
      allEvents: ["rename", "addItem"],
      uiEvents: ["rename", "addItem"],
      stateUpdaters: {
        rename: ({ state, payload }) => {
          state.name = payload as string;
        },
      },
      childrenComponentDefs: { items: itemDef },
      initialChildren: { items: [] },
      childrenUpdaters: {
        addItem: ({ children: { items }, payload }) => {
          items.push(payload as string);
        },
      },
    };

    it("initializes with nested children structure", () => {
      const reducer = createSofterReducer(
        stateManager,
        listDef as ComponentDef,
        eventMapper,
      );

      const state = reducer(undefined, { type: "@@INIT" });

      expect(stateManager.readState(state, [])).toEqual({
        name: "Shopping List",
      });
      expect(stateManager.getChildrenKeys(state, [])).toEqual({ items: [] });
    });

    it("handles adding a child item", () => {
      const reducer = createSofterReducer(
        stateManager,
        listDef as ComponentDef,
        eventMapper,
      );

      const state1 = reducer(undefined, { type: "@@INIT" });
      const state2 = reducer(state1, {
        type: `☁️/${INPUTTED_BY_USER}/addItem`,
        payload: "item1",
      });

      expect(stateManager.getChildrenKeys(state2, [])).toEqual({
        items: ["item1"],
      });
    });

    // Note: Testing nested child actions requires more complex setup with
    // childrenConfig to route events from parent to child. This is tested
    // in the utils package's reducer.test.ts with proper event forwarding setup.
  });
});
