import { ComponentDef, State } from "@softer-components/types";
import { CHILDREN_STATE_KEY, OWN_STATE_KEY, StateTree } from "./constants";
import { isNotUndefined } from "./predicate.functions";

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// STATE INITIALISATION
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Initialize the complete state tree for a component hierarchy
 */
export function initialStateTree(
  rootComponentDef: ComponentDef
): Record<string, State> {
  // TODO: Add listeners to children to optimize event forwarding performance
  return instanciateStateRecursively({}, rootComponentDef);
}

/**
 * Recursively instantiate state for a component and its children
 */
function instanciateStateRecursively(
  mutableGlobalState: StateTree,
  componentDef: ComponentDef
): StateTree {
  // Initialize component state
  if (isNotUndefined(componentDef.initialState)) {
    mutableGlobalState[OWN_STATE_KEY] = componentDef.initialState;
  }
  // Initialize children state
  if (isNotUndefined(componentDef.childrenComponents)) {
    mutableGlobalState[CHILDREN_STATE_KEY] = {};
    Object.entries(componentDef.childrenComponents).forEach(
      ([childName, childDef]) => {
        const childConfig = componentDef.childrenConfig?.[childName] ?? {};
        if (childConfig.isCollection) {
          const keys = (componentDef.initialChildrenNodes?.[childName] ??
            []) as string[];
          mutableGlobalState[CHILDREN_STATE_KEY][childName] = keys.reduce(
            (childrenState, childKey) => {
              childrenState[childKey] = instanciateStateRecursively(
                {},
                childDef
              );
              return childrenState;
            },
            {}
          );
        } else {
          if (componentDef.initialChildrenNodes?.[childName] ?? true) {
            mutableGlobalState[CHILDREN_STATE_KEY][childName] =
              instanciateStateRecursively({}, childDef);
          }
        }
      }
    );
  }
  // Return the state tree
  return mutableGlobalState;
}
