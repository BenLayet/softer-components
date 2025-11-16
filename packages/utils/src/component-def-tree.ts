import {
  ComponentDef,
  OptionalValue,
  State,
  Values,
} from "@softer-components/types";
import {
  CHILDREN_STATE_KEY,
  ComponentPath,
  OWN_STATE_KEY,
  StateTree,
} from "./constants";
import { assertIsNotUndefined, isUndefined } from "./predicate.functions";

/**
 * Find the component definition at the given path within the root component definition
 * @param componentDef - Root component definition
 * @param componentPath - Path to the desired component
 * @returns Component definition at the given path
 */
export const findComponentDef = (
  componentDef: ComponentDef,
  componentPath: ComponentPath
): ComponentDef => {
  if (componentPath.length === 0) {
    return componentDef;
  }
  const children = componentDef.childrenComponents ?? {};
  const childName = componentPath[0][0];
  const child = children[childName];
  if (!child) {
    throw new Error(
      `invalid path: childName = '${childName}' not found in children = ${JSON.stringify(Object.keys(children))}`
    );
  }
  return findComponentDef(child, componentPath.slice(1));
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
  const childrenState = globalState[CHILDREN_STATE_KEY];
  assertIsNotUndefined(childrenState);

  const subTree = isUndefined(key)
    ? childrenState[childName]
    : childrenState[childName][key];
  assertIsNotUndefined(subTree);

  return findSubStateTree(subTree, componentPath.slice(1));
};

/**
 * Create Values provider for a component given its definition and state tree
 * @param componentDef
 * @param componentStateTree
 * @returns Values that provides access to all selectors of the state tree,
 *  without exposing the state directly
 */
export function createValuesProvider(
  componentDef: ComponentDef,
  componentStateTree: StateTree
): Values {
  // Create own selectors
  const selectors = createOwnSelectors(componentDef, componentStateTree);

  // Create children selectors
  const childrenState = componentStateTree[CHILDREN_STATE_KEY] || {};
  const children = Object.fromEntries(
    Object.entries(childrenState).map(([childName, childState]) => {
      const childDef = componentDef.childrenComponents?.[childName];
      assertIsNotUndefined(childDef);

      const isCollection =
        componentDef.childrenConfig?.[childName].isCollection ?? false;

      if (isCollection) {
        const collectionChildValues = Object.fromEntries(
          Object.entries(childState as Record<string, StateTree>).map(
            ([childKey, childStateTree]) => {
              const childValues = createValuesProvider(
                childDef,
                childStateTree
              );
              return [childKey, childValues];
            }
          )
        );
        return [childName, collectionChildValues];
      } else {
        const childValues = createValuesProvider(
          childDef,
          childState as StateTree
        );
        return [childName, childValues];
      }
    })
  );
  // Return the values tree
  return { selectors, children };
}

function createOwnSelectors(
  componentDef: ComponentDef,
  componentStateTree: StateTree
): Values["selectors"] {
  const ownState = componentStateTree[OWN_STATE_KEY] || {};
  const selectorsDef = componentDef.selectors || {};
  return Object.fromEntries(
    Object.entries(selectorsDef).map(([selectorName, selector]) => {
      return [selectorName, () => selector(ownState)];
    })
  );
}

export const extractChildrenNodes = (
  componentDef: ComponentDef,
  stateTree: StateTree
) =>
  Object.fromEntries(
    Object.entries(stateTree[CHILDREN_STATE_KEY] || {}).map(
      ([childName, childState]) => {
        const childDef = componentDef.childrenComponents?.[childName];
        const isCollection =
          componentDef.childrenConfig?.[childName].isCollection ?? false;
        assertIsNotUndefined(childDef);
        return [childName, isCollection ? Object.keys(childState) : true];
      }
    )
  );
