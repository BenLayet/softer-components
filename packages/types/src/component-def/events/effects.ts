import {
  ComponentContract,
  EventsContract,
} from "../../component-contract/component-contract";
import { ExtractEventNameUnion } from "../../component-contract/component-contract-extractors";
import { EventConsumerInput } from "./event-consumer";
import { Dispatcher } from "./event-dispatcher";

export type Effect<
  TComponentContract extends ComponentContract,
  TEventNameUnion extends ExtractEventNameUnion<TComponentContract>, //triggering events names
  TDispatchableEventNameUnion extends ExtractEventNameUnion<TComponentContract>, //union of dispatchable events names
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
