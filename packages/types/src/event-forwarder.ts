import {
  ComponentContract,
  ComponentEventsContract,
} from "./component-contract";
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
> = TToPayload extends undefined
  ? {
      readonly withPayload?: never;
    }
  : TFromPayload extends TToPayload
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

export type FromEventContractToChildEventContract<
  TComponentContract extends ComponentContract,
  TFromEvents extends ComponentEventsContract,
  TToEvents extends ComponentEventsContract,
> = {
  [TFromEventName in keyof TFromEvents]: {
    [TToEventName in keyof TToEvents]: FromEventToEvent<
      TComponentContract,
      {
        name: TFromEventName & string;
        payload: TFromEvents[TFromEventName & string]["payload"];
      },
      {
        name: TToEventName & string;
        payload: TToEvents[TToEventName & string]["payload"];
      }
    > & {
      toKeys?: (
        params: Values<TComponentContract> & {
          payload: TFromEvents[TFromEventName & string]["payload"];
          childKey: string;
        },
      ) => string[];
    };
  }[keyof TToEvents];
}[keyof TFromEvents];

export type FromEventContractToEventContract<
  TComponentContract extends ComponentContract,
  TFromEvents extends ComponentEventsContract,
  TToEvents extends ComponentEventsContract,
> = {
  [TFromEventName in keyof TFromEvents]: {
    [TToEventName in keyof TToEvents]: FromEventToEvent<
      TComponentContract,
      {
        name: TFromEventName & string;
        payload: TFromEvents[TFromEventName & string]["payload"];
      },
      {
        name: TToEventName & string;
        payload: TToEvents[TToEventName & string]["payload"];
      }
    >;
  }[keyof TToEvents];
}[keyof TFromEvents];

export type InternalEventForwarder<
  TComponentContract extends ComponentContract,
> = {
  [TFromEventName in keyof TComponentContract["events"]]: {
    [TToEventName in keyof TComponentContract["events"]]: FromEventToEvent<
      TComponentContract,
      {
        name: TFromEventName & string;
        payload: TComponentContract["events"][TFromEventName &
          string]["payload"];
      },
      {
        name: TToEventName & string;
        payload: TComponentContract["events"][TToEventName & string]["payload"];
      }
    >;
  }[Exclude<keyof TComponentContract["events"], TFromEventName>]; //Exclude<..., TFromEventName> to prevent forwarding to itself
}[keyof TComponentContract["events"]];

export type InternalEventForwarders<
  TComponentContract extends ComponentContract,
> = InternalEventForwarder<TComponentContract>[]; //array of forwarders per event
