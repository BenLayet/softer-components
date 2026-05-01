import {
  ChildInstancesDef,
  ChildrenContract,
  ComponentDef,
} from "@softer-components/types";

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
  if (!componentDef.childrenComponentDefs) return;
  const componentDefWithChildren = componentDef as ComponentDef<{
    children: ChildrenContract;
  }>;
  const initialChildren = (componentDefWithChildren.initialChildren ??
    {}) as Record<string, ChildInstancesDef>;

  Object.entries(componentDefWithChildren.childrenComponentDefs).forEach(
    ([childName]) => {
      initializeChildState(
        stateManager,
        componentDef,
        childName,
        initialChildren[childName],
      );
    },
  );
}
export function initializeChildState(
  stateManager: RelativePathStateManager,
  componentDef: ComponentDef,
  childName: string,
  keys: string[] | boolean | undefined,
) {
  stateManager.initializeChildBranches(childName);
  booleanOrArrayToKeys(keys)
    .map(key => stateManager.childStateManager(childName, key))
    .forEach(childStateManager => {
      initializeStateRecursively(
        (componentDef as ComponentDef<{ children: ChildrenContract }>)
          .childrenComponentDefs?.[childName] ?? {},
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
