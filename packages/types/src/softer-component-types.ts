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
 *                         COMPONENT CONTRACTS
 ***************************************************************************************************************/
type ForUiContract = {
  readonly uiValues: Record<string, OptionalValue>;
  readonly uiEvents: Record<string, { payload: OptionalValue }>;
  readonly children: Record<string, { isCollection: boolean }>;
};

type ForDependencyContract = {
  readonly outputValues: Record<string, OptionalValue>;
  readonly outputEvents: Record<string, { payload: OptionalValue }>;
  readonly inputCommandEvents: Record<string, { payload: OptionalValue }>;
};
type ConstructorContract = {
  readonly constructWith: OptionalValue;
};
type ForParentContract = ForDependencyContract & ConstructorContract;

export type ComponentContract = {
  readonly forUi: ForUiContract;
  readonly forParent: ForParentContract;
};
//TODO
export type ContextContract = {
  readonly forContextUser: ForDependencyContract;
};
/***************************************************************************************************************
 *                         COMPONENT CONSTRAINTS
 ***************************************************************************************************************/
export type ComponentConstraints = {
  readonly contract: ComponentContract;
  readonly state: State;
  readonly internalEvents: Record<string, { payload: OptionalValue }>;
  //TODO add internal selectors (used in event handlers and child definitions)
};
type AnyComponentDefWithForParentContract<
  TForParentContract extends ForParentContract,
> = ComponentDef<
  ComponentConstraints & { contract: { forParent: TForParentContract } }
>;
type ExtractAllEventsFromComponentConstraints<
  TComponentConstraints extends ComponentConstraints,
> = TComponentConstraints["internalEvents"] &
  TComponentConstraints["contract"]["forUi"]["uiEvents"] &
  TComponentConstraints["contract"]["forParent"]["outputEvents"] &
  TComponentConstraints["contract"]["forParent"]["inputCommandEvents"];

type ExtractAllValuesFromComponentConstraints<
  TComponentConstraints extends ComponentConstraints,
> = TComponentConstraints["contract"]["forUi"]["uiValues"] &
  TComponentConstraints["contract"]["forParent"]["outputValues"];

/***************************************************************************************************************
 *                         STATE
 ***************************************************************************************************************/

/**
 * State is the same type as Value but is used in a specific context.
 */
export type State = Value;
/***************************************************************************************************************
 *                         STATE CONSTRUCTOR
 ***************************************************************************************************************/

export type StateConstructor<
  TComponentContraints extends ComponentConstraints,
> = (constructWith: any) => TComponentContraints["state"];

/***************************************************************************************************************
 *                         SELECTORS
 ***************************************************************************************************************/

/**
 * Selectors take state and return a value
 * @example
 * ```ts
 * (state: {counter:number}) => state.counter
 * ```
 */
export type Selector<TState extends State, TValue extends OptionalValue> = (
  state: TState
) => TValue;

type _Selectors<
  TState extends State,
  TValues extends Record<string, OptionalValue>,
> = {
  [key in keyof TValues]: Selector<TState, TValues[key]>;
};

export type Selectors<TComponentConstraints extends ComponentConstraints> =
  _Selectors<
    TComponentConstraints["state"],
    ExtractAllValuesFromComponentConstraints<TComponentConstraints>
  >;
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
type EventsDef = {
  [TEventName in string]: EventDef;
};
type EventsDefToEventUnion<TEventsDef extends EventsDef> = {
  [TEventName in keyof TEventsDef]: Event<
    TEventName & string,
    TEventsDef[TEventName]["payload"]
  >;
}[keyof TEventsDef];

export type EventConfig = EventDef & {
  readonly uiEvent?: true; //TODO check if we can use boolean type here, and still build type in component builder dynamically
  readonly outputEvent?: true;
  readonly inputCommandEvent?: true;
};

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
type StateUpdater<TState extends State, TPayload extends Payload> = (
  state: TState,
  payload: TPayload
) => TState;

type EventHandler<
  TState extends State,
  TEvent extends Event,
  TEventUnion extends Event,
> = {
  readonly stateUpdater?: StateUpdater<TState, TEvent["payload"]>;
  readonly forwarders?: EventForwarderDef<TState, TEvent, TEventUnion>[];
};
type _EventHandlers<TState extends State, TEventsDef extends EventsDef> = {
  [TEventName in keyof TEventsDef]?: EventHandler<
    TState,
    Event<TEventName & string, TEventsDef[TEventName]["payload"]>,
    EventsDefToEventUnion<TEventsDef>
  >;
};
type EventHandlers<TComponentConstraints extends ComponentConstraints> =
  _EventHandlers<
    TComponentConstraints["state"],
    ExtractAllEventsFromComponentConstraints<TComponentConstraints>
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
    TOwnConstraints["state"],
    EventsDefToEventUnion<TChildEventsDef>, //from child
    EventsDefToEventUnion<
      ExtractAllEventsFromComponentConstraints<TOwnConstraints>
    > //to parent
  >[];
};
type WithChildCommands<
  TOwnConstraints extends ComponentConstraints,
  TChildCommandsDef extends EventsDef,
> = {
  readonly commands?: EventForwarderDef<
    TOwnConstraints["state"],
    EventsDefToEventUnion<
      ExtractAllEventsFromComponentConstraints<TOwnConstraints>
    >, //from parent
    EventsDefToEventUnion<TChildCommandsDef> //to child
  >[];
};

type ChildDef<
  TOwnConstraints extends ComponentConstraints,
  TForParentContract extends ForParentContract,
> = AnyComponentDefWithForParentContract<TForParentContract> &
  WithChildListeners<TOwnConstraints, TForParentContract["outputEvents"]> &
  WithChildCommands<TOwnConstraints, TForParentContract["inputCommandEvents"]>;

type SingleChildDef<
  TOwnConstraints extends ComponentConstraints,
  TForParentContract extends ForParentContract = ForParentContract,
> = SingleChildFactory<
  TOwnConstraints["state"],
  TForParentContract["constructWith"]
> &
  ChildDef<TOwnConstraints, TForParentContract>;

type ChildCollectionDef<
  TOwnConstraints extends ComponentConstraints,
  TForParentContract extends ForParentContract = ForParentContract,
> = ChildCollectionFactory<
  TOwnConstraints["state"],
  TForParentContract["constructWith"]
> &
  ChildDef<TOwnConstraints, TForParentContract>;

export type ChildrenDef<TOwnConstraints extends ComponentConstraints> = {
  [childName in keyof TOwnConstraints["contract"]["forUi"]["children"]]: TOwnConstraints["contract"]["forUi"]["children"][childName] extends {
    isCollection: true;
  }
    ? ChildCollectionDef<TOwnConstraints>
    : SingleChildDef<TOwnConstraints>;
};

/***************************************************************************************************************
 *                         COMPONENT DEFINITION
 ***************************************************************************************************************/
export type ComponentDef<
  TComponentConstraints extends ComponentConstraints = ComponentConstraints,
> = {
  readonly stateConstructor: StateConstructor<TComponentConstraints>;
  readonly selectors: Selectors<TComponentConstraints>;
  readonly eventHandlers: EventHandlers<TComponentConstraints>;
  readonly children: ChildrenDef<TComponentConstraints>;
};
