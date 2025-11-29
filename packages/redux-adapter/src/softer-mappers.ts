import { OptionalValue, State } from "@softer-components/types";
import {
  assertIsNotUndefined,
  assertValueIsUndefined,
  CHILDREN_BRANCHES_KEY,
  ComponentPath,
  GlobalEvent,
  SofterRootState,
  OWN_VALUE_KEY,
  Tree,
} from "@softer-components/utils";
export type ReduxDispatch = (action: ReduxAction) => void;
type ReduxAction = {
  type: string;
  payload: OptionalValue;
};

export function isSofterEvent(action: ReduxAction): boolean {
  const parts = action.type.split(COMPONENT_SEPARATOR);
  return parts[0] === SOFTER_PREFIX;
}

export function actionToEvent({ type, payload }: ReduxAction): GlobalEvent {
  const parts = type.split(COMPONENT_SEPARATOR);
  if (parts.length < 2) {
    throw new Error(`invalid action type: '${type}'`);
  }
  if (parts[0] !== SOFTER_PREFIX) {
    throw new Error(`Not a softer event: '${type}'`);
  }
  const name = parts[parts.length - 1];
  const componentPath = stringToComponentPath(type);
  return {
    name,
    componentPath,
    payload,
  };
}

export function eventToAction(event: GlobalEvent): ReduxAction {
  const type = componentPathToString(event.componentPath) + event.name;
  return {
    type,
    payload: event.payload,
  };
}

//component path string conversion
const SOFTER_PREFIX = "☁️";
const COMPONENT_SEPARATOR = "/";
const KEY_SEPARATOR = ":";
export type GlobalState = { [SOFTER_PREFIX]?: Tree<State> };
export function addSofterRootTree(globalState: GlobalState): {
  [SOFTER_PREFIX]: Tree<State>;
} {
  assertValueIsUndefined(
    { softerRootTree: globalState[SOFTER_PREFIX] },
    "Global state already has root tree",
  );
  globalState[SOFTER_PREFIX] = {
    [OWN_VALUE_KEY]: {},
    [CHILDREN_BRANCHES_KEY]: {},
  };
  return globalState as { [SOFTER_PREFIX]: Tree<State> };
}
export function getSofterRootTree(
  globalState: SofterRootState & { [SOFTER_PREFIX]?: Tree<State> },
): Tree<State> {
  assertIsNotUndefined(
    globalState[SOFTER_PREFIX],
    "Global state does not have softer root tree",
  );
  return globalState[SOFTER_PREFIX];
}

export function componentPathToString(componentPath: ComponentPath): string {
  return (
    SOFTER_PREFIX +
    COMPONENT_SEPARATOR +
    componentPath
      .map(([componentName, instanceKey]) =>
        instanceKey
          ? `${componentName}${KEY_SEPARATOR}${instanceKey}`
          : componentName,
      )
      .map((segment) => segment + COMPONENT_SEPARATOR)
      .join("")
  );
}

export function stringToComponentPath(pathString: string): ComponentPath {
  if (!pathString) {
    return []; // tolerates empty string as root path
  }

  const parts = pathString.split(COMPONENT_SEPARATOR);
  if (parts.length < 2) {
    throw new Error(`invalid component path string: '${pathString}'`);
  }
  if (parts[0] !== SOFTER_PREFIX && parts[0] !== "") {
    throw new Error(`Not a softer component path: '${pathString}'`);
  }
  parts.shift(); // remove prefix
  parts.pop(); // remove trailing empty part due to trailing separator
  return parts.map((part) => {
    const [componentName, instanceKey] = part.split(KEY_SEPARATOR);
    return [componentName, instanceKey ?? undefined] as const;
  });
}
