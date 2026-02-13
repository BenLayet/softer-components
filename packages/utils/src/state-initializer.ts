import { ComponentContract, ComponentDef } from "@softer-components/types";

import { SINGLE_CHILD_KEY } from "./path";
import { RelativePathStateManager } from "./relative-path-state-manager";
import { StateManager } from "./state-manager";

// contains state for the whole application,
// and each state of each component is stored inside it
// (as a map or tree or whatever structure the real state manager uses)
export type SofterRootState = {};
/**
 * Initialize the complete state from the root component definition
 */
export function initializeRootState<T extends ComponentContract>(
  softerRootState: SofterRootState,
  rootComponentDef: ComponentDef<T>,
  stateManager: StateManager,
) {
  // Initialize the root state, even if undefined
  stateManager.updateState(softerRootState, [], rootComponentDef.initialState);

  // Initialize children state
  initializeChildrenState(
    rootComponentDef as ComponentDef,
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
    return [SINGLE_CHILD_KEY];
  } else if (value === false) {
    return [];
  } else {
    return value;
  }
}
