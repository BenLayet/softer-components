import { describe, expect, it } from "vitest";

import { CHILDREN_BRANCHES_KEY, OWN_VALUE_KEY, findSubTree } from "./tree";

describe("findSubTree", () => {
  it("returns root ", () => {
    const global = { [OWN_VALUE_KEY]: {} };
    const result = findSubTree(global, []);
    expect(result).toEqual(global);
  });
  it("returns a child ", () => {
    const childTree = { [OWN_VALUE_KEY]: {} };
    const globalTree = {
      [OWN_VALUE_KEY]: {},
      [CHILDREN_BRANCHES_KEY]: { child: { ["0"]: childTree } },
    };
    const result = findSubTree(globalTree, [["child", "0"]]);
    expect(result).toEqual(childTree);
  });
  it("returns a grand child ", () => {
    const grandChildTree = { [OWN_VALUE_KEY]: {} };
    const childTree = {
      [OWN_VALUE_KEY]: {},
      [CHILDREN_BRANCHES_KEY]: { grandChild: { "0": grandChildTree } },
    };
    const root = {
      [OWN_VALUE_KEY]: {},
      [CHILDREN_BRANCHES_KEY]: { child: { "0": childTree } },
    };
    const result = findSubTree(root, [
      ["child", "0"],
      ["grandChild", "0"],
    ]);
    expect(result).toEqual(grandChildTree);
  });
});
