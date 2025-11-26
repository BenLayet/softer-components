import { ChildrenNodes, State } from "@softer-components/types";
import { ChildrenPaths, ComponentPath, GlobalState } from "./utils.type";

/**
 * StateManager interface - all methods receive state as parameter
 */
export interface StateManager {
  /**
   * Read state at the given path
   */
  readState(globalState: GlobalState, path: ComponentPath): State;

  /**
   * Update state at the given path
   */
  updateState(
    globalState: GlobalState,
    path: ComponentPath,
    state: State
  ): void;

  /**
   * Create state at the given path (path must not exist, parent must exist)
   */
  createState(
    globalState: GlobalState,
    path: ComponentPath,
    state: State
  ): void;

  /**
   * Remove entire state tree at the given path
   */
  removeStateTree(globalState: GlobalState, path: ComponentPath): void;

  /**
   * Get children nodes structure at the given path
   */
  getChildrenNodes(
    globalState: GlobalState,
    path: ComponentPath
  ): ChildrenNodes;

  /**
   * Get children paths at the given path
   */
  getChildrenPaths(
    globalState: GlobalState,
    path: ComponentPath
  ): ChildrenPaths;

  /**
   * Select a value using a memoized selector
   */
  selectValue<T>(
    globalState: GlobalState,
    path: ComponentPath,
    selectorName: string,
    selector: (state: State) => T
  ): T;
}
