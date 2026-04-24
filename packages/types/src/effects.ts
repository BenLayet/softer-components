import { ComponentContract, EventsContract } from "./component-contract";
import { ExtractEventNameUnion } from "./component-contract-helpers";
import { Dispatcher } from "./event";
import { EventConsumerInput } from "./event-consumer";

export type Effect<
  TComponentContract extends ComponentContract,
  TEventNameUnion extends ExtractEventNameUnion<TComponentContract>, //triggering event names
  TDispatchableEventNameUnion extends ExtractEventNameUnion<TComponentContract>, //union of dispatchable event names
> = TComponentContract["events"] extends EventsContract
  ? (
      dispatchers: {
        [TDispatchableEventName in TDispatchableEventNameUnion]: Dispatcher<
          TComponentContract["events"]["payloads"],
          TDispatchableEventName
        >;
      },
      input: EventConsumerInput<
        TComponentContract["events"]["payloads"][TEventNameUnion],
        TComponentContract
      >,
    ) => void | Promise<void>
  : never;

export type Effects<TComponentContract extends ComponentContract> = {
  [TEventName in ExtractEventNameUnion<TComponentContract>]?: Effect<
    TComponentContract,
    TEventName,
    ExtractEventNameUnion<TComponentContract>
  >;
};
