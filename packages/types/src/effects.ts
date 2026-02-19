import { ComponentContract, EventsContract } from "./component-contract";
import { Dispatcher } from "./event";
import { EventConsumerInput } from "./event-consumer";

export type Effect<
  TComponentContract extends ComponentContract,
  TEventName extends keyof TComponentContract["events"], //triggering event names
  TDispatchableEventNames extends keyof TComponentContract["events"], //union of dispatchable event names
> = TComponentContract["events"] extends EventsContract
  ? (
      dispatchers: {
        [TDispatchableEventName in TDispatchableEventNames]: Dispatcher<
          TComponentContract["events"][TDispatchableEventName]["payload"]
        >;
      },
      input: EventConsumerInput<
        TComponentContract["events"][TEventName]["payload"],
        TComponentContract
      >,
    ) => void | Promise<void>
  : never;

export type Effects<TComponentContract extends ComponentContract> = {
  [TEventName in keyof TComponentContract["events"]]?: Effect<
    TComponentContract,
    TEventName,
    keyof TComponentContract["events"]
  >;
};
