import { ComponentDef } from "@softer-components/types";
import { describe, expect, it, vi } from "vitest";
import { initializeRootState } from "./state-initializer";
import { StateManager } from "./state-manager";

describe("state tests with mocks", () => {
  it("should create initial state tree for component with no constructor", () => {
    // GIVEN a simple component definition with initial state
    const rootDef = {};
    const stateManager = {} as StateManager;
    stateManager.writeState = vi.fn();
    stateManager.readState = vi.fn();

    // WHEN creating initial state tree
    initializeRootState(rootDef, stateManager);

    // THEN verify no methods were called
    expect(stateManager.writeState).toHaveBeenCalledWith(
      [], // path
      undefined // state
    );
    expect(stateManager.readState).not.toHaveBeenCalled();
  });

  it("should create initial state tree for simple component", () => {
    // GIVEN a simple component
    const rootDef: ComponentDef = {
      initialState: { level: 1 },
    };
    const stateManager = {} as StateManager;
    stateManager.writeState = vi.fn();

    // WHEN creating initial state tree
    initializeRootState(rootDef, stateManager);

    // THEN verify writeState was called with correct arguments
    expect(stateManager.writeState).toHaveBeenCalledTimes(1);
    expect(stateManager.writeState).toHaveBeenCalledWith(
      [], // path
      { level: 1 } // state
    );
  });

  it("should create state tree for component with 1 child", () => {
    // GIVEN a component with child components
    const childDef: ComponentDef = {
      initialState: { level: 2 },
    };

    const rootDef: ComponentDef = {
      initialState: { level: 1 },
      childrenComponents: { child: childDef },
    };
    const stateManager = {} as StateManager;
    stateManager.writeState = vi.fn();
    stateManager.readState = vi.fn();

    // WHEN creating initial state tree
    initializeRootState(rootDef, stateManager);

    // THEN verify writeState was called for parent and child
    expect(stateManager.writeState).toHaveBeenCalledTimes(2);

    // Verify first call (parent)
    expect(stateManager.writeState).toHaveBeenNthCalledWith(1, [], {
      level: 1,
    });

    // Verify second call (child)
    expect(stateManager.writeState).toHaveBeenNthCalledWith(
      2,
      [["child", undefined]], // path to child
      {
        level: 2,
      }
    );
  });
});
