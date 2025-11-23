/**
 * State tree structure and utilities to manipulate it.
 * State Managers could use these utilities to read/write states at specific paths, or create their own structures.
 */
import { ChildrenNodes, State } from "@softer-components/types";
import { assertIsNotUndefined, isUndefined } from "./predicate.functions";
import { ComponentPath } from "./utils.type";

export const OWN_STATE_KEY = "@";
export const CHILDREN_BRANCHES_KEY = "#";
export type SingleChildBranch = StateTree;
export type CollectionChildBranches = Record<string, SingleChildBranch>;
export type ChildrenBranches = Record<
  string,
  SingleChildBranch | CollectionChildBranches
>;

export type StateTree = {
  [OWN_STATE_KEY]?: State;
  [CHILDREN_BRANCHES_KEY]?: ChildrenBranches;
};
/**
 * @param globalState
 * @param componentPath
 * @returns sub-state tree of the global state for the component at the given path
 */
export const findSubStateTree = (
  globalState: StateTree,
  componentPath: ComponentPath
): StateTree => {
  if (componentPath.length === 0) {
    return globalState;
  }
  const pathSegment = componentPath[0];
  assertIsNotUndefined(pathSegment);

  const childName = pathSegment[0];
  assertIsNotUndefined(childName);

  const key = pathSegment[1];
  const childrenBranches = globalState[CHILDREN_BRANCHES_KEY];
  assertIsNotUndefined(childrenBranches);

  const subTree = isUndefined(key)
    ? childrenBranches[childName]
    : childrenBranches[childName][key];
  assertIsNotUndefined(subTree);

  return findSubStateTree(subTree, componentPath.slice(1));
};

export const removeSubStateTree = (
  globalState: StateTree,
  componentPath: ComponentPath
) => {
  if (componentPath.length === 0) {
    // Clear the whole state tree
    Object.keys(globalState).forEach((key) => delete globalState[key]);
    return;
  }
  const parentPath = componentPath.slice(0, -1);
  const lastSegment = componentPath[componentPath.length - 1];
  const parentSubTree = findSubStateTree(globalState, parentPath);
  const childrenBranches = parentSubTree[CHILDREN_BRANCHES_KEY];
  if (!childrenBranches) {
    return;
  }
  const childName = lastSegment[0];
  const key = lastSegment[1];
  if (!isUndefined(key)) {
    const collectionChildState = childrenBranches[childName];
    if (collectionChildState && typeof collectionChildState === "object") {
      delete collectionChildState[key];
    }
    // If the collection is now empty, remove it
    if (
      collectionChildState &&
      Object.keys(collectionChildState).length === 0
    ) {
      delete childrenBranches[childName];
    }
    return;
  }
  // Single child case
  delete childrenBranches[childName];
  // If no more children, remove the children state
  if (Object.keys(childrenBranches).length === 0) {
    delete parentSubTree[CHILDREN_BRANCHES_KEY];
  }
};

export function readState(
  globalState: StateTree,
  componentPath: ComponentPath
) {
  return findSubStateTree(globalState, componentPath)[OWN_STATE_KEY] || {};
}
export function writeState(
  globalState: StateTree,
  componentPath: ComponentPath,
  state: State
) {
  if (!doesSubStateExist(globalState, componentPath)) {
    createState(globalState, componentPath);
  }
  findSubStateTree(globalState, componentPath)[OWN_STATE_KEY] = state;
}
export const doesSubStateExist = (
  globalState: StateTree,
  componentPath: ComponentPath
): boolean => {
  if (componentPath.length === 0) {
    return true;
  }
  const pathSegment = componentPath[0];
  assertIsNotUndefined(pathSegment);

  const childName = pathSegment[0];
  assertIsNotUndefined(childName);

  const key = pathSegment[1];
  const childrenBranches = globalState[CHILDREN_BRANCHES_KEY];
  if (isUndefined(childrenBranches)) {
    return false;
  }

  const subTree = isUndefined(key)
    ? childrenBranches[childName]
    : childrenBranches[childName][key];
  if (isUndefined(subTree)) {
    return false;
  }

  return doesSubStateExist(subTree, componentPath.slice(1));
};

export const createState = (
  stateTree: StateTree,
  componentPath: ComponentPath
): void => {
  if (componentPath.length === 0) {
    return;
  }
  const pathSegment = componentPath[0];
  assertIsNotUndefined(pathSegment);

  const childName = pathSegment[0];
  assertIsNotUndefined(childName);

  const key = pathSegment[1];
  let childrenBranches = stateTree[CHILDREN_BRANCHES_KEY];
  if (isUndefined(childrenBranches)) {
    stateTree[CHILDREN_BRANCHES_KEY] = {};
    childrenBranches = stateTree[CHILDREN_BRANCHES_KEY];
  }
  if (isUndefined(childrenBranches[childName])) {
    childrenBranches[childName] = {};
  }

  if (!isUndefined(key)) {
    if (isUndefined(childrenBranches[childName][key])) {
      if (key === OWN_STATE_KEY || key === CHILDREN_BRANCHES_KEY) {
        throw new Error(`Invalid key name: '${key}' is reserved.`);
      }
      childrenBranches[childName][key] = {};
    }
  }

  const subTree = isUndefined(key)
    ? childrenBranches[childName]
    : childrenBranches[childName][key];

  createState(subTree, componentPath.slice(1));
};

export const getChildrenNodes = (stateTree: StateTree): ChildrenNodes =>
  Object.fromEntries(
    Object.entries(stateTree[CHILDREN_BRANCHES_KEY] || {}).map(
      ([childName, childBranch]) => {
        return [
          childName,
          isBranchOfSingleChild(childBranch) ? true : Object.keys(childBranch),
        ];
      }
    )
  ) as ChildrenNodes;

const isBranchOfSingleChild = (
  branch: SingleChildBranch | CollectionChildBranches
): branch is SingleChildBranch =>
  Object.keys(branch).includes(OWN_STATE_KEY) ||
  Object.keys(branch).includes(CHILDREN_BRANCHES_KEY);

export function valueProvider<T>(
  stateTree: StateTree,
  componentPath: ComponentPath,
  selector: (state: State) => T
): () => T {
  return () => {
    const subStateTree = findSubStateTree(stateTree, componentPath);
    const ownState = subStateTree[OWN_STATE_KEY] || {};
    return selector(ownState);
  };
}
