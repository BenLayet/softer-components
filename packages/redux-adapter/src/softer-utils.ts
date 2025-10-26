/**
 * This file manages a global state consisting of a Record of component state objects, where the keys are the paths to the components.
 * @example
 * ```ts
 * {
 *  "/": {pagetitle: {title: "My Shopping App"}},
 *  "/shoppingList": {name: "Grocery list"},
 *  "/shoppingList/items:1/": "milk",
 *  "/shoppingList/items:2/": "eggs",
 * }
 * ```
 *
 * and action with type in component path format: "/shoppingList/items:1/" or "/shoppingList/items/"
 * action type with no key ("/shoppingList/items/") match all component paths with keys ("/shoppingList/items:1/" or "/shoppingList/items:2/")
 */
import {
  AnyComponentDef,
  State,
  Event,
  defaultComponentDef,
} from "@softer-components/types";

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// STATE INITIALISATION
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function initialStateTree(componentDef: AnyComponentDef): State {
  return reinitialiseStateTree({}, "/", initialiseDefault(componentDef));
}

function reinitialiseStateTree(
  previousGlobalState: Record<string, State>,
  componentPath: string,
  componentDef: AnyComponentDef,
  initialStateFromParent?: State,
): Record<string, State> {
  // if the state is already initialized, don't re-initialize it.
  // Otherwise, it will be initialized with:
  //  - either the initial state given by the parent component
  //  - or the initial state of the component itself
  if (typeof previousGlobalState[componentPath] === "undefined") {
    previousGlobalState[componentPath] =
      initialStateFromParent ?? componentDef.initialState;
  }

  // continue refreshing the children of the current component
  reinitialiseChildrenState(previousGlobalState, componentPath, componentDef);
  return previousGlobalState;
}

function reinitialiseChildrenState(
  previousGlobalState: Record<string, State>,
  componentPath: string,
  componentDef: AnyComponentDef,
) {
  const componentState = previousGlobalState[componentPath];
  Object.entries(componentDef.children).map(([childName, childDef]: [string, any]) => {

    if (childDef.isCollection) {
      const childCount = childDef.count(componentState);
      for (let i = 0; i < childCount; i++) {
        const childKey = childDef.childKey(componentState, i);
        const childPath = `${componentPath}${childName}:${childKey}/`;
        const initialChildState = childDef.initialStateFactoryWithKey?.( //TODO initialChildState only after checking the state is undefined
          componentState,
          childKey,
        );
        reinitialiseStateTree(
          previousGlobalState,
          childPath,
          initialiseDefault(childDef.componentDef),
          initialChildState,
        );
      }
    } else {
      const childPath = `${componentPath}${childName}/`;
      const initialChildState = childDef.initialStateFactory?.(componentState);
      reinitialiseStateTree(
        previousGlobalState,
        childPath,
        initialiseDefault(childDef.componentDef),
        initialChildState,
      );
    }
  });
}

