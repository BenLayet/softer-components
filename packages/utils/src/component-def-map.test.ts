import { describe, it, expect } from "vitest";

import { createComponentDefMap } from "./component-def-map";

describe("createComponentDefMap", () => {
  it("returns a single empty component", () => {
    const result = createComponentDefMap({});

    expect(result).toEqual({
      "/": {},
    });
  });
  it("returns a single empty component", () => {
    const result = createComponentDefMap({});

    expect(result).toEqual({
      "/": {},
    });
  });
  it("returns the root component and single child", () => {
    const child1 = {};
    const root = {
      children: {
        child1: { componentDef: child1 },
      },
    };
    const result = createComponentDefMap(root);

    expect(result).toEqual({
      "/": root,
      "/child1/": child1,
    });
  });
  it("returns the root component with children and grandchildren", () => {
    const grandChild1 = {};
    const child1 = { children: { grandChild1: { componentDef: grandChild1 } } };
    const child2 = {};
    const root = {
      children: {
        child1: { componentDef: child1 },
        child2: { componentDef: child2 },
      },
    };
    const result = createComponentDefMap(root);

    expect(result).toEqual({
      "/": root,
      "/child1/": child1,
      "/child1/grandChild1/": grandChild1,
      "/child2/": child2,
    });
  });
});
