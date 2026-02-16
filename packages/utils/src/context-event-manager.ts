import {
  ComponentContract,
  ComponentDef,
  EventConsumerInput,
} from "@softer-components/types";

import { findComponentDefFromStatePath } from "./component-def-tree";
import { eventConsumerInputProvider } from "./event-consumer";
import { FORWARDED_FROM_CONTEXT, GlobalEvent } from "./global-event";
import {
  StatePath,
  computeRelativePath,
  statePathStartsWith,
  statePathToComponentPath,
} from "./path";
import {
  assertIsNotUndefined,
  ensureIsNotUndefined,
} from "./predicate.functions";
import { RelativePathStateReader } from "./relative-path-state-manager";
import { SofterRootState } from "./state-initializer";
import { StateManager, StateReader, StateTreeListener } from "./state-manager";

type EventType = {
  componentPath: string;
  eventName: string;
};
const areEventTypesEqual = (eventType1: EventType, eventType2: EventType) =>
  eventType1.eventName === eventType2.eventName &&
  eventType1.componentPath === eventType2.componentPath;
const listenerMatchingEventType =
  (eventType: EventType) => (listener: EventListener) =>
    areEventTypesEqual(listener.from, eventType);

export type EventListener = {
  from: EventType;
  to: {
    statePath: StatePath;
    eventName: string;
  };
  withPayload?: (input: EventConsumerInput) => any; //function that returns the payload for the triggered event
  onCondition?: (input: EventConsumerInput) => boolean; //function that returns a boolean indicating whether the event should be triggered
};

export class ContextEventManager<T extends ComponentContract = any> {
  private listeners: EventListener[] = [];
  private readonly stateReader: StateReader;

  constructor(
    private readonly rootComponentDef: ComponentDef<T>,
    stateManager: StateManager,
  ) {
    this.stateReader = stateManager;
    stateManager.addStateTreeListener(
      stateTreeListener(rootComponentDef, this),
    );
  }

  registerListener(listener: EventListener) {
    this.listeners.push(listener);
  }
  unregisterListenerToStatePath = (statePath: StatePath) => {
    this.listeners = this.listeners.filter(
      listener => !statePathStartsWith(listener.to.statePath, statePath),
    );
  };

  generateEvents(
    rootState: SofterRootState,
    triggeringEvent: GlobalEvent,
  ): GlobalEvent[] {
    const componentPath = statePathToComponentPath(triggeringEvent.statePath);
    const triggeringEventType = {
      componentPath,
      eventName: triggeringEvent.name,
    };
    return this.listeners
      .filter(listenerMatchingEventType(triggeringEventType))
      .flatMap(this.generateEvent(rootState, triggeringEvent));
  }

  private generateEvent =
    (rootState: SofterRootState, triggeringEvent: GlobalEvent) =>
    (listener: EventListener): GlobalEvent[] => {
      const relativeStateReader = new RelativePathStateReader(
        rootState,
        this.stateReader,
        triggeringEvent.statePath,
      );
      const eventConsumerInput = eventConsumerInputProvider(
        this.rootComponentDef as ComponentDef,
        triggeringEvent,
        relativeStateReader,
      );

      if (!listener.onCondition || listener.onCondition(eventConsumerInput())) {
        return [
          {
            name: listener.to.eventName,
            statePath: listener.to.statePath,
            payload: listener.withPayload
              ? listener.withPayload(eventConsumerInput())
              : triggeringEvent.payload,
            source: FORWARDED_FROM_CONTEXT,
          },
        ];
      } else {
        return [];
      }
    };
}

const stateTreeListener = <T extends ComponentContract>(
  rootComponentDef: ComponentDef<T>,
  contextEventManager: ContextEventManager<T>,
): StateTreeListener => ({
  onStateAdded: statePath => {
    const componentDef = findComponentDefFromStatePath(
      rootComponentDef,
      statePath,
    );
    Object.entries(componentDef.contextsConfig ?? {}).forEach(
      ([contextName, contextConfig]) => {
        assertIsNotUndefined(contextConfig);
        const contextComponentStatePath = computeRelativePath(
          statePath,
          ensureIsNotUndefined(componentDef.contextDefs?.[contextName]),
        );
        const contextComponentPath = statePathToComponentPath(
          contextComponentStatePath,
        );
        const listenerDefs = contextConfig.listeners ?? [];
        listenerDefs.forEach(listenerDef => {
          contextEventManager.registerListener({
            from: {
              componentPath: contextComponentPath,
              eventName: listenerDef.from,
            },
            to: {
              statePath,
              eventName: listenerDef.to,
            },
            withPayload: listenerDef.withPayload,
            onCondition: listenerDef.onCondition,
          });
        });
      },
    );
  },
  onStateRemoved: contextEventManager.unregisterListenerToStatePath,
});
