import { ComponentDef } from "@softer-components/types";

import { findComponentDefFromStatePath } from "../state/component-def-tree";
import { RelativePathStateReader } from "../state/relative-path-state-manager";
import { SofterRootState } from "../state/state-initializer";
import { StateReader } from "../state/state-manager";
import { StatePath } from "../state/state-path";
import { isUndefined } from "../utilities/assert.functions";
import { eventConsumerInputProvider } from "./event-consumer";
import { DISPATCHED_BY_EFFECT, SofterEvent } from "./softer-event";

export class EffectsManager {
  constructor(
    private readonly rootComponentDef: ComponentDef,
    private readonly stateReader: StateReader,
  ) {}
  async eventOccurred(
    event: SofterEvent,
    softerRootState: SofterRootState,
    dispatchEvent: (event: SofterEvent) => void,
  ) {
    const componentDefOfEvent = findComponentDefFromStatePath(
      this.rootComponentDef,
      event.statePath,
    );
    if (typeof componentDefOfEvent.effects !== "object") {
      return;
    }
    const effect = componentDefOfEvent.effects[event.name];
    if (isUndefined(effect)) {
      return Promise.resolve();
    }
    const relativePathStateManager = new RelativePathStateReader(
      softerRootState,
      this.stateReader,
      event.statePath,
    );
    const eventConsumerInput = eventConsumerInputProvider(
      this.rootComponentDef as ComponentDef,
      event,
      relativePathStateManager,
    );
    const dispatchers = createEventEffectDispatchers(
      event.statePath,
      dispatchEvent,
    );
    return effect(dispatchers, eventConsumerInput());
  }
}

const createEventEffectDispatchers = (
  statePath: StatePath,
  dispatchEvent: (event: SofterEvent) => void,
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
