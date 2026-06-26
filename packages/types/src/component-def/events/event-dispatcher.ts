import { Payload } from "../../component-contract/payload";

export type Dispatcher<
  TPayloads extends Record<string, Payload>,
  EventName extends string,
> =
  IsPropertyDefined<TPayloads, EventName> extends false
    ? () => void
    : (payload: TPayloads[EventName]) => void;

type IsPropertyDefined<T, K extends string> = K extends keyof T
  ? T[K] extends undefined
    ? false
    : true
  : false;
