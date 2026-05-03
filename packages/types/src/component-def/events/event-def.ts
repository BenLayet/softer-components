import { Payload } from "../../component-contract/payload";

export type EventDef<
  TPayload extends Payload = Payload,
  TEventName extends string = string,
> = {
  readonly name: TEventName;
  readonly payload?: TPayload;
};
