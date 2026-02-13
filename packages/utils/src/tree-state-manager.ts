import {
  ChildrenValues,
  ContextsValues,
  State,
} from "@softer-components/types";

import { ChildrenKeys, StatePath, statePathToString } from "./path";
import { assertIsNotUndefined } from "./predicate.functions";
import { SofterRootState } from "./state-initializer";
import { StateManager, StateTreeListener } from "./state-manager";
import {
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

class CompositeStateTreeListener implements StateTreeListener {
  private listeners: StateTreeListener[] = [];
  addListener(listener: StateTreeListener): void {
    this.listeners.push(listener);
  }
  onStateAdded(statePath: StatePath): void {
    this.listeners.forEach(listener => listener.onStateAdded?.(statePath));
  }
  onStateRemoved(statePath: StatePath): void {
    this.listeners.forEach(listener => listener.onStateRemoved?.(statePath));
  }
}

/**
 * Manages a state tree.
 * State is passed through each method call - no internal state reference.
 */
export class TreeStateManager implements StateManager {
  private stateTreeListener = new CompositeStateTreeListener();
  addStateTreeListener(listener: StateTreeListener): void {
    this.stateTreeListener.addListener(listener);
  }
  createState(rootStateTree: StateTree, path: StatePath, state: State): void {
    createValueAtPath(rootStateTree, path, state);
    this.stateTreeListener.onStateAdded(path);
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
    this.stateTreeListener.onStateRemoved(path);
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

  readState(rootStateTree: SofterRootState, path: StatePath): State {
    return getValueAtPath(rootStateTree as StateTree, path);
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
    softerRootState: SofterRootState,
    path: StatePath,
    selector: (
      state: State,
      childrenValues: ChildrenValues,
      contextsValues: ContextsValues,
    ) => T,
    childrenValues: ChildrenValues,
    contextsValues: ContextsValues,
  ): T {
    return selector(
      this.readState(softerRootState, path),
      childrenValues,
      contextsValues,
    );
  }
}
