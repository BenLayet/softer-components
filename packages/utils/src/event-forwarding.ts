import { ComponentDef, FromEventToChildEvent } from "@softer-components/types";

import { findComponentDef } from "./component-def-tree";
import { eventConsumerContextProvider } from "./event-consumer-context";
import {
  FORWARDED_FROM_CHILD_TO_PARENT,
  FORWARDED_FROM_PARENT_TO_CHILD,
  FORWARDED_INTERNALLY,
  GlobalEvent,
} from "./global-event";
import { assertIsNotUndefined } from "./predicate.functions";
import { RelativePathStateReader } from "./relative-path-state-manager";
import { SofterRootState } from "./state-initializer";
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
    triggeringEvent.statePath || [],
  );

  const componentDef = findComponentDef(
    rootComponentDef,
    triggeringEvent.statePath,
  );

  result.push(
    ...generateEventsToChildren(componentDef, triggeringEvent, stateReader),
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

  return result;
}

function generateEventsFromOwnComponent(
  componentDef: ComponentDef,
  triggeringEvent: GlobalEvent,
  stateReader: RelativePathStateReader,
): GlobalEvent[] {
  const forwarders = (componentDef.eventForwarders ?? []).filter(
    forwarder => forwarder.from === triggeringEvent.name,
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
      forwarder =>
        !forwarder.onCondition || forwarder.onCondition(eventContext()),
    )
    .map((forwarder: any) => ({
      name: forwarder.to,
      statePath: triggeringEvent.statePath,
      payload: forwarder.withPayload
        ? forwarder.withPayload(eventContext())
        : triggeringEvent.payload,
      source: FORWARDED_INTERNALLY,
    }));
}

function generateEventsToParent(
  rootComponentDef: ComponentDef,
  triggeringEvent: GlobalEvent,
  stateReader: RelativePathStateReader,
): GlobalEvent[] {
  if (!triggeringEvent.statePath?.length) {
    return [];
  }

  const parentComponentPath = triggeringEvent.statePath.slice(0, -1);
  const parentComponentDef = findComponentDef(
    rootComponentDef,
    parentComponentPath,
  );
  const childName =
    triggeringEvent.statePath[triggeringEvent.statePath.length - 1]?.[0];
  assertIsNotUndefined(childName);

  const childListeners = parentComponentDef.childrenConfig?.[
    childName
  ]?.listeners?.filter(listener => listener.from === triggeringEvent.name);

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
      listener => !listener.onCondition || listener.onCondition(eventContext()),
    )
    .map((listener: any) => ({
      name: listener.to,
      statePath: parentComponentPath,
      payload: listener.withPayload
        ? listener.withPayload(eventContext())
        : triggeringEvent.payload,
      source: FORWARDED_FROM_CHILD_TO_PARENT,
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
    (childConfig?.commands ?? [])
      .filter(command => command.from === triggeringEvent.name)
      .map(command => ({
        childName,
        command: command as FromEventToChildEvent<any, true, any, any>,
      })),
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
      ).map(childKey => ({ childName, command, childKey })),
    )
    .map(
      ({
        childName,
        command,
        childKey,
      }: {
        childName: string;
        childKey: string;
        command: any;
      }) => ({
        name: command.to,
        statePath: [...triggeringEvent.statePath, [childName, childKey]],
        payload: command.withPayload
          ? command.withPayload({ ...eventContext(), childKey })
          : triggeringEvent.payload,
        source: FORWARDED_FROM_PARENT_TO_CHILD,
      }),
    );
}
