import { describe, it, expect, vi } from "vitest";
import { createValueProviders } from "./value-providers";
import { RelativePathStateReader } from "./relative-path-state-manager";

describe("createValuesProvider", () => {
  it("returns root selectors", () => {
    //GIVEN
    const root = {
      selectors: {
        answer: (state: { answer: number }) => state.answer,
      },
    };
    const mockStateReader = {} as RelativePathStateReader;
    mockStateReader.getChildrenKeys = vi.fn().mockReturnValue({});
    mockStateReader.selectValue = vi.fn().mockReturnValue(42);

    //WHEN
    const result = createValueProviders(root, mockStateReader);

    //THEN
    expect(result.values.answer()).toEqual(42);
    expect(result.children).toEqual({});
  });
  it("returns a child selector", () => {
    //GIVEN
    const childDef = {
      selectors: {
        answer: (state: { answer: number }) => state.answer,
      },
    };
    const rootDef = {
      childrenComponents: { child: childDef },
    };
    const mockStateReader = {} as RelativePathStateReader;
    const mockChildStateReader = {} as RelativePathStateReader;
    mockStateReader.getChildrenKeys = vi.fn().mockReturnValue({ child: ["0"] });
    mockStateReader.childStateReader = vi
      .fn()
      .mockReturnValue(mockChildStateReader);
    mockChildStateReader.getChildrenKeys = vi.fn().mockReturnValue({});
    mockChildStateReader.selectValue = vi.fn().mockReturnValue(42);

    //WHEN
    const result = createValueProviders(rootDef, mockStateReader);

    //THEN
    expect(result.children.child["0"].values.answer()).toEqual(42);
    expect(result.values).toEqual({});
    expect(result.children.child["0"].children).toEqual({});
  });
});
