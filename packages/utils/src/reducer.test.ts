// packages/utils/src/state.test.ts
import { describe, expect, it } from "vitest";
import { newGlobalState } from "./reducer";

describe("initialStateTree", () => {
  it("should update simple state", () => {
    // GIVEN a simple component definition with initial state
    const componentDef = {
      initialState: { count: 0, name: "test" },
      events: {
        incrementRequested: {
          stateUpdater: (state: any) => ({ ...state, count: state.count + 1 }),
        },
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

  it("should not change state if no relevant action", () => {
    // GIVEN a simple component definition with initial state
    const componentDef = {
      initialState: { count: 0, name: "test" },
      events: {
        incrementRequested: {
          stateUpdater: (state: any) => ({ ...state, count: state.count + 1 }),
        },
      },
    };
    const previousGlobalState = {
      "/": { count: 0, name: "test" },
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

  it("should update nested component state", () => {
    // GIVEN a nested component definition with initial state
    const componentDef = {
      initialState: { title: "Parent" },
      children: {
        child1: {
          initialState: { count: 0 },
          events: {
            incrementRequested: {
              stateUpdater: (state: any) => ({
                ...state,
                count: state.count + 1,
              }),
            },
          },
        },
      },
    };
    const previousGlobalState = {
      "/": { title: "Parent" },
      "/child1/": { count: 0 },
    };

    // WHEN creating initial state tree with action for nested component
    const result = newGlobalState(
      componentDef,
      { type: "/child1/incrementRequested", payload: null },
      previousGlobalState
    );

    // THEN it should update the nested component state correctly
    expect(result).toEqual({
      "/": { title: "Parent" },
      "/child1/": { count: 1 },
    });
  });
});
