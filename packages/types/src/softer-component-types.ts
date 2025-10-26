/**
 * Core types for state-manager-agnostic component definitions.
 * These types provide the foundation for reusable and composable components,
 * compatible with any state manager.
 */

/***************************************************************************************************************
 *                         VALUE
 ***************************************************************************************************************/
export type Value =
  | string
  | number
  | boolean
  | Date
  | null
  | { readonly [key: string]: Value }
  | readonly Value[];

/***************************************************************************************************************
 *                         STATE
 ***************************************************************************************************************/

/**
 * State is the same type as Value but is used in a specific context.
 */
export type State = Value;

/***************************************************************************************************************
 *                         SELECTORS
 ***************************************************************************************************************/

/**
 * Selector takes state and returns a value
 * @example
 * ```ts
 * (state: {counter:number}) => state.counter
 * ```
 */
export type Selector<
  TState extends State,
  TValue extends Value | undefined = Value | undefined,
> = (state: TState) => TValue;
export type Selectors<TState extends State = State> =  {
      [key in string]: Selector<TState>;
    };
/***************************************************************************************************************
 *                         EVENTS
 ***************************************************************************************************************/

/**
 * Payload can be a specific value type or undefined (no payload)
 */
export type Payload = Value | undefined;
export type Payloads = Record<string, Payload>;

/**
 * Event with type and payload (payload is always present and typed by TPayload;
 * use `undefined` for events that conceptually carry no payload)
 * @example
 * ```ts
 * type ButtonClicked:Event = {type:"buttonClicked", payload: undefined};
 * const event:ButtonClicked = {type:"buttonClicked", payload: undefined};
 *
 * type LinkClicked:Event = {type:"linkClicked", payload:{url:string}};
 * const event:LinkClicked = {type:"linkClicked", payload:{url:"https://example.com"}};
 * ```
 */
export type Event<
  TEventName extends string = string,
  TPayload extends Payload = Payload,
> = {
  readonly type: TEventName;
  readonly payload: TPayload;
};

/***************************************************************************************************************
 *                         STATE UPDATERS
 ***************************************************************************************************************/

/**
 * State Updater takes no payload or only one type of payload.
 * A state updater is called when a specific event is dispatched with a specific payload.
 * (equivalent to a case reducer for a specific action in Redux)
 *
 * @example
 * ```ts
 * // With payload:
 * (state: {counter:number}, payload:number) => ({counter: state.counter + payload})
 * // Without payload:
 * (state: {counter:number}) => ({counter: state.counter + 1})
 * ```
 */
export type StateUpdater<TState extends State, TPayload extends Payload> = (
  state: TState,
  payload: TPayload,
) => TState;

/***************************************************************************************************************
 *                         EVENT DEFINITIONS TODO rename to EventHandler ?
 ***************************************************************************************************************/

export type EventDef<TState extends State, TPayload extends Payload> = {
  readonly stateUpdater?: StateUpdater<TState & {}, TPayload>;
};

export type InternalEventForwarderDef<
  TState extends State,
  TFromEvent extends Event,
  TToEvent extends Event,
> = {
  readonly to: Exclude<TToEvent["type"], TFromEvent["type"]>;
} & WithPayloadDef<TState, TFromEvent["payload"], TToEvent["payload"]> &
  OnConditionDef<TState, TFromEvent["payload"]>;

export type EventsDef<
  TState extends State,
  TPayloads extends Record<string, Payload>,
> = {
  [TEventName in keyof TPayloads]: EventDef<TState, TPayloads[TEventName]> & {
    //TODO make this optional empty event handler do not need to be defined
    forwarders?: InternalEventForwarderDef<
      TState,
      Event<TEventName & string, TPayloads[TEventName & string]>,
      PayloadsToEvent<TPayloads>
    >[];
  };
};

/***************************************************************************************************************
 *                        INPUT AND OUTPUT EVENT FORWARDERS
 ***************************************************************************************************************/

/** TODO check if necessary ?
 * Adds an optional key (string) to each path segment in a component path
 * E.g. "/list/item/" becomes "/list/:string/item/:string/"
 * 
type AddKeyToPath<TPath extends string> =
  TPath extends `/${infer Head}/${infer Tail}`
  ? `/${Head}${`:${string}` | ""}${AddKeyToPath<`/${Tail}`>}`
  : TPath;

/**
 * Basic event forwarder definition with onEvent and thenDispatch
 */
type OnEventThenDispatchDef<
  TFromEventName extends string,
  TToEventName extends string,
