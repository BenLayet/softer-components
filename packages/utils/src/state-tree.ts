/**
 * Tree structure and utilities to manipulate it.
 * State Managers could use these utilities to read/write states at specific paths or create their own structures.
 */
import { State } from "@softer-components/types";

import { ChildrenKeys, StatePath, statePathToString } from "./path";
import {
  assertIsNotUndefined,
  isNotUndefined,
  isUndefined,
} from "./predicate.functions";

// tree constants
export const CHILDREN_BRANCHES_KEY = "🪾";
export const OWN_VALUE_KEY = "🫒";
export function baseTree(t: State): StateTree {
  return { [OWN_VALUE_KEY]: t };
}

export type StateTree = {
  [OWN_VALUE_KEY]: State;
  // ----------------------------- child name --  key --- child tree
  [CHILDREN_BRANCHES_KEY]?: Record<string, Record<string, StateTree>>;
};

/**
 * @param treeAtRootOfPath
 * @param statePath
 * @returns sub-tree of the global tree for the component at the given path
 */
export const findSubTree = (
  treeAtRootOfPath: StateTree,
  statePath: StatePath,
): StateTree | undefined => {
  if (statePath.length === 0) {
    return treeAtRootOfPath;
  }
  assertIsNotUndefined(
    treeAtRootOfPath,
    `state sub tree at ${statePathToString(statePath)} should not be undefined`,
  );
  const childrenBranches = treeAtRootOfPath[CHILDREN_BRANCHES_KEY];
  if (isUndefined(childrenBranches)) {
    return undefined;
  }

  const pathSegment = statePath[0];
  assertIsNotUndefined(pathSegment);

  const [childName, key] = pathSegment;
  assertIsNotUndefined(childName);
  assertIsNotUndefined(key);

  const subTree = childrenBranches[childName][key];
  if (isUndefined(subTree)) {
    return undefined;
  }

  return findSubTree(subTree, statePath.slice(1));
};

/**
 * Removes the sub-tree of the global tree for the component at the given path.
 * Does nothing if the path does not exist. Cannot remove the root of the tree.
 * @param treeAtRootOfPath
 * @param statePath
 */
export const removeSubTree = (
  treeAtRootOfPath: StateTree,
  statePath: StatePath,
) => {
  if (statePath.length === 0) {
    throw new Error("Cannot remove the root of the tree");
  }
  const parentPath = statePath.slice(0, -1);
  const parentSubTree = findSubTree(treeAtRootOfPath, parentPath);
  assertIsNotUndefined(parentSubTree);

  const childrenBranches = parentSubTree[CHILDREN_BRANCHES_KEY];
  if (!childrenBranches) {
    return;
  }
  const [childName, key] = statePath[statePath.length - 1];
  assertIsNotUndefined(childName);
  assertIsNotUndefined(key);
  const childBranches = childrenBranches[childName];
  if (!childBranches) {
    return;
  }
  delete childBranches[key];
};

/**
 * Gets the value of the state at the given path. Returns undefined if the path does not exist.
 * @param treeAtRootOfPath
 * @param path
 */
export const getValueAtPath = (
  treeAtRootOfPath: StateTree,
  path: StatePath,
): State | undefined => {
  return findSubTree(treeAtRootOfPath, path)?.[OWN_VALUE_KEY];
};

/**
 * Updates the value of the state at the given path. Throws if the path does not exist.
 * @param treeAtRootOfPath
 * @param path
 * @param value
 */
export const updateValueAtPath = (
  treeAtRootOfPath: StateTree,
  path: StatePath,
  value: State,
) => {
  const subTree = findSubTree(treeAtRootOfPath, path);
  assertIsNotUndefined(subTree);
  subTree[OWN_VALUE_KEY] = value;
};

/**
 * Creates a new value at the given path.
 * Throws if the path already exists or if the parent path does not exist.
 * @param treeAtRootOfPath
 * @param path
 * @param value
 */
export const createValueAtPath = (
  treeAtRootOfPath: StateTree,
  path: StatePath,
  value: State,
): void => {
  if (path.length === 0) {
    throw new Error(
      `Cannot create a value at the root of the tree. Value = '${value}'`,
    );
  }
  //parse child name and key
  const pathSegment = path[path.length - 1];
  assertIsNotUndefined(pathSegment);
  const [childName, key] = pathSegment;
  assertIsNotUndefined(childName);
  assertIsNotUndefined(key);

  // this throws if the parent does not exist
  const childBranches = initializeChildBranches(
    treeAtRootOfPath,
    path.slice(0, -1),
    childName,
  );
  if (isNotUndefined(childBranches[key])) {
    throw new Error(
      `A child with name '${childName}' and key '${key}' already exists.`,
    );
  }
  // initialize instance
  childBranches[key] = { [OWN_VALUE_KEY]: value };
};

/**
 * gets the children keys for a child component name.
 * Returns an empty object if there are no children branches.
 * @param subTree
 */
export const getChildrenKeys = (subTree: StateTree | undefined): ChildrenKeys =>
  Object.fromEntries(
    Object.entries(subTree?.[CHILDREN_BRANCHES_KEY] || {}).map(
      ([childName, childBranch]) => {
        return [childName, Object.keys(childBranch)];
      },
    ),
  ) as ChildrenKeys;

/**
 * Initializes the children branches for a child component name at the given path.
 * Throws if the parent path does not exist.
 * Returns the children branches for the child component name.
 * @param treeAtRootOfPath
 * @param parentPath
 * @param childName
 */
export const initializeChildBranches = (
  treeAtRootOfPath: StateTree,
  parentPath: StatePath,
  childName: string,
) => {
  const parentSubTree = findSubTree(treeAtRootOfPath, parentPath);
  assertIsNotUndefined(parentSubTree);
  if (!parentSubTree[CHILDREN_BRANCHES_KEY]) {
    parentSubTree[CHILDREN_BRANCHES_KEY] = {};
  }
  const childrenBranches = parentSubTree[CHILDREN_BRANCHES_KEY];
  if (!childrenBranches[childName]) {
    childrenBranches[childName] = {};
  }
  return childrenBranches[childName];
};

/**
 * Reorders the children branches for a child component name at the given path according to the desired keys order.
 * @param treeAtRootOfPath
 * @param childName
 * @param desiredKeys
 */
export const reorderChildStates = (
  treeAtRootOfPath: StateTree,
  childName: string,
  desiredKeys: string[],
): void => {
  const childrenBranches = treeAtRootOfPath[CHILDREN_BRANCHES_KEY]?.[childName];
  assertIsNotUndefined(childrenBranches);
  const originalChildrenBranches = { ...childrenBranches };
  for (const key of desiredKeys) {
    const keyStr = String(key);
    const childBranch = originalChildrenBranches[keyStr];
    assertIsNotUndefined(
      childBranch,
      `Cannot reorder child states for child ${childName} because key ${keyStr} does not exist`,
    );
    childrenBranches[keyStr] = childBranch;
  }
};
