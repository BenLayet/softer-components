import { ComponentContract } from "../../component-contract/component-contract";
import { Payload } from "../../component-contract/payload";
import { Values } from "../values/values";

export type EventConsumerInput<
  TPayload extends Payload = Payload,
  TComponentContract extends ComponentContract = ComponentContract,
> = Values<TComponentContract> & {
  payload: TPayload;
  childKey: string;
};
