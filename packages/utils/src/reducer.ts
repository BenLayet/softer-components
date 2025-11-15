import { ComponentDef, Values } from "@softer-components/types";

import {
  createValuesProvider,
  findComponentDef,
  findSubStateTree,
} from "./component-def-tree";
import {
  CHILDREN_STATE_KEY,
  GlobalEvent,
  OWN_STATE_KEY,
  StateTree,
} from "./constants";
import {
  assertIsNotUndefined,
  isNotUndefined,
  isUndefined,
} from "./predicate.functions";
import { initialStateTree } from "./state";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// REDUCER
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function updateGlobalState(
  rootComponentDef: ComponentDef,
  previousGlobalState: StateTree,
  event: GlobalEvent
) {
  updateStateOfComponentOfEvent(rootComponentDef, previousGlobalState, event);
}

function updateStateOfComponentOfEvent(
  rootComponentDef: ComponentDef,
  previousGlobalState: StateTree,
  event: GlobalEvent
) {
  const componentDef = findComponentDef(rootComponentDef, event.componentPath);
  const updater = componentDef.updaters?.[event.name];
  if (!updater) return;
  const stateTree = findSubStateTree(previousGlobalState, event.componentPath);

  const { selectors, children, childrenNodes, state, payload } =
    prepareUpdaterParams(componentDef, stateTree, event);
  const originalChildrenNodesStr = JSON.stringify(childrenNodes);

  const nextComponentState = updater({
    selectors,
    children,
    payload,
    childrenNodes, // for update
    state, // for update // can be undefined
  });

  // Updater can update state in place or return a new state
  if (isNotUndefined(nextComponentState)) {
    stateTree[OWN_STATE_KEY] = nextComponentState;
  }

  // If children nodes have changed, update the state tree accordingly
  if (JSON.stringify(childrenNodes) !== originalChildrenNodesStr) {
    updateChildrenState(componentDef, stateTree, childrenNodes);
  }
}

const extractChildrenNodes = (
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
/**
 * Prepare updater parameters from component definition and state tree
 *
 * @param componentDef - Component definition with selectors and children
 * @param stateTree - Current state tree for the component
 * @param event - Event being processed
 * @returns Parameters for the updater function
 */
function prepareUpdaterParams(
  componentDef: ComponentDef,
  stateTree: StateTree,
  event: GlobalEvent
) {
  // Same structure as the state tree, but with values providers instead of states
  const { selectors, children } = createValuesProvider(componentDef, stateTree);

  // Just one level - children nodes for mutation
  const childrenNodes = extractChildrenNodes(componentDef, stateTree);

  // Current state of the component
  const state = stateTree[OWN_STATE_KEY];

  // Event payload
  const payload = event.payload;

  return {
    selectors,
    children,
    payload,
    childrenNodes,
    state,
  };
}

/**
 * Update children state based on changed childrenNodes
 *
 * @param componentDef - Component definition
 * @param stateTree - Current state tree
 * @param childrenNodes - New children nodes structure
 */
function updateChildrenState(
  componentDef: ComponentDef,
  stateTree: StateTree,
  desiredChildrenNodes: Record<string, string[] | boolean>
) {
  // Current children state
  const currentChildrenState = stateTree[CHILDREN_STATE_KEY] || {};

  // Add new children / remove old children
  Object.entries(desiredChildrenNodes).forEach(([childName, childNode]) => {
    const childConfig = componentDef.childrenConfig?.[childName] ?? {};
    const currentChildState = currentChildrenState[childName] ?? {};
    const childDef = componentDef.childrenComponents?.[childName];
    assertIsNotUndefined(childDef);

    if (childConfig.isCollection) {
      const desiredKeys = childNode as string[];
      assertIsNotUndefined(desiredKeys);

      // Keep previous / initialize state of desired keys
      currentChildrenState[childName] = Object.fromEntries(
        desiredKeys.map((key) => [
          key,
          currentChildState[key] ??
            initialStateTree(componentDef.childrenComponents?.[childName]),
        ])
      );
    } else {
      if (childNode) {
        if (isUndefined(currentChildState)) {
          currentChildrenState[childName] = initialStateTree(childDef);
        }
      } else {
        delete currentChildrenState[childName];
      }
    }
  });

  // Update the state tree
  stateTree[CHILDREN_STATE_KEY] = currentChildrenState;
}
