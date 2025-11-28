import { describe, it, expect } from "vitest";

import { CHILDREN_CONTAINER_KEY, findSubTree, OWN_KEY } from "./tree";

describe("findSubTree", () => {
  it("returns root ", () => {
    const global = { [OWN_KEY]: {} };
    const result = findSubTree(global, []);
    expect(result).toEqual(global);
  });
  it("returns a child ", () => {
    const child = { [OWN_KEY]: {} };
    const global = { [OWN_KEY]: {}, [CHILDREN_CONTAINER_KEY]: { child } };
    const result = findSubTree(global, [["child"]]);
    expect(result).toEqual(child);
  });
  it("returns a grand child ", () => {
    const grandChild = { [OWN_KEY]: {} };
    const child = { [OWN_KEY]: {}, [CHILDREN_CONTAINER_KEY]: { grandChild } };
    const root = { [OWN_KEY]: {}, [CHILDREN_CONTAINER_KEY]: { child } };
    const result = findSubTree(root, [["child"], ["grandChild"]]);
    expect(result).toEqual(grandChild);
  });
});
