import {
  CollectionChildConfig,
  ComponentDef,
  OptionalValue,
  SingleChildConfig,
  State,
} from "@softer-components/types";

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// STATE INITIALISATION
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Initialize the complete state tree for a component hierarchy
 */
export function initialStateTree(
  rootComponentDef: ComponentDef<any>,
  rootPath = "/"
): Record<string, State> {
  // TODO: Add listeners to children to optimize event forwarding performance
  return instanciateStateRecursively({}, rootPath, rootComponentDef);
}

/**
 * Recursively instantiate state for a component and its children
 */
function instanciateStateRecursively(
  mutableGlobalState: Record<string, State>,
  componentPath: string,
  componentDef: ComponentDef,
  protoState?: OptionalValue
): Record<string, State> {
  // Initialize component state
  mutableGlobalState[componentPath] = computeInitialState(
    componentDef.initialState,
    protoState
  );
  // Recursively initialize children
  instantiateChildrenState(mutableGlobalState, componentPath, componentDef);
  return mutableGlobalState;
}

/**
 * Initialize state for all children of a component
 */
function instantiateChildrenState(
  mutableGlobalState: Record<string, State>,
  componentPath: string,
  componentDef: ComponentDef
): void {
  for (const [childName, childComponentDef] of Object.entries(
    componentDef.childrenComponents ?? {}
  )) {
    const childConfig = (componentDef.childrenConfig?.[childName] ?? {}) as
      | (SingleChildConfig & { isCollection: false })
      | (CollectionChildConfig & { isCollection: true });
    if (childConfig.isCollection) {
      instantiateChildCollectionStates(
        mutableGlobalState,
        componentPath,
        childName,
        childComponentDef,
        childConfig
      );
    } else {
      instantiateSingleChildState(
        mutableGlobalState,
        componentPath,
        childName,
        childComponentDef,
        childConfig as SingleChildConfig
      );
    }
  }
}

/**
 * Initialize state for a single child component
 */
function instantiateSingleChildState(
  mutableGlobalState: Record<string, State>,
  componentPath: string,
  childName: string,
  childComponentDef: ComponentDef,
  childConfig: SingleChildConfig
): void {
  const childPath = `${componentPath}${childName}/`;
  // Instantiate child state
  const givenState = childConfig.initialChildState;
  instanciateStateRecursively(
    mutableGlobalState,
    childPath,
    childComponentDef,
    givenState
  );
}

/**
 * Initialize state for a collection of child components
 */
function instantiateChildCollectionStates(
  mutableGlobalState: Record<string, State>,
  componentPath: string,
  childName: string,
  childComponentDef: ComponentDef,
  childConfig: CollectionChildConfig
): void {
  const childPathPrefix = `${componentPath}${childName}:`;
  // Instantiate state for each child in collection
  for (const [key, givenState] of Object.entries(
    childConfig.initialChildrenStates
  )) {
    const childPath = `${childPathPrefix}${key}/`;
    instanciateStateRecursively(
      mutableGlobalState,
      childPath,
      childComponentDef,
      givenState
    );
  }
}

function computeInitialState(
  defaultInitialState: OptionalValue,
  givenInitialState: OptionalValue
) {
  if (typeof defaultInitialState === "undefined") {
    return givenInitialState;
  }
  if (typeof givenInitialState === "undefined") {
    return defaultInitialState;
  }
  if (typeof givenInitialState !== "object") {
    return givenInitialState;
  }
  if (typeof defaultInitialState !== "object") {
    return defaultInitialState;
  }
  //both are defined objects : patch initialState with given state
  return {
    ...defaultInitialState,
    ...givenInitialState,
  };
}
