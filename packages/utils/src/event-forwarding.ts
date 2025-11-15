import { ComponentDef, Payload, State } from "@softer-components/types";
import {
  createValuesProvider,
  findComponentDef,
  findSubStateTree,
} from "./component-def-tree";
import { GlobalEvent, StateTree } from "./constants";
import { assertIsNotUndefined } from "./predicate.functions";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// FORWARDING EVENTS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
export function generateEventsToForward(
  rootComponentDef: ComponentDef,
  globalStateTree: StateTree,
  triggeringEvent: GlobalEvent
) {
  const result: GlobalEvent[] = [];

  const componentStateTree = findSubStateTree(
    globalStateTree,
    triggeringEvent.componentPath
  );
  const componentDef = findComponentDef(
    rootComponentDef,
    triggeringEvent.componentPath
  );

  // Create events to forward for the component that the event was dispatched to
  result.push(
    ...generateEventsFromOwnComponent(
      componentDef,
      componentStateTree,
      triggeringEvent
    )
  );

  // Create events to forward from the parent component listening to child events
  result.push(
    ...generateEventsFromParentChildListeners(
      rootComponentDef,
      globalStateTree,
      triggeringEvent
    )
  );

  // Create events to forward for the component that the event was dispatched to
  result.push(
    ...generateCommandsToChildren(
      componentDef,
      componentStateTree,
      triggeringEvent
    )
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
  componentStateTree: StateTree,
  triggeringEvent: GlobalEvent
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
    componentStateTree,
    triggeringEvent
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
  rootComponentDef: ComponentDef,
  globalStateTree: StateTree,
  triggeringEvent: GlobalEvent
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
  const parentStateTree = findSubStateTree(
    globalStateTree,
    parentComponentPath
  );
  const callBackParams = prepareCallBackParams(
    parentComponentDef,
    parentStateTree,
    triggeringEvent
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
  componentStateTree: StateTree,
  triggeringEvent: GlobalEvent
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
    componentStateTree,
    triggeringEvent
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
  stateTree: StateTree,
  event: GlobalEvent
) {
  // Same structure as the state tree, but with values providers instead of states
  const { selectors, children } = createValuesProvider(componentDef, stateTree);

  // Event payload
  const payload = event.payload;

  // child key
  const fromChildKey =
    event.componentPath?.[event.componentPath?.length - 1]?.[1];

  return {
    selectors,
    children,
    payload,
    fromChildKey,
  };
}
