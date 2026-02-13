import { ComponentContract } from "./component-contract";
import { Payload } from "./event";
import { Values } from "./values";

export type EventConsumerInput<
  TPayload extends Payload = Payload,
  TComponentContract extends ComponentContract = ComponentContract,
> = Values<TComponentContract> & {
  payload: TPayload;
  childKey: string;
};
