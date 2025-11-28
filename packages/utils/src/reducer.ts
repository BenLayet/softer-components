import { ComponentDef } from "@softer-components/types";

import { assertIsNotUndefined, isNotUndefined } from "./predicate.functions";
import { initializeStateRecursively } from "./state-initializer";
import { findComponentDef } from "./component-def-tree";
import { GlobalEvent, SofterRootState } from "./utils.type";
import { RelativePathStateManager } from "./relative-path-state-manager";
import { createValueProviders } from "./value-providers";
import { produce } from "immer";
import { StateManager } from "./state-manager";

/**
 * Update the global state tree based on the given event
 *
 * @param softerRootState - Current global state
 * @param rootComponentDef - Root component definition
 * @param event - Event to process
 * @param stateManager - State manager to read/write state
 */
export function updateSofterRootState(
  softerRootState: SofterRootState,
  rootComponentDef: ComponentDef,
  event: GlobalEvent,
  stateManager: StateManager,
) {
  updateStateOfComponentOfEvent(
    rootComponentDef,
    event,
    new RelativePathStateManager(
      softerRootState,
      stateManager,
      event.componentPath,
    ),
  );
}

function updateStateOfComponentOfEvent(
  rootComponentDef: ComponentDef,
  event: GlobalEvent,
  stateManager: RelativePathStateManager,
) {
  const componentDef = findComponentDef(rootComponentDef, event.componentPath);
  const updater = componentDef.updaters?.[event.name];
  if (!updater) return;

  const { values, children, childrenNodes, state, payload } =
    prepareUpdaterParams(componentDef, event, stateManager);

  const next = produce({ state, childrenNodes }, (draft: any) => {
    const returnedValue = updater({
      values,
      children,
      payload,
      childrenNodes: draft.childrenNodes,
      state: draft.state,
    });

    if (isNotUndefined(returnedValue)) {
      draft.state = returnedValue;
    }
  });

  stateManager.updateState(next.state);

  // If children nodes have changed, update the state accordingly
  if (childrenNodes !== next.childrenNodes) {
    updateChildrenState(
      componentDef,
      childrenNodes,
      next.childrenNodes,
      stateManager,
    );
  }
}

/**
 * Prepare updater parameters from the component definition and state, recursively
 */
function prepareUpdaterParams(
  componentDef: ComponentDef,
  event: GlobalEvent,
  stateManager: RelativePathStateManager,
) {
  const { values, children } = createValueProviders(componentDef, stateManager);

  const childrenNodes = stateManager.getChildrenNodes();
  const state = stateManager.readState();
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
 */
function updateChildrenState(
  componentDef: ComponentDef,
  previousChildrenNodes: Record<string, string[] | boolean>,
  desiredChildrenNodes: Record<string, string[] | boolean>,
  stateManager: RelativePathStateManager,
) {
  Object.entries(desiredChildrenNodes).forEach(([childName, childNode]) => {
    const childConfig = componentDef.childrenConfig?.[childName] ?? {};
    const previousChildNode = previousChildrenNodes[childName];
    const childDef = componentDef.childrenComponents?.[childName];
    assertIsNotUndefined(childDef);

    if (childConfig.isCollection) {
      const previousKeys = (previousChildNode ?? []) as string[];
      const desiredKeys = childNode as string[];

      // Remove the state of deleted keys
      previousKeys
        .filter((key) => !desiredKeys.includes(key))
        .map((key) => stateManager.childStateManager(childName, key))
        .forEach((childStateManager) => childStateManager.removeStateTree());

      // Initialize the state of desired keys
      desiredKeys
        .filter((key) => !previousKeys.includes(key))
        .map((key) => stateManager.childStateManager(childName, key))
        .forEach((childStateManager) =>
          initializeStateRecursively(childDef, childStateManager),
        );
    } else {
      // Single child
      if (childNode) {
        if (!previousChildNode) {
          initializeStateRecursively(
            childDef,
            stateManager.childStateManager(childName),
          );
        }
      } else {
        stateManager.childStateManager(childName).removeStateTree();
      }
    }
  });
}
