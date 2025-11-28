import { ComponentDef } from "@softer-components/types";
import { isNotUndefined } from "./predicate.functions";
import { RelativePathStateManager } from "./relative-path-state-manager";
import { ComponentPath, SofterRootState } from "./utils.type";
import { StateManager } from "./state-manager";

/**
 * Initialize the complete state from the root component definition
 */
export function initializeRootState(
  softerRootState: SofterRootState,
  rootComponentDef: ComponentDef,
  stateManager: StateManager,
) {
  return initializeStateRecursively(
    rootComponentDef,
    new RelativePathStateManager(
      softerRootState,
      stateManager,
      [] as ComponentPath,
    ),
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
  if (isNotUndefined(componentDef.childrenComponents)) {
    Object.entries(componentDef.childrenComponents).forEach(
      ([childName, childDef]) => {
        const childConfig = componentDef.childrenConfig?.[childName] ?? {};
        if (childConfig.isCollection) {
          stateManager.createEmptyCollectionChild(childName);

          const keys = (componentDef.initialChildrenNodes?.[childName] ??
            []) as string[];
          keys
            .map((key) => stateManager.childStateManager(childName, key))
            .forEach((childStateManager) => {
              initializeStateRecursively(childDef, childStateManager);
            });
        } else {
          if (componentDef.initialChildrenNodes?.[childName] ?? true) {
            initializeStateRecursively(
              childDef,
              stateManager.childStateManager(childName),
            );
          }
        }
      },
    );
  }
}
