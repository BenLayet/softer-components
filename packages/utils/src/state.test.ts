// packages/utils/src/state.test.ts
import { describe, expect, it } from "vitest";
import { initialStateTree } from "./state";
import { ComponentDef } from "@softer-components/types";
import { listDef } from "../../types/src/softer-component-types.test"; // TODO ask expert about this import

describe("state tests", () => {
  it("should create initial state tree for component with no constructor", () => {
    // GIVEN a simple component definition with initial state
    const componentDef = {};

    // WHEN creating initial state tree
    const result = initialStateTree(componentDef);

    // THEN it should create correct state structure
    expect(result).toEqual({});
  });
  it("should create initial state tree for simple component", () => {
    // GIVEN a simple component
    const rootDef: ComponentDef = {
      initialState: { level: 1 },
    };

    // WHEN creating initial state tree
    const result = initialStateTree(rootDef);

    // THEN it should create correct state structure
    expect(result).toEqual({
      "@": { level: 1 },
    });
  });

  it("should create state tree for component with 1 child", () => {
    // GIVEN a component with child components
    const childDef: ComponentDef = {
      initialState: { level: 2 },
    };

    const rootDef: ComponentDef = {
      initialState: { level: 1 },
      childrenComponents: { child: childDef },
    };

    // WHEN creating initial state tree
    const result = initialStateTree(rootDef);

    // THEN it should create state for parent and child
    expect(result).toEqual({
      "@": { level: 1 },
      "#": {
        child: {
          "@": { level: 2 },
        },
      },
    });
  });

  it("should create state tree for nested children", () => {
    // GIVEN deeply nested component structure
    const grandChildDef: ComponentDef = { initialState: { level: 3 } };

    const childDef: ComponentDef = {
      initialState: { level: 2 },
      childrenComponents: { grandChild: grandChildDef },
    };

    const rootDef: ComponentDef = {
      initialState: { level: 1 },
      childrenComponents: { child: childDef },
    };

    // WHEN creating initial state tree
    const result = initialStateTree(rootDef);

    // THEN it should create state for all levels
    expect(result).toEqual({
      "@": { level: 1 },
      "#": {
        child: {
          "@": { level: 2 },
          "#": { grandChild: { "@": { level: 3 } } },
        },
      },
    });
  });

  it("should create state tree for component with 1 single child with initial node", () => {
    // GIVEN a component with child components
    type ChildContract = {
      state: {};
      events: {};
      values: {};
      children: {};
    };
    const child: ComponentDef<ChildContract> = {
      initialState: { level: 2 },
    };

    const rootDef: ComponentDef<{
      state: {};
      events: {};
      values: {};
      children: { child: ChildContract };
    }> = {
      initialState: { level: 1 },
      initialChildrenNodes: { child: false },
      childrenComponents: { child },
    };

    // WHEN creating initial state tree
    const result = initialStateTree(rootDef);

    // THEN it should create state for parent and no child
    expect(result).toEqual({
      "@": { level: 1 },
      "#": {},
    });
  });

  it("should create state tree for component with 1 collection child with no initial node", () => {
    // GIVEN a component with child components
    type ChildContract = {
      state: {};
      events: {};
      values: {};
      children: {};
    };
    const child: ComponentDef<ChildContract> = {
      initialState: { level: 2 },
    };

    const rootDef: ComponentDef<{
      state: {};
      events: {};
      values: {};
      children: { child: ChildContract & { isCollection: true } };
    }> = {
      initialState: { level: 1 },
      childrenComponents: { child },
      childrenConfig: {
        child: {
          isCollection: true,
        },
      },
    };

    // WHEN creating initial state tree
    const result = initialStateTree(rootDef);

    // THEN it should create state for parent and child
    expect(result).toEqual({
      "@": { level: 1 },
      "#": {
        child: {},
      },
    });
  });

  it("should create state tree for component with 1 collection child with initial node", () => {
    // GIVEN a component with child components
    type ChildContract = {
      state: {};
      events: {};
      values: {};
      children: {};
    };
    const child: ComponentDef<ChildContract> = {
      initialState: { level: 2 },
    };

    const rootDef: ComponentDef<{
      state: {};
      events: {};
      values: {};
      children: { child: ChildContract & { isCollection: true } };
    }> = {
      initialState: { level: 1 },
      initialChildrenNodes: { child: ["42", "9", "6"] },
      childrenComponents: { child },
      childrenConfig: {
        child: {
          isCollection: true,
        },
      },
    };

    // WHEN creating initial state tree
    const result = initialStateTree(rootDef);

    // THEN it should create state for parent and child
    expect(result).toEqual({
      "@": { level: 1 },
      "#": {
        child: {
          42: { "@": { level: 2 } },
          9: { "@": { level: 2 } },
          6: { "@": { level: 2 } },
        },
      },
    });
  });

  it("should initialize listDef", () => {
    // WHEN creating initial state tree
    const result = initialStateTree(listDef);
    const expectedState = {
      "@": {
        lastItemId: 0,
        listName: "My Shopping List",
        nextItemName: "",
      },
      "#": { items: {} },
    };
    expect(result).toEqual(expectedState);
  });
});
