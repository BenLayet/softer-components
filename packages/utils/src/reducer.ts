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
 * @param softerRootState - softer root state
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

  const { selectors, children, childrenKeys, state, payload } =
    prepareUpdaterParams(componentDef, event, stateManager);

  const next = produce({ state, childrenKeys }, (draft: any) => {
    const returnedValue = updater({
      selectors,
      children,
      payload,
      childrenKeys: draft.childrenKeys,
      state: draft.state,
    });

    if (isNotUndefined(returnedValue)) {
      draft.state = returnedValue;
    }
  });

  // update own state
  stateManager.updateState(next.state);

  // update children state
  updateChildrenState(
    componentDef,
    childrenKeys,
    next.childrenKeys,
    stateManager,
  );
}

/**
 * Prepare updater parameters from the component definition and state, recursively
 */
function prepareUpdaterParams(
  componentDef: ComponentDef,
  event: GlobalEvent,
  stateManager: RelativePathStateManager,
) {
  const { selectors, children } = createValueProviders(
    componentDef,
    stateManager,
  );
  const childrenKeys = stateManager.getChildrenKeys();
  const state = stateManager.readState();
  const payload = event.payload;

  return {
    selectors,
    children,
    payload,
    childrenKeys,
    state,
  };
}

/**
 * Update children state based on changed childrenKeys
 */
function updateChildrenState(
  componentDef: ComponentDef,
  previousChildrenKeys: Record<string, string[]>,
  desiredChildrenKeys: Record<string, string[]>,
  stateManager: RelativePathStateManager,
) {
  Object.entries(desiredChildrenKeys).forEach(([childName, desiredKeys]) => {
    const childDef = componentDef.childrenComponents?.[childName];
    assertIsNotUndefined(childDef);
    const previousKeys = (previousChildrenKeys[childName] ?? []) as string[];
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
  });
}
