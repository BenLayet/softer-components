import { ComponentDef } from "@softer-components/types";

import { findComponentDefFromStatePath } from "./component-def-tree";
import { eventConsumerInputProvider } from "./event-consumer";
import { DISPATCHED_BY_EFFECT, GlobalEvent } from "./global-event";
import { StatePath } from "./path";
import { isUndefined } from "./predicate.functions";
import { RelativePathStateReader } from "./relative-path-state-manager";
import { SofterRootState } from "./state-initializer";
import { StateReader } from "./state-manager";

export class EffectsManager {
  constructor(
    private readonly rootComponentDef: ComponentDef,
    private readonly stateReader: StateReader,
  ) {}
  eventOccurred(
    event: GlobalEvent,
    softerRootState: SofterRootState,
    dispatchEvent: (event: GlobalEvent) => void,
  ): Promise<void> {
    const componentDefOfEvent = findComponentDefFromStatePath(
      this.rootComponentDef,
      event.statePath,
    );
    const effect = componentDefOfEvent.effects?.[event.name];
    if (isUndefined(effect)) {
      return Promise.resolve();
    }
    const relativePathStateManager = new RelativePathStateReader(
      softerRootState,
      this.stateReader,
      event.statePath,
    );
    if (relativePathStateManager.readState()) {
    }

    const eventConsumerInput = eventConsumerInputProvider(
      this.rootComponentDef as ComponentDef,
      event,
      relativePathStateManager,
    );
    const dispatchers = createEventEffectDispatchers(
      event.statePath,
      dispatchEvent,
    );
    return effect(dispatchers, eventConsumerInput()) ?? Promise.resolve();
  }
}

const createEventEffectDispatchers = (
  statePath: StatePath,
  dispatchEvent: (event: GlobalEvent) => void,
) =>
  new Proxy(
    {},
    {
      get: (_, prop: string) => (payload?: any) =>
        dispatchEvent({
          statePath: statePath,
          name: prop,
          payload,
          source: DISPATCHED_BY_EFFECT,
        }),
    },
  );
