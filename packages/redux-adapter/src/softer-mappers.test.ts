import { describe, expect, it } from "vitest";
import { stringToComponentPath } from "./softer-mappers";

describe("stringToComponentPath", () => {
  it("should parse a single component path", () => {
    //WHEN
    const result = stringToComponentPath("☁️/child/");

    //THEN
    expect(result).toEqual([["child", undefined]]);
  });
});
