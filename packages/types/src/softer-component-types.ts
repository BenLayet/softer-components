/**
 * Core types for state-manager-agnostic component definitions.
 * These types provide the foundation for reusable and composable components,
 * compatible with any state manager.
 */

/***************************************************************************************************************
 *                         VALUE
 ***************************************************************************************************************/
// Value represents all possible data types that can be used in component state, events, and payloads.
// equivalent to JSON value with addition of Date type.
export type Value =
  | string
  | number
  | boolean
  | Date
  | null
  | { readonly [key: string]: Value }
  | readonly Value[];

export type OptionalValue = Value | undefined;

/***************************************************************************************************************
 *                         COMPONENT CONSTRAINTS
 ***************************************************************************************************************/
type ComponentContract = {
  readonly constructorArgument: OptionalValue;
  readonly selectorValues: Record<string, OptionalValue>;
  readonly eventPayloads: EventsDef; //TODO rename EventsDef to event payload or event contract
  readonly children: Record<string, { isCollection: boolean }>;
};
type InternalConstraints = {
  readonly state: State;
};

export type ComponentConstraints = {
  readonly internal: InternalConstraints;
  readonly contract: ComponentContract;
};

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
 * A selector takes a state and returns a value, possibly undefined.
 * @example
 * ```ts
 * (state: {counter:number}) => state.counter
 * ```
 */
export type Selector<
  TState extends State,
  TValue extends OptionalValue = OptionalValue,
> = (state: TState) => TValue;

export type Selectors<TConstraints extends ComponentConstraints> = {
  [key in keyof TConstraints["contract"]["selectorValues"]]: Selector<
    TConstraints["internal"]["state"],
    TConstraints["contract"]["selectorValues"][key]
  >;
};

export type NewSelectors<TPreviousConstraints extends ComponentConstraints> = {
  [key in Exclude<
    string,
    keyof TPreviousConstraints["contract"]["selectorValues"]
  >]: Selector<TPreviousConstraints["internal"]["state"], OptionalValue>;
};
/***************************************************************************************************************
 *                         EVENTS
 ***************************************************************************************************************/

/**
 * Payload can be a specific value type or undefined (no payload)
 */
export type Payload = OptionalValue;
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

/**
 * Event definition with payload type and optional uiEvent marker
 */
