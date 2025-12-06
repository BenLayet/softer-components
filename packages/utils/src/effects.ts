import {
  ComponentContract,
  Dispatcher,
  Payload,
} from "@softer-components/types";
import { EventConsumerContext } from "./event-consumer-context";

export type Effect<
  TComponentContract extends ComponentContract = ComponentContract,
  TPayload extends Payload = Payload,
  TDispatchableEventNames extends string[] = string[], //expect union of event names that can be dispatched by this effect
> = (
  dispatchers: {
    [TTriggerableEventName in TDispatchableEventNames[number]]: Dispatcher<
      TComponentContract["events"][TTriggerableEventName]["payload"]
    >;
  },
  eventContext: EventConsumerContext<TPayload, TComponentContract>,
) => void | Promise<void>;
export type Effects<
  TComponentContract extends ComponentContract = ComponentContract,
> = {
  [TEventName in keyof TComponentContract["events"] & string]?: Effect<
    TComponentContract,
    TComponentContract["events"][TEventName]["payload"],
    TComponentContract["events"][TEventName]["canTrigger"]
  >;
};
export type Unregister = () => void;
