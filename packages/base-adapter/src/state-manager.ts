import {
  ChildrenValues,
  ContextsValues,
  State,
} from "@softer-components/types";

import { ChildrenKeys, StatePath } from "./path";
import { SofterRootState } from "./state-initializer";

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
    childrenValues: ChildrenValues,
    contextsValues: ContextsValues,
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

  addStateTreeListener(listener: StateTreeListener): void;
}

export interface StateManager extends StateReader, StateWriter {}

export interface StateTreeListener {
  /**
   * Called when a new state is added at the given path.
   * Note that this is called for every node in the new subtree,
   * starting from the root of the subtree and going down to the leaves.
   * @param statePath
   */
  onStateAdded?: (statePath: StatePath) => void;

  /**
   * Called when a state is removed at the given path.
   * Note that this is NOT called for every node in the removed subtree,
   * just for the root of the removed subtree.
   * @param statePath
   */
  onStateRemoved?: (statePath: StatePath) => void;
}
