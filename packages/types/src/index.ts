/**
 * Core types for state-manager-agnostic component definitions.
 * These types provide the foundation for reusable and composable components,
 * compatible with any state manager.
 */
export type Value =
    | string
    | number
    | boolean
    | Date
    | null
    | { readonly [key: string]: Value }
    | readonly Value[];

// State can be a specific value type or undefined (void)
export type State = Value;

// Selector takes state and returns a value, with state being optional
// example: 
// ```
// (state: {counter:number}) => state.counter
// ```
export type Selector<TState extends State, TReturnType extends Value = Value> = (state: TState) => TReturnType;
type SelectorMap<TState extends State, TReturnType extends Record<string, Value>> = {
    readonly [key in keyof TReturnType]: Selector<TState, TReturnType[key]>;
};

// Payload can be a specific value type or void (no payload)
export type Payload = Value | void;

// Event handler takes only one type of payload: either void or a specific type
// example swith and without payload: 
// ```
// (state: {counter:number}, payload:number) => ({counter: state.counter + payload})
// (state: {counter:number}) => ({counter: state.counter + 1})
// ```
export type EventHandler<TState extends State = State, TPayload extends Payload = void> =
    (state: TState, payload: TPayload) => TState;

// EventHandler maps event types to their corresponding handlers
// example: 
// ```
// { 
//   incrementRequested: (state: {counter:number}) => ({counter: state.counter + 1}),
//   incrementByAmountRequested: (state: {counter:number}, payload:number) => ({counter: state.counter + payload}),
// }
// ```
export type EventHandlerRecord<TState extends State, TPayloads extends Record<string, Payload> = {}> = {
    readonly [eventType in keyof TPayloads]: EventHandler<TState, TPayloads[eventType]>;
};

// Payloads is a record mapping event names to their payload types
// example: 
// ```
// { 
//   incrementRequested: void,
//   incrementByAmountRequested: number,
// }
// ```
export type Payloads = Record<string, Payload>;

// DependenciesPayloads is a record mapping dependency name to the payloads of their events
// example: 
// ```
// {
//  amount: { amountUpdated: number },
//  user: { userLoggedIn: User, userLoggedOut: void },
// }
// ```
// where "amount/amountUpdated", "user/userLoggedIn", "user/userLoggedOut" are valid event paths
export type DependenciesPayloads = Record<string, Payloads>;


// Utility type to represent an event signature with a specific event name and payload type
// example: 
// ```
// type User = { id: string, name: string };
// type MyPayloads = { userLoggedIn: User, userLoggedOut: void };
// type MyEventSignature = ExtractEventSignature<MyPayloads>;
// type Expected = 
// | ["userLoggedIn", string] 
// | ["userLoggedOut", void]
// ```
type ExtractEventSignature<
    TPayloads extends Payloads
> = {
    [EventName in keyof TPayloads]: [`${EventName & string}`, TPayloads[EventName]]
}[keyof TPayloads];


// utility type to extract event paths from dependencies, and build a union of event names
// example: 
// ```
// type MyDependenciesPayloads = {
//     amount: { amountUpdated: number },
//     user: { userLoggedIn: string, userLoggedOut: void },
// };
// type MyEventSignatures = ExtractDependenciesEventSignature<MyDependenciesPayloads>;

// type Expected = 
// | ["amount/amountUpdated", number] 
// | ["user/userLoggedIn", string] 
// | ["user/userLoggedOut", void]
// ```
export type ExtractDependenciesEventSignature<
    T extends DependenciesPayloads> = keyof T extends infer DependencyName ?
    DependencyName extends string ?
    {
        [EventName in keyof T[DependencyName]]: [`${DependencyName & string}/${EventName & string}`, T[DependencyName][EventName]]
    }[keyof T[DependencyName]]
    : never : never;

// utility type to extract event signatures from both own payload and dependencies, and build a union of event signatures
// example
// ```
// type User = { id: string, name: string };
// type MyPayloads = { amountUpdated: number };
// type MyDependenciesPayloads = {
//     user: { userLoggedIn: User, userLoggedOut: void },
// };
// type MyEventSignatures = ExtractAllEventSignature<MyPayloads, MyDependenciesPayloads>;

// type Expected = 
// | ["amountUpdated", number] 
// | ["user/userLoggedIn", User] 
// | ["user/userLoggedOut", void]
// ```
type ExtractAllEventSignature<
    TPayloads extends Payloads,
    TDependenciesPayloads extends DependenciesPayloads
> = ExtractEventSignature<TPayloads> | ExtractDependenciesEventSignature<TDependenciesPayloads>;

// utility type to extract event paths from both own payload and dependencies, and build a union of event names
// ```
// type User = { id: string, name: string };
// type MyPayloads = { amountUpdated: number };
// type MyDependenciesPayloads = {
//     user: { userLoggedIn: User, userLoggedOut: void },
// };
// type MyEventSignatures = ExtractAllEventPath<MyPayloads, MyDependenciesPayloads>;

// type Expected = 
// | "amountUpdated"
// | "user/userLoggedIn"
// | "user/userLoggedOut"
// ```
export type ExtractAllEventPath<
    TPayloads extends Payloads,
    TDependenciesPayloads extends DependenciesPayloads> =
    ExtractAllEventSignature<TPayloads, TDependenciesPayloads>[0];


// utility type to extract the payload type for a given event name from both own payloads and dependencies
// ```
// type MyPayloads = { incrementRequested: void };
// type MyDependenciesPayloads = {
//     user: { userLoggedIn: string },
// };
// type Test1 = ExtractPayloadByEventName<MyPayloads, MyDependenciesPayloads, "incrementRequested">; // void
// type Test2 = ExtractPayloadByEventName<MyPayloads, MyDependenciesPayloads, "user/userLoggedIn">; // string
// ```
type ExtractPayloadByEventName<TPayloads extends Payloads,
    TDependenciesPayloads extends DependenciesPayloads,
    TEventName extends string> = (ExtractAllEventSignature<TPayloads, TDependenciesPayloads> & [TEventName, unknown])[1];

