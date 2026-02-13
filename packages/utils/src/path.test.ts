/// <reference types="vitest" />
import { describe, expect, it } from "vitest";

import { normalizeContextPath } from "./path";

describe("normalizeContextPath", () => {
  it("resolves .. and . in absolute paths", () => {
    expect(normalizeContextPath("/a/b/../c")).toBe("/a/c");
    expect(normalizeContextPath("/a/./b")).toBe("/a/b");
    expect(normalizeContextPath("/a//b///c")).toBe("/a/b/c");
    expect(normalizeContextPath("/../a")).toBe("/a");
  });

  it("resolves .. and . in relative paths", () => {
    expect(normalizeContextPath("a/b/../c")).toBe("a/c");
    expect(normalizeContextPath("./a/b")).toBe("a/b");
    expect(normalizeContextPath("a/../../b")).toBe("../b");
    expect(normalizeContextPath("..")).toBe("..");
  });

  it("root and empty", () => {
    expect(normalizeContextPath("/")).toBe("/");
    expect(normalizeContextPath("")).toBe("");
  });
});
