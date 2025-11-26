import { ChildrenNodes, State } from "@softer-components/types";
import { ChildrenPaths, ComponentPath, SofterRootState } from "./utils.type";

/**
 * StateManager interface - all methods receive state as parameter
 */
export interface StateManager {
  /**
   * Read state at the given path
   */
  readState(softerRootState: SofterRootState, path: ComponentPath): State;

  /**
   * Update state at the given path
   */
  updateState(
    softerRootState: SofterRootState,
    path: ComponentPath,
    state: State
  ): void;

  /**
   * Create state at the given path (path must not exist, parent must exist)
   */
  createState(
    softerRootState: SofterRootState,
    path: ComponentPath,
    state: State
  ): void;

  /**
   * Remove entire state tree at the given path
   */
  removeStateTree(softerRootState: SofterRootState, path: ComponentPath): void;

  /**
   * Create empty collection child at the given path
   */
  createEmptyCollectionChild(
    softerRootState: SofterRootState,
    parentPath: ComponentPath,
    childName: string
  ): void;

  /**
   * Get children nodes structure at the given path
   */
  getChildrenNodes(
    softerRootState: SofterRootState,
    path: ComponentPath
  ): ChildrenNodes;

  /**
   * Get children paths at the given path
   */
  getChildrenPaths(
    softerRootState: SofterRootState,
    path: ComponentPath
  ): ChildrenPaths;

  /**
   * Select a value using a memoized selector
   */
  selectValue<T>(
    softerRootState: SofterRootState,
    path: ComponentPath,
    selectorName: string,
    selector: (state: State) => T
  ): T;
}
