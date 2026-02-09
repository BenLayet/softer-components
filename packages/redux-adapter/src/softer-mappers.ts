import { Payload } from "@softer-components/types";
import {
  CHILDREN_BRANCHES_KEY,
  GlobalEvent,
  OWN_VALUE_KEY,
  SofterRootState,
  StateTree,
  assertIsNotUndefined,
  assertValueIsUndefined,
  statePathToString,
  stringToStatePath,
} from "@softer-components/utils";

const EVENT_SEPARATOR = "/";

function eventNameWithoutComponentPath(globalEventName: string): string {
  const eventName = globalEventName.split(EVENT_SEPARATOR).pop();
  assertIsNotUndefined(eventName);
  return eventName;
}
export type ReduxDispatch = (action: ReduxAction) => void;
type ReduxAction = {
  type: string;
  payload: Payload;
};

export function isSofterEvent(action: ReduxAction): boolean {
  return action.type.startsWith(REDUX_SOFTER_PREFIX);
}

export function removeSofterPrefix(actionType: string) {
  return actionType.slice(REDUX_SOFTER_PREFIX.length + 1);
}

export function actionToEvent(action: ReduxAction): GlobalEvent {
  if (!isSofterEvent(action)) {
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

export function eventToAction(event: GlobalEvent): ReduxAction {
  const type =
    REDUX_SOFTER_PREFIX +
    (event.source ?? "?") +
    statePathToString(event.statePath) +
    EVENT_SEPARATOR +
    event.name;
  return {
    type,
    payload: event.payload,
  };
}

//component path string conversion
const REDUX_SOFTER_PREFIX = "☁️";
export type GlobalState = { [REDUX_SOFTER_PREFIX]?: StateTree };
export function addSofterRootTree(globalState: GlobalState): {
  [REDUX_SOFTER_PREFIX]: StateTree;
} {
  assertValueIsUndefined(
    { softerRootTree: globalState[REDUX_SOFTER_PREFIX] },
    "Global state already has root tree",
  );
  globalState[REDUX_SOFTER_PREFIX] = {
    [OWN_VALUE_KEY]: {},
    [CHILDREN_BRANCHES_KEY]: {},
  };
  return globalState as { [REDUX_SOFTER_PREFIX]: StateTree };
}
export function getSofterRootTree(
  globalState: SofterRootState & { [REDUX_SOFTER_PREFIX]?: StateTree },
): StateTree {
  assertIsNotUndefined(
    globalState[REDUX_SOFTER_PREFIX],
    "Global state does not have softer root tree",
  );
  return globalState[REDUX_SOFTER_PREFIX];
}
