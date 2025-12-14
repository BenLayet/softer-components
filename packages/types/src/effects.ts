import { ComponentContract } from "./component-contract";
import { Dispatcher } from "./event";
import { EventConsumerContext } from "./event-consumer";

type TriggerableEventNames<
  TComponentContract extends ComponentContract = ComponentContract,
  TEventName extends keyof TComponentContract["events"] =
    keyof TComponentContract["events"],
> = TComponentContract["events"][TEventName]["canTrigger"] extends string[]
  ? TComponentContract["events"][TEventName]["canTrigger"][number]
  : never;

export type Effect<
  TComponentContract extends ComponentContract = ComponentContract,
  TEventName extends keyof TComponentContract["events"] =
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

export type Effects<
  TComponentContract extends ComponentContract = ComponentContract,
> = {
  [TEventName in keyof TComponentContract["events"] & string]?: Effect<
    TComponentContract,
    TEventName
  >;
};

export type EventEffectDispatchers<
  TComponentContract extends ComponentContract = ComponentContract,
  TEventName extends keyof TComponentContract["events"] =
    keyof TComponentContract["events"],
> = {
  [TTriggerableEventName in TComponentContract["events"][TEventName]["canTrigger"] &
    string]: Dispatcher<TComponentContract["events"][TEventName]["payload"]>;
};
export type ComponentEffectsDispatchers<
  TComponentContract extends ComponentContract = ComponentContract,
> = {
  [TEventName in keyof TComponentContract["events"]]: TComponentContract["events"][TEventName]["canTrigger"] extends undefined
    ? never
    : EventEffectDispatchers<TComponentContract, TEventName>;
};
