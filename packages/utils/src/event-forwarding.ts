import { ComponentDef, FromEventToChildEvent } from "@softer-components/types";

import { findComponentDefFromStatePath } from "./component-def-tree";
import { ContextEventManager } from "./context-event-manager";
import { eventConsumerInputProvider } from "./event-consumer";
import {
  FORWARDED_FROM_CHILD_TO_PARENT,
  FORWARDED_FROM_PARENT_TO_CHILD,
  FORWARDED_INTERNALLY,
  FORWARDED_TO_CONTEXT,
  GlobalEvent,
} from "./global-event";
import { computeRelativePath } from "./path";
import {
  assertIsNotUndefined,
  ensureIsNotUndefined,
} from "./predicate.functions";
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
  contextEventManager: ContextEventManager,
) {
  const result: GlobalEvent[] = [];
  const stateReader = new RelativePathStateReader(
    softerRootState,
    absoluteStateReader,
    triggeringEvent.statePath || [],
  );

  result.push(
    ...generateEventsToChildren(rootComponentDef, triggeringEvent, stateReader),
  );

  result.push(
    ...generateEventsFromOwnComponent(
      rootComponentDef,
      triggeringEvent,
      stateReader,
    ),
  );

  result.push(
    ...generateEventsToParent(rootComponentDef, triggeringEvent, stateReader),
  );
  result.push(
    ...generateEventsToContext(rootComponentDef, triggeringEvent, stateReader),
  );
  result.push(
    ...contextEventManager.generateEvents(softerRootState, triggeringEvent),
  );
  return result;
}

function generateEventsFromOwnComponent(
  rootComponentDef: ComponentDef,
  triggeringEvent: GlobalEvent,
  stateReader: RelativePathStateReader,
): GlobalEvent[] {
  const componentDef = findComponentDefFromStatePath(
    rootComponentDef,
    triggeringEvent.statePath,
  );
  if (typeof componentDef.eventForwarders !== "object") return [];
  const forwarders = componentDef.eventForwarders.filter(
    forwarder => forwarder.from === triggeringEvent.name,
  );

  if (forwarders.length === 0) {
    return [];
  }

  const eventConsumerInput = eventConsumerInputProvider(
    rootComponentDef,
    triggeringEvent,
    stateReader,
  );

  return forwarders
    .filter(
      forwarder =>
        !forwarder.onCondition || forwarder.onCondition(eventConsumerInput()),
    )
    .map((forwarder: any) => ({
      name: forwarder.to,
      statePath: triggeringEvent.statePath,
      payload: forwarder.withPayload
        ? forwarder.withPayload(eventConsumerInput())
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
  const parentComponentDef = findComponentDefFromStatePath(
    rootComponentDef,
    parentComponentPath,
  );
  const childName =
    triggeringEvent.statePath[triggeringEvent.statePath.length - 1]?.[0];
  assertIsNotUndefined(childName);

  if (typeof parentComponentDef.childrenConfig !== "object") return [];
  const childListeners = parentComponentDef.childrenConfig[
    childName
  ]?.listeners?.filter(listener => listener.from === triggeringEvent.name);

  if (!childListeners || childListeners.length === 0) {
    return [];
  }
  const eventConsumerInput = eventConsumerInputProvider(
    rootComponentDef as ComponentDef,
    triggeringEvent,
    stateReader.parentStateReader(),
  );

  return childListeners
    .filter(
      listener =>
        !listener.onCondition || listener.onCondition(eventConsumerInput()),
    )
    .map((listener: any) => ({
      name: listener.to,
      statePath: parentComponentPath,
      payload: listener.withPayload
        ? listener.withPayload(eventConsumerInput())
        : triggeringEvent.payload,
      source: FORWARDED_FROM_CHILD_TO_PARENT,
    }));
}

function generateEventsToChildren(
  rootComponentDef: ComponentDef,
  triggeringEvent: GlobalEvent,
  stateReader: RelativePathStateReader,
): GlobalEvent[] {
  const componentDef = findComponentDefFromStatePath(
    rootComponentDef,
    triggeringEvent.statePath,
  );

  if (typeof componentDef.childrenConfig !== "object") return [];
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
  const eventConsumerInput = eventConsumerInputProvider(
    rootComponentDef,
    triggeringEvent,
    stateReader,
  );

  return childrenCommands
    .filter(
      ({ command }) =>
        !command.onCondition || command.onCondition(eventConsumerInput()),
    )
    .flatMap(({ childName, command }) =>
      (command.toKeys
        ? command.toKeys(eventConsumerInput())
        : // default to all children
          (stateReader.getChildrenKeys()[childName] as string[])
      ).map(childKey => ({ childName, command, childKey })),
    )
    .map(({ childName, command, childKey }) => ({
      name: command.to,
      statePath: [...triggeringEvent.statePath, [childName, childKey]],
      payload: command.withPayload
        ? (command as any).withPayload({ ...eventConsumerInput(), childKey })
        : triggeringEvent.payload,
      source: FORWARDED_FROM_PARENT_TO_CHILD,
    }));
}

function generateEventsToContext(
  rootComponentDef: ComponentDef,
  triggeringEvent: GlobalEvent,
  stateReader: RelativePathStateReader,
): GlobalEvent[] {
  const componentDef = findComponentDefFromStatePath(
    rootComponentDef,
    triggeringEvent.statePath,
  );
  if (typeof componentDef.contextsConfig !== "object") return [];
  const contextCommands = Object.entries(
    componentDef.contextsConfig ?? {},
  ).flatMap(([contextName, contextConfig]) =>
    (contextConfig?.commands ?? [])
      .filter(command => command.from === triggeringEvent.name)
      .map(command => ({
        contextName,
        command: command as FromEventToChildEvent<any, true, any, any>,
      })),
  );

  if (contextCommands.length === 0) {
    return [];
  }
  const eventConsumerInput = eventConsumerInputProvider(
    rootComponentDef,
    triggeringEvent,
    stateReader,
  );
  return contextCommands
    .filter(
      ({ command }) =>
        !command.onCondition || command.onCondition(eventConsumerInput()),
    )
    .map(({ contextName, command }) => ({
      name: command.to,
      statePath: computeRelativePath(
        triggeringEvent.statePath,
        ensureIsNotUndefined(componentDef.contextDefs?.[contextName]),
      ),
      payload: command.withPayload
        ? (command as any).withPayload({ ...eventConsumerInput() })
        : triggeringEvent.payload,
      source: FORWARDED_TO_CONTEXT,
    }));
}
