import { describe, it, expect } from "vitest";
import { mapComponentTree } from "./softerUtils";
import type { ComponentDef } from "@softer-components/types";

describe("mapComponentTree", () => {
  it("returns a tree with only the root component if no children", () => {
    // GIVEN a root component definition with empty children
    const root: ComponentDef = { children: {} };

    // WHEN mapComponentTree is called with the root component
    const result = mapComponentTree(root);

    // THEN it should return a tree containing only the root component at path "/"
    expect(result).toEqual({ "/": root });
  });

  it("maps a tree with one child", () => {
    // GIVEN a child component with no dependencies
    const child: ComponentDef = {};
    // GIVEN a root component with the child in its children
    const root: ComponentDef = {
      children: { child },
    };

    // WHEN mapComponentTree is called with root and "/" path
    const result = mapComponentTree(root, "/");

    // THEN it should return a tree with root at "/" and child at "/child/"
    expect(result).toEqual({
      "/": root,
      "/child/": child,
    });
  });

  it("maps a tree with nested children", () => {
    // GIVEN a grandchild component with no dependencies
    const grandChild: ComponentDef = {};
    // GIVEN a child component containing the grandchild
    const child: ComponentDef = {
      children: { grandChild },
    };
    // GIVEN a root component containing the child
    const root: ComponentDef = {
      children: { child },
    };

    // WHEN mapComponentTree is called with root and "/" path
    const result = mapComponentTree(root, "/");

    // THEN it should return a tree with all components at their nested paths
    expect(result).toEqual({
      "/": root,
      "/child/": child,
      "/child/grandChild/": grandChild,
    });
  });

  it("handles multiple children at each level", () => {
    // GIVEN two child components with no dependencies
    const childA: ComponentDef = {};
    const childB: ComponentDef = {};
    // GIVEN a root component with both children in its dependencies
    const root: ComponentDef = {
      children: { childA, childB },
    };

    // WHEN mapComponentTree is called with root and "/" path
    const result = mapComponentTree(root, "/");

    // THEN it should return a tree with all components at their respective paths
    expect(result).toEqual({
      "/": root,
      "/childA/": childA,
      "/childB/": childB,
    });
  });

  it("uses custom root name", () => {
    // GIVEN a root component with no children
    const root: ComponentDef = {};

    // WHEN mapComponentTree is called with a custom root path "/custom/"
    const result = mapComponentTree(root, "/custom/");

    // THEN it should return a tree with root at the custom path
    expect(result).toEqual({ "/custom/": root });
  });
});
