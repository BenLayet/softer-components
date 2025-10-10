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

type DependenciesEventPath<
    EventDependencies extends Record<string, Record<string, Payload>>> ={
    [ComponentName in keyof EventDependencies]: {
        [EventName in keyof EventDependencies[ComponentName]]: `${ComponentName & string}/${EventName & string}`
    }[keyof EventDependencies[ComponentName]]
}[keyof EventDependencies];


type EventPath<
    TPayloads extends Record<string, Payload>,
    EventDependencies extends Record<string, Record<string, Payload>>> =
    (keyof TPayloads ) |
    DependenciesEventPath<EventDependencies>;


type GetPayloadType<
    TEvent extends string,
    TPayloads extends Record<string, Payload>,
    EventDependencies extends Record<string, Record<string, Payload>>
> = TEvent extends keyof TPayloads
    ? TPayloads[TEvent]
    : TEvent extends DependenciesEventPath<EventDependencies>
        ? ExtractDependencyPayload<TEvent, EventDependencies>
        : never;

type ExtractDependencyPayload<
    TEvent extends string,
    EventDependencies extends Record<string, Record<string, Payload>>
> = {
    [ComponentName in keyof EventDependencies]: {
        [EventName in keyof EventDependencies[ComponentName]]: TEvent extends `${ComponentName & string}/${EventName & string}`
            ? EventDependencies[ComponentName][EventName]
            : never
    }[keyof EventDependencies[ComponentName]]
}[keyof EventDependencies];


type ChainedEvent<
    TState extends State,
    TPayloads extends Record<string, Payload> = Record<string, Payload>,
    EventDependencies extends Record<string, Record<string, Payload>> = {},
    TOnEvent extends EventPath<TPayloads, EventDependencies> = EventPath<TPayloads, EventDependencies>,
    TThenDispatch extends EventPath<TPayloads, EventDependencies> = EventPath<TPayloads, EventDependencies>

> = {
    readonly onEvent: TOnEvent;
    readonly thenDispatch: TThenDispatch;
    readonly withPayload?: (
        previousPayload: GetPayloadType<TOnEvent, TPayloads, EventDependencies>,
        state: TState
    ) => GetPayloadType<TThenDispatch, TPayloads, EventDependencies>;
    readonly onCondition?: (
        previousPayload: GetPayloadType<TOnEvent, TPayloads, EventDependencies>,
        state: TState
    ) => boolean;
};

const test: ChainedEvent<
    {value:number},
    { updated:number },
    { counter : {incremented:string} },
    "counter/incremented",
    "updated"
>={

};

type test = ChainedEvent<
    {value: number},
    {incrementRequested:void},
    {
        amount: {
            amountUpdated: number,
            amountCleared: void
        },
        user: {
            userLoggedIn: string,
            userLoggedOut: void
        }
    }>;
type test2 = keyof {incrementRequested:void};

// Component definition type for defining a component with state, selectors, and event handlers
export type ComponentDef<
    TState extends State = State,
    TPayloads extends Record<string, Payload> = Record<string, Payload>,
    TSelectorReturnTypes extends Record<string, Value> = Record<string, Value>,
    EventDependencies extends Record<string, Record<string, Payload>> = {},
> = {
    readonly initialState: TState;
    readonly chainedEvents?: ChainedEvent<TState, TPayloads, EventDependencies>[];
    readonly eventHandlers?: Partial<EventHandlerMap<TState, TPayloads>>;
    readonly selectors?: SelectorMap<TState, TSelectorReturnTypes>;
};