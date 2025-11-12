// packages/utils/src/state.test.ts
import { describe, expect, it } from "vitest";
import { newGlobalState } from "./reducer";
import { ComponentDef } from "@softer-components/types";

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
      stateUpdaters: {
        incrementRequested: (state) => ({
          ...state,
          count: state.count + 1,
        }),
      },
    };

    const previousGlobalState = {
      "/": { count: 0, name: "test" },
    };

    // WHEN creating initial state tree
    const result = newGlobalState(
      componentDef,
      { type: "/incrementRequested", payload: null },
      previousGlobalState
    );

    // THEN it should create correct state structure
    expect(result).toEqual({
      "/": { count: 1, name: "test" },
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
      stateUpdaters: {
        incrementRequested: (state) => ({
          ...state,
          count: state.count + 1,
        }),
      },
    };
    const previousGlobalState = {
      "/": initialState,
    };

    // WHEN creating initial state tree with irrelevant action
    const result = newGlobalState(
      componentDef,
      { type: "/someOtherAction", payload: null },
      previousGlobalState
    );

    // THEN it should return the same state object
    expect(result).toBe(previousGlobalState);
  });

  it("should update child component state", () => {
    // GIVEN a simple component definition with initial state
    const initialState = { count: 0, name: "test" };
    type ChildState = typeof initialState;
    type ChildComponentContract = {
      state: ChildState;
      events: { incrementRequested: { payload: undefined } };
      values: {};
      children: {};
    };
    const child: ComponentDef<ChildComponentContract> = {
      initialState,
      stateUpdaters: {
        incrementRequested: (state) => ({
          ...state,
          count: state.count + 1,
        }),
      },
    };
    const componentDef: ComponentDef<{
      state: undefined;
      events: {};
      values: {};
      children: { child: ChildComponentContract };
    }> = {
      childrenComponents: { child },
    };
    const previousGlobalState = {
      "/": undefined,
      "/child/": { count: 0 },
    };

    // WHEN creating initial state tree with action for nested component
    const result = newGlobalState(
      componentDef,
      { type: "/child/incrementRequested", payload: null },
      previousGlobalState
    );

    // THEN it should update the nested component state correctly
    expect(result).toEqual({
      "/": undefined,
      "/child/": { count: 1, name: "test" },
    });
  });

  it("should create child component state", () => {
    // GIVEN a simple component definition with initial state
    const initialState = { count: 0, name: "test" };
    type ChildState = typeof initialState;
    type ChildComponentContract = {
      state: ChildState;
      events: {};
      values: {};
      children: {};
    };
    const child: ComponentDef<ChildComponentContract> = {
      initialState,
    };
    const componentDef: ComponentDef<{
      state: undefined;
      events: { createChildRequested: { payload: undefined } };
      values: {};
      children: { child: ChildComponentContract };
    }> = {
      childrenComponents: { child },
      childrenConfig: {
        child: {
          createOnEvent: { type: "createChildRequested" },
        },
      },
    };
    const previousGlobalState = {
      "/": undefined,
    };

    // WHEN creating initial state tree with action for nested component
    const result = newGlobalState(
      componentDef,
      { type: "/child/incrementRequested", payload: null },
      previousGlobalState
    );

    // THEN it should update the nested component state correctly
    expect(result).toEqual({
      "/": undefined,
      "/child/": { count: 0, name: "test" },
    });
  });
  it("should create child component state with given state", () => {
    // GIVEN a simple component definition with initial state
    const initialState = { count: 0, name: "test" };
    type ChildState = typeof initialState;
    type ChildComponentContract = {
      state: ChildState;
      events: {};
      values: {};
      children: {};
    };
    const child: ComponentDef<ChildComponentContract> = {
      initialState,
    };
    const componentDef: ComponentDef<{
      state: undefined;
      events: {
        createChildRequested: { payload: undefined };
        removeChildRequested: { payload: undefined };
      };
      values: {};
      children: { child: ChildComponentContract };
    }> = {
      childrenComponents: { child },
      childrenConfig: {
        child: {
          createOn: {
            type: "createChildRequested",
            initialChildState: () => ({ count: 42 }),
          },
          removeOn: {
            type: "removeChildRequested",
          },
        },
      },
    };
    const previousGlobalState = {
      "/": undefined,
    };

    // WHEN creating initial state tree with action for nested component
    const result = newGlobalState(
      componentDef,
      { type: "/child/incrementRequested", payload: null },
      previousGlobalState
    );

    // THEN it should update the nested component state correctly
    expect(result).toEqual({
      "/": undefined,
      "/child/": { count: 42, name: "test" },
    });
  });

  it("should create children component states with given states", () => {
    // GIVEN a simple component definition with initial state
    const initialState = { count: 0, name: "test" };
    type ChildState = typeof initialState;
    type ChildComponentContract = {
      state: ChildState;
      events: {};
      values: {};
      children: {};
    };
    const child: ComponentDef<ChildComponentContract> = {
      initialState,
    };
    const componentDef: ComponentDef<{
      state: undefined;
      events: {
        create2ChildrenRequested: { payload: undefined };
        swapChildrenRequested: { payload: undefined };
        removeTopChildrenRequested: { payload: number };
      };
      values: {};
      children: { child: ChildComponentContract & { isCollection: true } };
    }> = {
      childrenComponents: { child },
      childrenConfig: {
        child: {
          isCollection: true,
          updateAllOn: [
            {
              type: "create2ChildrenRequested",
              newChildrenStates: () => ({
                a: { action: "create", initialState: { count: 42 } },
                b: { action: "create", initialState: { count: 7 } },
              }),
            },
            {
              type: "swapChildrenRequested",
              newChildrenStates: () => ({
                b: { action: "keep" },
                a: { action: "keep" },
              }),
            },
            {
              type: "removeTopChildrenRequested",
              newChildrenStates: (_, count) => ({
                b: { action: "keep" },
                a: { action: "keep" },
              }),
            },
          ],
        },
      },
    };
    const previousGlobalState = {
      "/": undefined,
    };

    // WHEN creating initial state tree with action for nested component
    const result = newGlobalState(
      componentDef,
      { type: "/child/incrementRequested", payload: null },
      previousGlobalState
    );

    // THEN it should update the nested component state correctly
    expect(result).toEqual({
      "/": undefined,
      "/child/": { count: 42, name: "test" },
    });
  });
});
