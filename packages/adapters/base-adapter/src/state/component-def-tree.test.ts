import { describe, expect, it } from "vitest";

import { findComponentDefFromStatePath } from "./component-def-tree";

describe("findComponentDef", () => {
  it("returns a single empty component", () => {
    const root = {};
    const result = findComponentDefFromStatePath(root, []);
    expect(result).toEqual(root);
  });
  it("returns a child component", () => {
    const child = {};
    const root = { config: { childrenDefs: { child } } };
    const result = findComponentDefFromStatePath(root, [["child", "0"]]);
    expect(result).toEqual(child);
  });
  it("returns a grand child component", () => {
    const grandChild = {};
    const child = { config: { childrenDefs: { grandChild } } };
    const root = { config: { childrenDefs: { child } } };
    const result = findComponentDefFromStatePath(root, [
      ["child", "0"],
      ["grandChild", "0"],
    ]);
    expect(result).toEqual(grandChild);
  });
});
