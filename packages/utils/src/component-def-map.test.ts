import { describe, it, expect } from "vitest";

import { createComponentDefMap } from "./component-def-map";

describe("createComponentDefMap", () => {
  it("returns a map-like object containing the root component", () => {
    const grandChild1 = {};
    const child1 = { children: { grandChild1 } };
    const child2 = {};
    const root = { children: { child1, child2 } };
    const result = createComponentDefMap(root);

    expect(result).toEqual({
      "/": root,
      "/child1/": child1,
      "/child1/grandChild1/": grandChild1,
      "/child2/": child2,
    });
  });
});
