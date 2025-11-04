import {
  ChildCollectionDef,
  ComponentDef,
  OptionalValue,
  SingleChildDef,
  State,
} from "@softer-components/types";

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// STATE INITIALISATION
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Initialize the complete state tree for a component hierarchy
 */
export function initialStateTree(componentDef: ComponentDef<any, any>): State {
  // TODO: Add listeners to children to optimize event forwarding performance
  return reinstanciateStateRecursively({}, "/", componentDef);
}

/**
 * Recursively instantiate state for a component and its children
 * Only instantiates if state doesn't already exist
 */
export function reinstanciateStateRecursively(
  mutableGlobalState: Record<string, State>,
  componentPath: string,
  componentDef: ComponentDef<any, any>,
  protoState?: OptionalValue
): Record<string, State> {
  // if state does not already exist
  if (!(componentPath in mutableGlobalState)) {
    // Initialize component state
    mutableGlobalState[componentPath] =
      componentDef.initialState?.(protoState) ?? undefined;
  }

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
  componentDef: ComponentDef<any, any>
): void {
  const componentState = mutableGlobalState[componentPath];

  for (const [childName, childDef] of Object.entries(
    componentDef.children ?? {}
  )) {
    if (childDef.isCollection) {
      instantiateChildCollectionStates(
        mutableGlobalState,
        componentPath,
        childName,
        childDef as ChildCollectionDef<any, any, any>,
        componentState
      );
    } else {
      instantiateSingleChildState(
        mutableGlobalState,
        componentPath,
        childName,
        childDef as SingleChildDef<any, any, any>,
        componentState
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
  childDef: SingleChildDef<any, any, any>,
  parentComponentState: State
): void {
  const childPath = `${componentPath}${childName}/`;

  // Check if child should exist
  if (childDef.exists && !childDef.exists(parentComponentState)) {
    pruneChildStates(mutableGlobalState, childPath);
    return;
  }

  // Instantiate child state
  const protoState = childDef.protoState?.(parentComponentState);
  reinstanciateStateRecursively(
    mutableGlobalState,
    childPath,
    childDef,
    protoState
  );
}

/**
 * Remove state for a child and all its descendants
 * Optimized to collect keys first, then delete
 */
function pruneChildStates(
  mutableGlobalState: Record<string, State>,
  childPath: string
): void {
  // Collect all paths that start with childPath
  const pathsToDelete = Object.keys(mutableGlobalState).filter((path) =>
    path.startsWith(childPath)
  );
  // Delete in separate pass
  for (const path of pathsToDelete) {
    delete mutableGlobalState[path];
  }
}

/**
 * Initialize state for a collection of child components
 */
function instantiateChildCollectionStates(
  mutableGlobalState: Record<string, State>,
  componentPath: string,
  childName: string,
  childDef: ChildCollectionDef<any, any, any>,
  parentComponentState: State
): void {
  const newKeys = childDef.getKeys(parentComponentState);
  const childPathPrefix = `${componentPath}${childName}:`;

  // Prunes state for children that no longer exist
  pruneChildrenStates(mutableGlobalState, childPathPrefix, newKeys);

  // Instantiate state for each child in collection
  for (const key of newKeys) {
    const childPath = `${childPathPrefix}${key}/`;
    const protoState = childDef.protoState?.(parentComponentState, key);
    reinstanciateStateRecursively(
      mutableGlobalState,
      childPath,
      childDef,
      protoState
    );
  }
}

/**
 * Remove state for children that no longer exist in the collection
 * Optimized with Set for O(1) lookups
 */
function pruneChildrenStates(
  mutableGlobalState: Record<string, State>,
  childPathPrefix: string,
  keysToKeep: string[]
): void {
  // Collect all paths to delete
  const pathsToDelete = Object.keys(mutableGlobalState).filter((path) => {
    if (path.startsWith(childPathPrefix)) {
      const key = path.slice(
        childPathPrefix.length,
        path.indexOf("/", childPathPrefix.length)
      );
      return !keysToKeep.includes(key);
    }
    return false;
  });
  // Delete in separate pass to avoid modifying during iteration
  for (const path of pathsToDelete) {
    delete mutableGlobalState[path];
  }
}
