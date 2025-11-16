import { OptionalValue } from "@softer-components/types";
import {
  ComponentPath,
  GlobalEvent,
  StateTree,
} from "node_modules/@softer-components/utils/src/constants";

const COMPONENT_SEPARATOR = "/";
const KEY_SEPARATOR = ":";
const SOFTER_SOFTER_PREFIX = "☁️";
type Action = {
  type: string;
  payload: OptionalValue;
};

export function softerRootState(reduxGlobalState: any): StateTree {
  return reduxGlobalState?.[SOFTER_SOFTER_PREFIX] ?? {};
}
export function initialReduxGlobalState(softerGlobalStateTree: StateTree) {
  return { [SOFTER_SOFTER_PREFIX]: softerGlobalStateTree };
}

export function isSofterEvent(action: Action): boolean {
  const parts = action.type.split(COMPONENT_SEPARATOR);
  return parts[0] === SOFTER_SOFTER_PREFIX;
}

export function actionToEvent({ type, payload }: Action): GlobalEvent {
  const parts = type.split(COMPONENT_SEPARATOR);
  if (parts.length < 2) {
    throw new Error(`invalid action type: '${type}'`);
  }
  if (parts[0] !== SOFTER_SOFTER_PREFIX) {
    throw new Error(`Not a softer event: '${type}'`);
  }
  const name = parts[parts.length - 1];
  const componentPath: ComponentPath = parts
    .slice(1, parts.length - 1)
    .map((part) => {
      const [componentName, instanceKey] = part.split(KEY_SEPARATOR);
      return [componentName, instanceKey] as const;
    });

  return {
    name,
    componentPath,
    payload,
  };
}

export function eventToAction(event: GlobalEvent): Action {
  const type =
    SOFTER_SOFTER_PREFIX +
    COMPONENT_SEPARATOR +
    [
      ...event.componentPath.map(([componentName, instanceKey]) =>
        instanceKey
          ? `${componentName}${KEY_SEPARATOR}${instanceKey}`
          : componentName
      ),
      event.name,
    ].join(COMPONENT_SEPARATOR);
  return {
    type,
    payload: event.payload,
  };
}
