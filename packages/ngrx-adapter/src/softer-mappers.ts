import { Payload } from "@softer-components/types";
import {
  CHILDREN_BRANCHES_KEY,
  GlobalEvent,
  OWN_VALUE_KEY,
  StateTree,
  statePathToString,
  stringToStatePath,
} from "@softer-components/utils";

const EVENT_SEPARATOR = "/";

function eventNameWithoutComponentPath(globalEventName: string): string {
  const eventName = globalEventName.split(EVENT_SEPARATOR).pop();
  assertIsNotUndefined(eventName);
  return eventName;
}

export type NgRxAction = {
  type: string;
  payload?: Payload;
};

export const NGRX_SOFTER_PREFIX = "☁️";

export function isSofterAction(action: NgRxAction): boolean {
  return action.type.startsWith(NGRX_SOFTER_PREFIX);
}

export function removeSofterPrefix(actionType: string): string {
  return actionType.slice(NGRX_SOFTER_PREFIX.length + 1);
}

export function actionToEvent(action: NgRxAction): GlobalEvent {
  if (!isSofterAction(action)) {
    throw new Error(`Not a softer event: '${action.type}'`);
  }
  const pathStr = removeSofterPrefix(action.type);
  const name = eventNameWithoutComponentPath(action.type);
  const statePathStr = pathStr.substring(
    0,
    pathStr.length - (name.length + EVENT_SEPARATOR.length),
  );
  const statePath = stringToStatePath(statePathStr);
  const payload = action.payload;
  return { name, statePath, payload };
}

export function eventToAction(event: GlobalEvent): NgRxAction {
  const type =
    NGRX_SOFTER_PREFIX +
    (event.source ?? "?") +
    statePathToString(event.statePath) +
    EVENT_SEPARATOR +
    event.name;
  return {
    type,
    payload: event.payload,
  };
}

export type NgrxGlobalState<FeatureName extends string = string> = {
  [K in FeatureName]?: StateTree;
};

export const emptyStateTree = {
  [OWN_VALUE_KEY]: {},
  [CHILDREN_BRANCHES_KEY]: {},
};
export function getSofterRootTree<FeatureName extends string>(
  globalState: NgrxGlobalState<FeatureName>,
  featureName: FeatureName,
): StateTree {
  assertIsNotUndefined(
    globalState[featureName],
    `The global state at '${featureName}' is not defined`,
  );
  return globalState[featureName];
}

function assertIsNotUndefined<T>(
  value: T | undefined,
  message?: string,
): asserts value is T {
  if (typeof value === "undefined") {
    throw new Error(message || "Value is not defined");
  }
}
