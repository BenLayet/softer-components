import { ChildrenValues, Selector, State } from "@softer-components/types";

import { assertIsNotUndefined } from "./predicate.functions";
import { StateManager } from "./state-manager";
import { StatePath, statePathToString } from "./state-tree";
import {
  ChildrenKeys,
  StateTree,
  createValueAtPath,
  findSubTree,
  getChildrenKeys,
  getValueAtPath,
  initializeChildBranches,
  removeSubTree,
  reorderChildStates,
  updateValueAtPath,
} from "./state-tree";

/**
 * Manages a state tree.
 * State is passed through each method call - no internal state reference.
 */
export class TreeStateManager implements StateManager {
  private removeStateTreeListener: (path: StatePath) => void = () => {};
  setRemoveStateTreeListener(listener: (path: StatePath) => void): void {
    this.removeStateTreeListener = listener;
  }

  createState(rootStateTree: StateTree, path: StatePath, state: State): void {
    createValueAtPath(rootStateTree, path, state);
  }

  initializeChildBranches(
    rootStateTree: StateTree,
    parentPath: StatePath,
    childName: string,
  ): void {
    initializeChildBranches(rootStateTree, parentPath, childName);
  }

  removeStateTree(rootStateTree: StateTree, path: StatePath): void {
    removeSubTree(rootStateTree, path);
    this.removeStateTreeListener(path);
  }

  reorderChildStates(
    rootStateTree: StateTree,
    parentPath: StatePath,
    childName: string,
    desiredKeys: string[],
  ): void {
    const treeAtPath = findSubTree(rootStateTree, parentPath);
    assertIsNotUndefined(
      treeAtPath,
      `Cannot reorder child states at path ${statePathToString(
        parentPath,
      )} as it does not exist`,
    );
    reorderChildStates(treeAtPath, childName, desiredKeys);
  }

  readState(rootStateTree: StateTree, path: StatePath): State {
    return getValueAtPath(rootStateTree, path);
  }

  updateState(rootStateTree: StateTree, path: StatePath, state: State): void {
    try {
      updateValueAtPath(rootStateTree, path, state);
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  getChildrenKeys(rootStateTree: StateTree, path: StatePath): ChildrenKeys {
    return getChildrenKeys(findSubTree(rootStateTree, path));
  }

  selectValue<T>(
    rootStateTree: StateTree,
    path: StatePath,
    selector: Selector<State>,
    children: ChildrenValues,
  ): T {
    return selector(this.readState(rootStateTree, path), children);
  }
}
