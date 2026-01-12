import { ComponentDef } from "@softer-components/types";

import { RelativePathStateManager } from "./relative-path-state-manager";
import { StateManager } from "./state-manager";
import { SofterRootState } from "./utils.type";

const INITIAL_KEY = "0";
/**
 * Initialize the complete state from the root component definition
 */
export function initializeRootState(
  softerRootState: SofterRootState,
  rootComponentDef: ComponentDef,
  stateManager: StateManager,
) {
  // Initialize the root state, even if undefined
  stateManager.updateState(softerRootState, [], rootComponentDef.initialState);

  // Initialize children state
  initializeChildrenState(
    rootComponentDef,
    new RelativePathStateManager(softerRootState, stateManager, []),
  );
}

/**
 * Recursively instantiate state for a component and its children
 */
export function initializeStateRecursively(
  componentDef: ComponentDef,
  stateManager: RelativePathStateManager,
) {
  // Initialize the component state, even if undefined
  stateManager.createState(componentDef.initialState);

  // Initialize children state
  initializeChildrenState(componentDef, stateManager);
}
function initializeChildrenState(
  componentDef: ComponentDef,
  stateManager: RelativePathStateManager,
) {
  Object.entries(componentDef.childrenComponentDefs ?? {}).forEach(
    ([childName]) => {
      initializeChildState(
        stateManager,
        componentDef,
        childName,
        componentDef.initialChildren?.[childName],
      );
    },
  );
}
export function initializeChildState(
  stateManager: RelativePathStateManager,
  componentDef: ComponentDef,
  childName: string,
  keys?: string[] | boolean,
) {
  stateManager.initializeChildBranches(childName);
  booleanOrArrayToKeys(keys)
    .map(key => stateManager.childStateManager(childName, key))
    .forEach(childStateManager => {
      initializeStateRecursively(
        componentDef.childrenComponentDefs?.[childName] ?? {},
        childStateManager,
      );
    });
}

function booleanOrArrayToKeys(value: boolean | string[] | undefined): string[] {
  if (value === true || value === undefined) {
    return [INITIAL_KEY];
  } else if (value === false) {
    return [];
  } else {
    return value;
  }
}