> = {
  readonly onEvent: TFromEventName; // TODO onEvent could depend on the state
  readonly thenDispatch: TToEventName; // TODO thenDispatch could depend on the state + payload
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
  ? {}
  : TFromPayload extends TToPayload
    ? {
        readonly withPayload?: (
          state: TState & {},
          payload: TFromPayload,
        ) => TToPayload;
      }
    : {
        readonly withPayload: (
          state: TState & {}, //TODO use ResolvedSelectors instead of TState
          payload: TFromPayload,
        ) => TToPayload;
      };

/**
 * Defines onCondition property for event forwarders
 * Optional condition to determine if event should be forwarded
 */
type OnConditionDef<TState extends State, TFromPayload extends Payload> = {
  onCondition?: (state: TState, payload: TFromPayload) => boolean;
};

/**
 * Internal event forwarder definition with all properties
 */
type _EventForwarderDef<
  TState extends State,
  TFromEvent extends Event, //no union here
  TToEvent extends Event, //no union here
> = OnEventThenDispatchDef<TFromEvent["type"], TToEvent["type"]> &
  WithPayloadDef<TState, TFromEvent["payload"], TToEvent["payload"]> &
  OnConditionDef<TState, TFromEvent["payload"]>;

/**
 * Event forwarder definition for forwarding events between different event sets
 * Prevents dispatching to self and handles type safety
 */
export type EventForwarderDef<
  TState extends State,
  TFromEvents extends Event, //expects union
  TToEvents extends Event = TFromEvents, //expects union
> = TFromEvents extends never
  ? any
  : TFromEvents extends infer TFromEvent extends Event
    ? TToEvents extends infer TToEvent extends Event
      ? // TODO prevent forwarding to self while tolerating any as TToEvents or TFromEvents
        // ? string extends TToEvents["type"] // tolerates any as TToEvents
        //     ? _EventForwarderDef<TState, TFromEvent, TToEvent>
        //     :  string extends TFromEvents["type"] // tolerates any as TFromEvents
        //         ? _EventForwarderDef<TState, TFromEvent, TToEvent>
        //         : TToEvent extends TFromEvent // prevent dispatching to self
        //             ? never
        //             :
        _EventForwarderDef<TState, TFromEvent, TToEvent>
      : never
    : never;
/***************************************************************************************************************
 *                         CHILDREN
 ***************************************************************************************************************/
export type BaseComponentDef<TState extends State> = {
  readonly initialState?: TState;
  readonly events: EventsDef<any, any>;
};
type SingleChildFactory<
  TParentState extends State,
  TChildState extends State,
> = {
  //TODO readonly exists?: (state: TParentState & {}) => boolean;
  readonly isCollection?: false;
  readonly initialStateFactory?: (state: TParentState & {}) => TChildState & {};
};
type ChildCollectionFactory<
  TParentState extends State,
  TChildState extends State,
> = {
  readonly isCollection: true;
  readonly count: (state: TParentState & {}) => number; // TODO replace by getKeys()
  readonly childKey: (state: TParentState & {}, index: number) => string;
  readonly initialStateFactoryWithKey?: (
    state: TParentState & {},
    childKey: string,
  ) => TChildState & {};
};
type ChildDef<TParentState extends State, TChildState extends State = State> = {
  componentDef: BaseComponentDef<TChildState>; //TODO use ComponentDef instead of BaseComponentDef ?
} & (
  | SingleChildFactory<TParentState, TChildState>
  | ChildCollectionFactory<TParentState, TChildState>
);

export type ChildrenDef<TParentState extends State> = Record<
  string,
  ChildDef<TParentState>
>;

/***************************************************************************************************************
 *                         COMPONENT DEFINITION
 ***************************************************************************************************************/

export type WithInitialState<TState extends State> = {
  readonly initialState: TState;
};
export type WithChildrenDef<TChildrenDef extends ChildrenDef<any>> = {
  readonly children: TChildrenDef;
};
export type WithSelectors<
  TState extends State,
  TSelectors extends Selectors<TState>,
> = {
  readonly selectors: TSelectors;
};
export type WithEvents<TState extends State, TPayloads extends Payloads> = {
  readonly events: EventsDef<TState, TPayloads>;
};
export type WithInput<
  TState extends State,
  TPayloads extends Payloads,
  TChildrenDef extends ChildrenDef<TState>,
> = {
  readonly input: EventForwarderDef<
    TState,
    ChildrenDefToEvent<TChildrenDef>,
    PayloadsToEvent<TPayloads>
  >[];
};

export type WithOutput<
  TState extends State,
  TPayloads extends Payloads,
  TChildrenDef extends ChildrenDef<TState>,
> = {
  readonly output: EventForwarderDef<
    TState,
    PayloadsToEvent<TPayloads>,
    ChildrenDefToEvent<TChildrenDef>
  >[];
};

export type ComponentDef<
  TState extends State,
  TSelectors extends Selectors<TState>,
  TPayloads extends Payloads, //TODO use TEventDef extends EventDef<TState>
  TChildrenDef extends ChildrenDef<TState>,
> = WithInitialState<TState> &
  WithSelectors<TState, TSelectors> &
  WithChildrenDef<TChildrenDef> &
  WithEvents<TState, TPayloads> &
  WithInput<TState, TPayloads, TChildrenDef> &
  WithOutput<TState, TPayloads, TChildrenDef>;

export type AnyComponentDef = ComponentDef<any, any, any, any>;

/***************************************************************************************************************
 * Utility types
 ***************************************************************************************************************/

export type EventsDefToPayloads<TEventsDef extends EventsDef<any, any>> =
  TEventsDef extends EventsDef<any, infer TPayloads> ? TPayloads : never;

export type EventsDefToEvent<TEventsDef extends EventsDef<any, any>> =
  PayloadsToEvent<EventsDefToPayloads<TEventsDef>>;

export type PayloadsToEvent<TPayload extends Payloads> = {
  [TEventName in keyof TPayload]: Event<
    TEventName & string,
    TPayload[TEventName]
  >;
}[keyof TPayload];

export type ChildrenDefToEvent<TChildrenDef extends ChildrenDef<any>> = {
  [TChildName in keyof TChildrenDef]: ChildEventsDefToEvent<
    TChildName & string,
    TChildrenDef[TChildName]["componentDef"]["events"]
  >;
}[keyof TChildrenDef];

type ChildEventsDefToEvent<
  TChildName extends string,
  TEventsDef extends EventsDef<any, any>,
> = {
  [TEventName in keyof EventsDefToPayloads<TEventsDef>]: Event<
    `${TChildName}/${TEventName & string}`,
    EventsDefToPayloads<TEventsDef>[TEventName]
  >;
}[keyof EventsDefToPayloads<TEventsDef>];
