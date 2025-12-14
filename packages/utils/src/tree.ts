/**
 * Tree structure and utilities to manipulate it.
 * State Managers could use these utilities to read/write states at specific paths or create their own structures.
 */
import { ChildrenKeys } from "@softer-components/types";

import { componentPathToString } from "./component-path";
import {
  assertIsNotUndefined,
  isNotUndefined,
  isUndefined,
} from "./predicate.functions";
import { ComponentPath } from "./utils.type";

// tree constants
export const CHILDREN_BRANCHES_KEY = "🪾";
export const OWN_VALUE_KEY = "🫒";

export type Tree<T> = {
  [OWN_VALUE_KEY]: T;
  // ----------------------------- child name --  key --- child tree
  [CHILDREN_BRANCHES_KEY]?: Record<string, Record<string, Tree<T>>>;
};
/**
 * @param treeAtRootOfPath
 * @param componentPath
 * @returns sub-tree of the global tree for the component at the given path
 */
export const findSubTree = <T>(
  treeAtRootOfPath: Tree<T>,
  componentPath: ComponentPath,
): Tree<T> | undefined => {
  if (componentPath.length === 0) {
    return treeAtRootOfPath;
  }
  assertIsNotUndefined(
    treeAtRootOfPath,
    `state sub tree at ${componentPathToString(componentPath)} should not be undefined`,
  );
  const childrenBranches = treeAtRootOfPath[CHILDREN_BRANCHES_KEY];
  if (isUndefined(childrenBranches)) {
    return undefined;
  }

  const pathSegment = componentPath[0];
  assertIsNotUndefined(pathSegment);

  const [childName, key] = pathSegment;
  assertIsNotUndefined(childName);
  assertIsNotUndefined(key);

  const subTree = childrenBranches[childName][key];
  if (isUndefined(subTree)) {
    return undefined;
  }

  return findSubTree(subTree, componentPath.slice(1));
};

export const removeSubTree = <T>(
  treeAtRootOfPath: Tree<T>,
  componentPath: ComponentPath,
) => {
  if (componentPath.length === 0) {
    throw new Error("Cannot remove the root of the tree");
  }
  const parentPath = componentPath.slice(0, -1);
  const parentSubTree = findSubTree(treeAtRootOfPath, parentPath);
  assertIsNotUndefined(parentSubTree);

  const childrenBranches = parentSubTree[CHILDREN_BRANCHES_KEY];
  if (!childrenBranches) {
    return;
  }
  const [childName, key] = componentPath[componentPath.length - 1];
  assertIsNotUndefined(childName);
  assertIsNotUndefined(key);
  const childBranches = childrenBranches[childName];
  if (!childBranches) {
    return;
  }
  delete childBranches[key];
};

export const getValueAtPath = <T>(
  treeAtRootOfPath: Tree<T>,
  path: ComponentPath,
): T | undefined => {
  return findSubTree(treeAtRootOfPath, path)?.[OWN_VALUE_KEY];
};

export const updateValueAtPath = <T>(
  treeAtRootOfPath: Tree<T>,
  path: ComponentPath,
  value: T,
) => {
  const subTree = findSubTree(treeAtRootOfPath, path);
  assertIsNotUndefined(subTree);
  subTree[OWN_VALUE_KEY] = value;
};

export const createValueAtPath = <T>(
  treeAtRootOfPath: Tree<T>,
  path: ComponentPath,
  value: T,
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

export const getChildrenKeys = (subTree: Tree<any> | undefined): ChildrenKeys =>
  Object.fromEntries(
    Object.entries(subTree?.[CHILDREN_BRANCHES_KEY] || {}).map(
      ([childName, childBranch]) => {
        return [childName, Object.keys(childBranch)];
      },
    ),
  ) as ChildrenKeys;

export const initializeChildBranches = <T>(
  treeAtRootOfPath: Tree<T>,
  parentPath: ComponentPath,
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
