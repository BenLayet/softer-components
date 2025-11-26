/**
 * Tree tree structure and utilities to manipulate it.
 * State Managers could use these utilities to read/write states at specific paths, or create their own structures.
 */
import { ChildrenNodes } from "@softer-components/types";
import {
  assertIsNotUndefined,
  isNotUndefined,
  isUndefined,
} from "../../utils/src/predicate.functions";
import { ComponentPath } from "../../utils/src/utils.type";

// state tree
export const CHILDREN_CONTAINER_KEY = "🪾";
export const OWN_KEY = "🫒";

export type SingleChildInstance<T> = Tree<T>;
export type CollectionChildInstances<T> = Record<
  string,
  SingleChildInstance<T>
>;
export type ChildrenContainer<T> = Record<
  string,
  SingleChildInstance<T> | CollectionChildInstances<T>
>;

export type Tree<T> = {
  [OWN_KEY]: T;
  [CHILDREN_CONTAINER_KEY]?: ChildrenContainer<T>;
};
/**
 * @param treeAtRootOfPath
 * @param componentPath
 * @returns sub-tree of the global tree for the component at the given path
 */
export const findSubTree = <T>(
  treeAtRootOfPath: Tree<T>,
  componentPath: ComponentPath
): Tree<T> => {
  if (componentPath.length === 0) {
    assertIsNotUndefined(treeAtRootOfPath);
    return treeAtRootOfPath;
  }
  const pathSegment = componentPath[0];
  assertIsNotUndefined(pathSegment);

  const childName = pathSegment[0];
  assertIsNotUndefined(childName);

  const key = pathSegment[1];
  const childrenBranches = treeAtRootOfPath[CHILDREN_CONTAINER_KEY];
  assertIsNotUndefined(childrenBranches);

  const subTree = isUndefined(key)
    ? (childrenBranches[childName] as SingleChildInstance<T>)
    : (childrenBranches[childName] as CollectionChildInstances<T>)[key];
  assertIsNotUndefined(subTree);

  return findSubTree(subTree, componentPath.slice(1));
};

export const subTreeExistsAtPath = <T>(
  treeAtRootOfPath: Tree<T>,
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
  const childrenBranches = treeAtRootOfPath[CHILDREN_CONTAINER_KEY];
  assertIsNotUndefined(childrenBranches);

  const subTree = isUndefined(key)
    ? (childrenBranches[childName] as SingleChildInstance<T>)
    : (childrenBranches[childName] as CollectionChildInstances<T>)[key];
  assertIsNotUndefined(subTree);

  return subTreeExistsAtPath(subTree, componentPath.slice(1));
};

export const removeSubTree = <T>(
  treeAtRootOfPath: Tree<T>,
  componentPath: ComponentPath
) => {
  if (componentPath.length === 0) {
    throw new Error("Cannot remove the root of the tree");
  }
  const parentPath = componentPath.slice(0, -1);
  const lastSegment = componentPath[componentPath.length - 1];
  const parentSubTree = findSubTree(treeAtRootOfPath, parentPath);
  const childrenBranches = parentSubTree[CHILDREN_CONTAINER_KEY];
  if (!childrenBranches) {
    return;
  }
  const childName = lastSegment[0];
  const key = lastSegment[1];
  if (!isUndefined(key)) {
    const collectionBranches = childrenBranches[childName];
    if (isBranchOfCollection(collectionBranches)) {
      delete collectionBranches[key];
    }
    return;
  } else {
    // Single child case
    delete childrenBranches[childName];
  }
};

export const getValueAtPath = <T>(
  treeAtRootOfPath: Tree<T>,
  path: ComponentPath
): T => {
  const value = findSubTree(treeAtRootOfPath, path)[OWN_KEY];
  assertIsNotUndefined(
    value,
    `No value found at path: ${path.map((parts) => parts.join(":")).join("/")}`
  );
  return value;
};

export const updateValueAtPath = <T>(
  treeAtRootOfPath: Tree<T>,
  path: ComponentPath,
  value: T
) => (findSubTree(treeAtRootOfPath, path)[OWN_KEY] = value);

export const createValueAtPath = <T>(
  treeAtRootOfPath: Tree<T>,
  path: ComponentPath,
  value: T
): void => {
  if (path.length === 0) {
    treeAtRootOfPath[OWN_KEY] = value;
    return;
  }
  const parentPath = path.slice(0, -1);
  const parentSubTree = findSubTree(treeAtRootOfPath, parentPath);
  if (!parentSubTree[CHILDREN_CONTAINER_KEY]) {
    parentSubTree[CHILDREN_CONTAINER_KEY] = {};
  }
  const childrenContainer = parentSubTree[CHILDREN_CONTAINER_KEY];
  //parse child name and key
  const pathSegment = path[path.length - 1];
  assertIsNotUndefined(pathSegment);

  const childName = pathSegment[0];
  assertIsNotUndefined(childName);

  const key = pathSegment[1];
  if (isUndefined(key)) {
    // Single child case
    if (isNotUndefined(childrenContainer[childName])) {
      throw new Error(`A child with name '${childName}' already exists.`);
    }
    // initialize instance
    childrenContainer[childName] = { [OWN_KEY]: value };
  } else {
    // Collection child case
    if (!childrenContainer[childName]) {
      childrenContainer[childName] = {};
    }
    const collectionChildInstancesContainer = childrenContainer[
      childName
    ] as CollectionChildInstances<T>;
    if (isNotUndefined(collectionChildInstancesContainer[key])) {
      throw new Error(
        `A child with name '${childName}' and key '${key}' already exists.`
      );
    }
    // initialize instance
    collectionChildInstancesContainer[key] = { [OWN_KEY]: value };
  }
};

export const getChildrenNodes = (tree: Tree<any>): ChildrenNodes =>
  Object.fromEntries(
    Object.entries(tree[CHILDREN_CONTAINER_KEY] || {}).map(
      ([childName, childBranch]) => {
        return [
          childName,
          isBranchOfSingleChild(childBranch) ? true : Object.keys(childBranch),
        ];
      }
    )
  ) as ChildrenNodes;

export const createEmptyCollectionChildAtPath = <T>(
  treeAtRootOfPath: Tree<T>,
  parentPath: ComponentPath,
  childName: string
) => {
  const parentSubTree = findSubTree(treeAtRootOfPath, parentPath);
  if (!parentSubTree[CHILDREN_CONTAINER_KEY]) {
    parentSubTree[CHILDREN_CONTAINER_KEY] = {};
  }
  const childrenContainer = parentSubTree[CHILDREN_CONTAINER_KEY];
  if (!childrenContainer[childName]) {
    childrenContainer[childName] = {};
  }
};

const isBranchOfSingleChild = <T>(
  branch: SingleChildInstance<T> | CollectionChildInstances<T>
): branch is SingleChildInstance<T> =>
  Object.keys(branch).includes(OWN_KEY) ||
  Object.keys(branch).includes(CHILDREN_CONTAINER_KEY);

const isBranchOfCollection = <T>(
  branch: SingleChildInstance<T> | CollectionChildInstances<T>
): branch is CollectionChildInstances<T> => !isBranchOfSingleChild(branch);
