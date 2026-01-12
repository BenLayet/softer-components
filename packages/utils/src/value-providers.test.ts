import { ComponentDef } from "@softer-components/types";
import { describe, expect, it, vi } from "vitest";

import { RelativePathStateReader } from "./relative-path-state-manager";
import { createValueProviders } from "./value-providers";

describe("createValuesProvider", () => {
  it("returns root values provider", () => {
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
    expect(result.values.answer()).toEqual(42);
    expect(result.childrenValues).toEqual({});
  });
  it("returns a single child values provider", () => {
    //GIVEN
    const childDef: ComponentDef = {
      selectors: {
        answer: (state: { answer: number }) => state.answer,
      },
    };
    const rootDef: ComponentDef = {
      childrenComponentDefs: { child: childDef },
    };
    const mockStateReader = {} as RelativePathStateReader;
    const mockChildStateReader = {} as RelativePathStateReader;
    mockStateReader.getChildrenKeys = vi.fn().mockReturnValue({ child: ["0"] });
    mockStateReader.firstChildStateReader = vi
      .fn()
      .mockReturnValue(mockChildStateReader);
    mockChildStateReader.getChildrenKeys = vi.fn().mockReturnValue({});
    mockChildStateReader.selectValue = vi.fn().mockReturnValue(42);

    //WHEN
    const result = createValueProviders(rootDef, mockStateReader);

    //THEN
    expect((result.childrenValues.child?.values as any).answer()).toEqual(42);
    expect(result.values).toEqual({});
    expect(result.childrenValues.child?.childrenValues).toEqual({});
  });
});
