import { ComponentDef } from "@softer-components/types";
import { describe, expect, it, vi } from "vitest";

import { RelativePathStateReader } from "../state/relative-path-state-manager";
import { createValueProviders } from "./value-providers";

describe("createValuesProvider", () => {
  it("returns root values provider", () => {
    //GIVEN
    const initialState = { answer: 42 };
    type TestContract = { values: { answer: number } };
    const rootDef: ComponentDef<TestContract, typeof initialState> = {
      initialState,
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
    const result = createValueProviders<typeof rootDef>(
      rootDef,
      mockStateReader,
    );

    //THEN
    expect(result.values.answer()).toEqual(42);
    expect(result.childrenValues).toEqual({});
  });
  it("returns a single child values provider", () => {
    //GIVEN
    const initialState = { answer: 42 };
    type ChildContract = { values: { answer: number } };
    const childDef: ComponentDef<ChildContract, typeof initialState> = {
      initialState,
      selectors: {
        answer: (state: { answer: number }) => state.answer,
      },
    };
    type RootContract = { children: { child: ChildContract } };
    const rootDef: ComponentDef<RootContract> = {
      childrenDefs: { child: childDef },
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
    expect(result.childrenValues.child.values.answer()).toEqual(42);
  });
});
