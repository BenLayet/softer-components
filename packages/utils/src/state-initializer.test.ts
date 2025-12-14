import { ComponentDef } from "@softer-components/types";
import { describe, expect, it, vi } from "vitest";

import { initializeRootState } from "./state-initializer";
import { StateManager } from "./state-manager";

describe("state tests with mocks", () => {
  it("should create initial state for component with no constructor", () => {
    // GIVEN a simple component definition with initial state
    const rootDef = {};
    const stateManager = {} as StateManager;
    stateManager.updateState = vi.fn();
    stateManager.readState = vi.fn();

    // WHEN creating an initial state
    initializeRootState({}, rootDef, stateManager);

    // THEN verify no methods were called
    expect(stateManager.updateState).toHaveBeenCalledWith(
      {},
      [], // path
      undefined, // state
    );
    expect(stateManager.readState).not.toHaveBeenCalled();
  });

  it("should create initial state for simple component", () => {
    // GIVEN a simple component
    const rootDef: ComponentDef = {
      initialState: { level: 1 },
    };
    const stateManager = {} as StateManager;
    stateManager.updateState = vi.fn();
    stateManager.updateState = vi.fn();

    // WHEN creating an initial state
    initializeRootState({}, rootDef, stateManager);

    // THEN verify writeState was called with correct arguments
    expect(stateManager.updateState).toHaveBeenCalledTimes(1);
    expect(stateManager.updateState).toHaveBeenCalledWith(
      {},
      [], // path
      { level: 1 }, // state
    );
  });

  it("should create state for component with 1 child", () => {
    // GIVEN a component with child components
    const child: ComponentDef = {
      initialState: { level: 2 },
    };

    const rootDef: ComponentDef = {
      initialState: { level: 1 },
      childrenComponents: { child },
    };
    const stateManager = {} as StateManager;
    stateManager.updateState = vi.fn();
    stateManager.createState = vi.fn();
    stateManager.readState = vi.fn();
    stateManager.initializeChildBranches = vi.fn();

    // WHEN creating an initial state
    initializeRootState({}, rootDef, stateManager);

    // THEN
    expect(stateManager.updateState).toHaveBeenCalledTimes(1);
    expect(stateManager.updateState).toHaveBeenCalledWith(
      {},
      [], // path
      { level: 1 }, // state
    );

    expect(stateManager.initializeChildBranches).toHaveBeenCalledTimes(1);
    expect(stateManager.initializeChildBranches).toHaveBeenCalledWith(
      {},
      [], // path
      "child",
    );
    expect(stateManager.createState).toHaveBeenCalledTimes(1);
    expect(stateManager.createState).toHaveBeenCalledWith(
      {},
      [["child", "0"]], // path to child
      {
        level: 2,
      },
    );
  });
});
