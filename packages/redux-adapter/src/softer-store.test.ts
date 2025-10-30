import { describe, it, expect } from "vitest";

import { configureSofterStore } from "./softer-store";
import { ComponentDef } from "@softer-components/types";

describe("configureSofterStore", () => {
  it("should create a store with initial state", () => {
    //GIVEN a root component definition with initial state and state updaters
    const initialState = { count: 0 };
    type MyState = typeof initialState;
    const rootComponentDef = { initialState };
    //WHEN the store is configured
    const store = configureSofterStore(rootComponentDef);

    //THEN the store should have the initial state
    expect(store.getState()).toHaveProperty("/");
    const state = store.getState()["/"] as MyState;
    expect(state.count).toBe(0);
  });

  it("should create a store with events", () => {
    //GIVEN a root component definition with initial state and state updaters
    const initialState = { count: 0 };
    type MyState = typeof initialState;
    const rootComponentDef = {
      initialState,
      events: {
        incrementRequested: {
          stateUpdater: (state) => ({ ...state, count: state.count + 1 }),
        },
      },
    };
    const store = configureSofterStore(rootComponentDef);

    //WHEN an event is dispatched
    store.dispatch({ type: "/incrementRequested", payload: undefined });

    //THEN the store should have the initial state
    expect(store.getState()).toHaveProperty("/");
    const state = store.getState()["/"] as MyState;
    expect(state.count).toBe(1);
  });

  it("should create a store with events forwarding", () => {
    //GIVEN a root component definition with initial state and state updaters
    const initialState = { count: 0 };
    type MyState = typeof initialState;
    const rootComponentDef = {
      initialState,
      events: {
        incrementBtnClicked: {
          forwarders: [{ to: "incrementRequested" }],
        },
        incrementRequested: {
          stateUpdater: (state) => ({ ...state, count: state.count + 1 }),
        },
      },
    };
    const store = configureSofterStore(rootComponentDef);

    //WHEN an event is dispatched
    store.dispatch({ type: "/incrementBtnClicked", payload: undefined });

    //THEN the store should have the initial state
    expect(store.getState()).toHaveProperty("/");
    const state = store.getState()["/"] as MyState;
    expect(state.count).toBe(1);
  });

  it("should create a store with children", () => {
    //GIVEN a root component definition with initial state and state updaters
    const initialState = { count: 0 };
    type MyState = typeof initialState;
    const childComponentDef = {
      initialState,
      events: {
        incrementRequested: {
          stateUpdater: (state) => ({ ...state, count: state.count + 1 }),
        },
      },
    };
    const rootComponentDef = {
      children: {
        child: childComponentDef,
      },
    };
    const store = configureSofterStore(rootComponentDef);

    //WHEN an event is dispatched
    store.dispatch({ type: "/child/incrementRequested", payload: undefined });

    //THEN the store should have the initial state
    expect(store.getState()).toHaveProperty("/child/");
    const state = store.getState()["/child/"] as MyState;
    expect(state.count).toBe(1);
  });

  it("should create a store with children and output", () => {
    //GIVEN a root component definition with initial state and state updaters
    const initialState = { count: 0 };
    type MyState = typeof initialState;
    const childComponentDef = {
      initialState,
      events: {
        incrementRequested: {
          stateUpdater: (state) => ({ ...state, count: state.count + 1 }),
        },
      },
    };
    const rootComponentDef = {
      events: {
        incrementBtnClicked: {},
      },
      children: {
        child: {
          ...childComponentDef,
          forwarders: [
            {
              onEvent: "incrementBtnClicked",
              thenDispatch: "child/incrementRequested",
            },
          ],
        },
      },
    };
    const store = configureSofterStore(rootComponentDef);

    //WHEN an event is dispatched
    store.dispatch({ type: "/incrementBtnClicked", payload: undefined });

    //THEN the store should have the initial state
    expect(store.getState()).toHaveProperty("/child/");
    const state = store.getState()["/child/"] as MyState;
    expect(state.count).toBe(1);
  });

  it("should create a store with children and input", () => {
    //GIVEN a root component definition with initial state and state updaters
    const initialState = { count: 0 };
    type MyState = typeof initialState;
    type MyEvents = {
      incrementRequested: { payload: undefined };
    };
    const childComponentDef = {
      events: {
        incrementBtnClicked: {},
      },
    };
    const rootComponentDef: ComponentDef<MyState, MyEvents> = {
      initialState,
      events: {
        incrementRequested: {
          stateUpdater: (state) => ({ ...state, count: state.count + 1 }),
        },
      },
      children: {
        child: {
          ...childComponentDef,
          listeners: [
            {
              from: "child/incrementBtnClicked",
              to: "incrementRequested",
            },
          ],
        },
      },
    };
    const store = configureSofterStore(rootComponentDef);

    //WHEN an event is dispatched
    store.dispatch({ type: "/child/incrementBtnClicked", payload: undefined });

    //THEN the store should have the initial state
    expect(store.getState()).toHaveProperty("/");
    const state = store.getState()["/"] as MyState;
    expect(state.count).toBe(1);
  });
});
