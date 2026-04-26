import {
  ChildInstanceContract,
  ChildrenContract,
  ComponentContract,
  ContextContract,
  EventsContract,
} from "../../component-contract/component-contract";
import { Payload } from "../../component-contract/payload";
import { Values } from "../values/values";

//TODO do not export event
export type Event<
  TPayload extends Payload = Payload,
  TEventName extends string = string,
> = {
  readonly name: TEventName;
  readonly payload?: TPayload;
};

/**
 * Defines withPayload property for events forwarders
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
 * Defines onCondition property for events forwarders
 * Optional condition to determine if the events should be forwarded
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
  [TFromEventName in TFromEvents["allEvents"][number]]: {
    [TToEventName in TToEvents["allEvents"][number]]: FromEventToChildEvent<
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
  }[TToEvents["allEvents"][number]];
}[TFromEvents["allEvents"][number]];

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
  [TFromEventName in TFromEvents["allEvents"][number]]: {
    [TToEventName in TToEvents["allEvents"][number]]: FromEventToEvent<
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
  }[TToEvents["allEvents"][number]];
}[TFromEvents["allEvents"][number]];

export type InternalEventForwarder<
  TComponentContract extends ComponentContract,
> = TComponentContract["events"] extends EventsContract
  ? {
      [TFromEventName in TComponentContract["events"]["allEvents"][number]]: {
        [TToEventName in TComponentContract["events"]["allEvents"][number]]: FromEventToEvent<
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
      }[Exclude<
        TComponentContract["events"]["allEvents"][number],
        TFromEventName
      >]; //Exclude<..., TFromEventName> to prevent forwarding to itself
    }[TComponentContract["events"]["allEvents"][number]]
  : never;
export type InternalEventForwarders<
  TComponentContract extends ComponentContract,
> = InternalEventForwarder<TComponentContract>[]; //array of forwarders per events

/***************************************************************************************************************
 *                         CHILDREN DEFINITION
 ***************************************************************************************************************/

export type ListenersDef<
  TParentContract extends ComponentContract,
  TChildContract extends ComponentContract & ChildInstanceContract,
> = FromEventContractToEventContract<
  TParentContract,
  TChildContract["events"], //from child
  TParentContract["events"] //to parent
>[];

type WithChildListeners<
  TParentContract extends ComponentContract,
  TChildContract extends ComponentContract & ChildInstanceContract,
> = {
  readonly listeners?: ListenersDef<TParentContract, TChildContract>;
};

export type CommandsDef<
  TParentContract extends ComponentContract,
  TChildContract extends ComponentContract & ChildInstanceContract,
> = FromEventContractToChildEventContract<
  TParentContract,
  TChildContract extends { type: "collection" } ? true : false,
  TParentContract["events"], //from parent
  TChildContract["events"] //to child
>[];

type WithChildCommands<
  TParentContract extends ComponentContract,
  TChildContract extends ComponentContract & ChildInstanceContract,
> = {
  readonly commands?: CommandsDef<TParentContract, TChildContract>;
};
/***************************************************************************************************************
 *                         CHILDREN AND CONTEXTS CONFIGS
 ***************************************************************************************************************/

export type ChildConfig<
  TParentContract extends ComponentContract,
  TChildContract extends ComponentContract & ChildInstanceContract,
> = WithChildListeners<TParentContract, TChildContract> &
  WithChildCommands<TParentContract, TChildContract>;

export type ChildrenConfig<TComponentContract extends ComponentContract> =
  TComponentContract["children"] extends ChildrenContract
    ? {
        [K in keyof TComponentContract["children"]]?: ChildConfig<
          TComponentContract,
          TComponentContract["children"][K]
        >;
      }
    : never;

export type ContextsConfig<
  TComponentContract extends { context: ContextContract } & ComponentContract,
> = {
  [K in keyof TComponentContract["context"]]?: ChildConfig<
    TComponentContract,
    TComponentContract["context"][K]
  >;
};
