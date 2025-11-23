import { ComponentDef } from "@softer-components/types";
import { isNotUndefined } from "./predicate.functions";
import { StateManager } from "./state-manager";
import { RelativePathStateManager } from "./relative-path-state-manager";

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// STATE INITIALISATION
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Initialize the complete state tree from the root component definition
 */
export function initializeRootState(
  rootComponentDef: ComponentDef,
  stateManager: StateManager
) {
  return initializeStateTree(
    rootComponentDef,
    new RelativePathStateManager(stateManager)
  );
}
/**
 * Initialize the complete state tree for a component hierarchy
 */
export const initializeStateTree = (
  rootComponentDef: ComponentDef,
  stateManager: RelativePathStateManager
) => {
  return initializeStateRecursively(rootComponentDef, stateManager);
};

/**
 * Recursively instantiate state for a component and its children
 */
function initializeStateRecursively(
  componentDef: ComponentDef,
  stateManager: RelativePathStateManager
) {
  // Initialize component state, even if undefined
  stateManager.writeState(componentDef.initialState);

  // Initialize children state
  if (isNotUndefined(componentDef.childrenComponents)) {
    Object.entries(componentDef.childrenComponents).forEach(
      ([childName, childDef]) => {
        const childConfig = componentDef.childrenConfig?.[childName] ?? {};
        if (childConfig.isCollection) {
          const keys = (componentDef.initialChildrenNodes?.[childName] ??
            []) as string[];
          keys
            .map((key) => stateManager.childStateManager(childName, key))
            .forEach((childStateManager) => {
              initializeStateTree(childDef, childStateManager);
            });
        } else {
          if (componentDef.initialChildrenNodes?.[childName] ?? true) {
            initializeStateTree(
              childDef,
              stateManager.childStateManager(childName)
            );
          }
        }
      }
    );
  }
}
