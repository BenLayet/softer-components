import { ComponentContract } from "./component-contract";
import { Dispatcher } from "./event";
import { EventConsumerContext } from "./event-consumer";

export type EffectsDef<TEventNames extends string> = {
  [TEventName in TEventNames]?: TEventNames[];
};
type TriggerableEventNames<
  T extends EffectsDef<string>,
  TEventName extends keyof T,
> = T[TEventName] extends string[] ? T[TEventName][number] : never;
export type Effect<
  TComponentContract extends ComponentContract = ComponentContract,
  TEffectsDef extends EffectsDef<keyof TComponentContract["events"] & string> =
    EffectsDef<keyof TComponentContract["events"] & string>,
  TEventName extends keyof TComponentContract["events"] & keyof TEffectsDef =
    keyof TComponentContract["events"] & keyof TEffectsDef,
> = (
  dispatchers: {
    [TTriggerableEventName in TriggerableEventNames<
      TEffectsDef,
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
  T extends ComponentContract,
  TEffectsDef extends EffectsDef<keyof T["events"] & string>,
> = {
  [TEventName in keyof TEffectsDef & keyof T["events"] & string]: Effect<
    T,
    TEffectsDef,
    TEventName
  >;
};
