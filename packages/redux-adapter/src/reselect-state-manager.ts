import { createSelector } from "@reduxjs/toolkit";
import { ChildrenNodes, State } from "@softer-components/types";
import {
  ChildrenPaths,
  ComponentPath,
  StateManager,
} from "@softer-components/utils";
import {
  createEmptyCollectionChildAtPath,
  createValueAtPath,
  findSubTree,
  getChildrenNodes,
  getValueAtPath,
  OWN_KEY,
  removeSubTree,
  Tree,
  updateValueAtPath,
} from "./tree";
import { componentPathToString } from "./softer-mappers";

// Selector structure for a component
type ComponentSelector = {
  stateTreeSelector: (rootStateTree: Tree<State>) => Tree<State>;
  childrenNodesSelector: (rootStateTree: Tree<State>) => ChildrenNodes;
  childrenPathsSelector: (rootStateTree: Tree<State>) => ChildrenPaths;
  ownStateSelector: (rootStateTree: Tree<State>) => State;
  valueSelectors: {
    [selectorName: string]: (rootStateTree: Tree<State>) => any;
  };
};

const createComponentSelector = (path: ComponentPath): ComponentSelector => {
  const stateTreeSelector = (rootStateTree: Tree<State>): Tree<State> =>
    findSubTree(rootStateTree, path);

  const ownStateSelector = createSelector(
    [stateTreeSelector],
    (stateTree: Tree<State>): State => stateTree?.[OWN_KEY]
  );

  const childrenNodesSelector = createSelector(
    [stateTreeSelector],
    (stateTree: Tree<State>): ChildrenNodes => getChildrenNodes(stateTree)
  );

  const childrenPathsSelector = createSelector(
    [childrenNodesSelector],
    (childrenNodes: ChildrenNodes): ChildrenPaths =>
      Object.fromEntries(
        Object.entries(childrenNodes).map(([childName, childNode]) => [
          childName,
          Array.isArray(childNode)
            ? childNode.map((key) =>
                componentPathToString([...path, [childName, key]])
              )
            : componentPathToString([...path, [childName]]),
        ])
      )
  );

  return {
    ownStateSelector,
    stateTreeSelector,
    childrenNodesSelector,
    childrenPathsSelector,
    valueSelectors: {},
  };
};

/**
 * Maintains a tree of memoized selectors with the same structure as the state tree.
 * State is passed through each method call - no internal state reference.
 */
export class ReselectStateManager implements StateManager {
  private readonly selectorsTree: Tree<ComponentSelector>;

  private selectorsAtPath = (path: ComponentPath): ComponentSelector =>
    getValueAtPath(this.selectorsTree, path);

  constructor() {
    this.selectorsTree = {
      [OWN_KEY]: createComponentSelector([]),
    };
  }

  createState(
    rootStateTree: Tree<State>,
    path: ComponentPath,
    state: State
  ): void {
    createValueAtPath(rootStateTree, path, state);
    createValueAtPath(this.selectorsTree, path, createComponentSelector(path));
  }

  /**
   * Create empty collection child at the given path
   */
  createEmptyCollectionChild(
    rootStateTree: Tree<State>,
    parentPath: ComponentPath,
    childName: string
  ): void {
    createEmptyCollectionChildAtPath(rootStateTree, parentPath, childName);
    createEmptyCollectionChildAtPath(this.selectorsTree, parentPath, childName);
  }

  removeStateTree(rootStateTree: Tree<State>, path: ComponentPath): void {
    removeSubTree(rootStateTree, path);
    removeSubTree(this.selectorsTree, path);
  }

  readState(rootStateTree: Tree<State>, path: ComponentPath): State {
    const selectors = this.selectorsAtPath(path);
    return selectors.ownStateSelector(rootStateTree);
  }

  updateState(
    rootStateTree: Tree<State>,
    path: ComponentPath,
    state: State
  ): void {
    updateValueAtPath(rootStateTree, path, state);
  }

  getChildrenNodes(
    rootStateTree: Tree<State>,
    path: ComponentPath
  ): ChildrenNodes {
    const selectors = this.selectorsAtPath(path);
    return selectors.childrenNodesSelector(rootStateTree);
  }

  getChildrenPaths(
    rootStateTree: Tree<State>,
    path: ComponentPath
  ): ChildrenPaths {
    const selectors = this.selectorsAtPath(path);
    return selectors.childrenPathsSelector(rootStateTree);
  }

  selectValue<T>(
    rootStateTree: Tree<State>,
    path: ComponentPath,
    selectorName: string,
    selector: (state: State) => T
  ): T {
    const valuesSelectors = getValueAtPath(
      this.selectorsTree,
      path
    ).valueSelectors;

    if (!valuesSelectors[selectorName]) {
      // Create and cache selector
      const memoizedSelector = createSelector(
        [getValueAtPath(this.selectorsTree, path).ownStateSelector],
        (ownState: State): T => {
          return selector(ownState);
        }
      );
      valuesSelectors[selectorName] = memoizedSelector;
    }

    const memoizedSelector = valuesSelectors[selectorName];
    return memoizedSelector(rootStateTree);
  }

  // Helper methods to get selectors (for React hooks)
  getStateSelector(path: ComponentPath) {
    return this.selectorsAtPath(path).ownStateSelector;
  }

  getChildrenNodesSelector(path: ComponentPath) {
    return this.selectorsAtPath(path).childrenNodesSelector;
  }

  getChildrenPathsSelector(path: ComponentPath) {
    return this.selectorsAtPath(path).childrenPathsSelector;
  }

  getValueSelector<T>(
    path: ComponentPath,
    selectorName: string,
    selector: (state: State) => T
  ) {
    const valuesSelectors = getValueAtPath(
      this.selectorsTree,
      path
    ).valueSelectors;

    if (!valuesSelectors[selectorName]) {
      const memoizedSelector = createSelector(
        [getValueAtPath(this.selectorsTree, path).ownStateSelector],
        (ownState: State): T => {
          return selector(ownState);
        }
      );
      valuesSelectors[selectorName] = memoizedSelector;
    }

    return valuesSelectors[selectorName];
  }
}
