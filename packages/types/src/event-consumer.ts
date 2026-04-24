import { ComponentContract } from "./component-contract";
import { Payload } from "./data";
import { Values } from "./values";

export type EventConsumerInput<
  TPayload extends Payload = Payload,
  TComponentContract extends ComponentContract = ComponentContract,
> = Values<TComponentContract> & {
  payload: TPayload;
  childKey: string;
};
