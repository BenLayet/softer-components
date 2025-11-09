import { describe, it, expect } from "vitest";

import { configureSofterStore } from "./softer-store";
import { ComponentDef, SingleNode } from "@softer-components/types";

describe("configureSofterStore", () => {
  it("should create a store with initial state", () => {
    //GIVEN a root component definition with initial state and state updaters
    const initialState = { count: 0 };
    type MyState = typeof initialState;
    const rootComponentDef = { initialState: () => initialState };
    //WHEN the store is configured
    const store = configureSofterStore(rootComponentDef);

    //THEN the store should have the initial state
    expect(store.getState()).toEqual({ "/": { count: 0 } });
  });

  it("should create a store with one event", () => {
    //GIVEN a root component definition with initial state and state updaters
    const initialState = { count: 0 };
    type MyState = typeof initialState;
    const rootComponentDef: ComponentDef<
      MyState,
      { incrementRequested: { payload: undefined } },
      {}
    > = {
      initialState: () => initialState,
      events: {
        incrementRequested: {
          payloadFactory: () => {},
        },
      },
      stateUpdaters: {
        incrementRequested: (state) => ({
          ...state,
          count: state.count + 1,
        }),
      },
    };
    const store = configureSofterStore(rootComponentDef);

    //WHEN an event is dispatched
    store.dispatch({ type: "/incrementRequested", payload: undefined });

    //THEN the store should have the initial state
    expect(store.getState()).toEqual({ "/": { count: 1 } });
  });

  it("should create a store with events forwarding", () => {
    //GIVEN a root component definition with initial state and state updaters
    const initialState = { count: 0 };
    type MyState = typeof initialState;
    const rootComponentDef: ComponentDef<
      MyState,
      {
        incrementRequested: { payload: undefined };
        incrementBtnClicked: { payload: undefined };
      },
      {}
    > = {
      initialState: () => initialState,
      events: {
        incrementBtnClicked: {
          payloadFactory: () => {},
        },
        incrementRequested: {
          payloadFactory: () => {},
        },
      },
      stateUpdaters: {
        incrementRequested: (state) => ({
          ...state,
          count: state.count + 1,
        }),
      },
      eventForwarders: [
        { from: "incrementBtnClicked", to: "incrementRequested" },
      ],
    };
    const store = configureSofterStore(rootComponentDef);

    //WHEN an event is dispatched
    store.dispatch({ type: "/incrementBtnClicked", payload: undefined });

    //THEN the store should have the initial state
    expect(store.getState()).toEqual({ "/": { count: 1 } });
  });

  it("should create a store with one child", () => {
    //GIVEN a root component definition with initial state and state updaters
    const childInitialState = { count: 0 };
    type ChildState = typeof childInitialState;
    const childComponentDef: ComponentDef<
      ChildState,
      { incrementRequested: { payload: undefined } },
      {}
    > = {
      initialState: () => childInitialState,
      events: {
        incrementRequested: {
          payloadFactory: () => {},
        },
      },
      stateUpdaters: {
        incrementRequested: (state) => ({
          ...state,
          count: state.count + 1,
        }),
      },
    };
    const rootComponentDef = {
      children: {
        child: { componentDef: childComponentDef },
      },
    };
    const store = configureSofterStore(rootComponentDef);

    //WHEN an event is dispatched
    store.dispatch({ type: "/child/incrementRequested", payload: undefined });

    //THEN the store should have the updated state
    expect(store.getState()).toEqual({
      "/": undefined,
      "/child/": { count: 1 },
    });
  });

  it("should create a store with one command to one child", () => {
    //GIVEN a root component definition with initial state and state updaters
    const initialState = { count: 0 };
    type MyState = typeof initialState;
    const childComponentDef: ComponentDef<
      MyState,
      { incrementRequested: { payload: undefined } },
      {}
    > = {
      initialState: () => initialState,
      events: {
        incrementRequested: {
          payloadFactory: () => {},
        },
      },
      stateUpdaters: {
        incrementRequested: (state) => ({
          ...state,
          count: state.count + 1,
        }),
      },
    };
    const rootComponentDef = {
      events: {
        incrementBtnClicked: {
          payloadFactory: () => {},
        },
      },
      children: {
        child: {
          componentDef: childComponentDef,
          commands: [
            {
              from: "incrementBtnClicked",
              to: "incrementRequested",
            },
          ],
        },
      },
    } satisfies ComponentDef<
      MyState,
      { incrementBtnClicked: { payload: undefined } },
      {}
    >;
    const store = configureSofterStore(rootComponentDef);

    //WHEN an event is dispatched
    store.dispatch({ type: "/incrementBtnClicked", payload: undefined });

    //THEN the store should have the updated state
    expect(store.getState()).toEqual({
      "/": undefined,
      "/child/": { count: 1 },
    });
  });

  it("should create a store with one listener of one child", () => {
    //GIVEN a root component definition with initial state and state updaters
    type ChildEvents = {
      incrementBtnClicked: { payload: undefined };
    };
    const childComponentDef: ComponentDef<undefined, ChildEvents, {}> = {
      events: {
        incrementBtnClicked: {
          payloadFactory: () => {},
        },
      },
    };

    const initialState = { count: 0 };
    type ParentState = typeof initialState;
    type ParentEvents = {
      incrementRequested: { payload: undefined };
    };
    const child: SingleNode<
      ParentState,
      ParentEvents,
      typeof childComponentDef
    > = {
      componentDef: childComponentDef,
      listeners: [
        {
          from: "incrementBtnClicked",
          to: "incrementRequested",
        },
      ],
    };
    const rootComponentDef: ComponentDef<ParentState, ParentEvents> = {
      initialState: () => initialState,
      events: {
        incrementRequested: {
          payloadFactory: () => {},
        },
      },
      stateUpdaters: {
        incrementRequested: (state) => ({
          ...state,
          count: state.count + 1,
        }),
      },
      children: {
        child,
      },
    };
    const store = configureSofterStore(rootComponentDef);
    //WHEN an event is dispatched
    store.dispatch({ type: "/child/incrementBtnClicked", payload: undefined });

    //THEN the store should have the updated state
    expect(store.getState()).toEqual({
      "/": { count: 1 },
      "/child/": undefined,
    });
  });
});
