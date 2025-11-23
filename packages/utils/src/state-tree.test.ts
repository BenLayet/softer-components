import { describe, it, expect } from "vitest";

import { findSubStateTree } from "./state-tree";

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
