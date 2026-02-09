import { ChildrenValues, State } from "@softer-components/types";

import { SofterRootState } from "./state-initializer";
import { ChildrenKeys, StatePath } from "./state-tree";

/**
 * StateReader
 *
 * All methods receive state as a parameter and extract information from it.
 */
export interface StateReader {
  /**
   * Read state at the given path
   */
  readState(softerRootState: SofterRootState, path: StatePath): State;

  /**
   * Get all children's keys at the given path
   */
  getChildrenKeys(
    softerRootState: SofterRootState,
    path: StatePath,
  ): ChildrenKeys;

  /**
   * Select a value from the state at the given path
   */
  selectValue<T>(
    softerRootState: SofterRootState,
    path: StatePath,
    selector: (state: State) => T,
    children: ChildrenValues,
  ): T;
}

/**
 * StateWriter
 *
 * All methods receive state as a parameter and modify it.
 */
export interface StateWriter {
  /**
   * Update state at the given path
   */
  updateState(
    softerRootState: SofterRootState,
    path: StatePath,
    state: State,
  ): void;

  /**
   * Create the state at the given path (the path must not exist, parent must exist)
   */
  createState(
    softerRootState: SofterRootState,
    path: StatePath,
    state: State,
  ): void;

  /**
   * Create an empty child at the given path
   */
  initializeChildBranches(
    softerRootState: SofterRootState,
    parentPath: StatePath,
    childName: string,
  ): void;

  /**
   * Remove the entire state at the given path
   */
  removeStateTree(softerRootState: SofterRootState, path: StatePath): void;

  /**
   * Reorder child states at the given path
   */
  reorderChildStates(
    softerRootState: SofterRootState,
    currentPath: StatePath,
    childName: string,
    desiredKeys: string[],
  ): void;

  /**
   * Sets a listener to be notified with the specific path when a state tree is removed.
   * @param listener
   */
  setRemoveStateTreeListener(listener: (path: StatePath) => void): void;
}

export interface StateManager extends StateReader, StateWriter {}
