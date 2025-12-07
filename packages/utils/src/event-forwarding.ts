import { GlobalEvent, SofterRootState } from "./utils.type";
import { assertIsNotUndefined } from "./predicate.functions";
import { findComponentDef } from "./component-def-tree";
import { RelativePathStateReader } from "./relative-path-state-manager";
import { StateReader } from "./state-manager";
import { eventConsumerContextProvider } from "./event-consumer-context";
import { ComponentDef } from "@softer-components/types";

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
    ...generateEventsToParent(rootComponentDef, triggeringEvent, stateReader),
  );

  result.push(
    ...generateEventsToChildren(componentDef, triggeringEvent, stateReader),
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

  const eventContext = eventConsumerContextProvider(
    componentDef,
    triggeringEvent,
    stateReader,
  );

  return forwarders
    .filter(
      (forwarder) =>
        !forwarder.onCondition || forwarder.onCondition(eventContext()),
    )
    .map((forwarder) => ({
      name: forwarder.to,
      componentPath: triggeringEvent.componentPath,
      payload: forwarder.withPayload
        ? forwarder.withPayload(eventContext())
        : triggeringEvent.payload,
      source: "➡️",
    }));
}

function generateEventsToParent(
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
  const eventContext = eventConsumerContextProvider(
    parentComponentDef,
    triggeringEvent,
    stateReader.parentStateReader(),
  );

  return childListeners
    .filter(
      (listener) =>
        !listener.onCondition || listener.onCondition(eventContext()),
    )
    .map((listener) => ({
      name: listener.to,
      componentPath: parentComponentPath,
      payload: listener.withPayload
        ? listener.withPayload(eventContext())
        : triggeringEvent.payload,
      source: "👂",
    }));
}

function generateEventsToChildren(
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

  const eventContext = eventConsumerContextProvider(
    componentDef,
    triggeringEvent,
    stateReader,
  );

  return childrenCommands
    .filter(
      ({ command }) =>
        !command.onCondition || command.onCondition(eventContext()),
    )
    .flatMap(({ childName, command }) =>
      (command.toKeys
        ? command.toKeys(eventContext())
        : // default to all children
          stateReader.getChildrenKeys()[childName]
      ).map((childKey) => ({ childName, command, childKey })),
    )
    .map(({ childName, command, childKey }) => ({
      name: command.to,
      componentPath: [...triggeringEvent.componentPath, [childName, childKey]],
      payload: command.withPayload
        ? command.withPayload({ ...eventContext(), childKey })
        : triggeringEvent.payload,
      source: "📢",
    }));
}
