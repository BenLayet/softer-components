import { ComponentPath, GlobalEvent, SofterRootState } from "./utils.type";
import { Effect, Effects, Unregister } from "./effects";
import { isUndefined } from "./predicate.functions";
import { eventConsumerContextProvider } from "./event-consumer-context";
import {
  ComponentContract,
  ComponentDef,
  EventEffectDispatchers,
  ExtractEventNames,
  Payload,
} from "@softer-components/types";
import { StateReader } from "./state-manager";
import { findComponentDef } from "./component-def-tree";
import { RelativePathStateReader } from "./relative-path-state-manager";
import { componentPathToString } from "./component-path";

export class EffectsManager {
  private readonly effectsMap: {
    [pathStr: string]: { [eventName: string]: Effect[] };
  } = {};

  constructor(
    private readonly rootComponentDef: ComponentDef,
    private readonly stateReader: StateReader,
  ) {}

  registerEffects = (pathStr: string, effects: Effects<any>): Unregister => {
    const unregisterFunctions = Object.entries(effects).map(
      ([eventName, effect]) => this.registerEffect(pathStr, eventName, effect),
    );
    return () => unregisterFunctions.forEach((f) => f());
  };
  registerEffect<
    TComponentContract extends ComponentContract,
    TEventName extends ExtractEventNames<TComponentContract> & string,
  >(pathStr: string, eventName: TEventName, effect: Effect): Unregister {
    if (isUndefined(this.effectsMap[pathStr])) {
      this.effectsMap[pathStr] = {};
    }
    if (isUndefined(this.effectsMap[pathStr][eventName])) {
      this.effectsMap[pathStr][eventName] = [];
    }
    if (this.effectsMap[pathStr][eventName].includes(effect)) {
      throw new Error("Effect already registered");
    }
    this.effectsMap[pathStr][eventName].push(effect);
    return () => {
      this.effectsMap[pathStr][eventName] = this.effectsMap[pathStr][
        eventName
      ].filter((f) => f !== effect);
      if (this.effectsMap[pathStr][eventName].length === 0) {
        delete this.effectsMap[pathStr][eventName];
      }
      if (Object.keys(this.effectsMap[pathStr]).length === 0) {
        delete this.effectsMap[pathStr];
      }
    };
  }
  eventOccurred(
    event: GlobalEvent,
    softerRootState: SofterRootState,
    dispatchEvent: (event: GlobalEvent) => void,
  ): void {
    const pathStr = componentPathToString(event.componentPath);
    const effects = this.effectsMap[pathStr]?.[event.name] as
      | Effect[]
      | undefined;
    if (isUndefined(effects)) {
      return;
    }
    const componentDefOfEvent = findComponentDef(
      this.rootComponentDef,
      event.componentPath,
    );

    const relativePathStateManager = new RelativePathStateReader(
      softerRootState,
      this.stateReader,
      event.componentPath,
    );
    const eventContext = eventConsumerContextProvider(
      componentDefOfEvent,
      event,
      relativePathStateManager,
    );
    const dispatchers = createEventEffectDispatchers(
      event.name,
      componentDefOfEvent,
      event.componentPath,
      dispatchEvent,
    );
    effects.forEach((effect) => effect(dispatchers, eventContext()));
  }
}

const createEventEffectDispatchers = (
  triggeringEventName: string,
  componentDef: ComponentDef,
  componentPath: ComponentPath,
  dispatchEvent: (event: GlobalEvent) => void,
): EventEffectDispatchers =>
  Object.fromEntries(
    (componentDef["effects"]?.[triggeringEventName] ?? []).map(
      (dispatchableEventName: string) => [
        dispatchableEventName,
        (payload: Payload) =>
          dispatchEvent({
            componentPath,
            name: dispatchableEventName,
            payload,
          }),
      ],
    ),
  ) as EventEffectDispatchers;
