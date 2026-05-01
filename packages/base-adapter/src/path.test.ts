/// <reference types="vitest" />
import { describe, expect, it } from "vitest";

import { normalizePath, stringToStatePath } from "./path";

describe("normalizeContextPath", () => {
  it("resolves .. and . in absolute paths", () => {
    expect(normalizePath("/a/b/../c")).toBe("/a/c");
    expect(normalizePath("/a/./b")).toBe("/a/b");
    expect(normalizePath("/a//b///c")).toBe("/a/b/c");
    expect(normalizePath("/../a")).toBe("/a");
  });

  it("resolves .. and . in relative paths", () => {
    expect(normalizePath("a/b/../c")).toBe("a/c");
    expect(normalizePath("./a/b")).toBe("a/b");
    expect(normalizePath("a/../../b")).toBe("../b");
    expect(normalizePath("..")).toBe("..");
  });

  it("root and empty", () => {
    expect(normalizePath("/")).toBe("/");
    expect(normalizePath("")).toBe("");
  });
});

describe("stringToStatePath", () => {
  it("should create empty path from empty string", () => {
    const result = stringToStatePath("");
    expect(result).toEqual([]);
  });
});
