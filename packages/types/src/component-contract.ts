import { EffectsDef } from "./component-def";
import { Payload } from "./event";
import { State } from "./state";

export type ComponentValuesContract = { [SelectorName in string]: any };

export type ComponentEventsContract<
  TEventNames extends readonly string[] = string[],
  TPayloads extends { [EventName in TEventNames[number]]?: Payload } = Record<
    TEventNames[number],
    Payload
  >,
> = {
  [TEventName in TEventNames[number]]: {
    payload: TPayloads[TEventName] extends infer TPayload extends Payload
      ? TPayload
      : undefined;
  };
};

/**
 * Contract of a component: defines how the component can be used by the UI and by other components
 *
 */
export type ComponentContract<EventNames extends string = string> = {
  state: State;
  values: ComponentValuesContract;
  events: ComponentEventsContract<EventNames[]>;
  children: Record<string, ComponentContract>;
  effects?: EffectsDef<EventNames[]>;
};
