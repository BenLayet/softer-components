import { ComponentContract, ComponentDef } from "@softer-components/types";
import { produce } from "immer";

import {
  findComponentDefFromStatePath,
  isCollectionChild,
} from "./component-def-tree";
import { GlobalEvent } from "./global-event";
import {
  assertIsArray,
  assertIsNotUndefined,
  isNotUndefined,
} from "./predicate.functions";
import { RelativePathStateManager } from "./relative-path-state-manager";
import { SofterRootState, initializeChildState } from "./state-initializer";
import { StateManager } from "./state-manager";
import { createValueProviders } from "./value-providers";

/**
 * Update the global state tree based on the given event
 *
 * @param softerRootState - softer root state
 * @param rootComponentDef - Root component definition
 * @param event - Event to process
 * @param stateManager - State manager to read/write state
 */
export function updateSofterRootState<T extends ComponentContract = any>(
  softerRootState: SofterRootState,
  rootComponentDef: ComponentDef<T>,
  event: GlobalEvent,
  stateManager: StateManager,
) {
  updateStateOfComponentOfEvent(
    rootComponentDef,
    event,
    new RelativePathStateManager(
      softerRootState,
      stateManager,
      event.statePath,
    ),
  );
}

function updateStateOfComponentOfEvent<T extends ComponentContract = any>(
  rootComponentDef: ComponentDef<T>,
  event: GlobalEvent,
  stateManager: RelativePathStateManager,
) {
  const componentDef = findComponentDefFromStatePath(
    rootComponentDef,
    event.statePath,
  );
  updateState(rootComponentDef, componentDef, stateManager, event);
  updateChildrenInstances(rootComponentDef, componentDef, stateManager, event);
}

function updateState<T>(
  rootComponentDef: ComponentDef,
  componentDef: ComponentDef,
  stateManager: RelativePathStateManager,
  event: GlobalEvent,
) {
  const stateUpdater = componentDef.stateUpdaters?.[event.name];
  if (!stateUpdater) return;

  const { values, childrenValues, state, payload, contextsValues } =
    prepareUpdaterParams(rootComponentDef as ComponentDef, event, stateManager);

  const next = produce({ state }, (draft: any) => {
    const returnedValue = stateUpdater({
      values,
      childrenValues,
      contextsValues,
      payload,
      state: draft.state,
    });

    if (isNotUndefined(returnedValue)) {
      draft.state = returnedValue;
    }
  });

  // update own state
  stateManager.updateState(next.state);
}

function updateChildrenInstances<T>(
  rootComponentDef: ComponentDef,
  componentDef: ComponentDef,
  stateManager: RelativePathStateManager,
  event: GlobalEvent,
) {
  const childrenUpdater = componentDef.childrenUpdaters?.[event.name];
  if (!childrenUpdater) return;

  const { values, children, childrenValues, payload, contextsValues } =
    prepareUpdaterParams(rootComponentDef as ComponentDef, event, stateManager);

  const next = produce({ children }, (draft: any) => {
    const returnedValue = childrenUpdater({
      values,
      childrenValues,
      contextsValues,
      payload,
      children: draft.children,
    });

    if (isNotUndefined(returnedValue)) {
      draft.children = returnedValue;
    }
  });

  // update children state
  updateChildrenState(componentDef, children, next.children, stateManager);
}
/**
 * Prepare updater parameters from the component definition and state, recursively
 */
function prepareUpdaterParams(
  rootComponentDef: ComponentDef,
  event: GlobalEvent,
  stateManager: RelativePathStateManager,
) {
  const { values, childrenValues, contextsValues } = createValueProviders(
    rootComponentDef,
    stateManager,
  );
  const componentDef = findComponentDefFromStatePath(
    rootComponentDef,
    event.statePath,
  );
  const childrenKeys = stateManager.getChildrenKeys();
  const children = childrenKeysToBooleanOrArray(childrenKeys, componentDef);
  const state = stateManager.readState();
  const payload = event.payload;

  return {
    values,
    children,
    payload,
    childrenValues,
    contextsValues,
    state,
  };
}

/**
 * Update children state based on changed children
 */
function updateChildrenState(
  componentDef: ComponentDef,
  previousChildrenKeys: Record<string, boolean | string[]>,
  desiredChildrenKeys: Record<string, boolean | string[]>,
  stateManager: RelativePathStateManager,
) {
  Object.entries(desiredChildrenKeys).forEach(([childName, desiredKeys]) => {
    const childDef = componentDef.childrenComponentDefs?.[childName];
    assertIsNotUndefined(childDef);
    const previousKeys = previousChildrenKeys[childName];

    // Remove the state of deleted keys
    removeStateOfDeletedKeys(
      previousKeys,
      desiredKeys,
      childName,
      stateManager,
    );

    // Initialize the state of desired keys
    initialiseChildStateOfAddedKeys(
      componentDef,
      previousKeys,
      desiredKeys,
      childName,
      stateManager,
    );
    // reorder child states if needed
    if (Array.isArray(desiredKeys) && desiredKeys.length > 0) {
      assertIsArray(
        previousKeys,
        `Expected previousKeys to be an array for child ${childName}, but got ${typeof previousKeys}`,
      );
      const areDifferent =
        desiredKeys.length !== previousKeys.length ||
        desiredKeys.some((key, index) => key !== previousKeys[index]);
      if (areDifferent) {
        stateManager.reorderChildStates(childName, desiredKeys);
      }
    }
  });
}

function initialiseChildStateOfAddedKeys(
  componentDef: ComponentDef,
  previousKeys: boolean | string[],
  desiredKeys: boolean | string[],
  childName: string,
  stateManager: RelativePathStateManager,
) {
  if (Array.isArray(previousKeys)) {
    assertIsArray(
      desiredKeys,
      `Expected desiredKeys to be an array for child ${childName}, but got ${typeof desiredKeys}`,
    );
    const newKeys = desiredKeys.filter(key => !previousKeys.includes(key));
    initializeChildState(stateManager, componentDef, childName, newKeys);
  } else {
    if (desiredKeys !== false && !previousKeys) {
      initializeChildState(stateManager, componentDef, childName, true);
    }
  }
}

function removeStateOfDeletedKeys(
  previousKeys: boolean | string[],
  desiredKeys: boolean | string[],
  childName: string,
  stateManager: RelativePathStateManager,
) {
  if (Array.isArray(previousKeys)) {
    assertIsArray(
      desiredKeys,
      `Expected desiredKeys to be an array for child ${childName}, but got ${typeof desiredKeys} `,
    );
    previousKeys
      .filter(key => !desiredKeys.includes(key))
      .map(key => stateManager.childStateManager(childName, key))
      .forEach(childStateManager => childStateManager.removeStateTree());
  } else {
    if (previousKeys && desiredKeys === false) {
      const childStateManager = stateManager.firstChildStateManager(childName);
      childStateManager.removeStateTree();
    }
  }
}

function childrenKeysToBooleanOrArray(
  childrenKeys: Record<string, string[]>,
  componentDef: ComponentDef,
): Record<string, boolean | string[]> {
  const ret: Record<string, boolean | string[]> = {};
  Object.entries(childrenKeys).forEach(([childName, keys]) => {
    if (isCollectionChild(componentDef, childName)) {
      ret[childName] = keys;
    } else {
      ret[childName] = keys.length > 0;
    }
  });
  return ret;
}
