type Value =
  | string
  | number
  | boolean
  | Date
  | null
  | { readonly [key: string]: Value }
  | readonly Value[];

export type OptionalValue = Value | undefined;
type State = OptionalValue;
type Payload = OptionalValue;

type ComponentValuesContract = { [SelectorName in string]: OptionalValue };
type ComponentEventsContract = {
  [EventName in string]: { payload: OptionalValue };
};
type ComponentChildrenContract = Record<
  string,
  ComponentContract & { isCollection: boolean }
>;

type ComponentContract = {
  state: OptionalValue;
  values: ComponentValuesContract;
  events: ComponentEventsContract;
  children: ComponentChildrenContract;
};

export type ComponentDef<TComponentContract extends ComponentContract> = {
  initialState?: TComponentContract["state"];
  selectors?: {
    [SelectorName in keyof TComponentContract["values"]]: (
      state: TComponentContract["state"]
    ) => TComponentContract["values"][SelectorName];
  };
  uiEvents?: (keyof TComponentContract["events"])[];
  stateUpdaters?: {
    [EventName in keyof TComponentContract["events"]]?: (
      state: TComponentContract["state"],
      payload: TComponentContract["events"][EventName]["payload"]
    ) => TComponentContract["state"];
  };
  eventForwarders?: InternalEventForwarders<TComponentContract>;
  childrenComponents?: {
    [ChildName in keyof TComponentContract["children"]]: ComponentDef<
      TComponentContract["children"][ChildName]
    >;
  };
  childrenConfig?: {
    [ChildName in keyof TComponentContract["children"]]?: TComponentContract["children"][ChildName]["isCollection"] extends true
      ? CollectionChildConfig<
          TComponentContract,
          TComponentContract["children"][ChildName]
        >
      : SingleChildConfig<
          TComponentContract,
          TComponentContract["children"][ChildName]
        >;
  };
};
/***************************************************************************************************************
 *                         EVENT FORWARDING DEFINITIONS
 ***************************************************************************************************************/

export type Event<
  TEventName extends string = string,
  TPayload extends Payload = Payload,
> = {
  readonly type: TEventName;
  readonly payload: TPayload;
};
/**
 * Defines withPayload property for event forwarders
 * Required when payload types don't match, optional when they do
 */
type WithPayloadDef<
  TState extends State,
  TFromPayload extends Payload,
  TToPayload extends Payload,
> = TToPayload extends undefined
  ? {
      readonly withPayload?: never;
    }
  : TFromPayload extends TToPayload
    ? {
        readonly withPayload?: (
          state: TState & {},
          payload: TFromPayload
        ) => TToPayload;
      }
    : {
        readonly withPayload: (
          state: TState & {}, //TODO use ResolvedSelectors instead of TState
          payload: TFromPayload
        ) => TToPayload;
      };

type ExtractChildrenState<TChildren extends ComponentChildrenContract> = {
  [ChildName in keyof TChildren]: TChildren[ChildName] extends {
    isCollection: true;
  }
    ? Record<string, TChildren[ChildName]["state"]>
    : TChildren[ChildName]["state"];
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
    state: TComponentContract["state"],
    payload: TFromPayload,
    children: ExtractChildrenState<TComponentContract["children"]>
  ) => boolean;
};

type ToEventDef<
  TComponentContract extends ComponentContract,
  TFromEvent extends Event, //not expecting a union
  TToEvent extends Event, //not expecting a union
  TWithKey extends boolean = false,
> = {
  readonly to: TToEvent["type"];
} & WithPayloadDef<
  TComponentContract["state"],
  TFromEvent["payload"],
  TToEvent["payload"]
> &
  (TWithKey extends true
    ? {
        childKey?: (
          state: TComponentContract["state"],
          payload: TFromEvent["payload"]
        ) => string;
      }
    : {});

type FromEventDef<TFromEvent extends Event> = {
  readonly from: TFromEvent["type"];
};
export type FromEventToEvent<
  TComponentContract extends ComponentContract,
  TFromEvent extends Event, //not expecting a union
  TToEvent extends Event, //not expecting a union
  TWithKey extends boolean = false,
> = FromEventDef<TFromEvent> &
  ToEventDef<TComponentContract, TFromEvent, TToEvent, TWithKey> &
  OnConditionDef<TComponentContract, TFromEvent["payload"]>;

export type FromEventContractToEventContract<
  TComponentContract extends ComponentContract,
  TFromEventsContract extends ComponentEventsContract, //expecting a union
  TToEventsContract extends ComponentEventsContract, //expecting a union
  TWithKey extends boolean = false,
> = {
  [TFromEventName in keyof TFromEventsContract]: {
    [TToEventName in keyof TToEventsContract]: FromEventToEvent<
      TComponentContract,
      {
        type: TFromEventName & string;
        payload: TFromEventsContract[TFromEventName & string]["payload"];
      },
      {
        type: TToEventName & string;
        payload: TToEventsContract[TToEventName & string]["payload"];
      },
      TWithKey
    >;
  }[keyof TToEventsContract];
}[keyof TFromEventsContract];

