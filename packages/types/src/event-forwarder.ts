import { ComponentContract, EventsContract } from "./component-contract";
import { Event, Payload } from "./event";
import { Values } from "./values";

/**
 * Defines withPayload property for event forwarders
 * Required when payload types don't match, optional when they do
 */
type WithPayloadDef<
  TComponentContract extends ComponentContract,
  TFromPayload extends Payload,
  TToPayload extends Payload,
> = [TToPayload] extends [undefined]
  ? {
      readonly withPayload?: never;
    }
  : [TFromPayload] extends [TToPayload]
    ? {
        readonly withPayload?: (
          params: Values<TComponentContract> & {
            payload: TFromPayload;
            childKey: string;
          },
        ) => TToPayload;
      }
    : {
        readonly withPayload: (
          params: Values<TComponentContract> & {
            payload: TFromPayload;
            childKey: string;
          },
        ) => TToPayload;
      };

/**
 * Defines onCondition property for event forwarders
 * Optional condition to determine if the event should be forwarded
 */
type OnConditionDef<
  TComponentContract extends ComponentContract,
  TFromPayload extends Payload,
> = {
  onCondition?: (
    params: Values<TComponentContract> & {
      payload: TFromPayload;
      childKey?: string;
    },
  ) => boolean;
};

type ToEventDef<
  TComponentContract extends ComponentContract,
  TFromEvent extends Event, //not expecting a union
  TToEvent extends Event, //not expecting a union
> = {
  readonly to: TToEvent["name"];
} & WithPayloadDef<
  TComponentContract,
  TFromEvent["payload"],
  TToEvent["payload"]
>;

type FromEventDef<TFromEvent extends Event> = {
  readonly from: TFromEvent["name"];
};
export type FromEventToEvent<
  TComponentContract extends ComponentContract,
  TFromEvent extends Event, //not expecting a union
  TToEvent extends Event, //not expecting a union
> = FromEventDef<TFromEvent> &
  ToEventDef<TComponentContract, TFromEvent, TToEvent> &
  OnConditionDef<TComponentContract, TFromEvent["payload"]>;

export type FromEventToChildEvent<
  TComponentContract extends ComponentContract,
  TIsDestinationACollection extends boolean | undefined,
  TFromEvent extends Event, //not expecting a union
  TToEvent extends Event, //not expecting a union
> = FromEventToEvent<TComponentContract, TFromEvent, TToEvent> &
  (TIsDestinationACollection extends undefined | false
    ? {}
    : {
        toKeys?: (
          params: Values<TComponentContract> & {
            payload: TFromEvent["payload"];
            childKey: string;
          },
        ) => string[];
      });

export type FromEventContractToChildEventContract<
  TComponentContract extends ComponentContract,
  TIsDestinationACollection extends boolean | undefined,
  TFromEvents extends EventsContract | undefined,
  TToEvents extends EventsContract | undefined,
> = TFromEvents extends EventsContract
  ? TToEvents extends EventsContract
    ? FromNonUndefinedEventContractToNonUndefinedChildEventContract<
        TComponentContract,
        TIsDestinationACollection,
        TFromEvents,
        TToEvents
      >
    : never
  : never;

type FromNonUndefinedEventContractToNonUndefinedChildEventContract<
  TComponentContract extends ComponentContract,
  TIsDestinationACollection extends boolean | undefined,
  TFromEvents extends EventsContract,
  TToEvents extends EventsContract,
> = {
  [TFromEventName in TFromEvents["eventName"]]: {
    [TToEventName in TToEvents["eventName"]]: FromEventToChildEvent<
      TComponentContract,
      TIsDestinationACollection,
      {
        name: TFromEventName & string;
        payload: TFromEvents["payloads"][TFromEventName & string];
      },
      {
        name: TToEventName & string;
        payload: TToEvents["payloads"][TToEventName & string];
      }
    >;
  }[TToEvents["eventName"]];
}[TFromEvents["eventName"]];

export type FromEventContractToEventContract<
  TComponentContract extends ComponentContract,
  TFromEvents extends EventsContract | undefined,
  TToEvents extends EventsContract | undefined,
> = TFromEvents extends EventsContract
  ? TToEvents extends EventsContract
    ? FromNonUndefinedEventContractToNonUndefinedEventContract<
        TComponentContract,
        TFromEvents,
        TToEvents
      >
    : never
  : never;

type FromNonUndefinedEventContractToNonUndefinedEventContract<
  TComponentContract extends ComponentContract,
  TFromEvents extends EventsContract,
  TToEvents extends EventsContract,
> = {
  [TFromEventName in TFromEvents["eventName"]]: {
    [TToEventName in TToEvents["eventName"]]: FromEventToEvent<
      TComponentContract,
      {
        name: TFromEventName & string;
        payload: TFromEvents["payloads"][TFromEventName & string];
      },
      {
        name: TToEventName & string;
        payload: TToEvents["payloads"][TToEventName & string];
      }
    >;
  }[TToEvents["eventName"]];
}[TFromEvents["eventName"]];

export type InternalEventForwarder<
  TComponentContract extends ComponentContract,
> = TComponentContract["events"] extends EventsContract
  ? {
      [TFromEventName in TComponentContract["events"]["eventName"]]: {
        [TToEventName in TComponentContract["events"]["eventName"]]: FromEventToEvent<
          TComponentContract,
          {
            name: TFromEventName & string;
            payload: TComponentContract["events"]["payloads"][TFromEventName &
              string];
          },
          {
            name: TToEventName & string;
            payload: TComponentContract["events"]["payloads"][TToEventName &
              string];
          }
        >;
      }[Exclude<TComponentContract["events"]["eventName"], TFromEventName>]; //Exclude<..., TFromEventName> to prevent forwarding to itself
    }[TComponentContract["events"]["eventName"]]
  : never;
export type InternalEventForwarders<
  TComponentContract extends ComponentContract,
> = InternalEventForwarder<TComponentContract>[]; //array of forwarders per event
