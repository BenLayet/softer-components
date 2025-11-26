import { describe, it, expect } from "vitest";

import { CHILDREN_BRANCHES_KEY, findSubTree, OWN_KEY } from "./tree";

describe("findSubTree", () => {
  it("returns root ", () => {
    const global = {};
    const result = findSubTree(global, []);
    expect(result).toEqual(global);
  });
  it("returns a child ", () => {
    const child = {};
    const global = { [OWN_KEY]: { child } };
    const result = findSubTree(global, [["child"]]);
    expect(result).toEqual(child);
  });
  it("returns a grand child ", () => {
    const grandChild = {};
    const child = { [CHILDREN_BRANCHES_KEY]: { grandChild } };
    const root = { [CHILDREN_BRANCHES_KEY]: { child } };
    const result = findSubTree(root, [["child"], ["grandChild"]]);
    expect(result).toEqual(grandChild);
  });
});
