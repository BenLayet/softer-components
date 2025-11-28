import { describe, it, expect } from "vitest";

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
