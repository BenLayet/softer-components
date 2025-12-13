import { describe, it, expect, vi } from "vitest";
import { createValueProviders } from "./value-providers";
import { RelativePathStateReader } from "./relative-path-state-manager";
import { ComponentDef } from "@softer-components/types";

describe("createValuesProvider", () => {
  it("returns root selectors", () => {
    //GIVEN
    const rootDef: ComponentDef = {
      selectors: {
        answer: (state: { answer: number }) => state.answer,
      },
    };
    const mockStateReader = {} as RelativePathStateReader;
    mockStateReader.getChildrenKeys = vi.fn().mockReturnValue({});
    mockStateReader.selectValue = vi.fn().mockReturnValue(42);

    //WHEN
    const result = createValueProviders(rootDef, mockStateReader);

    //THEN
    expect(result.selectors.answer()).toEqual(42);
    expect(result.children).toEqual({});
  });
  it("returns a child selector", () => {
    //GIVEN
    const childDef: ComponentDef = {
      selectors: {
        answer: (state: { answer: number }) => state.answer,
      },
    };
    const rootDef: ComponentDef = {
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
    expect(result.children.child["0"].selectors.answer()).toEqual(42);
    expect(result.selectors).toEqual({});
    expect(result.children.child["0"].children).toEqual({});
  });
});
