import { Payload } from "@softer-components/types";
import {
  CHILDREN_BRANCHES_KEY,
  GlobalEvent,
  OWN_VALUE_KEY,
  SofterRootState,
  Source,
  StateTree,
  statePathToString,
  stringToStatePath,
} from "@softer-components/utils";

const PART_SEPARATOR = "|";

export type ReduxDispatch = (action: ReduxAction) => void;
type ReduxAction = {
  type: string;
  payload: Payload;
};

export function isSofterEvent(action: ReduxAction): boolean {
  return action.type.startsWith(REDUX_SOFTER_PREFIX);
}
export function actionToEvent(action: ReduxAction): GlobalEvent {
  if (!isSofterEvent(action)) {
    throw new Error(`Not a softer event: '${action.type}'`);
  }
  const parts = action.type.split(PART_SEPARATOR);
  if (parts.length < 4) {
    throw new Error(
      `Invalid softer event type: '${action.type}'. Expected format: '☁️/source/statePath/eventName'`,
    );
  }
  parts.shift(); // remove softer prefix
  const source = parts.shift() as Source;
  const name = parts.pop() as string;
  const statePathStr = parts.join(PART_SEPARATOR); // rebuild statePathStr
  const statePath = stringToStatePath(statePathStr);
  const payload = action.payload;
  return { name, statePath, payload, source };
}

export function eventToAction(event: GlobalEvent): ReduxAction {
  const type =
    REDUX_SOFTER_PREFIX +
    PART_SEPARATOR +
    (event.source ?? "?") +
    PART_SEPARATOR +
    statePathToString(event.statePath) +
    PART_SEPARATOR +
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
  if (typeof globalState[REDUX_SOFTER_PREFIX] !== "undefined") {
    throw new Error("The global state already has a root tree");
  }
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

function assertIsNotUndefined<T>(
  value: T | undefined,
  message?: string,
): asserts value is T {
  if (typeof value === "undefined") {
    throw new Error(message || "Value is not defined");
  }
}
