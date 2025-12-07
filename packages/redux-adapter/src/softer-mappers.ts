import { Payload, State } from "@softer-components/types";
import {
  assertIsNotUndefined,
  assertValueIsUndefined,
  CHILDREN_BRANCHES_KEY,
  GlobalEvent,
  SofterRootState,
  OWN_VALUE_KEY,
  Tree,
  componentPathToString,
  stringToComponentPath,
  eventNameWithoutComponentPath,
} from "@softer-components/utils";
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
  const componentPath = stringToComponentPath(pathStr);
  return {
    name: eventNameWithoutComponentPath(action.type),
    componentPath,
    payload: action.payload,
  };
}

export function eventToAction(event: GlobalEvent): ReduxAction {
  const type =
    REDUX_SOFTER_PREFIX +
    (event.source ?? "?") +
    componentPathToString(event.componentPath) +
    event.name;
  return {
    type,
    payload: event.payload,
  };
}

//component path string conversion
const REDUX_SOFTER_PREFIX = "☁️";
export type GlobalState = { [REDUX_SOFTER_PREFIX]?: Tree<State> };
export function addSofterRootTree(globalState: GlobalState): {
  [REDUX_SOFTER_PREFIX]: Tree<State>;
} {
  assertValueIsUndefined(
    { softerRootTree: globalState[REDUX_SOFTER_PREFIX] },
    "Global state already has root tree",
  );
  globalState[REDUX_SOFTER_PREFIX] = {
    [OWN_VALUE_KEY]: {},
    [CHILDREN_BRANCHES_KEY]: {},
  };
  return globalState as { [REDUX_SOFTER_PREFIX]: Tree<State> };
}
export function getSofterRootTree(
  globalState: SofterRootState & { [REDUX_SOFTER_PREFIX]?: Tree<State> },
): Tree<State> {
  assertIsNotUndefined(
    globalState[REDUX_SOFTER_PREFIX],
    "Global state does not have softer root tree",
  );
  return globalState[REDUX_SOFTER_PREFIX];
}
