import { ComponentDef, State } from "@softer-components/types";

import { assertIsNotUndefined, isNotUndefined } from "./predicate.functions";
import { initializeStateTree } from "./state";
import { StateManager } from "./state-manager";
import { findComponentDef } from "./component-def-tree";
import { GlobalEvent } from "./utils.type";
import { RelativePathStateManager } from "./relative-path-state-manager";
import { createValueProviders } from "./value-providers";
import { produce } from "immer";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// REDUCER
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Update the global state tree based on the given event
 *
 * @param rootComponentDef - Root component definition
 * @param event - Event to process
 * @param stateManager - State manager to read/write state
 */
export function updateGlobalState(
  rootComponentDef: ComponentDef,
  event: GlobalEvent,
  stateManager: StateManager
) {
  updateStateOfComponentOfEvent(
    rootComponentDef,
    event,
    new RelativePathStateManager(stateManager, event.componentPath)
  );
}

function updateStateOfComponentOfEvent(
  rootComponentDef: ComponentDef,
  event: GlobalEvent,
  stateManager: RelativePathStateManager
) {
  const componentDef = findComponentDef(rootComponentDef, event.componentPath);
  const updater = componentDef.updaters?.[event.name];
  if (!updater) return;

  const { values, children, childrenNodes, state, payload } =
    prepareUpdaterParams(componentDef, event, stateManager);
  //
  const next = produce({ state, childrenNodes }, (draft: any) => {
    const returnedValue = updater({
      values,
      children,
      payload,
      childrenNodes: draft.childrenNodes, // for update // can only be mutated
      state: draft.state, // for update // can be undefined // can only be mutated or returned
    });

    if (isNotUndefined(returnedValue)) {
      draft.state = returnedValue;
    }
  });

  stateManager.writeState(next.state);

  // If children nodes have changed, update the state tree accordingly
  if (childrenNodes !== next.childrenNodes) {
    updateChildrenState(
      componentDef,
      childrenNodes,
      next.childrenNodes,
      stateManager
    );
  }
}
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
  event: GlobalEvent,
  stateManager: RelativePathStateManager
) {
  // Same structure as the state tree, but with values providers instead of states
  const { values, children } = createValueProviders(componentDef, stateManager);

  // Just one level - children nodes for mutation
  const childrenNodes = stateManager.getChildrenNodes();

  // Current state of the component
  const state = stateManager.readState();

  // Event payload
  const payload = event.payload;

  return {
    values,
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
  previousChildrenNodes: Record<string, string[] | boolean>,
  desiredChildrenNodes: Record<string, string[] | boolean>,
  stateManager: RelativePathStateManager
) {
  // Add new children / remove old children
  Object.entries(desiredChildrenNodes).forEach(([childName, childNode]) => {
    const childConfig = componentDef.childrenConfig?.[childName] ?? {};
    const previousChildNode = previousChildrenNodes[childName];
    const childDef = componentDef.childrenComponents?.[childName];
    assertIsNotUndefined(childDef);

    if (childConfig.isCollection) {
      const previousKeys = (previousChildNode ?? []) as string[];
      const desiredKeys = childNode as string[];

      // Remove state of deleted keys
      previousKeys
        .filter((key) => !desiredKeys.includes(key))
        .map((key) => stateManager.childStateManager(childName, key))
        .forEach((childStateManager) => childStateManager.removeState());

      // initialize state of desired keys
      desiredKeys
        .filter((key) => !previousKeys.includes(key))
        .map((key) => stateManager.childStateManager(childName, key))
        .forEach((childStateManager) =>
          initializeStateTree(childDef, childStateManager)
        );
    } else {
      // single child
      if (childNode) {
        if (!previousChildNode) {
          initializeStateTree(
            childDef,
            stateManager.childStateManager(childName)
          );
        }
      } else {
        stateManager.childStateManager(childName).removeState();
      }
    }
  });
}
