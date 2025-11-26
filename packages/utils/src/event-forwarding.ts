import { ComponentDef } from "@softer-components/types";
import { GlobalEvent, GlobalState } from "./utils.type";
import { assertIsNotUndefined } from "./predicate.functions";
import { findComponentDef } from "./component-def-tree";
import { createValueProviders } from "./value-providers";
import { RelativePathStateManager } from "./relative-path-state-manager";

/**
 * Generate events to forward based on the triggering event
 */
export function generateEventsToForward(
  globalState: GlobalState,
  rootComponentDef: ComponentDef,
  triggeringEvent: GlobalEvent,
  stateManager: RelativePathStateManager
) {
  const result: GlobalEvent[] = [];

  const componentDef = findComponentDef(
    rootComponentDef,
    triggeringEvent.componentPath
  );

  result.push(
    ...generateEventsFromOwnComponent(
      globalState,
      componentDef,
      triggeringEvent,
      stateManager
    )
  );

  result.push(
    ...generateEventsFromParentChildListeners(
      globalState,
      rootComponentDef,
      triggeringEvent,
      stateManager
    )
  );

  result.push(
    ...generateCommandsToChildren(
      globalState,
      componentDef,
      triggeringEvent,
      stateManager
    )
  );

  return result;
}

function generateEventsFromOwnComponent(
  globalState: GlobalState,
  componentDef: ComponentDef,
  triggeringEvent: GlobalEvent,
  stateManager: RelativePathStateManager
): GlobalEvent[] {
  const forwarders = (componentDef.eventForwarders ?? []).filter(
    (forwarder) => forwarder.from === triggeringEvent.name
  );

  if (forwarders.length === 0) {
    return [];
  }

  const callBackParams = prepareCallBackParams(
    globalState,
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
      componentPath: triggeringEvent.componentPath,
      payload: forwarder.withPayload
        ? forwarder.withPayload(callBackParams)
        : triggeringEvent.payload,
    }));
}

function generateEventsFromParentChildListeners(
  globalState: GlobalState,
  rootComponentDef: ComponentDef<any>,
  triggeringEvent: GlobalEvent,
  stateManager: RelativePathStateManager
): GlobalEvent[] {
  if (!triggeringEvent.componentPath?.length) {
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
    return [];
  }

  const callBackParams = prepareCallBackParams(
    globalState,
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
      componentPath: parentComponentPath,
      payload: listener.withPayload
        ? listener.withPayload(callBackParams)
        : triggeringEvent.payload,
    }));
}

function generateCommandsToChildren(
  globalState: GlobalState,
  componentDef: ComponentDef,
  triggeringEvent: GlobalEvent,
  stateManager: RelativePathStateManager
): GlobalEvent[] {
  const childrenCommands = Object.entries(
    componentDef.childrenConfig ?? {}
  ).flatMap(([childName, childConfig]) =>
    (childConfig.commands ?? [])
      .filter((command) => command.from === triggeringEvent.name)
      .map((command) => ({ childName, command }))
  );

  if (childrenCommands.length === 0) {
    return [];
  }

  const callBackParams = prepareCallBackParams(
    globalState,
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

function prepareCallBackParams(
  globalState: GlobalState,
  componentDef: ComponentDef,
  event: GlobalEvent,
  stateManager: RelativePathStateManager
) {
  const { values, children } = createValueProviders(
    globalState,
    componentDef,
    stateManager
  );
  const payload = event.payload;
  const fromChildKey =
    event.componentPath?.[event.componentPath?.length - 1]?.[1];

  return {
    values,
    children,
    payload,
    fromChildKey,
  };
}
