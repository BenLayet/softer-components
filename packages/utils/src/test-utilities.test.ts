import { describe, expect, it } from "vitest";

import { diff } from "./test-utilities";
import { CHILDREN_BRANCHES_KEY, OWN_VALUE_KEY, findSubTree } from "./tree";

describe("test-utilities", () => {
  it("should report diff of objects", () => {
    const a = { name: "Alice", age: 30, address: { city: "New York" } };
    const b = { name: "Alice", age: 31, address: { country: "USA" } };

    const result = diff(a, b);
    expect(result).toEqual({
      age: {
        from: 30,
        to: 31,
        type: "changed",
      },
      "address.city": {
        from: "New York",
        type: "removed",
      },
      "address.country": {
        to: "USA",
        type: "added",
      },
    });
  });
});
