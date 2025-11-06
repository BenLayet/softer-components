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
 *                         STATE
 ***************************************************************************************************************/

/**
 * State is the same type as OptionalValue but is used in a specific context.
 */
export type State = OptionalValue;
/***************************************************************************************************************
 *                         SELECTORS
 ***************************************************************************************************************/

/**
 * A selector takes a state and returns a value, possibly undefined.
 * Selectors are Record of selectors
 * @example
 * ```ts
 * (state: {counter:number}) => state.counter
 * ```
 */
export type Selectors<TState extends State> = {
  [key in string]: (state: TState) => OptionalValue;
};
/***************************************************************************************************************
 *                         EVENTS
 ***************************************************************************************************************/

/**
 * Payload can be a specific value type or undefined (no payload)
 */
export type Payload = OptionalValue;
export type Payloads = Record<string, Payload>;

export type Event<
  TEventName extends string = string,
  TPayload extends Payload = Payload,
> = {
  readonly type: TEventName;
  readonly payload: TPayload;
};

/***************************************************************************************************************
 *                         EVENTS CONTRACTS
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
type EventsContractToEventUnion<TEventsDef extends EventsContract> = {
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
  ? {
      readonly withPayload?: (
        state: TState & {},
        payload: TFromPayload
      ) => TToPayload;
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
  readonly from: TFromEvent["type"];
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
}[keyof TEventsContract][]; //array of forwarders per event
/***************************************************************************************************************
 *                         CHILDREN DEFINITION
 ***************************************************************************************************************/

export type SingleChildFactory<
  TParentState extends State,
  TProtoChildState extends OptionalValue,
> = {
  // TODO instantiate children in event handlers ? and remove getKeys/initialStateFactoryWithKey ???
  // using constructInitialChildWith / addChildOnEvent / removeChildOnEvent
  readonly exists?: (state: TParentState) => boolean;
  readonly protoState?: (state: TParentState) => TProtoChildState; // TODO instantiate children in event handlers ?
};

export type ChildCollectionFactory<
  TParentState extends State,
  TProtoChildState extends OptionalValue,
> = {
  // TODO instantiate children in event handlers ? and remove getKeys/initialStateFactoryWithKey ???
  // using constructInitialChildrenWith: / addChildOnEvent / removeChildOnEvent
  readonly getKeys: (state: TParentState) => string[]; //keys are used to check if instance already exists
  readonly protoState?: (
    //creates initial state for each child instance that doesn't exist yet
    state: TParentState,
    key: string
  ) => TProtoChildState;
};
/**
 * From child to own event forwarding definition
 */
type ChildEventsListener<
  TParentState extends State,
  TFromChildEvent extends Event, // union expected
  TToParentEvent extends Event, // union expected
> = {
  readonly from: TFromChildEvent["type"];
} & EventForwarderDef<TParentState, TFromChildEvent, TToParentEvent>;

type WithChildListeners<
  TParentState extends State,
  TParentEventsContract extends EventsContract,
  TChildEventsDef extends EventsContract,
> = {
  readonly listeners?: ChildEventsListener<
    TParentState,
    EventsContractToEventUnion<TChildEventsDef>, //from child
    EventsContractToEventUnion<TParentEventsContract> //to parent
  >[];
};
type WithChildCommands<
  TParentState extends State,
  TParentEventsContract extends EventsContract,
  TChildCommandsDef extends EventsContract,
> = {
  readonly commands?: EventForwarderDef<
    TParentState,
    EventsContractToEventUnion<TParentEventsContract>, //from parent
    EventsContractToEventUnion<TChildCommandsDef> //to child
  >[];
};

export type ChildDef<
  TParentState extends State,
  TParentEventsContract extends EventsContract,
  TChildComponentDef extends ComponentDef<any, any, any> = ComponentDef<
    any,
    any,
    any
  >,
> = TChildComponentDef & // no internal constraints for child component
  WithChildListeners<
    TParentState,
    TParentEventsContract,
    ExtractEventContract<TChildComponentDef>
  > & // but their contract need to match parent's listeners and commands
  WithChildCommands<
    TParentState,
    TParentEventsContract,
    ExtractEventContract<TChildComponentDef>
  >;

