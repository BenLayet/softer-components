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
    mockStateReader.getChildrenNodes = vi.fn().mockReturnValue({});
    mockStateReader.selectValue = vi.fn().mockReturnValue(42);

    //WHEN
    const result = createValueProviders(root, mockStateReader);

    //THEN
    expect(result.values.answer()).toEqual(42);
    expect(result.children).toEqual({});
  });
  it("returns a child selector", () => {
    //GIVEN
    const child = {
      selectors: {
        answer: (state: { answer: number }) => state.answer,
      },
    };
    const root = {
      childrenComponents: { child },
    };
    const mockStateReader = {} as RelativePathStateReader;
    const mockChildStateReader = {} as RelativePathStateReader;
    mockStateReader.getChildrenNodes = vi.fn().mockReturnValue({ child: true });
    mockStateReader.childStateReader = vi
      .fn()
      .mockReturnValue(mockChildStateReader);
    mockChildStateReader.getChildrenNodes = vi.fn().mockReturnValue({});
    mockChildStateReader.selectValue = vi.fn().mockReturnValue(42);

    //WHEN
    const result = createValueProviders(root, mockStateReader);

    //THEN
    expect(result.children.child.values.answer()).toEqual(42);
    expect(result.values).toEqual({});
    expect(result.children.child.children).toEqual({});
  });
});
