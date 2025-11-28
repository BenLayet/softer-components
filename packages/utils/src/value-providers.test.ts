import { describe, it, expect, vi } from "vitest";
import { createValueProviders } from "./value-providers";
import { RelativePathStateManager } from "./relative-path-state-manager";

describe("createValuesProvider", () => {
  it("returns root selectors", () => {
    //GIVEN
    const root = {
      selectors: {
        answer: (state: { answer: number }) => state.answer,
      },
    };
    const mockStateManager = {} as RelativePathStateManager;
    mockStateManager.getChildrenNodes = vi.fn().mockReturnValue({});
    mockStateManager.selectValue = vi.fn().mockReturnValue(42);

    //WHEN
    const result = createValueProviders({}, root, mockStateManager);

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
    const mockStateManager = {} as RelativePathStateManager;
    const mockChildStateManager = {} as RelativePathStateManager;
    mockStateManager.getChildrenNodes = vi
      .fn()
      .mockReturnValue({ child: true });
    mockStateManager.childStateManager = vi
      .fn()
      .mockReturnValue(mockChildStateManager);
    mockChildStateManager.getChildrenNodes = vi.fn().mockReturnValue({});
    mockChildStateManager.selectValue = vi.fn().mockReturnValue(42);

    //WHEN
    const result = createValueProviders({}, root, mockStateManager);

    //THEN
    expect(result.children.child.values.answer()).toEqual(42);
    expect(result.values).toEqual({});
    expect(result.children.child.children).toEqual({});
  });
});