export type SingleChildDef<
  TParentState extends State,
  TParentEventsContract extends EventsContract,
  TChildComponentDef extends ComponentDef<any, any, any> = ComponentDef<
    any,
    any,
    any
  >,
> = { readonly isCollection?: false } & SingleChildFactory<
  TParentState,
  ExtractConstructorContract<TChildComponentDef>
> &
  ChildDef<TParentState, TParentEventsContract, TChildComponentDef>;

export type ChildCollectionDef<
  TParentState extends State,
  TParentEventsContract extends EventsContract,
  TChildComponentDef extends ComponentDef<any, any, any> = ComponentDef<
    any,
    any,
    any
  >,
> = { readonly isCollection: true } & ChildCollectionFactory<
  TParentState,
  ExtractConstructorContract<TChildComponentDef>
> &
  ChildDef<TParentState, TParentEventsContract, TChildComponentDef>;

export type ChildrenDef<
  TParentState extends State,
  TParentEventsContract extends EventsContract,
> = {
  [childName in string]:
    | ChildCollectionDef<TParentState, TParentEventsContract>
    | SingleChildDef<TParentState, TParentEventsContract>;
};

/***************************************************************************************************************
 *                         COMPONENT DEFINITION
 ***************************************************************************************************************/
export type ComponentDef<
  TState extends State = State,
  TEventsContract extends EventsContract = EventsContract,
  TProtoState extends OptionalValue = never,
> = {
  readonly initialState?: (protoState: TProtoState) => TState;
  readonly selectors?: Selectors<TState>;
  readonly stateUpdaters?: StateUpdaters<TState, TEventsContract>;
  readonly eventForwarders?: EventForwarders<TState, TEventsContract>;
  readonly children?: ChildrenDef<TState, TEventsContract>;
};

/***************************************************************************************************************
 *                         COMPONENT CONTRACTS
 ***************************************************************************************************************/
/**
 * State is an internal constraint and not part of the contract.
 * EventsContracts is necesssary to construct the component definition.
 *
 * ChildrenContract, SelectorsContract and ConstructorContract can be extracted from the component definition.
 */
export type ChildrenContract = Record<string, { isCollection: boolean }>;
export type ConstructorContract = OptionalValue;
export type SelectorsContract = Record<string, OptionalValue>;
/**
 * Component contract defining selectors, events and children contracts.
 * Used by UI components to interact with softer components.
 */
export type UiContract = {
  readonly selectors: SelectorsContract;
  readonly events: EventsContract;
  readonly children: ChildrenContract;
};

/**
 * Component contract defining initialState and events contracts.
 * Used by parent softer components to interact with child softer components.
 */
export type ForParentContract = {
  readonly protoState: OptionalValue;
  readonly events: EventsContract;
};

/***************************************************************************************************************
 *                         COMPONENT CONTRACTS EXTRACTION HELPERS
 ***************************************************************************************************************/
export type ExtractChildrenContract<
  TComponentDef extends ComponentDef<any, any, any>,
> = {
  [K in keyof TComponentDef["children"]]: {
    isCollection: TComponentDef["children"][K] extends ChildCollectionDef<
      any,
      any,
      any
    >
      ? true
      : false;
  };
};

export type ExtractSelectorContract<
  TComponentDef extends ComponentDef<any, any, any>,
> = {
  [K in keyof TComponentDef["selectors"]]: TComponentDef["selectors"][K] extends (
    state: any
  ) => infer TValue
    ? TValue
    : never;
};

export type ExtractEventContract<
  TComponentDef extends ComponentDef<any, any, any>,
> =
  TComponentDef extends ComponentDef<any, infer TEventsContract, any>
    ? TEventsContract
    : never;

export type ExtractConstructorContract<
  TComponentDef extends ComponentDef<any, any, any>,
> =
  TComponentDef extends ComponentDef<any, any, infer TProtoState>
    ? TProtoState
    : never;
