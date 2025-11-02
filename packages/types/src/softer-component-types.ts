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
export type ComponentContract = {
  readonly constructor: OptionalValue;
  readonly selectors: SelectorsContract;
  readonly events: EventsContract; //TODO rename EventsDef to event payload or event contract
  readonly children: Record<string, { isCollection: boolean }>;
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

export type Selectors<
  TState extends State,
  TSelectorsContract extends SelectorsContract,
> = {
  [key in keyof TSelectorsContract]: Selector<TState, TSelectorsContract[key]>;
};
export type SelectorsContract = Record<string, OptionalValue>;
export type ExtractSelectorContract<TSelectors extends Selectors<any, any>> = {
  [K in keyof TSelectors]: TSelectors[K] extends Selector<any, infer TValue>
    ? TValue
    : never;
};
/***************************************************************************************************************
 *                         EVENTS
 ***************************************************************************************************************/

/**
 * Payload can be a specific value type or undefined (no payload)
 */
export type Payload = OptionalValue;
export type Payloads = Record<string, Payload>;

type Event<
  TEventName extends string = string,
  TPayload extends Payload = Payload,
> = {
  readonly type: TEventName;
  readonly payload: TPayload;
};

/***************************************************************************************************************
 *                         EVENTS DEFINITION
 ***************************************************************************************************************/

/**
 * Event definition with payload type and optional uiEvent marker
 */
type EventContract = {
  readonly payload: Payload;
};
export type EventsContract = {
  [TEventName in string]: EventContract;
};
export type EventsContractToEventUnion<TEventsDef extends EventsContract> = {
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
 *                    STATE UPDATERS
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

export type StateUpdaters<
  TState extends State,
  TEventsContract extends EventsContract,
> = {
  [TEventName in keyof TEventsContract]?: StateUpdater<
    TState,
    TEventsContract[TEventName]["payload"]
  >;
};

export type EventForwarders<
  TState extends State,
  TEventsContract extends EventsContract,
> = {
  [TEventName in keyof TEventsContract]?: EventForwarderDef<
    TState,
    Event<TEventName & string, TEventsContract[TEventName]["payload"]>,
    EventsContractToEventUnion<TEventsContract>
  >;
};
/***************************************************************************************************************
 *                         CHILDREN
 ***************************************************************************************************************/
type SingleChildFactory<
  TState extends State,
  TChildConstructorArgument extends OptionalValue,
> = {
  // TODO instantiate children in event handlers ? and remove getKeys/initialStateFactoryWithKey ???
  // using constructInitialChildWith / addChildOnEvent / removeChildOnEvent
  readonly exists?: (state: TState) => boolean;
  readonly constructWith?: (state: TState) => TChildConstructorArgument; // TODO instantiate children in event handlers ?
};

type ChildCollectionFactory<
  TState extends State,
  TChildConstructorArgument extends OptionalValue,
> = {
  // TODO instantiate children in event handlers ? and remove getKeys/initialStateFactoryWithKey ???
  // using constructInitialChildrenWith: / addChildOnEvent / removeChildOnEvent
  readonly getKeys: (state: TState) => string[]; //keys are used to check if instance already exists
  readonly constructWith: (
    //creates initial state for each child instance that doesn't exist yet
    state: TState,
    key: string
  ) => TChildConstructorArgument;
};
/**
 * From child to own event forwarding definition
 */
type ChildEventsListener<
  TState extends State,
  TFromChildEvent extends Event, // union expected
  TToEvent extends Event, // union expected
> = {
  readonly from: TFromChildEvent["type"];
} & EventForwarderDef<TState, TFromChildEvent, TToEvent>;

type WithChildListeners<
  TState extends State,
  TContract extends ComponentContract,
  TChildEventsDef extends EventsContract,
> = {
  readonly listeners?: ChildEventsListener<
    TState,
    EventsContractToEventUnion<TChildEventsDef>, //from child
    EventsContractToEventUnion<TContract["events"]> //to parent
  >[];
};
type WithChildCommands<
  TState extends State,
  TContract extends ComponentContract,
  TChildCommandsDef extends EventsContract,
> = {
  readonly commands?: EventForwarderDef<
    TState,
    EventsContractToEventUnion<TContract["events"]>, //from parent
    EventsContractToEventUnion<TChildCommandsDef> //to child
  >[];
};

type ChildDef<
  TState extends State,
  TContract extends ComponentContract,
  TForParentContract extends ComponentContract,
> = ComponentDef<any, TForParentContract> & // no internal constraints for child component
  WithChildListeners<TState, TContract, TForParentContract["events"]> & // but their contract need to match parent's listeners and commands
  WithChildCommands<TState, TContract, TForParentContract["events"]>;

type SingleChildDef<
  TState extends State,
  TContract extends ComponentContract,
  TForParentContract extends ComponentContract = ComponentContract,
> = SingleChildFactory<TState, TForParentContract["constructor"]> &
  ChildDef<TState, TContract, TForParentContract>;

type ChildCollectionDef<
  TState extends State,
  TContract extends ComponentContract,
  TForParentContract extends ComponentContract = ComponentContract,
> = ChildCollectionFactory<TState, TForParentContract["constructor"]> &
  ChildDef<TState, TContract, TForParentContract>;

export type ChildrenDef<
  TState extends State,
  TContract extends ComponentContract,
> = {
  [childName in keyof TContract["children"]]: TContract["children"][childName] extends {
    isCollection: true;
  }
    ? ChildCollectionDef<TState, TContract>
    : SingleChildDef<TState, TContract>;
};
/// Utility type to extract child contract from ChildDef
export type ExtractChildrenContract<
  TChildrenDef extends ChildrenDef<any, any>,
> = {
  [K in keyof TChildrenDef]: {
    isCollection: TChildrenDef[K] extends ChildCollectionDef<any, any, any>
      ? true
      : false;
  };
};

/***************************************************************************************************************
 *                         COMPONENT DEFINITION
 ***************************************************************************************************************/
export type ComponentDef<
  TState extends State,
  TPartialContract extends Partial<ComponentContract>,
> = {
  readonly initialState?: TState;
  readonly selectors?: Selectors<
    TState,
    WithDefaultSelectorsContract<TPartialContract["selectors"]>
  >;
  readonly stateUpdaters?: StateUpdaters<
    TState,
    WithDefaultEventsContract<TPartialContract["events"]>
  >;
  readonly eventForwarders?: EventForwarders<
    TState,
    WithDefaultEventsContract<TPartialContract["events"]>
  >;
  readonly children?: ChildrenDef<TState, WithDefault<TPartialContract>>;
};

type WithDefault<TPartialContract extends Partial<ComponentContract>> = {
  constructor: TPartialContract extends { constructor: OptionalValue }
    ? TPartialContract["constructor"]
    : undefined;
  selectors: WithDefaultSelectorsContract<TPartialContract["selectors"]>;
  events: WithDefaultEventsContract<TPartialContract["events"]>;
  children: TPartialContract extends {
    children: Record<string, { isCollection: boolean }>;
  }
    ? TPartialContract["children"]
    : {};
};

type WithDefaultEventsContract<
  TEventsContract extends EventsContract | undefined,
> = TEventsContract extends EventsContract ? TEventsContract : {};

type WithDefaultSelectorsContract<
  TSelectorsContract extends SelectorsContract | undefined,
> = TSelectorsContract extends SelectorsContract ? TSelectorsContract : {};
