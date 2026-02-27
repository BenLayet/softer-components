import { OptionalValue } from "./value";

export type Payload = OptionalValue;
export type Event<
  TPayload extends Payload = Payload,
  TEventName extends string = string,
> = {
  readonly name: TEventName;
  readonly payload?: TPayload;
};

type IsPropertyDefined<T, K extends string> = K extends keyof T
  ? T[K] extends undefined
    ? false
    : true
  : false;
export type Dispatcher<
  TPayloads extends Record<string, Payload>,
  EventName extends string,
> =
  IsPropertyDefined<TPayloads, EventName> extends false
    ? () => void
    : (payload: TPayloads[EventName]) => void;
