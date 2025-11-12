// packages/utils/src/state.test.ts
import { describe, expect, it } from "vitest";
import { initialStateTree } from "./state";
import { ComponentDef } from "@softer-components/types";

describe("state tests", () => {
  it("should create initial state tree for component with no constructor", () => {
    // GIVEN a simple component definition with initial state
    const componentDef = {};

    // WHEN creating initial state tree
    const result = initialStateTree(componentDef);

    // THEN it should create correct state structure
    expect(result).toEqual({
      "/": undefined,
    });
  });
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

  it("should create state tree for component with 1 child", () => {
    // GIVEN a component with child components
    const child: ComponentDef = { initialState: { value: "child" } };

    const parent: ComponentDef = {
      initialState: { count: 1 },
      childrenComponents: { child },
    };

    // WHEN creating initial state tree
    const result = initialStateTree(parent);

    // THEN it should create state for parent and child
    expect(result).toEqual({
      "/": { count: 1 },
      "/child/": { value: "child" },
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
      "/": { level: 1 },
      "/child/": { level: 2 },
      "/child/grandChild/": { level: 3 },
    });
  });

  it("should handle components without initialState", () => {
    // GIVEN a component without a initialState
    const childDef = { initialState: { answer: 42 } };

    const parentDef = {
      // no initialState
      childrenComponents: { child: childDef },
    };

    // WHEN creating initial state tree
    const result = initialStateTree(parentDef);

    // THEN it should create state only for the child
    expect(result).toEqual({
      "/": undefined,
      "/child/": { answer: 42 },
    });
  });

  it("should handle components with protoState", () => {
    // GIVEN a component without a initialState
    const initialState = { answer: 42, question: "" };
    const child: ComponentDef<{
      state: typeof initialState;
      events: {};
      children: {};
      values: {};
    }> = {
      initialState: { answer: 42, question: "" },
    };

    const parentDef: ComponentDef = {
      childrenComponents: { child },
      // no initialState
      childrenConfig: {
        child: {
          initialChildState: {
            question:
              "What is the answer to the ultimate question of life, the universe, and everything?",
          },
        },
      },
    };

    // WHEN creating initial state tree
    const result = initialStateTree(parentDef);

    // THEN it should create state only for the child
    expect(result).toEqual({
      "/": undefined,
      "/child/": {
        answer: 42,
        question:
          "What is the answer to the ultimate question of life, the universe, and everything?",
      },
    });
  });

  it("should handle components with initialChildrenState for child collections", () => {
    // GIVEN a component without a initialState
    const initialState = { answer: 42, question: "" };
    type ChildContract = {
      state: typeof initialState;
      events: {};
      children: {};
      values: {};
    };
    const child: ComponentDef<ChildContract> = {
      initialState: { answer: 42, question: "" },
    };

    const parentDef: ComponentDef<{
      state: undefined;
      events: {};
      values: {};
      children: { child: ChildContract & { isCollection: true } };
    }> = {
      childrenComponents: { child },
      // no initialState
      childrenConfig: {
        child: {
          isCollection: true,
          initialChildrenStates: {
            v1: {
              question:
                "What is the answer to the ultimate question of life, the universe, and everything?",
            },
            v2: {
              question: "What is 9x6?",
            },
          },
        },
      },
    };

    // WHEN creating initial state tree
    const result = initialStateTree(parentDef);

    // THEN it should create state only for the child
    expect(result).toEqual({
      "/": undefined,
      "/child:v1/": {
        answer: 42,
        question:
          "What is the answer to the ultimate question of life, the universe, and everything?",
      },
      "/child:v2/": {
        answer: 42,
        question: "What is 9x6?",
      },
    });
  });
});
