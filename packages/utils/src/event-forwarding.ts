import { ComponentDef } from "@softer-components/types";
import { GlobalEvent, SofterRootState } from "./utils.type";
import { assertIsNotUndefined } from "./predicate.functions";
import { findComponentDef } from "./component-def-tree";
import { createValueProviders } from "./value-providers";
import { RelativePathStateReader } from "./relative-path-state-manager";
import { StateReader } from "./state-manager";

/**
 * Generate events to forward based on the triggering event
 */
export function generateEventsToForward(
  softerRootState: SofterRootState,
  rootComponentDef: ComponentDef,
  triggeringEvent: GlobalEvent,
  absoluteStateReader: StateReader,
) {
  const result: GlobalEvent[] = [];
  const stateReader = new RelativePathStateReader(
    softerRootState,
    absoluteStateReader,
    triggeringEvent.componentPath || [],
  );

  const componentDef = findComponentDef(
    rootComponentDef,
    triggeringEvent.componentPath,
  );

  result.push(
    ...generateEventsFromOwnComponent(
      componentDef,
      triggeringEvent,
      stateReader,
    ),
  );

  result.push(
    ...generateEventsFromParentChildListeners(
      rootComponentDef,
      triggeringEvent,
      stateReader,
    ),
  );

  result.push(
    ...generateCommandsToChildren(componentDef, triggeringEvent, stateReader),
  );

  return result;
}

function generateEventsFromOwnComponent(
  componentDef: ComponentDef,
  triggeringEvent: GlobalEvent,
  stateReader: RelativePathStateReader,
): GlobalEvent[] {
  const forwarders = (componentDef.eventForwarders ?? []).filter(
    (forwarder) => forwarder.from === triggeringEvent.name,
  );

  if (forwarders.length === 0) {
    return [];
  }

  const callBackParams = prepareCallBackParams(
    componentDef,
    triggeringEvent,
    stateReader,
  );

  return forwarders
    .filter(
      (forwarder) =>
        !forwarder.onCondition || forwarder.onCondition(callBackParams),
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
  rootComponentDef: ComponentDef,
  triggeringEvent: GlobalEvent,
  stateReader: RelativePathStateReader,
): GlobalEvent[] {
  if (!triggeringEvent.componentPath?.length) {
    return [];
  }

  const parentComponentPath = triggeringEvent.componentPath.slice(0, -1);
  const parentComponentDef = findComponentDef(
    rootComponentDef,
    parentComponentPath,
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
    parentComponentDef,
    triggeringEvent,
    stateReader,
  );

  return childListeners
    .filter(
      (listener) =>
        !listener.onCondition || listener.onCondition(callBackParams),
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
  componentDef: ComponentDef,
  triggeringEvent: GlobalEvent,
  stateReader: RelativePathStateReader,
): GlobalEvent[] {
  const childrenCommands = Object.entries(
    componentDef.childrenConfig ?? {},
  ).flatMap(([childName, childConfig]) =>
    (childConfig.commands ?? [])
      .filter((command) => command.from === triggeringEvent.name)
      .map((command) => ({ childName, command })),
  );

  if (childrenCommands.length === 0) {
    return [];
  }

  const callBackParams = prepareCallBackParams(
    componentDef,
    triggeringEvent,
    stateReader,
  );

  return childrenCommands
    .filter(
      ({ command }) =>
        !command.onCondition || command.onCondition(callBackParams),
    )
    .flatMap(({ childName, command }) =>
      (command.toKeys ? command.toKeys(callBackParams) : [undefined]).map(
        (key) => ({ childName, command, key }),
      ),
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
  componentDef: ComponentDef,
  event: GlobalEvent,
  stateReader: RelativePathStateReader,
) {
  const { values, children } = createValueProviders(componentDef, stateReader);
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
