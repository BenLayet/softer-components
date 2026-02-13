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
    const mockStateReader = {
      currentPath: [],
    } as {} as RelativePathStateReader;
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
    const mockStateReader = {
      currentPath: [],
    } as {} as RelativePathStateReader;
    const mockChildStateReader = {
      currentPath: [["child", "0"]],
    } as {} as RelativePathStateReader;
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
  });
  it("returns a contexts values provider", () => {
    //GIVEN
    const context1Def: ComponentDef = {
      selectors: {
        answer: (state: { answer: number }) => state.answer,
      },
    };
    const childDef: ComponentDef = {
      contextDefs: { context1: "/context1" },
    };
    const rootDef: ComponentDef = {
      childrenComponentDefs: { child: childDef, context1: context1Def },
    };
    const mockChildStateReader = {
      currentPath: [["child", "0"]],
    } as {} as RelativePathStateReader;
    const mockContext1StateReader = {
      currentPath: [["context1", "0"]],
    } as {} as RelativePathStateReader;
    mockChildStateReader.getChildrenKeys = vi.fn().mockReturnValue({});
    mockChildStateReader.forRelativePath = vi
      .fn()
      .mockReturnValue(mockContext1StateReader);
    mockContext1StateReader.getChildrenKeys = vi.fn().mockReturnValue({});
    mockContext1StateReader.selectValue = vi.fn().mockReturnValue(42);

    //WHEN
    //creating child values
    const result = createValueProviders(rootDef, mockChildStateReader);

    //THEN
    expect((result.contextsValues.context1?.values as any).answer()).toEqual(
      42,
    );
  });
});
