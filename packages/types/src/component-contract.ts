import { EffectsDef } from "./component-def";
import { Payload } from "./event";

export type ComponentValuesContract = { [SelectorName in string]: any };

export type ComponentEventsContract<
  TEventNames extends string = string, // expect union
  TPayloads extends { [EventName in TEventNames]?: Payload } = Record<
    TEventNames,
    undefined
  >,
> = {
  [TEventName in TEventNames]: {
    payload: TPayloads[TEventName] extends infer TPayload extends Payload
      ? TPayload
      : undefined;
  };
};

export type ChildInstanceContract =
  | { isOptional?: false; isCollection?: false }
  | { isCollection: true; isOptional?: false }
  | { isOptional: true; isCollection?: false }; // allows for type narrowing

/**
 * Contract of a component: defines how the component can be used by the UI and by other components
 *
 */
export type ComponentContract<TEventNames extends string = string> = {
  values: ComponentValuesContract;
  events: ComponentEventsContract<
    TEventNames,
    { [EventName in TEventNames]?: Payload }
  >;
  children: Record<string, ComponentContract & ChildInstanceContract>;
  effects?: EffectsDef<TEventNames>;
};
