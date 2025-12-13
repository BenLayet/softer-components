import { OptionalValue } from "./value";

export type Payload = OptionalValue;
export type Event<
  TPayload extends Payload = Payload,
  TEventName extends string = string,
> = {
  readonly name: TEventName;
  readonly payload: TPayload;
};

export type Dispatcher<TPayload extends Payload = Payload> =
  TPayload extends undefined ? () => void : (payload: TPayload) => void;
