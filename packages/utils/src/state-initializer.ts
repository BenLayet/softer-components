import { ComponentDef } from "@softer-components/types";
import { isNotUndefined } from "./predicate.functions";
import { RelativePathStateManager } from "./relative-path-state-manager";
import { SofterRootState } from "./utils.type";
import { StateManager } from "./state-manager";

/**
 * Initialize the complete state tree from the root component definition
 */
export function initializeRootState(
  softerRootState: SofterRootState,
  rootComponentDef: ComponentDef,
  stateManager: StateManager
) {
  return initializeStateRecursively(
    softerRootState,
    rootComponentDef,
    new RelativePathStateManager(stateManager, [])
  );
}

/**
 * Recursively instantiate state for a component and its children
 */
export function initializeStateRecursively(
  softerRootState: SofterRootState,
  componentDef: ComponentDef,
  stateManager: RelativePathStateManager
) {
  // Initialize component state, even if undefined
  stateManager.createState(softerRootState, componentDef.initialState);

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
              initializeStateRecursively(
                softerRootState,
                childDef,
                childStateManager
              );
            });
        } else {
          if (componentDef.initialChildrenNodes?.[childName] ?? true) {
            initializeStateRecursively(
              softerRootState,
              childDef,
              stateManager.childStateManager(childName)
            );
          }
        }
      }
    );
  }
}
