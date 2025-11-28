import { ChildrenNodes, State } from "@softer-components/types";
import { ComponentPath, SofterRootState } from "./utils.type";

/**
 * StateReader - all methods receive state as a parameter
 */
export interface StateReader {
  /**
   * Read state at the given path
   */
  readState(softerRootState: SofterRootState, path: ComponentPath): State;

  /**
   * Get children nodes structure at the given path
   */
  getChildrenNodes(
    softerRootState: SofterRootState,
    path: ComponentPath,
  ): ChildrenNodes;

  /**
   * Select a value using a memoized selector
   */
  selectValue<T>(
    softerRootState: SofterRootState,
    path: ComponentPath,
    selectorName: string,
    selector: (state: State) => T,
  ): T;
}

/**
 * StateWriter - all methods receive state as a parameter and can modify it.
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
   * Create an empty collection child at the given path
   */
  createEmptyCollectionChild(
    softerRootState: SofterRootState,
    parentPath: ComponentPath,
    childName: string,
  ): void;

  /**
   * Remove the entire state at the given path
   */
  removeStateTree(softerRootState: SofterRootState, path: ComponentPath): void;

  setRemoveStateTreeListener(listener: (path: ComponentPath) => void): void;
}

export interface StateManager extends StateReader, StateWriter {}
