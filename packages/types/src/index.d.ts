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
 * State can be a specific value type or undefined (void)
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
export type Selector<TState extends State, TValue extends Value = Value> = (
  state: TState,
) => TValue;

/***************************************************************************************************************
 *                         EVENTS
 ***************************************************************************************************************/

/**
 * Payload can be a specific value type or void (no payload)
 */
export type Payload = Value | void;

/**
 * Event with type and payload (payload is always present and typed by TPayload;
 * use `void`/`undefined` for events that conceptually carry no payload)
 * @example
 * ```ts
 * type ButtonClicked:Event = {type:"buttonClicked", payload:void};
 * const event:ButtonClicked = {type:"buttonClicked", payload: undefined};
 *
 * type LinkClicked:Event = {type:"linkClicked", payload:{url:string}};
 * const event:LinkClicked = {type:"linkClicked", payload:{url:"https://example.com"}};
 * ```
 */
type Event<
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
 * State Updater takes only one type of payload: either void or a specific type.
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
export type StateUpdater<
  TState extends State = State,
  TPayload extends Payload = Payload,
> = (state: TState, payload: TPayload) => TState;

/**
 * StateUpdaterRecord maps event types to their corresponding function
 * @example
 * ```ts
 * {
 *   incrementRequested: (state: {counter:number}) => ({counter: state.counter + 1}),
 *   incrementByAmountRequested: (state: {counter:number}, payload:number) => ({counter: state.counter + payload}),
 * }
 * ```
 */
type StateUpdaters<TState extends State, TEvents extends Event> =
  TEvents extends Event<infer TEventName, infer TPayload>
    ? {
        readonly [K in TEventName]: StateUpdater<TState, TPayload>;
      }
    : never;

/***************************************************************************************************************
 *                         EVENT FORWARDERS
 ***************************************************************************************************************/

/**
 * Basic event forwarder definition with onEvent and thenDispatch
 */
type OnEventThenDispatchDef<
  TFromEventName extends string,
  TToEventName extends string,
> = {
  readonly onEvent: TFromEventName;
  readonly thenDispatch: TToEventName;
};

/**
 * Defines withPayload property for event forwarders
 * Required when payload types don't match, optional when they do
 */
type WithPayloadDef<
  TState extends State,
  TFromPayload extends Payload,
  TToPayload extends Payload,
> = TToPayload extends void
  ? {}
  : TFromPayload extends TToPayload
    ? {
        readonly withPayload?: (
          state: TState,
          payload: TFromPayload,
        ) => TToPayload;
      }
    : {
        readonly withPayload: (
          state: TState,
          payload: TFromPayload,
        ) => TToPayload;
      };

/**
 * Defines onCondition property for event forwarders
 * Optional condition to determine if event should be forwarded
 */
type OnConditionDef<
  TState extends State,
  TFromPayload extends Payload,
> = TFromPayload extends void
  ? {
      readonly onCondition?: (state: TState) => boolean;
    }
  : {
      readonly onCondition?: (state: TState, payload: TFromPayload) => boolean;
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
  TToEvents extends Event, //expects union
> = TFromEvents extends infer TFromEvent extends Event
  ? TToEvents extends infer TToEvent extends Event
    ? TToEvent extends never // tolerates any as TToEvents
      ? _EventForwarderDef<TState, TFromEvent, TToEvent>
      : TToEvent extends TFromEvent // prevent dispatching to self
        ? never
        : _EventForwarderDef<TState, TFromEvent, TToEvent>
    : never
  : never;

/***************************************************************************************************************
 *                         DEPENDENCY EVENTS
 ***************************************************************************************************************/
/**
 * Dependency represents a named collection of events from a child component
 * @example
 ```ts
   type TestEvents = {
    type: "numberExpected";
    payload: number;
   } | {
    type: "stringExpected";
    payload: string;
   }
  

   const event1 : DependencyEvent<"test", TestEvents> = {type: "test/numberExpected", payload: 42};
   const event2 : DependencyEvent<"test", TestEvents> = {type: "test/stringExpected", payload: "foo"};
   const event3 : DependencyEvent<"test", TestEvents> = {type: "test/numberExpected", payload: "shouldError"}; // Should error
 ```
 */
type DependencyEvent<
  TDependencyName extends string,
  TEvent extends Event,
> = TEvent extends { type: infer T; payload: infer P }
  ? { readonly type: `${TDependencyName}/${T & string}`; readonly payload: P }
  : never;

type ExtractDependencyEvent<TChildrenEvents extends Record<string, Event>> = {
  [TDependencyName in keyof TChildrenEvents]: DependencyEvent<
    TDependencyName & string,
    TChildrenEvents[TDependencyName]
  >;
}[keyof TChildrenEvents];

/***************************************************************************************************************
 *
 *                     COMPONENT DEFINITION
 *
 ***************************************************************************************************************/

/**
 * Component definition type for defining a component with:
 * - initialState: immutable, completely reconstructed by the state updaters after an event
 * - selectors: to select values from the state
 * - stateUpdaters: to update the state based on actions with payloads
 * - eventForwarders: to forward events to other parts of the application
 */
export type ComponentDef<
  TEvents extends Event = Event, // expects union
  TState extends State = State,
  TSelectors extends Record<string, Selector<TState>> = Record<
    string,
    Selector<TState>
  >,
  TChildrenEvents extends Record<string, Event> = Record<string, Event>,
  TUiEvents extends TEvents = TEvents,
> = {
  readonly initialState?: TState;
  readonly selectors?: TSelectors;
  readonly stateUpdaters?: StateUpdaters<TState, TEvents>;
  readonly uiEventTypes?: TUiEvents["type"][];
  readonly children?: {
    [child in keyof TChildrenEvents]: ComponentDef<TChildrenEvents[child]>;
  };
  readonly eventForwarders?: /** within the same component */
  (
    | EventForwarderDef<TState, TEvents, TEvents>
    /** from child components to this component */
    | EventForwarderDef<
        TState,
        ExtractDependencyEvent<TChildrenEvents>,
        TEvents
      >
    /** from this component to child components */
    | EventForwarderDef<
        TState,
        TEvents,
        ExtractDependencyEvent<TChildrenEvents>
      >
    /** between child components */
    | EventForwarderDef<
        TState,
        ExtractDependencyEvent<TChildrenEvents>,
        ExtractDependencyEvent<TChildrenEvents>
      >
  )[];
};
