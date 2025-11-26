import { ComponentDef } from "@softer-components/types";

import { assertIsNotUndefined, isNotUndefined } from "./predicate.functions";
import {
  initializeRootState,
  initializeStateRecursively,
} from "./state-initializer";
import { findComponentDef } from "./component-def-tree";
import { GlobalEvent, GlobalState } from "./utils.type";
import { RelativePathStateManager } from "./relative-path-state-manager";
import { createValueProviders } from "./value-providers";
import { produce } from "immer";
import { StateManager } from "./state-manager";

/**
 * Update the global state tree based on the given event
 *
 * @param globalState - Current global state
 * @param rootComponentDef - Root component definition
 * @param event - Event to process
 * @param stateManager - State manager to read/write state
 */
export function updateGlobalState(
  globalState: GlobalState,
  rootComponentDef: ComponentDef,
  event: GlobalEvent,
  stateManager: StateManager
) {
  updateStateOfComponentOfEvent(
    globalState,
    rootComponentDef,
    event,
    new RelativePathStateManager(stateManager, [])
  );
}

function updateStateOfComponentOfEvent<State>(
  globalState: GlobalState,
  rootComponentDef: ComponentDef,
  event: GlobalEvent,
  stateManager: RelativePathStateManager
) {
  const componentDef = findComponentDef(rootComponentDef, event.componentPath);
  const updater = componentDef.updaters?.[event.name];
  if (!updater) return;

  const { values, children, childrenNodes, state, payload } =
    prepareUpdaterParams(globalState, componentDef, event, stateManager);

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

  stateManager.updateState(globalState, next.state);

  // If children nodes have changed, update the state tree accordingly
  if (childrenNodes !== next.childrenNodes) {
    updateChildrenState(
      globalState,
      componentDef,
      childrenNodes,
      next.childrenNodes,
      stateManager
    );
  }
}

/**
 * Prepare updater parameters from component definition and state tree
 */
function prepareUpdaterParams(
  globalState: GlobalState,
  componentDef: ComponentDef,
  event: GlobalEvent,
  stateManager: RelativePathStateManager
) {
  const { values, children } = createValueProviders(
    globalState,
    componentDef,
    stateManager
  );

  const childrenNodes = stateManager.getChildrenNodes(globalState);
  const state = stateManager.readState(globalState);
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
  globalState: GlobalState,
  componentDef: ComponentDef,
  previousChildrenNodes: Record<string, string[] | boolean>,
  desiredChildrenNodes: Record<string, string[] | boolean>,
  stateManager: RelativePathStateManager
) {
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
        .forEach((childStateManager) =>
          childStateManager.removeStateTree(globalState)
        );

      // Initialize state of desired keys
      desiredKeys
        .filter((key) => !previousKeys.includes(key))
        .map((key) => stateManager.childStateManager(childName, key))
        .forEach((childStateManager) =>
          initializeStateRecursively(globalState, childDef, childStateManager)
        );
    } else {
      // Single child
      if (childNode) {
        if (!previousChildNode) {
          initializeStateRecursively(
            globalState,
            childDef,
            stateManager.childStateManager(childName)
          );
        }
      } else {
        stateManager.childStateManager(childName).removeStateTree(globalState);
      }
    }
  });
}
