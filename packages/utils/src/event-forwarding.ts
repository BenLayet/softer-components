import { ComponentDef } from "@softer-components/types";
import { findSubStateTree } from "./state-tree";
import { GlobalEvent } from "./utils.type";
import { assertIsNotUndefined } from "./predicate.functions";
import { StateManager } from "./state-manager";
import { findComponentDef } from "./component-def-tree";
import { createValueProviders } from "./value-providers";
import { RelativePathStateManager } from "./relative-path-state-manager";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// FORWARDING EVENTS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
export function generateEventsToForward(
  rootComponentDef: ComponentDef,
  triggeringEvent: GlobalEvent,
  stateManager: StateManager
) {
  const result: GlobalEvent[] = [];

  const componentDef = findComponentDef(
    rootComponentDef,
    triggeringEvent.componentPath
  );

  // Create events to forward for the component that the event was dispatched to
  result.push(
    ...generateEventsFromOwnComponent(
      componentDef,
      triggeringEvent,
      stateManager
    )
  );

  // Create events to forward from the parent component listening to child events
  result.push(
    ...generateEventsFromParentChildListeners(
      rootComponentDef,
      triggeringEvent,
      stateManager
    )
  );

  // Create events to forward for the component that the event was dispatched to
  result.push(
    ...generateCommandsToChildren(componentDef, triggeringEvent, stateManager)
  );

  return result;
}

/** *
 * @param componentDef
 * @param componentStateTree
 * @param triggeringEvent
 * @returns events generated from the own component event forwarders
 */
function generateEventsFromOwnComponent(
  componentDef: ComponentDef,
  triggeringEvent: GlobalEvent,
  stateManager: StateManager
): GlobalEvent[] {
  const forwarders = (componentDef.eventForwarders ?? []).filter(
    (forwarder) => forwarder.from === triggeringEvent.name
  );

  //no forwarders, no events to generate, no need to walk the whole state tree
  if (forwarders.length === 0) {
    return [];
  }
  const callBackParams = prepareCallBackParams(
    componentDef,
    triggeringEvent,
    stateManager
  );

  return forwarders
    .filter(
      (forwarder) =>
        !forwarder.onCondition || forwarder.onCondition(callBackParams)
    )
    .map((forwarder) => ({
      name: forwarder.to,
      componentPath: triggeringEvent.componentPath, // same component path as the triggering event
      payload: forwarder.withPayload
        ? forwarder.withPayload(callBackParams)
        : triggeringEvent.payload,
    }));
}
/**
 *
 * @param rootComponentDef root component def
 * @param globalStateTree global state tree (with same root as rootComponentDef)
 * @param triggeringEvent global event
 * @returns events generated from parent component listening to child events
 */
function generateEventsFromParentChildListeners(
  rootComponentDef: ComponentDef<any>,
  triggeringEvent: GlobalEvent,
  stateManager: StateManager
): GlobalEvent[] {
  if (!triggeringEvent.componentPath?.length) {
    //no parent component, no child listeners
    return [];
  }
  const parentComponentPath = triggeringEvent.componentPath.slice(0, -1);
  const parentComponentDef = findComponentDef(
    rootComponentDef,
    parentComponentPath
  );
  const childName =
    triggeringEvent.componentPath[
      triggeringEvent.componentPath.length - 1
    ]?.[0];
  assertIsNotUndefined(childName);

  const childListeners = parentComponentDef.childrenConfig?.[
    childName
  ]?.listeners?.filter((listener) => listener.from === triggeringEvent.name);

  if (!childListeners || childListeners.length === 0) {
    //no parent component, no child listeners
    return [];
  }
  const callBackParams = prepareCallBackParams(
    parentComponentDef,
    triggeringEvent,
    stateManager
  );
  return childListeners
    .filter(
      (listener) =>
        !listener.onCondition || listener.onCondition(callBackParams)
    )
    .map((listener) => ({
      name: listener.to,
      componentPath: parentComponentPath, // new event is generated from the parent component
      payload: listener.withPayload
        ? listener.withPayload(callBackParams)
        : triggeringEvent.payload,
    }));
}

/**
 *
 * @param componentDef
 * @param componentStateTree
 * @param triggeringEvent
 * @returns commands to children (as events generated from specific children components, ie with a child key for collection children)
 */
function generateCommandsToChildren(
  componentDef: ComponentDef,
  triggeringEvent: GlobalEvent,
  stateManager: StateManager
): GlobalEvent[] {
  const childrenCommands = Object.entries(
    componentDef.childrenConfig ?? {}
  ).flatMap(([childName, childConfig]) =>
    (childConfig.commands ?? [])
      .filter((command) => command.from === triggeringEvent.name)
      .map((command) => ({ childName, command }))
  );

  if (childrenCommands.length === 0) {
    //no commands matching the event, no events to generate
    return [];
  }
  const callBackParams = prepareCallBackParams(
    componentDef,
    triggeringEvent,
    stateManager
  );
  return childrenCommands
    .filter(
      ({ command }) =>
        !command.onCondition || command.onCondition(callBackParams)
    )
    .flatMap(({ childName, command }) =>
      (command.toKeys ? command.toKeys(callBackParams) : [undefined]).map(
        (key) => ({ childName, command, key })
      )
    )
    .map(({ childName, command, key }) => ({
      name: command.to,
      componentPath: [...triggeringEvent.componentPath, [childName, key]],
      payload: command.withPayload
        ? command.withPayload(callBackParams)
        : triggeringEvent.payload,
    }));
}

/**
 * @param componentDef - Component definition with selectors and children
 * @param stateTree - Current state tree for the component
 * @param event - Event being processed
 * @returns Parameters for the onCondition  and withPayload functions
 */
function prepareCallBackParams(
  componentDef: ComponentDef,
  event: GlobalEvent,
  stateManager: StateManager
) {
  // Same structure as the state tree, but with values providers instead of states
  const { values, children } = createValueProviders(
    componentDef,
    new RelativePathStateManager(stateManager, event.componentPath)
  );
  // Event payload
  const payload = event.payload;

  // child key
  const fromChildKey =
    event.componentPath?.[event.componentPath?.length - 1]?.[1];

  return {
    values,
    children,
    payload,
    fromChildKey,
  };
}
