import { describe, it, expect } from "vitest";

import {
  createValuesProvider,
  findComponentDef,
  findSubStateTree,
} from "./component-def-tree";

describe("findComponentDef", () => {
  it("returns a single empty component", () => {
    const root = {};
    const result = findComponentDef(root, []);
    expect(result).toEqual(root);
  });
  it("returns a child component", () => {
    const child = {};
    const root = { childrenComponents: { child } };
    const result = findComponentDef(root, [["child"]]);
    expect(result).toEqual(child);
  });
  it("returns a grand child component", () => {
    const grandChild = {};
    const child = { childrenComponents: { grandChild } };
    const root = { childrenComponents: { child } };
    const result = findComponentDef(root, [["child"], ["grandChild"]]);
    expect(result).toEqual(grandChild);
  });
});

describe("findSubStateTree", () => {
  it("returns root state", () => {
    const globalState = {};
    const result = findSubStateTree(globalState, []);
    expect(result).toEqual(globalState);
  });
  it("returns a child state", () => {
    const child = {};
    const globalState = { "#": { child } };
    const result = findSubStateTree(globalState, [["child"]]);
    expect(result).toEqual(child);
  });
  it("returns a grand child state", () => {
    const grandChild = {};
    const child = { "#": { grandChild } };
    const root = { "#": { child } };
    const result = findSubStateTree(root, [["child"], ["grandChild"]]);
    expect(result).toEqual(grandChild);
  });
});

describe("createValuesProvider", () => {
  it("returns root selectors", () => {
    const globalState = { "@": { answer: 42 } };
    const root = {
      selectors: {
        answer: (state: { answer: number }) => state.answer,
      },
    };
    const result = createValuesProvider(root, globalState);
    expect(result.selectors.answer()).toEqual(42);
    expect(result.children).toEqual({});
  });
  it("returns a child selector", () => {
    const childState = { "@": { answer: 42 } };
    const globalState = { "#": { child: childState } };
    const child = {
      selectors: {
        answer: (state: { answer: number }) => state.answer,
      },
    };
    const root = {
      childrenComponents: { child },
    };
    const result = createValuesProvider(root, globalState);
    expect(result.children.child.selectors.answer()).toEqual(42);
    expect(result.selectors).toEqual({});
    expect(result.children.child.children).toEqual({});
  });
});
