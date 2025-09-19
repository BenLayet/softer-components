import { describe, it, expect } from "vitest";

import { configureSofterStore } from "./softerStore";
import { ComponentDef } from "@softer-components/types";

describe("configureSofterStore", () => {
  it("should create a store with initial state", () => {
    //GIVEN a root component definition with initial state and state updaters
    const initialState = { count: 0 };
    type MyState = typeof initialState;
    const rootComponentDef: ComponentDef<never, MyState> = {
      initialState,
    };
    //WHEN the store is configured
    const store = configureSofterStore(rootComponentDef);

    //THEN the store should have the initial state
    expect(store.getState()).toHaveProperty("/");
    const state = store.getState()["/"] as MyState;
    expect(state.count).toBe(0);
  });

  it("should handle state updater actions", () => {
    //GIVEN a root component definition with initial state and state updaters
    type MyEvent = { type: "incrementRequested"; payload: number };
    const initialState = { count: 0 };
    type MyState = typeof initialState;
    const rootComponentDef: ComponentDef<MyEvent, MyState> = {
      initialState,
      stateUpdaters: {
        incrementRequested: (state, amount) => ({
          count: state.count + amount,
        }),
      },
    };
    //AND a store configured with the component definition
    const store = configureSofterStore(rootComponentDef);

    //WHEN an incrementRequested event is dispatched
    store.dispatch({ type: "/incrementRequested", payload: 5 });

    //THEN the state should be updated accordingly
    const state = store.getState()["/"] as MyState;
    expect(state.count).toBe(5);
  });

  it("should handle nested component state", () => {
    //GIVEN a child component definition
    const childComponentDef: ComponentDef<
      { type: "decrementRequested"; payload: number },
      { count: number }
    > = {
      initialState: { count: 10 },
      stateUpdaters: {
        decrementRequested: (state, amount) => ({
          count: state.count - amount,
        }),
      },
    };

    //GIVEN a root component definition with the child
    const rootComponentDef: ComponentDef<
      never,
      {},
      {},
      { child: { type: "decrementRequested"; payload: number } }
    > = {
      children: {
        child: childComponentDef,
      },
    };

    //AND a store configured with the root component definition
    const store = configureSofterStore(rootComponentDef);

    //WHEN a decrementRequested event is dispatched to the child
    store.dispatch({ type: "/child/decrementRequested", payload: 3 });

    //THEN the child's state should be updated accordingly
    const childState = store.getState()["/child"] as { count: number };
    expect(childState.count).toBe(7);
  });

  it("should set up own event forwarders", () => {
    //GIVEN a root component definition with an event forwarder
    const rootComponentDef: ComponentDef<
      { type: "start"; payload: void } | { type: "finish"; payload: void },
      { log: string[] }
    > = {
      initialState: { log: [] },
      stateUpdaters: {
        start: (state) => ({
          log: [...state.log, `Started`],
        }),
        finish: (state) => ({
          log: [...state.log, `Finished`],
        }),
      },
      eventForwarders: [
        {
          onEvent: "start",
          thenDispatch: "finish",
        },
      ],
    };

    //AND a store configured with the root component definition
    const store = configureSofterStore(rootComponentDef);

    //WHEN a start event is dispatched
    store.dispatch({ type: "/start" });

    //THEN the store should have the initial state
    expect(store.getState()).toHaveProperty("/");
    const state = store.getState()["/"] as { log: string[] };
    expect(state.log).toEqual(["Started", "Finished"]);
  });
});
