import { ChildrenNodes, State } from "@softer-components/types";
import { ComponentPath, StateManager } from "src/index";
import {
  createEmptyCollectionChildAtPath,
  createValueAtPath,
  findSubTree,
  getChildrenNodes,
  getValueAtPath,
  removeSubTree,
  Tree,
  updateValueAtPath,
} from "./tree";

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

  /**
   * Create an empty collection child at the given path
   */
  createEmptyCollectionChild(
    rootStateTree: Tree<State>,
    parentPath: ComponentPath,
    childName: string,
  ): void {
    createEmptyCollectionChildAtPath(rootStateTree, parentPath, childName);
  }

  removeStateTree(rootStateTree: Tree<State>, path: ComponentPath): void {
    removeSubTree(rootStateTree, path);
    this.removeStateTreeListener(path);
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

  getChildrenNodes(
    rootStateTree: Tree<State>,
    path: ComponentPath,
  ): ChildrenNodes {
    return getChildrenNodes(findSubTree(rootStateTree, path));
  }

  selectValue<T>(
    rootStateTree: Tree<State>,
    path: ComponentPath,
    _selectorName: string,
    selector: (state: State) => T,
  ): T {
    return selector(this.readState(rootStateTree, path));
  }
}
