import { Payload } from "./event";

export type ValuesContract = { [SelectorName in string]: any };

export type EventsContract<
  TEventNames extends string = string, // expect union
  TPayloads extends { [EventName in TEventNames]?: Payload } = any,
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

export type ChildrenContract = Record<
  string,
  ComponentContract & ChildInstanceContract
>;
export type ContextContract = Record<string, ComponentContract>;

/**
 * Contract of a component: defines how the component can be used by the UI and by other components
 *
 */
export type ComponentContract = {
  values: ValuesContract;
  events: EventsContract;
  children: ChildrenContract;
  context?: ContextContract;
};
