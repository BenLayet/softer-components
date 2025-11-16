import { OptionalValue } from "@softer-components/types";
import {
  ComponentPath,
  GlobalEvent,
  StateTree,
} from "node_modules/@softer-components/utils/src/constants";

const COMPONENT_SEPARATOR = "/";
const KEY_SEPARATOR = ":";
const SOFTER_SOFTER_PREFIX = "☁️";
type ReduxAction = {
  type: string;
  payload: OptionalValue;
};

export function softerRootState(reduxGlobalState: any): StateTree {
  return reduxGlobalState?.[SOFTER_SOFTER_PREFIX] ?? {};
}
export function initialReduxGlobalState(softerGlobalStateTree: StateTree) {
  return { [SOFTER_SOFTER_PREFIX]: softerGlobalStateTree };
}

export function isSofterEvent(action: ReduxAction): boolean {
  const parts = action.type.split(COMPONENT_SEPARATOR);
  return parts[0] === SOFTER_SOFTER_PREFIX;
}

export function actionToEvent({ type, payload }: ReduxAction): GlobalEvent {
  const parts = type.split(COMPONENT_SEPARATOR);
  if (parts.length < 2) {
    throw new Error(`invalid action type: '${type}'`);
  }
  if (parts[0] !== SOFTER_SOFTER_PREFIX) {
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
  const type =
    SOFTER_SOFTER_PREFIX +
    COMPONENT_SEPARATOR +
    componentPathToString(event.componentPath) +
    event.name;
  return {
    type,
    payload: event.payload,
  };
}

export function componentPathToString(componentPath: ComponentPath): string {
  return (
    SOFTER_SOFTER_PREFIX +
    COMPONENT_SEPARATOR +
    componentPath
      .map(([componentName, instanceKey]) =>
        instanceKey
          ? `${componentName}${KEY_SEPARATOR}${instanceKey}`
          : componentName
      )
      .join(COMPONENT_SEPARATOR) +
    COMPONENT_SEPARATOR
  );
}

export function stringToComponentPath(pathString: string): ComponentPath {
  const parts = pathString.split(COMPONENT_SEPARATOR);
  if (!parts.pop()) {
    return []; // tolerates empty string as root path
  }
  return parts.map((part) => {
    const [componentName, instanceKey] = part.split(KEY_SEPARATOR);
    return [componentName, instanceKey ?? undefined] as const;
  });
}
