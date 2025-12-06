type Value =
  | string
  | number
  | boolean
  | null
  | { readonly [key: string]: Value }
  | readonly Value[];

export type OptionalValue = Value | undefined;
export type State = OptionalValue;
export type Payload = OptionalValue;

export type ComponentValuesContract = { [SelectorName in string]: any };
export type ComponentEventsContract<
  EventNames extends string = string,
  DispatchableEventNames extends EventNames = EventNames,
> = {
  [EventName in EventNames]: {
    payload: OptionalValue;
    canTrigger?: DispatchableEventNames[];
  };
};

export type ComponentContract<EventNames extends string = string> = {
  state: OptionalValue;
  values: ComponentValuesContract;
  events: ComponentEventsContract<EventNames>;
  children: Record<string, ComponentContract>;
};
/*
TODO ask expert about letting client declare only partial contract in ComponentDef
e.g.
export type ComponentDef<
  TPartialContract extends Partial<ComponentContract> = {},
  TComponentContract extends ComponentContract = {
    state: any;
    values: any;
    events: any;
    children: any;
  } & TPartialContract,
> =
*/
/**
 * Definition of a component including its initial state, selectors, updaters, event forwarders, and child components
 */
export type ComponentDef<TComponentContract extends ComponentContract = any> = {
  initialState?: TComponentContract["state"];
  selectors?: {
    [SelectorName in keyof TComponentContract["values"]]: (
      state: TComponentContract["state"],
    ) => TComponentContract["values"][SelectorName];
  };
  uiEvents?: (keyof TComponentContract["events"] & string)[];
  updaters?: {
    [EventName in keyof TComponentContract["events"]]?: (
      params: Values<TComponentContract> & {
        state: TComponentContract["state"]; //mutable
        childrenKeys: ChildrenKeys<TComponentContract["children"]>; //mutable
        payload: TComponentContract["events"][EventName]["payload"];
      },
    ) => void | TComponentContract["state"];
  };
  eventForwarders?: InternalEventForwarders<TComponentContract>;
  childrenComponents?: {
    [ChildName in keyof TComponentContract["children"]]: ComponentDef<
      TComponentContract["children"][ChildName]
    >;
  };
  initialChildrenKeys?: ChildrenKeys<TComponentContract["children"]>;
  childrenConfig?: {
    [ChildName in keyof TComponentContract["children"]]?: ChildConfig<
      TComponentContract,
      TComponentContract["children"][ChildName]
    >;
  };
  effects?: Effects<TComponentContract>;
};
/***************************************************************************************************************
 *                         VALUES
 ***************************************************************************************************************/
/**
 * Provides access to computed values (from selectors) and child values
 * This is the runtime interface for accessing global state without exposing the state itself
 */
export type Values<
  TComponentContract extends ComponentContract = ComponentContract,
> = {
  /** Computed values from selectors - call these functions to get current values */
  selectors: {
    [K in keyof TComponentContract["values"]]: () => TComponentContract["values"][K];
  };
  /** Child component values - access nested component values here */
  children: ChildrenValues<TComponentContract>;
};
export type ChildrenValues<TComponentContract extends ComponentContract> = {
  [ChildName in keyof TComponentContract["children"]]: {
    [ChildKey: string]: Values<TComponentContract["children"][ChildName]>;
  };
};
/***************************************************************************************************************
 *                         EVENT FORWARDING DEFINITIONS
 ***************************************************************************************************************/

export type Event<
  TPayload extends Payload = Payload,
  TEventName extends string = string,
> = {
  readonly name: TEventName;
  readonly payload: TPayload;
};
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
            childKey?: string;
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
          childKey?: string;
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

/***************************************************************************************************************
 *                         CHILDREN KEYS
 ***************************************************************************************************************/
type ChildKeys = string[];
export type ChildrenKeys<
  TChildrenContract extends Record<string, ComponentContract> = Record<
    string,
    ComponentContract
  >,
> = {
  [ChildName in keyof TChildrenContract]: ChildKeys;
};

/***************************************************************************************************************
 *                         CHILDREN DEFINITION
 ***************************************************************************************************************/

type WithChildListeners<
  TParentContract extends ComponentContract,
  TChildContract extends ComponentContract,
> = {
  readonly listeners?: FromEventContractToEventContract<
    TParentContract,
    TChildContract["events"], //from child
    TParentContract["events"] //to parent
  >[];
};
type WithChildCommands<
  TParentContract extends ComponentContract,
  TChildContract extends ComponentContract,
> = {
  readonly commands?: FromEventContractToChildEventContract<
    TParentContract,
    TParentContract["events"], //from parent
    TChildContract["events"] //to child
  >[];
};

export type ChildConfig<
  TParentContract extends ComponentContract,
  TChildContract extends ComponentContract,
> = WithChildListeners<TParentContract, TChildContract> &
  WithChildCommands<TParentContract, TChildContract>;

/***************************************************************************************************************
 *                     Effects
 ***************************************************************************************************************/
type Effects<TComponentContract extends ComponentContract> = {
  [EventName in keyof TComponentContract["events"]]?: TComponentContract["events"][EventName]["canTrigger"] extends infer DispatchableEventNames extends
    string[]
    ? DispatchableEventNames
    : never;
};
/***************************************************************************************************************
 *                       HELPER TYPES TO EXTRACT CONTRACTS FROM DEFINITIONS
 ***************************************************************************************************************/
export type Selectors<TState extends OptionalValue> = {
  [SelectorName in string]: (state: TState) => any;
};
export type ExtractComponentValuesContract<
  TSelectors extends Record<string, (state: any) => any>,
> = {
  [SelectorName in keyof TSelectors]: TSelectors[SelectorName] extends (
    state: any,
  ) => infer TResult
    ? TResult
    : never;
};

export type ExtractComponentChildrenContract<
  TChildren extends Record<string, ComponentDef>,
> = {
  [ChildName in keyof TChildren]: TChildren[ChildName] extends ComponentDef<
    infer TComponentContract
  >
    ? TComponentContract
    : never;
};
export type ExtractEventNames<TComponentContract extends ComponentContract> =
  keyof TComponentContract["events"] & string;

export type Dispatcher<TPayload extends Payload = Payload> =
  TPayload extends undefined ? () => void : (payload: TPayload) => void;
export type EventEffectDispatchers<
  TComponentContract extends ComponentContract = ComponentContract,
  TEventName extends
    ExtractEventNames<TComponentContract> = ExtractEventNames<TComponentContract>,
> = {
  [TTriggerableEventName in TComponentContract["events"][TEventName]["canTrigger"] &
    string]: Dispatcher<TComponentContract["events"][TEventName]["payload"]>;
};
export type ComponentEffectsDispatchers<
  TComponentContract extends ComponentContract = ComponentContract,
> = {
  [TEventName in ExtractEventNames<TComponentContract>]: TComponentContract["events"][TEventName]["canTrigger"] extends undefined
    ? never
    : EventEffectDispatchers<TComponentContract, TEventName>;
};
