// packages/utils/src/state.test.ts
import { describe, expect, it } from "vitest";
import { initialStateTree, reinstanciateStateRecursively } from "./state";
import {
  ComponentDef,
  ExtractConstructorContract,
} from "@softer-components/types";

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
    const componentDef = { initialState: () => ({ count: 0, name: "test" }) };

    // WHEN creating initial state tree
    const result = initialStateTree(componentDef);

    // THEN it should create correct state structure
    expect(result).toEqual({
      "/": { count: 0, name: "test" },
    });
  });

  it("should create state tree for component with 1 child", () => {
    // GIVEN a component with child components
    const childDef = { initialState: () => ({ value: "child" }) };

    const parentDef: ComponentDef = {
      initialState: () => ({ count: 1 }),
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
    const grandChildDef = { initialState: () => ({ level: 3 }) };

    const childDef = {
      initialState: () => ({ level: 2 }),
      children: { grandChild: grandChildDef },
    };

    const rootDef = {
      initialState: () => ({ level: 1 }),
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

  it("should handle components without initialState", () => {
    // GIVEN a component without a initialState
    const childDef = { initialState: () => ({ value: 42 }) };

    const parentDef = {
      // no initialState
      children: { child: { ...childDef } },
    };

    // WHEN creating initial state tree
    const result = initialStateTree(parentDef);

    // THEN it should create state only for the child
    expect(result).toEqual({
      "/": undefined,
      "/child/": { value: 42 },
    });
  });

  it("should handle components with protoState", () => {
    // GIVEN a component without a initialState
    const childDef = {
      initialState: (question: string) => ({ value: 42, question }),
    };

    const parentDef = {
      initialState: () => ({ version: 1 }),
      // no initialState
      children: {
        child: {
          ...childDef,
          protoState: (state: { version: number }) =>
            state.version === 1
              ? "What is the answer to the ultimate question of life, the universe, and everything?"
              : "What was the question again?",
        },
      },
    };

    // WHEN creating initial state tree
    const result = initialStateTree(parentDef);

    // THEN it should create state only for the child
    expect(result).toEqual({
      "/": { version: 1 },
      "/child/": {
        value: 42,
        question:
          "What is the answer to the ultimate question of life, the universe, and everything?",
      },
    });
  });

  it("should have one branch and one leaf", () => {
    // GIVEN a component with a child collection
    const leafDef = {
      initialState: () => ({ color: "green" }),
    };
    const branchDef = {
      initialState: () => ({
        type: "wooden",
      }),
      children: {
        leaf: leafDef,
      },
    };
    const trunkState = { hasOneBranch: true };
    type TrunkState = typeof trunkState;
    const trunkDef = {
      initialState: () => trunkState,
      children: {
        branch: {
          ...branchDef,
          exists: (state: TrunkState) => state.hasOneBranch,
        },
      },
    };

    // WHEN creating initial state tree
    const result = initialStateTree(trunkDef);

    // THEN it should create state for parent and child collection
    expect(result).toEqual({
      "/": { hasOneBranch: true },
      "/branch/": {
        type: "wooden",
      },
      "/branch/leaf/": {
        color: "green",
      },
    });
  });

  it("should have one branch and one leaf", () => {
    // GIVEN a component with a child collection
    const leafDef = {
      initialState: () => ({ color: "green" }),
    };
    const branchDef = {
      initialState: () => ({
        type: "wooden",
      }),
      children: {
        leaf: leafDef,
      },
    };
    const trunkState = { hasOneBranch: true };
    type TrunkState = typeof trunkState;
    const trunkDef = {
      initialState: () => trunkState,
      children: {
        branch: {
          ...branchDef,
          exists: (state: TrunkState) => state.hasOneBranch,
        },
      },
    };

    //current state
    const mutableGlobalState = {
      "/": { hasOneBranch: false },
      "/branch/": {
        type: "wooden",
      },
      "/branch/leaf/": {
        color: "green",
      },
    };

    // WHEN creating initial state tree
    const result = reinstanciateStateRecursively(
      mutableGlobalState,
      "/",
      trunkDef
    );

    // THEN it should create state for parent and child collection
    expect(result).toEqual({
      "/": { hasOneBranch: false },
    });
  });

  it("should create state tree for component with child collection", () => {
    // GIVEN a component with a child collection
    const leafDef: ComponentDef<{ key: string; color: string }, {}, string> = {
      initialState: (key: string) => ({ key, color: "green" }),
    };
    const branchDef: ComponentDef<
      { id: string; leaves: number; type: string },
      {},
      { id: string; leaves: number }
    > = {
      initialState: (protoState: { id: string; leaves: number }) => ({
        ...protoState,
        type: "wooden",
      }),
      children: {
        leaf: {
          ...leafDef,
          isCollection: true,
          getKeys: (state: { leaves: number }) =>
            new Array(state.leaves).fill(0).map((_, i) => (i + 1).toString()),
          protoState: (_: {}, key: string) => key,
        },
      },
    };
    const trunkState = { branches: [1, 2], leavesPerBranch: 2 };
    type TrunkState = typeof trunkState;
    const trunkDef: ComponentDef<TrunkState, {}, undefined> = {
      initialState: () => trunkState,
      children: {
        branch: {
          ...branchDef,
          isCollection: true,
          getKeys: (state: TrunkState) =>
            state.branches.map((b) => b.toString()),
          protoState: (parentState: TrunkState, key: string) => ({
            id: key,
            leaves: parentState.leavesPerBranch,
          }),
        },
      },
    };

    // WHEN creating initial state tree
    const result = initialStateTree(trunkDef);

    // THEN it should create state for parent and child collection
    expect(result).toEqual({
      "/": {
        branches: [1, 2],
        leavesPerBranch: 2,
      },
      "/branch:1/": {
        id: "1",
        leaves: 2,
        type: "wooden",
      },
      "/branch:1/leaf:1/": {
        key: "1",
        color: "green",
      },
      "/branch:1/leaf:2/": {
        key: "2",
        color: "green",
      },
      "/branch:2/": {
        id: "2",
        leaves: 2,
        type: "wooden",
      },
      "/branch:2/leaf:1/": {
        key: "1",
        color: "green",
      },
      "/branch:2/leaf:2/": {
        key: "2",
        color: "green",
      },
    });
  });

  it("should remove branch and leaves when a branch is removed", () => {
    // GIVEN a component with a child collection
    const leafDef: ComponentDef<{ key: string; color: string }, {}, string> = {
      initialState: (key: string) => ({ key, color: "green" }),
    };
    const branchDef: ComponentDef<
      { id: string; leaves: number; type: string },
      {},
      { id: string; leaves: number }
    > = {
      initialState: (protoState: { id: string; leaves: number }) => ({
        ...protoState,
        type: "wooden",
      }),
      children: {
        leaf: {
          ...leafDef,
          isCollection: true,
          getKeys: (state: { leaves: number }) =>
            new Array(state.leaves).fill(0).map((_, i) => (i + 1).toString()),
          protoState: (_: {}, key: string) => key,
        },
      },
    };
    const trunkState = { branches: [1, 2], leavesPerBranch: 2 };
    type TrunkState = typeof trunkState;
    const trunkDef: ComponentDef<TrunkState, {}, undefined> = {
      initialState: () => trunkState,
      children: {
        branch: {
          ...branchDef,
          isCollection: true,
          getKeys: (state: TrunkState) =>
            state.branches.map((b) => b.toString()),
          protoState: (parentState: TrunkState, key: string) => ({
            id: key,
            leaves: parentState.leavesPerBranch,
          }),
        },
      },
    };

    //current state
    const mutableGlobalState = {
      "/": {
        branches: [2],
        leavesPerBranch: 2,
      },
      "/branch:1/": {
        id: "1",
        leaves: 2,
        type: "wooden",
      },
      "/branch:1/leaf:1/": {
        key: "1",
        color: "green",
      },
      "/branch:1/leaf:2/": {
        key: "2",
        color: "green",
      },
      "/branch:2/": {
        id: "2",
        leaves: 2,
        type: "wooden",
      },
      "/branch:2/leaf:1/": {
        key: "1",
        color: "green",
      },
      "/branch:2/leaf:2/": {
        key: "2",
        color: "green",
      },
    };

    // WHEN creating initial state tree
    const result = reinstanciateStateRecursively(
      mutableGlobalState,
      "/",
      trunkDef
    );

    // THEN it should create state for parent and child collection
    expect(result).toEqual({
      "/": {
        branches: [2],
        leavesPerBranch: 2,
      },
      "/branch:2/": {
        id: "2",
        leaves: 2,
        type: "wooden",
      },
      "/branch:2/leaf:1/": {
        key: "1",
        color: "green",
      },
      "/branch:2/leaf:2/": {
        key: "2",
        color: "green",
      },
    });
  });
});
