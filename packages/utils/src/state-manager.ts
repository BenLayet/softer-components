import { ChildrenKeys, ChildrenValues, State } from "@softer-components/types";
import { ComponentPath, SofterRootState } from "./utils.type";

/**
 * StateReader
 *
 * All methods receive state as a parameter and extract information from it.
 */
export interface StateReader {
  /**
   * Read state at the given path
   */
  readState(softerRootState: SofterRootState, path: ComponentPath): State;

  /**
   * Get all children's keys at the given path
   */
  getChildrenKeys(
    softerRootState: SofterRootState,
    path: ComponentPath,
  ): ChildrenKeys;

  /**
   * Select a value from the state at the given path
   */
  selectValue<T>(
    softerRootState: SofterRootState,
    path: ComponentPath,
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
    path: ComponentPath,
    state: State,
  ): void;

  /**
   * Create the state at the given path (the path must not exist, parent must exist)
   */
  createState(
    softerRootState: SofterRootState,
    path: ComponentPath,
    state: State,
  ): void;

  /**
   * Create an empty child at the given path
   */
  initializeChildBranches(
    softerRootState: SofterRootState,
    parentPath: ComponentPath,
    childName: string,
  ): void;

  /**
   * Remove the entire state at the given path
   */
  removeStateTree(softerRootState: SofterRootState, path: ComponentPath): void;

  /**
   * Sets a listener to be notified with the specific path when a state tree is removed.
   * @param listener
   */
  setRemoveStateTreeListener(listener: (path: ComponentPath) => void): void;
}

export interface StateManager extends StateReader, StateWriter {}