type EventDef = {
  readonly payload: Payload;
};
export type EventsDef = {
  [TEventName in string]: EventDef;
};
export type EventsDefToEventUnion<TEventsDef extends EventsDef> = {
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
export type EventForwarderDef<
  TState extends State,
  TFromEvent extends Event, //not expecting a union (but tolerates 'any')
  TToEvent extends Event, //not expecting a union (but tolerates 'any')
> = {
  readonly to: string extends TFromEvent["type"]
    ? TToEvent["type"] //allow any type if TFromEvent type is not precise
    : Exclude<TToEvent["type"], TFromEvent["type"]>; //prevent forwarding to same event type
} & WithPayloadDef<TState, TFromEvent["payload"], TToEvent["payload"]> &
  OnConditionDef<TState, TFromEvent["payload"]>;

/***************************************************************************************************************
 *                      EVENT HANDLERS
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

export type EventHandler<
  TState extends State,
  TEvent extends Event,
  TForwardDestinationEventUnion extends Event,
> = {
  readonly stateUpdater?: StateUpdater<TState, TEvent["payload"]>;
  readonly forwarders?: EventForwarderDef<
    TState,
    TEvent,
    TForwardDestinationEventUnion
  >[];
};
export type EventHandlers<
  TState extends State,
  TEventsDef extends EventsDef,
> = {
  [TEventName in keyof TEventsDef]?: EventHandler<
    TState,
    Event<TEventName & string, TEventsDef[TEventName]["payload"]>,
    EventsDefToEventUnion<TEventsDef>
  >;
};
/********
 * new event handlers
 * *********/
type _NewEventHandler<
  TState extends State,
  TPreviousEventsDef extends EventsDef,
  TNewEventsDef extends EventsDef = EventsDef,
> = {
  //TODO exclude keys that are already defined
  [TEventName in keyof TNewEventsDef]: EventHandler<
    TState,
    Event<TEventName & string, TNewEventsDef[TEventName]["payload"]>,
    | EventsDefToEventUnion<TPreviousEventsDef>
    | EventsDefToEventUnion<TNewEventsDef>
  >;
};
export type NewEventHandlers<
  TPreviousConstraints extends ComponentConstraints,
> = _NewEventHandler<
  TPreviousConstraints["internal"]["state"],
  TPreviousConstraints["contract"]["eventPayloads"]
>;
/***************************************************************************************************************
 *                         CHILDREN
 ***************************************************************************************************************/
type SingleChildFactory<
  TParentState extends State,
  TChildConstructWith extends OptionalValue,
> = {
  // TODO instantiate children in event handlers ? and remove getKeys/initialStateFactoryWithKey ???
  // using constructInitialChildWith / addChildOnEvent / removeChildOnEvent
  readonly exists?: (state: TParentState) => boolean;
  readonly constructWith?: (state: TParentState) => TChildConstructWith; // TODO instantiate children in event handlers ?
};

type ChildCollectionFactory<
  TParentState extends State,
  TChildConstructWith extends OptionalValue,
> = {
  // TODO instantiate children in event handlers ? and remove getKeys/initialStateFactoryWithKey ???
  // using constructInitialChildrenWith: / addChildOnEvent / removeChildOnEvent
  readonly getKeys: (state: TParentState) => string[]; //keys are used to check if instance already exists
  readonly constructWith: (
    //creates initial state for each child instance that doesn't exist yet
    state: TParentState,
    key: string
  ) => TChildConstructWith;
};
/**
 * Generic event forwarder definition (used in children definitions)
 */
type ChildListener<
  TState extends State,
  TFromChildEvent extends Event,
  TToEvent extends Event,
> = {
  readonly from: TFromChildEvent["type"];
} & EventForwarderDef<TState, TFromChildEvent, TToEvent>;

type WithChildListeners<
  TOwnConstraints extends ComponentConstraints,
  TChildEventsDef extends EventsDef,
> = {
  readonly listeners?: ChildListener<
    TOwnConstraints["internal"]["state"],
    EventsDefToEventUnion<TChildEventsDef>, //from child
    EventsDefToEventUnion<TOwnConstraints["contract"]["eventPayloads"]> //to parent
  >[];
};
type WithChildCommands<
  TOwnConstraints extends ComponentConstraints,
  TChildCommandsDef extends EventsDef,
> = {
  readonly commands?: EventForwarderDef<
    TOwnConstraints["internal"]["state"],
    EventsDefToEventUnion<TOwnConstraints["contract"]["eventPayloads"]>, //from parent
    EventsDefToEventUnion<TChildCommandsDef> //to child
  >[];
};

type ChildDef<
  TOwnConstraints extends ComponentConstraints,
  TForParentContract extends ComponentConstraints["contract"],
> = ComponentDef<{ internal: any; contract: TForParentContract }> & // no internal constraints for child component
  WithChildListeners<TOwnConstraints, TForParentContract["eventPayloads"]> & // but their contract need to match parent's listeners and commands
  WithChildCommands<TOwnConstraints, TForParentContract["eventPayloads"]>;

type SingleChildDef<
  TOwnConstraints extends ComponentConstraints,
  TForParentContract extends ComponentContract = ComponentContract,
> = SingleChildFactory<
  TOwnConstraints["internal"]["state"],
  TForParentContract["constructorArgument"]
> &
  ChildDef<TOwnConstraints, TForParentContract>;

type ChildCollectionDef<
  TOwnConstraints extends ComponentConstraints,
  TForParentContract extends ComponentContract = ComponentContract,
> = ChildCollectionFactory<
  TOwnConstraints["internal"]["state"],
  TForParentContract["constructorArgument"]
> &
  ChildDef<TOwnConstraints, TForParentContract>;

export type ChildrenDef<TOwnConstraints extends ComponentConstraints> = {
  [childName in keyof TOwnConstraints["contract"]["children"]]: TOwnConstraints["contract"]["children"][childName] extends {
    isCollection: true;
  }
    ? ChildCollectionDef<TOwnConstraints>
    : SingleChildDef<TOwnConstraints>;
};

/***************************************************************************************************************
 *                         COMPONENT DEFINITION
 ***************************************************************************************************************/
export type ComponentDef<
  TConstraints extends ComponentConstraints = ComponentConstraints,
> = {
  readonly initialState: TConstraints["internal"]["state"];
  readonly selectors: Selectors<TConstraints>;
  readonly eventHandlers: EventHandlers<
    TConstraints["internal"]["state"],
    TConstraints["contract"]["eventPayloads"]
  >;
  readonly children: ChildrenDef<TConstraints>;
};

// Extract contract from component definition
export type ExtractConstraints<TComponentDef extends ComponentDef<any>> =
  TComponentDef extends ComponentDef<infer TConstraints> ? TConstraints : never;

export type ExtractContract<TComponentDef extends ComponentDef<any>> =
  ExtractConstraints<TComponentDef>["contract"];