// utility type for mapping payloads between events, with access to state and previous payload
// If previous payload is void, mapper takes only state
// If previous payload is not void, mapper takes previous payload and state
// example: 
// ```
// type MyState = { count: number };
// type MyPreviousPayload = { amount: number } | void;
// type MyNewPayload = { newAmount: number };
// // Mapper when previous payload is not void
// const mapper1: PayloadMapper<MyState, { amount: number }, { newAmount: number }> = (previousPayload, state) => ({
//     newAmount: previousPayload.amount + state.count
// });
// // Mapper when previous payload is void  
// const mapper2: PayloadMapper<MyState, void, { newAmount: number }> = (state) => ({
//     newAmount: state.count
// });
// ```
type PayloadMapper<
    TState extends State,
    TPreviousPayload extends Payload,
    TNewPayload extends Payload
> = TPreviousPayload extends void ?
    (state: TState) => TNewPayload
    : (previousPayload: TPreviousPayload, state: TState) => TNewPayload;


// utility type to extract event paths from dependencies, and build a union of event names
// ```
type MyState = { userName: string };
type MyPayloads = { helloRequested: string };
type MyDependenciesPayloads = {
    user: { loggedIn: string, loggedOut: Date },
};
type MyChainedEvent = ChainedEvent<MyState, MyPayloads, MyDependenciesPayloads>;
//  // uninon of all valid chained events: including
// | { onEvent: "user/loggedIn";  thenDispatch: "userAuthenticated"; }
// | { onEvent: "user/loggedIn";  thenDispatch: "userAuthenticated"; onCondition: (state: MyState, previousPayload: string) => boolean; }
// | { onEvent: "user/loggedIn";  thenDispatch: "userAuthenticated"; withPayload: (state: MyState, previousPayload: string) => string; }
// ```
//TODO rename to EventForwarder
export type ChainedEvent<
    TState extends State,
    TPayloads extends Record<string, Payload>,
    TEventDependencies extends Record<string, Record<string, Payload>>,
    TTriggeringEventName extends ExtractAllEventPath<TPayloads, TEventDependencies> = ExtractAllEventPath<TPayloads, TEventDependencies>,
    TDispatchingEventName extends ExtractAllEventPath<TPayloads, TEventDependencies> = ExtractAllEventPath<TPayloads, TEventDependencies>,
> = TTriggeringEventName extends string ? //prevents union distribution
    TDispatchingEventName extends string ? //prevents union distribution
    TTriggeringEventName extends TDispatchingEventName ? //prevents chain to self
    never : //here TTriggeringEventName is one specific event name / TDispatchingEventName is another, different one
    {
        readonly onEvent: TTriggeringEventName;
        readonly thenDispatch: TDispatchingEventName;
    } &
    {
        readonly onCondition?: ExtractPayloadByEventName<TPayloads, TEventDependencies, TTriggeringEventName> extends void ? (
            state: TState // TODO selectors instead of state?
        ) => boolean
        : (
            state: TState,
            previousPayload: ExtractPayloadByEventName<TPayloads, TEventDependencies, TTriggeringEventName>,
        ) => boolean;
    } &
    (
        ExtractPayloadByEventName<TPayloads, TEventDependencies, TDispatchingEventName> extends void ?
        // no payload to dispatch
        {} // TODO reject with error if withPayload is provided
        :
        // payload can be dispatched
        (ExtractPayloadByEventName<TPayloads, TEventDependencies, TTriggeringEventName> extends ExtractPayloadByEventName<TPayloads, TEventDependencies, TDispatchingEventName> ?
            // same payload type for triggering event and dispatch - can omit mapper
            {
                readonly withPayload?: PayloadMapper<
                    TState,
                    ExtractPayloadByEventName<TPayloads, TEventDependencies, TTriggeringEventName>,
                    ExtractPayloadByEventName<TPayloads, TEventDependencies, TDispatchingEventName>
                >;
            } : {
                //  payload types are different - must provide a mapper
                readonly withPayload: PayloadMapper<
                    TState,
                    ExtractPayloadByEventName<TPayloads, TEventDependencies, TTriggeringEventName>,
                    ExtractPayloadByEventName<TPayloads, TEventDependencies, TDispatchingEventName>
                >;
            })
    ) : never : never;

// Component definition type for defining a component with state, selectors, event handlers and chained events
export type ComponentDef<
    TState extends State = State,
    TPayloads extends Record<string, Payload> = Record<string, Payload>,
    TSelectorReturnTypes extends Record<string, Value> = Record<string, Value>,
    EventDependencies extends Record<string, Record<string, Payload>> = {},
> = {
    readonly initialState: TState;
    readonly selectors?: SelectorMap<TState, TSelectorReturnTypes>;
    readonly eventHandlers?: Partial<EventHandlerRecord<TState, TPayloads>>;
    readonly chainedEvents?: ChainedEvent<TState, TPayloads, EventDependencies>[];
};

//Utility types
export type ExtractSelectorReturnTypes<T extends SelectorMap<any, any>> =
    T extends SelectorMap<any, infer P> ? P : never;

export type ExtractEventHandlerPayloads<T extends EventHandlerRecord<any, any>> =
    { [EventName in keyof T]: T[EventName] extends (state: any, payload: infer EventHandlerPayload) => any ?
        EventHandlerPayload extends Value ? EventHandlerPayload : void
        : never };