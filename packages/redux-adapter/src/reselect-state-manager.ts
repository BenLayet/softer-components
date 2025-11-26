import { createSelector } from "@reduxjs/toolkit";
import { ChildrenNodes, State } from "@softer-components/types";
import {
  ChildrenPaths,
  ComponentPath,
  StateManager,
} from "@softer-components/utils";
import {
  createValueAtPath,
  findSubTree,
  getChildrenNodes,
  getValueAtPath,
  OWN_KEY,
  removeSubTree,
  Tree,
} from "./tree";
import { componentPathToString } from "./softer-mappers";

export const SOFTER_PREFIX = "☁️";
// same structure as StateTree, but for selectors instead of states
// maintained by ReselectStateManager
type ComponentSelector = {
  stateTreeSelector: (state: any) => Tree<State>;
  childrenNodesSelector: (state: any) => ChildrenNodes;
  childrenPathsSelector: (state: any) => ChildrenPaths;
  ownStateSelector: (state: any) => State;
  valueSelectors: { [selectorName: string]: (state: any) => any };
};
const createComponentSelector = (path: ComponentPath): ComponentSelector => {
  const stateTreeSelector = (rootState: Tree<State>): Tree<State> =>
    findSubTree(rootState, path);

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
 * Keeps a mutable tree of the state, updates outside softer-component flow are not allowed.
 *
 *
 * Also maintains a tree of the selectors with the same structure as the state tree
 * Selectors are memoized using Reselect, so selectValue and getChildrenNodes are efficient.
 */
export class ReselectStateManager implements StateManager {
  private readonly selectorsTree: Tree<ComponentSelector>;
  private selectorsAtPath = (path: ComponentPath): ComponentSelector =>
    getValueAtPath(this.selectorsTree, path);
  private stateTreeAtPath = (path: ComponentPath): Tree<State> =>
    this.selectorsAtPath(path).stateTreeSelector(this.rootState);
  private ownStateAtPath = (path: ComponentPath): State =>
    this.selectorsAtPath(path).ownStateSelector(this.rootState);
  private childrenNodesAtPath = (path: ComponentPath): ChildrenNodes =>
    this.selectorsAtPath(path).childrenNodesSelector(this.rootState);
  private childrenPathsAtPath = (path: ComponentPath): ChildrenPaths =>
    this.selectorsAtPath(path).childrenPathsSelector(this.rootState);

  constructor(public rootState: Tree<State>) {
    this.selectorsTree = {
      [OWN_KEY]: createComponentSelector([]),
    };
  }

  readState(path: ComponentPath): State {
    return this.ownStateAtPath(path);
  }
  /**
   * @param state new state to overwrite at path
   */
  updateState(path: ComponentPath, state: State): void {
    this.stateTreeAtPath(path)[OWN_KEY] = state;
  }
  /**
   * @param path component path to create. It MUST NOT exist already. Parent MUST exist.
   * @param state new state to create at path
   */
  createState(path: ComponentPath, state: State): void {
    createValueAtPath(this.rootState, path, state);
    createValueAtPath(this.selectorsTree, path, createComponentSelector(path));
  }

  removeStateTree(path: ComponentPath): void {
    removeSubTree(this.rootState, path);
    removeSubTree(this.selectorsTree, path);
  }

  getChildrenNodes(path: ComponentPath): ChildrenNodes {
    return this.childrenNodesAtPath(path);
  }
  getChildrenPath(path: ComponentPath): ChildrenPaths {
    return this.childrenPathsAtPath(path);
  }

  selectValue<T>(
    path: ComponentPath,
    selectorName: string,
    selector: (state: State) => T
  ): T {
    const valuesSelectors = getValueAtPath(
      this.selectorsTree,
      path
    ).valueSelectors;
    if (!valuesSelectors[selectorName]) {
      // create and cache selector
      const memoizedSelector = createSelector(
        [getValueAtPath(this.selectorsTree, path).ownStateSelector],
        (ownState: State): T => {
          return selector(ownState);
        }
      );
      valuesSelectors[selectorName] = memoizedSelector;
    }
    const memoizedSelector = valuesSelectors[selectorName];
    return memoizedSelector(this.rootState);
  }
}
