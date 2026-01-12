import { ChildrenValues, Selector, State } from "@softer-components/types";

import { componentPathToString } from "./component-path";
import { assertIsNotUndefined } from "./predicate.functions";
import { StateManager } from "./state-manager";
import {
  ChildrenKeys,
  Tree,
  createValueAtPath,
  findSubTree,
  getChildrenKeys,
  getValueAtPath,
  initializeChildBranches,
  removeSubTree,
  reorderChildStates,
  updateValueAtPath,
} from "./tree";
import { ComponentPath } from "./utils.type";

/**
 * Manages a state tree.
 * State is passed through each method call - no internal state reference.
 */
export class TreeStateManager implements StateManager {
  private removeStateTreeListener: (path: ComponentPath) => void = () => {};
  setRemoveStateTreeListener(listener: (path: ComponentPath) => void): void {
    this.removeStateTreeListener = listener;
  }

  createState(
    rootStateTree: Tree<State>,
    path: ComponentPath,
    state: State,
  ): void {
    createValueAtPath(rootStateTree, path, state);
  }

  initializeChildBranches(
    rootStateTree: Tree<State>,
    parentPath: ComponentPath,
    childName: string,
  ): void {
    initializeChildBranches(rootStateTree, parentPath, childName);
  }

  removeStateTree(rootStateTree: Tree<State>, path: ComponentPath): void {
    removeSubTree(rootStateTree, path);
    this.removeStateTreeListener(path);
  }

  reorderChildStates(
    rootStateTree: Tree<State>,
    parentPath: ComponentPath,
    childName: string,
    desiredKeys: string[],
  ): void {
    const treeAtPath = findSubTree(rootStateTree, parentPath);
    assertIsNotUndefined(
      treeAtPath,
      `Cannot reorder child states at path ${componentPathToString(
        parentPath,
      )} as it does not exist`,
    );
    reorderChildStates(treeAtPath, childName, desiredKeys);
  }

  readState(rootStateTree: Tree<State>, path: ComponentPath): State {
    return getValueAtPath(rootStateTree, path);
  }

  updateState(
    rootStateTree: Tree<State>,
    path: ComponentPath,
    state: State,
  ): void {
    try {
      updateValueAtPath(rootStateTree, path, state);
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  getChildrenKeys(
    rootStateTree: Tree<State>,
    path: ComponentPath,
  ): ChildrenKeys {
    return getChildrenKeys(findSubTree(rootStateTree, path));
  }

  selectValue<T>(
    rootStateTree: Tree<State>,
    path: ComponentPath,
    selector: Selector<State>,
    children: ChildrenValues,
  ): T {
    return selector(this.readState(rootStateTree, path), children);
  }
}
