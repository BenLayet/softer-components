import { describe, expect, it } from "vitest";

import { diff } from "./diff";

describe("diff", () => {
  it("returns empty diff when comparing empty objects", () => {
    const result = diff({}, {});
    expect(result).toEqual({});
  });

  it("returns added properties", () => {
    const result = diff({}, { a: 1 });
    expect(result).toEqual({ a: "added::new='1'" });
  });

  it("returns removed properties", () => {
    const result = diff({ a: 1 }, {});
    expect(result).toEqual({ a: "removed::old='1'" });
  });

  it("returns changed properties", () => {
    const result = diff({ a: 1 }, { a: 2 });
    expect(result).toEqual({ a: "changed::old='1';new='2'" });
  });

  it("handles nested objects", () => {
    const result = diff({ a: { b: 1 } }, { a: { b: 2, c: 3 } });
    expect(result).toEqual({
      "a.b": "changed::old='1';new='2'",
      "a.c": "added::new='3'",
    });
  });

  it("handles arrays", () => {
    const result = diff({ a: [1, 2] }, { a: [1, 3] });
    expect(result).toEqual({
      "a[1]": "changed::old='2';new='3'",
    });
  });
});
