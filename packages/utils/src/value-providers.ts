import {
  ComponentDef,
  Values as ValueProviders,
} from "@softer-components/types";
import { assertValueIsNotUndefined } from "./predicate.functions";
import { RelativePathStateManager } from "./relative-path-state-manager";
import { GlobalState } from "./utils.type";

/**
 * Create Values provider for a component given its definition and state
 */
export function createValueProviders(
  globalState: GlobalState,
  componentDef: ComponentDef,
  stateManager: RelativePathStateManager
): ValueProviders {
  // Create own values
  const values = createOwnValueProviders(
    globalState,
    componentDef,
    stateManager
  );

  // Create children values
  const childrenNodes = stateManager.getChildrenNodes(globalState);
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
              globalState,
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
            globalState,
            childDef,
            stateManager.childStateManager(childName)
          ),
        ];
      }
    })
  );

  return { values, children };
}

function createOwnValueProviders(
  globalState: GlobalState,
  componentDef: ComponentDef,
  stateManager: RelativePathStateManager
): ValueProviders["values"] {
  const selectorsDef = componentDef.selectors || {};
  return Object.fromEntries(
    Object.entries(selectorsDef).map(([selectorName, selector]) => [
      selectorName,
      () => stateManager.selectValue(globalState, selectorName, selector),
    ])
  );
}
