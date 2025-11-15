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

type ComponentValuesContract = { [SelectorName in string]: any };
type ComponentEventsContract = {
  [EventName in string]: { payload: OptionalValue };
};
type ComponentChildContract = ComponentContract & {
  isCollection?: boolean;
};
type ComponentChildrenContract = Record<string, ComponentChildContract>;

export type ComponentContract = {
  state: OptionalValue;
  values: ComponentValuesContract;
  events: ComponentEventsContract;
  children: ComponentChildrenContract;
};

export type ComponentDef<
  TComponentContract extends ComponentContract = {
    state: any;
    values: any;
    events: any;
    children: any;
  },
> = {
  initialState?: TComponentContract["state"];
  initialChildrenNodes?: ChildrenNodes<TComponentContract["children"]>;
  selectors?: {
    [SelectorName in keyof TComponentContract["values"]]: (
      state: TComponentContract["state"]
    ) => TComponentContract["values"][SelectorName];
  };
  uiEvents?: (keyof TComponentContract["events"])[];
  updaters?: {
    [EventName in keyof TComponentContract["events"]]?: (
      params: Values<TComponentContract> & {
        state: TComponentContract["state"]; //mutable
        childrenNodes: ChildrenNodes<TComponentContract["children"]>; //mutable
        payload: TComponentContract["events"][EventName]["payload"];
      }
    ) => void | TComponentContract["state"]; //return new state or void if state is mutated
  };
  eventForwarders?: InternalEventForwarders<TComponentContract>;
  childrenComponents?: {
    [ChildName in keyof TComponentContract["children"]]: ComponentDef<
      TComponentContract["children"][ChildName]
    >;
  };
  childrenConfig?: {
    [ChildName in keyof TComponentContract["children"]]?: ChildConfig<
      TComponentContract,
      TComponentContract["children"][ChildName]
    >;
  };
};
/***************************************************************************************************************
 *                         VALUES
 ***************************************************************************************************************/
/**
 * Provides access to computed values (from selectors) and child values
 * This is the runtime interface for accessing global state in a structured way
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
  [ChildName in keyof TComponentContract["children"]]: TComponentContract["children"][ChildName]["isCollection"] extends true
    ? {
        [ChildKey: string]: Values<TComponentContract["children"][ChildName]>;
      }
    : Values<TComponentContract["children"][ChildName]>;
};
/***************************************************************************************************************
 *                         EVENT FORWARDING DEFINITIONS
 ***************************************************************************************************************/

export type Event<
  TEventName extends string = string,
  TPayload extends Payload = Payload,
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
            fromChildKey: string;
          }
        ) => TToPayload;
      }
    : {
        readonly withPayload: (
          params: Values<TComponentContract> & {
            payload: TFromPayload;
            fromChildKey: string;
          }
        ) => TToPayload;
      };

/**
 * Defines onCondition property for event forwarders
 * Optional condition to determine if event should be forwarded
 */
type OnConditionDef<
  TComponentContract extends ComponentContract,
  TFromPayload extends Payload,
> = {
  onCondition?: (
    params: Values<TComponentContract> & {
      payload: TFromPayload;
      fromChildKey: string;
    }
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
    > & {
      //TODO ask expert how to declare 'toKeys' only for commands from parent to children
      toKeys?: (
        params: Values<TComponentContract> & {
          payload: TFromEvents[TFromEventName & string]["payload"];
          fromChildKey: string;
        }
      ) => string[];
    };
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
 *                         CHILDREN NODES
 ***************************************************************************************************************/
export type ChildrenNodes<
  TChildrenContract extends
    ComponentChildrenContract = ComponentChildrenContract,
> = {
  [ChildName in keyof TChildrenContract]: TChildrenContract[ChildName]["isCollection"] extends true
    ? string[]
    : boolean;
};
export type ChildrenNode<TChildContract extends ComponentChildContract> = {
  readonly path: string;
  readonly values: Values<TChildContract>;
};

type T = ChildrenNodes[string];
/***************************************************************************************************************
 *                         CHILDREN DEFINITION
 ***************************************************************************************************************/

type WithChildListeners<
  TParentContract extends ComponentContract,
  TChildContract extends ComponentChildContract,
> = {
  readonly listeners?: FromEventContractToEventContract<
    TParentContract,
    TChildContract["events"], //from child
    TParentContract["events"] //to parent
  >[];
};
type WithChildCommands<
  TParentContract extends ComponentContract,
  TChildContract extends ComponentChildContract,
> = {
  readonly commands?: FromEventContractToEventContract<
    TParentContract,
    TParentContract["events"], //from parent
    TChildContract["events"] //to child
  >[];
};

export type ChildConfig<
  TParentContract extends ComponentContract,
  TChildContract extends ComponentChildContract,
> = WithChildListeners<TParentContract, TChildContract> &
  WithChildCommands<TParentContract, TChildContract> &
  (TChildContract["isCollection"] extends true
    ? {
        readonly isCollection: true;
      }
    : { readonly isCollection?: false });
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
    state: any
  ) => infer TResult
    ? TResult
    : never;
};

export type ExtractComponentChildrenContract<
  TChildren extends Record<string, ComponentDef<any>>,
  TIsCollection extends { [key in keyof TChildren]?: "isCollection" } = {},
> = {
  [ChildName in keyof TChildren]: (TChildren[ChildName] extends ComponentDef<
    infer TComponentContract
  >
    ? TComponentContract
    : never) & {
    isCollection: TIsCollection[ChildName] extends "isCollection"
      ? true
      : false;
  };
};
