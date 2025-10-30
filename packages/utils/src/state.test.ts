// packages/utils/src/state.test.ts
import { describe, expect, it } from "vitest";
import { initialStateTree } from "./state";

describe("initialStateTree", () => {
  it("should create initial state tree for simple component", () => {
    // GIVEN a simple component definition with initial state
    const componentDef = { initialState: { count: 0, name: "test" } };

    // WHEN creating initial state tree
    const result = initialStateTree(componentDef);

    // THEN it should create correct state structure
    expect(result).toEqual({
      "/": { count: 0, name: "test" },
    });
  });

  it("should create state tree for component with children", () => {
    // GIVEN a component with child components
    const childDef = { initialState: { value: "child" } };

    const parentDef = {
      initialState: { count: 1 },
      children: { child: childDef },
    };

    // WHEN creating initial state tree
    const result = initialStateTree(parentDef);

    // THEN it should create state for parent and child
    expect(result).toEqual({
      "/": { count: 1 },
      "/child/": { value: "child" },
    });
  });

  it("should create state tree for nested children", () => {
    // GIVEN deeply nested component structure
    const grandChildDef = { initialState: { level: 3 } };

    const childDef = {
      initialState: { level: 2 },
      children: { grandChild: grandChildDef },
    };

    const rootDef = {
      initialState: { level: 1 },
      children: {
        child: childDef,
      },
    };

    // WHEN creating initial state tree
    const result = initialStateTree(rootDef);

    // THEN it should create state for all levels
    expect(result).toEqual({
      "/": { level: 1 },
      "/child/": { level: 2 },
      "/child/grandChild/": { level: 3 },
    });
  });
});
