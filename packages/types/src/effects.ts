import { ComponentContract } from "./component-contract";
import { Dispatcher } from "./event";
import { EventConsumerContext } from "./event-consumer";

type TriggerableEventNames<
  TComponentContract extends ComponentContract,
  TEventName extends keyof TComponentContract["effects"] &
    keyof TComponentContract["events"],
> = TComponentContract["effects"][TEventName] extends string[]
  ? TComponentContract["effects"][TEventName][number]
  : never;
export type Effect<
  TComponentContract extends ComponentContract = ComponentContract,
  TEventName extends keyof TComponentContract["effects"] &
    keyof TComponentContract["events"] = keyof TComponentContract["effects"] &
    keyof TComponentContract["events"],
> = (
  dispatchers: {
    [TTriggerableEventName in TriggerableEventNames<
      TComponentContract,
      TEventName
    >]: Dispatcher<
      TComponentContract["events"][TTriggerableEventName]["payload"]
    >;
  },
  eventContext: EventConsumerContext<
    TComponentContract["events"][TEventName]["payload"],
    TComponentContract
  >,
) => void | Promise<void>;

export type Effects<TComponentContract extends ComponentContract> = {
  [TEventName in keyof TComponentContract["effects"] &
    keyof TComponentContract["events"]]: Effect<TComponentContract, TEventName>;
};