function initialiseDefault(
  componentDef: Partial<AnyComponentDef>
): AnyComponentDef {
  return {
    ...defaultComponentDef,
    ...componentDef,
  };
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// REDUCER
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function newGlobalState(
  rootComponentDef: AnyComponentDef,
  action: any,
  previousGlobalState: Record<string, State>,
): Record<string, State> {
  const newGlobalState = updateStateOfComponentOfAction(
    rootComponentDef,
    action,
    previousGlobalState,
  );
  if (newGlobalState === previousGlobalState) {
    return previousGlobalState;
  }
  return reinitialiseStateTree(newGlobalState, "/", rootComponentDef);
}

function updateStateOfComponentOfAction(
  rootComponentDef: AnyComponentDef,
  action: any,
  previousGlobalState: Record<string, State>,
): Record<string, State> {
  const stateUpdater = findStateUpdater(rootComponentDef, action.type);
  if (!stateUpdater) return previousGlobalState;
  const componentPath = extractComponentPathStr(action.type);
  const componentState = previousGlobalState[componentPath];
  const nextComponentState = stateUpdater(componentState, action.payload);
  if (nextComponentState === componentState) {
    return previousGlobalState;
  }
  return {
    ...previousGlobalState,
    [componentPath]: nextComponentState, // update the component state in a new global state
  };
}

export const extractComponentPathStr = (fullType: string): string => {
  return fullType.slice(0, fullType.lastIndexOf("/") + 1);
};
export const extractComponentDefPath = (fullType: string): string[] => {
  const parts = fullType.split("/");
  if (parts.length < 2) {
    return [];
  }
  return parts.slice(1, -1).map((part) => part.split(":")[0]);
};

export const extractEventName = (fullType: string): string => {
  const lastSlashIndex = fullType.lastIndexOf("/");
  if (lastSlashIndex === -1) {
    return "";
  }
  return fullType.slice(lastSlashIndex + 1);
};

const findComponentDef = (
  componentDef: AnyComponentDef,
  path: string[],
): AnyComponentDef => {
  if (path.length === 0) {
    return componentDef;
  }
  const children = componentDef.children;
  const childName = path[0];
  const child = children[childName];
  if (!child) {
    throw new Error(
      `invalid path: childName = ${childName} not found in children = ${JSON.stringify(Object.keys(children))}`,
    );
  }
  return findComponentDef(initialiseDefault(child.componentDef), path.slice(1));
};

export const findStateUpdater = (
  rootComponentDef: AnyComponentDef,
  absoluteEventType: string,
) => {
  const componentDef = findComponentDef(
    rootComponentDef,
    extractComponentDefPath(absoluteEventType),
  );
  const eventName = extractEventName(absoluteEventType);
  return componentDef?.events?.[eventName]?.stateUpdater;
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// FORWARDING EVENTS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
export function createEventsToForward(
  rootComponentDef: AnyComponentDef,
  globalState: Record<string, State>,
  triggeringEvent: Event,
) {
  const result: Event[] = [];
  //TODO change to for each
  Object.entries(globalState)
    .map(
      ([componentPath, componentState]) =>
        [
          componentPath,
          componentState,
          findComponentDef(
            rootComponentDef,
            extractComponentDefPath(componentPath),
          ),
        ] as const,
    )
    .map(([componentPath, componentState, componentDef]) => {
      createInputEventsToForward(
        componentPath,
        componentState,
        componentDef,
        triggeringEvent,
      ).forEach((event) => result.push(event));
      return [componentPath, componentState, componentDef] as const;
    })
    .filter(([componentPath]) =>
      isComponentPathMatch(componentPath, triggeringEvent.type),
    )
    .flatMap(([componentPath, componentState, componentDef]) =>
      createEventsOfMatchingComponentToForward(
        componentPath,
        componentState,
        componentDef,
        triggeringEvent,
      ),
    )
    .forEach((event) => result.push(event));
  return result;
}

function createEventsOfMatchingComponentToForward(
  componentPath: string,
  componentState: State,
  componentDef: AnyComponentDef,
  triggeringEvent: Event,
) {
  return [
    ...createInternalEventsToForward(
      componentPath,
      componentState,
      componentDef,
      triggeringEvent,
    ),
    ...createOutputEventsToForward(
      componentPath,
      componentState,
      componentDef,
      triggeringEvent,
    ),
  ];
}

function createInternalEventsToForward(
  componentPath: string,
  componentState: State,
  componentDef: AnyComponentDef,
  triggeringEvent: Event,
) {
  return Object.entries(componentDef.events)
    .filter(([eventName]) =>
      isActionTypeMatch(`${componentPath}${eventName}`, triggeringEvent.type),
    )
    .map(([_, eventDef]) => eventDef)
    .flatMap((eventDef) => eventDef.forwarders ?? [])
    .filter(
      (ef) =>
        !ef.onCondition ||
        ef.onCondition(componentState, triggeringEvent.payload),
    )
    .map((ef: any) => ({
      type: `${componentPath}${ef.to}`,
      payload: ef.withPayload
        ? ef.withPayload(componentState, triggeringEvent.payload)
        : triggeringEvent.payload,
    }));
}

function createOutputEventsToForward(
  componentPath: string,
  componentState: State,
  componentDef: AnyComponentDef,
  triggeringEvent: Event,
) {
  return Object.values(componentDef.output)
    .filter((ef) =>
      isActionTypeMatch(`${componentPath}${ef.onEvent}`, triggeringEvent.type),
    )
    .filter(
      (ef) =>
        !ef.onCondition ||
        ef.onCondition(componentState, triggeringEvent.payload),
    )
    .map((ef) => ({
      type: `${componentPath}${ef.thenDispatch}`, //TODO thenDispatch should be a function that returns the event type
      payload: ef.withPayload
        ? ef.withPayload(componentState, triggeringEvent.payload)
        : triggeringEvent.payload,
    }));
}

function createInputEventsToForward(
  componentPath: string,
  componentState: State,
  componentDef: AnyComponentDef,
  triggeringEvent: Event,
) {
  return Object.values(componentDef.input)
    .filter((ef) =>
      isActionTypeMatch(`${componentPath}${ef.onEvent}`, triggeringEvent.type),
    )
    .filter(
      (ef) =>
        !ef.onCondition ||
        ef.onCondition(componentState, triggeringEvent.payload),
    )
    .map((ef: any) => ({
      type: `${componentPath}${ef.thenDispatch}`,
      payload: ef.withPayload
        ? ef.withPayload(componentState, triggeringEvent.payload)
        : triggeringEvent.payload,
    }));
}

const isActionTypeMatch = (actionType1: string, actionType2: string) => {
  return (
    extractEventName(actionType1) === extractEventName(actionType2) &&
    isComponentPathMatch(actionType1, actionType2)
  );
};
const isComponentPathMatch = (
  componentPath1: string,
  componentPath2: string,
) => {
  const parts1 = componentPath1.split("/").slice(0, -1);
  const parts2 = componentPath2.split("/").slice(0, -1);
  if (parts1.length !== parts2.length) {
    return false;
  }
  return parts1.every((part1, i) => isComponentPartMatch(part1, parts2[i]));
};
const isComponentPartMatch = (part1: string, part2: string) => {
  const [componentName1, componentKey1] = part1.split(":");
  const [componentName2, componentKey2] = part2.split(":");
  if (componentName1 !== componentName2) {
    return false;
  }
  if (componentKey1 && componentKey2) {
    return componentKey1 === componentKey2;
  }
  //if one is not defined, it's a wildcard'
  return true;
};
