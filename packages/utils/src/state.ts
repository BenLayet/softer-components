//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// STATE INITIALISATION
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

import { ComponentDef, State } from "@softer-components/types";

export function initialStateTree(componentDef: ComponentDef): State {
  //add listeners to children to optimise event forwarding performance TODO
  return reinitialiseStateTree({}, "/", componentDef);
}

export function reinitialiseStateTree(
  mutableGlobalState: Record<string, State>,
  componentPath: string,
  componentDef: ComponentDef<any, any>,
  initialStateFromParent?: State
): Record<string, State> {
  // if the state is already initialized, don't re-initialize it.
  if (typeof mutableGlobalState[componentPath] === "undefined") {
    mutableGlobalState[componentPath] = initialComponentState(
      componentDef,
      initialStateFromParent
    );
  }
  // continue refreshing the children of the current component
  reinitialiseChildrenState(mutableGlobalState, componentPath, componentDef);
  return mutableGlobalState;
}

function initialComponentState(
  componentDef: ComponentDef<any, any>,
  parentState?: State
): State {
  if (
    typeof parentState === "undefined" &&
    typeof componentDef?.initialState === "undefined"
  ) {
    throw new Error(
      `Component has no initial state defined and no initial state provided by parent.`
    );
  }
  if (
    typeof parentState === "object" &&
    typeof componentDef?.initialState === "object"
  ) {
    return {
      ...componentDef.initialState,
      ...parentState,
    };
  }
  return parentState ?? componentDef.initialState;
}

function reinitialiseChildrenState(
  previousGlobalState: Record<string, State>,
  componentPath: string,
  componentDef: ComponentDef<any, any>
) {
  const componentState = previousGlobalState[componentPath];
  Object.entries(componentDef.children ?? {}).map(
    ([childName, childDef]: [string, any]) => {
      if (childDef.isCollection) {
        const childCount = childDef.count(componentState);
        for (let i = 0; i < childCount; i++) {
          const childKey = childDef.childKey(componentState, i);
          const childPath = `${componentPath}${childName}:${childKey}/`;
          const initialChildState = childDef.initialStateFactoryWithKey?.(
            //TODO initialChildState only after checking the state is undefined
            componentState,
            childKey
          );
          reinitialiseStateTree(
            previousGlobalState,
            childPath,
            childDef,
            initialChildState
          );
        }
      } else {
        const childPath = `${componentPath}${childName}/`;
        const initialChildState =
          childDef.initialStateFactory?.(componentState);
        reinitialiseStateTree(
          previousGlobalState,
          childPath,
          childDef,
          initialChildState
        );
      }
    }
  );
}
