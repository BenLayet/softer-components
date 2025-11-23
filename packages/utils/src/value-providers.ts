import {
  ComponentDef,
  Values as ValueProviders,
} from "@softer-components/types";
import {
  assertIsNotUndefined,
  assertValueIsNotUndefined,
} from "./predicate.functions";
import { RelativePathStateManager } from "./relative-path-state-manager";

/**
 * Create Values provider for a component given its definition and state
 * @param componentDef
 * @param stateManager
 * @returns Provider for all values from their selectors and their children selectors,
 *  without exposing the state directly
 */
export function createValueProviders(
  componentDef: ComponentDef,
  stateManager: RelativePathStateManager
): ValueProviders {
  // Create own values
  const values = createOwnValueProviders(componentDef, stateManager);

  // Create children values
  const childrenNodes = stateManager.getChildrenNodes();
  const children = Object.fromEntries(
    Object.entries(childrenNodes).map(([childName, childNode]) => {
      const childDef = componentDef.childrenComponents?.[childName];
      assertValueIsNotUndefined({ childDef });

      const isCollection =
        componentDef.childrenConfig?.[childName].isCollection ?? false;

      if (isCollection) {
        const keys = (childNode ?? []) as string[];
        const collectionChildValueProviders = Object.fromEntries(
          keys.map((key) => {
            const childValueProviders = createValueProviders(
              childDef,
              stateManager.childStateManager(childName, key)
            );
            return [key, childValueProviders];
          })
        );
        return [childName, collectionChildValueProviders];
      } else {
        return [
          childName,
          createValueProviders(
            childDef,
            stateManager.childStateManager(childName)
          ),
        ];
      }
    })
  );
  // Return the values tree
  return { values, children };
}

function createOwnValueProviders(
  componentDef: ComponentDef,
  stateManager: RelativePathStateManager
): ValueProviders["values"] {
  const selectorsDef = componentDef.selectors || {};
  return Object.fromEntries(
    Object.entries(selectorsDef).map(([selectorName, selector]) => [
      selectorName,
      () => stateManager.selectValue(selectorName, selector),
    ])
  );
}
