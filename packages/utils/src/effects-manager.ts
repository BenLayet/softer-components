import { ComponentContract, ComponentDef } from "@softer-components/types";

import { findComponentDef } from "./component-def-tree";
import { eventConsumerContextProvider } from "./event-consumer-context";
import { DISPATCHED_BY_EFFECT, GlobalEvent } from "./global-event";
import { isUndefined } from "./predicate.functions";
import { RelativePathStateReader } from "./relative-path-state-manager";
import { SofterRootState } from "./state-initializer";
import { StateReader } from "./state-manager";
import { StatePath } from "./state-tree";

export class EffectsManager<TRootComponentContract extends ComponentContract> {
  constructor(
    private readonly rootComponentDef: ComponentDef<TRootComponentContract>,
    private readonly stateReader: StateReader,
  ) {}
  eventOccurred(
    event: GlobalEvent,
    softerRootState: SofterRootState,
    dispatchEvent: (event: GlobalEvent) => void,
  ): Promise<void> {
    const componentDefOfEvent = findComponentDef(
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

    const eventContext = eventConsumerContextProvider(
      componentDefOfEvent,
      event,
      relativePathStateManager,
    );
    const dispatchers = createEventEffectDispatchers(
      event.statePath,
      dispatchEvent,
    );
    return effect(dispatchers, eventContext()) ?? Promise.resolve();
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
