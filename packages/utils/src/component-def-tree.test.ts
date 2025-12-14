import { describe, expect, it } from "vitest";

import { findComponentDef } from "./component-def-tree";

describe("findComponentDef", () => {
  it("returns a single empty component", () => {
    const root = {};
    const result = findComponentDef(root, []);
    expect(result).toEqual(root);
  });
  it("returns a child component", () => {
    const child = {};
    const root = { childrenComponents: { child } };
    const result = findComponentDef(root, [["child", "0"]]);
    expect(result).toEqual(child);
  });
  it("returns a grand child component", () => {
    const grandChild = {};
    const child = { childrenComponents: { grandChild } };
    const root = { childrenComponents: { child } };
    const result = findComponentDef(root, [
      ["child", "0"],
      ["grandChild", "0"],
    ]);
    expect(result).toEqual(grandChild);
  });
});