export type InternalEventForwarder<
  TComponentContract extends ComponentContract,
> = {
  [TFromEventName in keyof TComponentContract["events"]]: {
    [TToEventName in keyof TComponentContract["events"]]: FromEventToEvent<
      TComponentContract,
      {
        type: TFromEventName & string;
        payload: TComponentContract["events"][TFromEventName &
          string]["payload"];
      },
      {
        type: TToEventName & string;
        payload: TComponentContract["events"][TToEventName & string]["payload"];
      }
    >;
  }[Exclude<keyof TComponentContract["events"], TFromEventName>]; //Exclude<..., TFromEventName> to prevent forwarding to itself
}[keyof TComponentContract["events"]];

export type InternalEventForwarders<
  TComponentContract extends ComponentContract,
> = InternalEventForwarder<TComponentContract>[]; //array of forwarders per event

/***************************************************************************************************************
 *                         CHILDREN DEFINITION
 ***************************************************************************************************************/

type WithChildListeners<
  TParentContract extends ComponentContract,
  TChildEvents extends ComponentEventsContract,
> = {
  readonly listeners?: FromEventContractToEventContract<
    TParentContract,
    TChildEvents, //from child
    TParentContract["events"] //to parent
  >[];
};
type WithChildCommands<
  TParentContract extends ComponentContract,
  TChildEvents extends ComponentEventsContract,
  TWithKey extends boolean = false,
> = {
  readonly commands?: FromEventContractToEventContract<
    TParentContract,
    TParentContract["events"], //from parent
    TChildEvents, //to child
    TWithKey
  >[];
};
/********************************************
 *      SINGLE CHILD DEFINITION
 ********************************************/
type SingleChildFactoryEvent<
  TParentContract extends ComponentContract,
  TChildContract extends ComponentContract,
> = {
  [ParentEventName in keyof TParentContract["events"] & string]: {
    readonly type: ParentEventName;
    readonly createdChildState?: (
      state: TParentContract["state"],
      payload: TParentContract["events"][ParentEventName]["payload"]
    ) => TChildContract["state"];
  };
}[keyof TParentContract["events"] & string];
export type SingleChildFactory<
  TParentContract extends ComponentContract,
  TChildContract extends ComponentContract,
> = {
  readonly isCollection?: false;
  readonly initiallyCreated?: boolean;
  readonly initialChildState?: TChildContract["state"];
  readonly createOnEvent?: SingleChildFactoryEvent<
    TParentContract,
    TChildContract
  >;
  readonly removeOnEvent?: { type: keyof TParentContract["events"] & string };
};
type SingleChildConfig<
  TParentContract extends ComponentContract,
  TChildContract extends ComponentContract,
> = WithChildListeners<TParentContract, TChildContract["events"]> &
  WithChildCommands<TParentContract, TChildContract["events"]> &
  SingleChildFactory<TParentContract, TChildContract>;
/********************************************
 *      COLLECTION CHILD DEFINITION
 ********************************************/

type Remove = {
  readonly action: "remove";
};
type Keep = {
  readonly action: "keep";
};
type Create<TState extends State> = {
  readonly action: "create";
  readonly beforeIndex?: number; //defaults to end
  readonly initialState?: TState;
};

type CollectionChildFactoryEvent<
  TParentContract extends ComponentContract,
  TChildContract extends ComponentContract,
> = {
  [ParentEventName in keyof TParentContract["events"] & string]: {
    readonly type: ParentEventName;
    readonly newChildrenStates: (
      state: TParentContract["state"],
      payload: TParentContract["events"][ParentEventName]["payload"]
    ) => Record<string, Create<TChildContract["state"]> | Keep | Remove>; //can reorder / add / remove children
  };
}[keyof TParentContract["events"] & string];

export type CollectionChildFactory<
  TParentContract extends ComponentContract,
  TChildContract extends ComponentContract,
> = {
  readonly isCollection: true;
  readonly initialChildrenStates?: Record<string, TChildContract["state"]>;
  readonly updateOnEvents?: CollectionChildFactoryEvent<
    TParentContract,
    TChildContract
  >[];
};

type CollectionChildConfig<
  TParentContract extends ComponentContract,
  TChildContract extends ComponentContract,
> = WithChildListeners<TParentContract, TChildContract["events"]> &
  WithChildCommands<TParentContract, TChildContract["events"], true> &
  CollectionChildFactory<TParentContract, TChildContract>;

/***************************************************************************************************************
 *                       HELPER TYPES TO EXTRACT CONTRACTS FROM DEFINITIONS
 ***************************************************************************************************************/
export type Selectors<TState extends OptionalValue> = {
  [SelectorName in string]: (state: TState) => OptionalValue;
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
