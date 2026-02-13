/**
 * Tree structure and utilities to manipulate it.
 * State Managers could use these utilities to read/write states at specific paths or create their own structures.
 */
import { State } from "@softer-components/types";

import { normalizeContextPath } from "./path";
import {
  assertIsNotUndefined,
  isNotUndefined,
  isUndefined,
} from "./predicate.functions";

type ComponentName = string;
type ChildKey = string;
export type StatePathSegment = [ComponentName, ChildKey];
export type StatePath = StatePathSegment[];
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

const COMPONENT_SEPARATOR = "/";
const KEY_SEPARATOR = ":";
export const SINGLE_CHILD_KEY = "0";

/**
 * Converts a state path to a string representation that can be used in event names or as keys in maps.
 * @param statePath
 * @returns string representation of the state path, with component names separated with "/" and keys separated by ":". Starts with a "/" but does not end with a "/". For example: "/ComponentA:instance1/ComponentB/ComponentC:instance2"
 */
export function statePathToString(statePath: StatePath): string {
  return statePath
    .map(([componentName, instanceKey]) =>
      instanceKey
        ? `${COMPONENT_SEPARATOR}${componentName}${KEY_SEPARATOR}${instanceKey}`
        : `${COMPONENT_SEPARATOR}${componentName}`,
    )
    .join("");
}

/**
 * Converts a string representation of a state path back to a StatePath.
 * The string is typically in the format produced by statePathToString.
 * For example: "/ComponentA:instance1/ComponentB/ComponentC:instance2"
 * but ":0" can be omitted for single child components, so "/ComponentA/ComponentB/ComponentC" is also valid and will be parsed as if it were "/ComponentA:0/ComponentB:0/ComponentC:0"
 * @param statePathStr
 */
export function stringToStatePath(statePathStr: string): StatePath {
  const parts = statePathStr.split(COMPONENT_SEPARATOR);
  parts.shift(); // remove prefix
  return parts.map(part => {
    const [componentName, instanceKey] = part.split(KEY_SEPARATOR);
    return [componentName, instanceKey ?? SINGLE_CHILD_KEY] as const;
  });
}

/**
 * Computes a new state path by applying a relative path to a given state path.
 * @param statePath
 * @param relativePathString a string representation of a relative path, using "../" to go back up one level, "./" is ignored, and otherwise the same as statePathStr returned by componentPathToString.
 * @returns the new state path.
 */
export function computeRelativePath(
  statePath: StatePath,
  relativePathString: string,
): StatePath {
  const normalizedRelativePathString = normalizeContextPath(
    `${statePathToString(statePath)}/${relativePathString}`,
  );
  return stringToStatePath(normalizedRelativePathString);
}

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

export const getValueAtPath = (
  treeAtRootOfPath: StateTree,
  path: StatePath,
): State | undefined => {
  return findSubTree(treeAtRootOfPath, path)?.[OWN_VALUE_KEY];
};

export const updateValueAtPath = (
  treeAtRootOfPath: StateTree,
  path: StatePath,
  value: State,
) => {
  const subTree = findSubTree(treeAtRootOfPath, path);
  assertIsNotUndefined(subTree);
  subTree[OWN_VALUE_KEY] = value;
};

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

export const getChildrenKeys = (subTree: StateTree | undefined): ChildrenKeys =>
  Object.fromEntries(
    Object.entries(subTree?.[CHILDREN_BRANCHES_KEY] || {}).map(
      ([childName, childBranch]) => {
        return [childName, Object.keys(childBranch)];
      },
    ),
  ) as ChildrenKeys;

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
export type ChildrenKeys = Record<string, string[]>;

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
