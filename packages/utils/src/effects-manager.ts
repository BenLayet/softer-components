import {
  ComponentContract,
  ComponentDef,
  ComponentTreePaths,
  Effect,
  Effects,
  GetContractAtPath,
  Payload,
} from "@softer-components/types";

import { findComponentDef } from "./component-def-tree";
import { eventConsumerContextProvider } from "./event-consumer-context";
import { isUndefined } from "./predicate.functions";
import { RelativePathStateReader } from "./relative-path-state-manager";
import { StateReader } from "./state-manager";
import { ComponentPath, GlobalEvent, SofterRootState } from "./utils.type";

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
      event.componentPath,
    );
    const effect = componentDefOfEvent.effects?.[event.name];
    if (isUndefined(effect)) {
      return Promise.resolve();
    }
    const relativePathStateManager = new RelativePathStateReader(
      softerRootState,
      this.stateReader,
      event.componentPath,
    );
    if (relativePathStateManager.readState()) {
    }

    const eventContext = eventConsumerContextProvider(
      componentDefOfEvent,
      event,
      relativePathStateManager,
    );
    const dispatchers = createEventEffectDispatchers(
      event.componentPath,
      dispatchEvent,
    );
    return effect(dispatchers, eventContext()) ?? Promise.resolve();
  }
}

const createEventEffectDispatchers = (
  componentPath: ComponentPath,
  dispatchEvent: (event: GlobalEvent) => void,
) =>
  new Proxy(
    {},
    {
      get: (_, prop: string) => (payload?: any) =>
        dispatchEvent({
          componentPath,
          name: prop,
          payload,
          source: "📡",
        }),
    },
  );
