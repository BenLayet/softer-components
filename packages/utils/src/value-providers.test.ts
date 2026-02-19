import { ComponentDef, Values } from "@softer-components/types";
import { describe, expect, it, vi } from "vitest";

import { RelativePathStateReader } from "./relative-path-state-manager";
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
    const result = createValueProviders(
      rootDef,
      mockStateReader,
    ) as Values<TestContract>;

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
    const rootDef: ComponentDef<{ children: { child: ChildContract } }> = {
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
    expect(result.childrenValues.child.values.answer()).toEqual(42);
  });
  it("returns a contexts values provider", () => {
    //GIVEN
    type Context1State = { answer: number };
    type Context1Contract = { values: { answer: number } };
    const context1Def: ComponentDef<Context1Contract, Context1State> = {
      initialState: { answer: 42 },
      selectors: {
        answer: (state: { answer: number }) => state.answer,
      },
    };
    type Child1Contract = { context: { context1: Context1Contract } };
    const childDef: ComponentDef<Child1Contract> = {
      contextDefs: { context1: "../context1" },
    };
    const rootDef: ComponentDef<{
      children: { child1: Child1Contract; context1: Context1Contract };
    }> = {
      childrenComponentDefs: { child1: childDef, context1: context1Def },
    };
    const mockRootStateReader = {
      currentPath: [],
    } as {} as RelativePathStateReader;
    const mockChild1StateReader = {
      currentPath: [["child1", "0"]],
    } as {} as RelativePathStateReader;
    const mockContext1StateReader = {
      currentPath: [["context1", "0"]],
    } as {} as RelativePathStateReader;

    mockRootStateReader.getChildrenKeys = vi
      .fn()
      .mockReturnValue({ child1: ["0"], context1: ["0"] });
    mockRootStateReader.firstChildStateReader = vi
      .fn()
      .mockImplementation(childName =>
        childName === "child1"
          ? mockChild1StateReader
          : mockContext1StateReader,
      );

    mockChild1StateReader.getChildrenKeys = vi.fn().mockReturnValue({});
    mockChild1StateReader.forRelativePath = vi
      .fn()
      .mockReturnValue(mockContext1StateReader);
    mockContext1StateReader.getChildrenKeys = vi.fn().mockReturnValue({});
    mockContext1StateReader.selectValue = vi.fn().mockReturnValue(42);

    //WHEN
    const result = createValueProviders(rootDef, mockRootStateReader);

    //THEN
    expect(
      result.childrenValues.child1.contextsValues.context1.values.answer(),
    ).toEqual(42);
  });
});
