import { ComponentDef } from "@softer-components/types";
import { RelativePathStateManager } from "./relative-path-state-manager";
import { SofterRootState } from "./utils.type";
import { StateManager } from "./state-manager";

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
  Object.entries(componentDef.childrenComponents ?? {}).forEach(
    ([childName, childDef]) => {
      stateManager.initializeChildBranches(childName);
      (componentDef.initialChildrenKeys?.[childName] ?? [INITIAL_KEY])
        .map((key) => stateManager.childStateManager(childName, key))
        .forEach((childStateManager) => {
          initializeStateRecursively(childDef, childStateManager);
        });
    },
  );
}
