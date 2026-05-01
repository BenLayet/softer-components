import { describe, expect, it } from "vitest";

import { StatePath, statePathToString, stringToStatePath } from "./path";
import {
  CHILDREN_BRANCHES_KEY,
  OWN_VALUE_KEY,
  findSubTree,
} from "./state-tree";

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
  [
    { pathStr: "", path: [] },
    { pathStr: "/child:0", path: [["child", "0"]] },
    {
      pathStr: "/child1/child2",
      path: [
        ["child1", "0"],
        ["child2", "0"],
      ],
    },
  ].forEach(({ pathStr, path }) => {
    it(`should convert '${pathStr}' to path`, () => {
      const result = stringToStatePath(pathStr);
      expect(result).toEqual(path);
    });
  });
  [
    { pathStr: "", path: [] as StatePath },
    { pathStr: "/child:0", path: [["child", "0"]] as StatePath },
    {
      pathStr: "/child1:0/child2:0",
      path: [
        ["child1", "0"],
        ["child2", "0"],
      ] as StatePath,
    },
  ].forEach(({ pathStr, path }) => {
    it(`should convert from path to '${pathStr}'`, () => {
      const result = statePathToString(path);
      expect(result).toEqual(pathStr);
    });
  });
});
