/**
 * Core types for state-manager-agnostic component definitions.
 * These types provide the foundation for reusable and composable components,
 * compatible with any state manager.
 */
type Value =
    | string
    | number
    | boolean
    | null
    | { readonly [key: string]: Value }
    | readonly Value[];

// State can be a specific value type or undefined (void)
export type State = Value;

// Selector takes state and returns a value, with state being optional
export type Selector<TState extends State, TReturnType extends Value> = (state: TState) => TReturnType;
type SelectorMap<TState extends State, TReturnType extends Record<string, Value>> = {
    readonly [key in keyof TReturnType]: Selector<TState, TReturnType[key]>;
};

// Payload can be a specific value type or void (no payload)
type Payload = Value | void;

// Event handler takes only one type of payload: either void or a specific type
export type EventHandler<TState extends State = State, TPayload extends Payload = void> =
    (state: TState, payload: TPayload) => TState;

// EventHandler maps event types to their corresponding handlers
export type EventHandlerMap<TState extends State, TPayloads extends Record<string, Payload> = {}> = {
    readonly [eventType in keyof TPayloads]: EventHandler<TState, TPayloads[eventType]>;
};

// ChainedEvent type for defining a chain of synchronous event
type EventLocator<TEventType extends string = string, TPath extends readonly string[] = readonly string[]> = {
    readonly eventType: TEventType;
    readonly path?: TPath;
};
type ChainedEvent<TState extends State> = {
    readonly onEvent: EventLocator;
    readonly thenDispatch: EventLocator;
    readonly withPayload?: (previousPayload?: Payload, state?: TState) => Payload;
    readonly onCondition?: (previousPayload?: Payload, state?: TState) => boolean;
};

// Component definition type for defining a component with state, selectors, and event handlers
export type ComponentDef<
    TState extends State = State,
    TPayloads extends Record<string, Payload> = Record<string, Payload>,
    TSelectorReturnTypes extends Record<string, Value> = Record<string, Value>
> = {
    readonly initialState: TState;
    readonly children?: Record<string, ComponentDef>;
    readonly chainedEvents?: ChainedEvent<TState>[];
    readonly eventHandlers?: EventHandlerMap<TState, TPayloads>;
    readonly selectors?: SelectorMap<TState, TSelectorReturnTypes>;
};
