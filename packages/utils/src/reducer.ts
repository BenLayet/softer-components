import { ComponentDef, State, Event } from "@softer-components/types";
import {
  extractComponentPathStr,
  extractEventName,
  findComponentDef,
} from "./component-def-map";
import { reinstanciateStateRecursively } from "./state";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// REDUCER
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function newGlobalState(
  rootComponentDef: ComponentDef<any, any, any>,
  event: Event,
  previousGlobalState: Record<string, State>
): Record<string, State> {
  const newGlobalState = updateStateOfComponentOfEvent(
    rootComponentDef,
    event,
    previousGlobalState
  );
  if (newGlobalState === previousGlobalState) {
    return previousGlobalState;
  }
  return reinstanciateStateRecursively(newGlobalState, "/", rootComponentDef);
}

function updateStateOfComponentOfEvent(
  rootComponentDef: ComponentDef<any, any>,
  action: any,
  previousGlobalState: Record<string, State>
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

const findStateUpdater = (
  rootComponentDef: ComponentDef<any, any>,
  absoluteEventType: string
) => {
  const componentDef = findComponentDef(
    rootComponentDef,
    extractComponentPathStr(absoluteEventType)
  );
  const eventName = extractEventName(absoluteEventType);
  return componentDef.stateUpdaters?.[eventName];
};
