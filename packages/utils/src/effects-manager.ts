import {
  ComponentContract,
  ComponentDef,
  Effect,
  Effects,
  Payload,
} from "@softer-components/types";

import { findComponentDef } from "./component-def-tree";
import { eventConsumerContextProvider } from "./event-consumer-context";
import { isUndefined } from "./predicate.functions";
import { RelativePathStateReader } from "./relative-path-state-manager";
import { StateReader } from "./state-manager";
import { ComponentPath, GlobalEvent, SofterRootState } from "./utils.type";

type Unregister = () => void;
// Recursive type to get all component paths
export type ComponentPaths<T> =
  | "/"
  | (T extends { children: infer C }
      ? C extends Record<string, any>
        ? {
            [K in keyof C & string]:
              | `/${K}`
              | `/${K}${Exclude<ComponentPaths<C[K]>, "/">}`;
          }[keyof C & string]
        : never
      : never);

// Utility type to get ComponentContract at a specific path
export type GetContractAtPath<T, Path extends string> = Path extends "/"
  ? T
  : Path extends `/${infer First}/${infer Rest}`
    ? T extends { children: infer C }
      ? First extends keyof C
        ? GetContractAtPath<C[First], `/${Rest}`>
        : never
      : never
    : Path extends `/${infer Only}`
      ? T extends { children: infer C }
        ? Only extends keyof C
          ? C[Only]
          : never
        : never
      : never;

export class EffectsManager<TRootComponentContract extends ComponentContract> {
  private readonly effectsMap: {
    [componentDefPath: string]: { [eventName: string]: Effect[] };
  } = {};

  constructor(
    private readonly rootComponentDef: ComponentDef<TRootComponentContract>,
    private readonly stateReader: StateReader,
  ) {}
  configureEffects = <Path extends ComponentPaths<TRootComponentContract>>(
    componentDefPath: Path,
    effects: Effects<GetContractAtPath<TRootComponentContract, Path>>,
  ) => {
    return this._registerEffects<
      GetContractAtPath<TRootComponentContract, Path>
    >(componentDefPath, effects);
  };
  private _registerEffects = <TComponentContract extends ComponentContract>(
    componentDefPath: string,
    effects: Effects<TComponentContract>,
  ): Unregister => {
    const unregisterFunctions = Object.entries(effects).map(
      ([eventName, effect]) =>
        this._registerEffect(componentDefPath, eventName, effect as Effect),
    );
    return () => unregisterFunctions.forEach(f => f());
  };

  private _registerEffect<
    TComponentContract extends ComponentContract,
    TEventName extends keyof TComponentContract["events"] & string,
  >(
    componentDefPath: string,
    eventName: TEventName,
    effect: Effect,
  ): Unregister {
    if (isUndefined(this.effectsMap[componentDefPath])) {
      this.effectsMap[componentDefPath] = {};
    }
    if (isUndefined(this.effectsMap[componentDefPath][eventName])) {
      this.effectsMap[componentDefPath][eventName] = [];
    }
    if (this.effectsMap[componentDefPath][eventName].includes(effect)) {
      throw new Error("Effect already registered");
    }
    this.effectsMap[componentDefPath][eventName].push(effect);
    return () => {
      this.effectsMap[componentDefPath][eventName] = this.effectsMap[
        componentDefPath
      ][eventName].filter(f => f !== effect);
      if (this.effectsMap[componentDefPath][eventName].length === 0) {
        delete this.effectsMap[componentDefPath][eventName];
      }
      if (Object.keys(this.effectsMap[componentDefPath]).length === 0) {
        delete this.effectsMap[componentDefPath];
      }
    };
  }

  eventOccurred(
    event: GlobalEvent,
    softerRootState: SofterRootState,
    dispatchEvent: (event: GlobalEvent) => void,
  ): void {
    const componentDefPath =
      "/" + event.componentPath.map(([child, _key]) => child).join("/");
    const effects = this.effectsMap[componentDefPath]?.[event.name] as
      | Effect[]
      | undefined;
    if (isUndefined(effects)) {
      return;
    }
    const relativePathStateManager = new RelativePathStateReader(
      softerRootState,
      this.stateReader,
      event.componentPath,
    );
    if (relativePathStateManager.readState()) {
    }
    const componentDefOfEvent = findComponentDef(
      this.rootComponentDef,
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
    effects.forEach(effect => effect(dispatchers, eventContext()));
  }
}

const createEventEffectDispatchers = (
  triggeringEventName: string,
  componentDef: ComponentDef,
  componentPath: ComponentPath,
  dispatchEvent: (event: GlobalEvent) => void,
) =>
  Object.fromEntries(
    (componentDef["effects"]?.[triggeringEventName] ?? []).map(
      (dispatchableEventName: string) => [
        dispatchableEventName,
        (payload: Payload) =>
          dispatchEvent({
            componentPath,
            name: dispatchableEventName,
            payload,
            source: "📡",
          }),
      ],
    ),
  );
