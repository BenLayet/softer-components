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
export type Selectors<TState extends State = State> = {
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
  readonly type: TEventName; //TODO separate type and component path
  readonly payload: TPayload;
};

/***************************************************************************************************************
 *                         EVENTS DEFINITION
 ***************************************************************************************************************/
type EventDef = {
  readonly payload: Payload;
  readonly uiEvent?: true;
};
export type EventsDef = {
  [TEventName in string]: EventDef;
};
type EventsDefToEventUnion<TEventsDef extends EventsDef> = {
  [TEventName in keyof TEventsDef]: Event<
    TEventName & string,
    TEventsDef[TEventName]["payload"]
  >;
}[keyof TEventsDef];

/***************************************************************************************************************
 *                         EVENT FORWARDING DEFINITIONS
 ***************************************************************************************************************/

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
          payload: TFromPayload
        ) => TToPayload;
      }
    : {
        readonly withPayload: (
          state: TState & {}, //TODO use ResolvedSelectors instead of TState
          payload: TFromPayload
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
 * Event forwarder definition from a known event (used in internal event handlers)
 */
export type EventForwarderFromKnownEventDef<
  TState extends State,
  TFromEvent extends Event,
  TToEvent extends Event,
> = {
  readonly to: string extends TFromEvent["type"]
    ? TToEvent["type"] //allow any type if TFromEvent type is not precise
    : Exclude<TToEvent["type"], TFromEvent["type"]>; //prevent forwarding to same event type
} & WithPayloadDef<TState, TFromEvent["payload"], TToEvent["payload"]> &
  OnConditionDef<TState, TFromEvent["payload"]>;

/**
 * Generic event forwarder definition (used in children definitions)
 */
export type EventForwarderDef<
  TState extends State,
  TFromEvent extends Event,
  TToEvent extends Event,
> = {
  readonly from: string extends TToEvent["type"]
    ? TFromEvent["type"] //allow any type if TToEvent type is not precise
    : Exclude<TFromEvent["type"], TToEvent["type"]>; //prevent forwarding to same event type
} & EventForwarderFromKnownEventDef<TState, TFromEvent, TToEvent>;

/***************************************************************************************************************
 *                      INTERNAL EVENT HANDLERS
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
  payload: TPayload
) => TState;

export type EventHandlers<
  TState extends State,
  TEventsDef extends EventsDef,
> = {
  [TEventName in keyof TEventsDef]?: {
    readonly stateUpdater?: StateUpdater<
      TState & {},
      TEventsDef[TEventName]["payload"]
    >;
    forwarders?: EventForwarderFromKnownEventDef<
      TState,
      Event<TEventName & string, TEventsDef[TEventName]["payload"]>,
      EventsDefToEventUnion<TEventsDef>
    >[];
  };
};

/***************************************************************************************************************
 *                         CHILDREN
 ***************************************************************************************************************/
type SingleChildFactory<
  TParentState extends State,
  TChildState extends State = State,
> = {
  readonly isCollection?: false;
  readonly exists?: (state: TParentState & {}) => boolean;
  readonly initialStateFactory?: (state: TParentState & {}) => TChildState & {}; // TODO instantiate children in event handlers ?
};
type ChildCollectionFactory<
  TParentState extends State,
  TChildState extends State = State,
> = {
  readonly isCollection: true;
  readonly getKeys: (state: TParentState & {}) => string[]; //keys are used to check if instance already exists
  readonly initialStateFactoryWithKey?: (
    //creates initial state for each child instance that doesn't exist yet
    state: TParentState & {},
    key: string
  ) => TChildState & {};
};

type WithChildListeners<
  TParentState extends State,
  TParentEventsDef extends EventsDef,
  TChildEventsDef extends EventsDef,
> = {
  readonly listeners?: EventForwarderDef<
    TParentState,
    EventsDefToEventUnion<TChildEventsDef>, //from child
    EventsDefToEventUnion<TParentEventsDef> //to parent
  >[];
};
type WithChildCommands<
  TParentState extends State,
  TParentEventsDef extends EventsDef,
  TChildCommandsDef extends EventsDef,
> = {
  readonly commands?: EventForwarderDef<
    TParentState,
    EventsDefToEventUnion<TParentEventsDef>, //from parent
    EventsDefToEventUnion<TChildCommandsDef> //to child
  >[];
};

type ChildDef<
  TParentState extends State,
  TParentEventsDef extends EventsDef,
  TChildState extends State = any,
  TChildEventsDef extends EventsDef = any,
  TChildCommandsDef extends EventsDef = any,
> = ComponentDef<TChildState, TChildEventsDef, TChildCommandsDef> &
  (
    | SingleChildFactory<TParentState, TChildState>
    | ChildCollectionFactory<TParentState, TChildState>
  ) &
  WithChildListeners<TParentState, TParentEventsDef, TChildEventsDef> &
  WithChildCommands<TParentState, TParentEventsDef, TChildCommandsDef>;

export type ChildrenDef<
  TParentState extends State = State,
  TParentEventsDef extends EventsDef = EventsDef,
> = Record<string, ChildDef<TParentState, TParentEventsDef>>;

/***************************************************************************************************************
 *                         COMPONENT DEFINITION
 ***************************************************************************************************************/

export type WithInitialState<
  TState extends State,
  TPartialState extends Partial<TState> = Partial<TState>,
> = {
  readonly initialState?: TPartialState;
};
export type WithChildrenDef<
  TState extends State,
  TEventsDef extends EventsDef,
> = {
  readonly children?: ChildrenDef<TState, TEventsDef>;
};
export type WithSelectors<TState extends State> = {
  readonly selectors?: Selectors<TState>;
};
export type WithEventHandlers<
  TState extends State,
  TEventsDef extends EventsDef,
> = {
  readonly events?: EventHandlers<TState, TEventsDef>;
};

export type WithCommandHandlers<
  TState extends State,
  TEventsDef extends EventsDef,
> = {
  readonly commands?: EventHandlers<TState, TEventsDef>;
};

export type ComponentDef<
  TState extends State = {},
  TEventsDef extends EventsDef = {},
  TCommandsDef extends EventsDef = {},
> = WithInitialState<TState> &
  WithSelectors<TState> &
  WithChildrenDef<TState, TEventsDef> &
  WithEventHandlers<TState, TEventsDef> &
  WithCommandHandlers<TState, TCommandsDef>;

/***************************************************************************************************************
 * Utility types
 ***************************************************************************************************************/

export type ExtractEventsDef<TComponentDef extends ComponentDef<any, any>> =
  TComponentDef extends ComponentDef<any, infer TEventsDef, any>
    ? TEventsDef
    : never;
export type ExtractCommandsDef<
  TComponentDef extends ComponentDef<any, any, any>,
> =
  TComponentDef extends ComponentDef<any, any, infer TCommandsDef>
    ? TCommandsDef
    : never;
