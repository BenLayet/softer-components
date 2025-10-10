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

// Selector takes state and returns a value
// example: 
// ```
// (state: {counter:number}) => state.counter
// ```
export type Selector<TState extends State> = (state: TState) => Value;

// SelectorRecord maps selector names to their corresponding functions
// all from the sme state type, but different return types
// example: 
// ```
// { 
//   selectCount: (state: {counter:number}) => state.counter,
//   selectIsPositive: (state: {counter:number}) => state.counter > 0,
// }
// ```
type SelectorRecord<TState extends State> = Record<string, Selector<TState>>;

// Payload can be a specific value type or void (no payload)
export type Payload = Value | void;

// State Updater takes only one type of payload: either void or a specific type
// example swith and without payload: 
// ```
// (state: {counter:number}, payload:number) => ({counter: state.counter + payload})
// (state: {counter:number}) => ({counter: state.counter + 1})
// ```
export type StateUpdater<TState extends State = State, TPayload extends Payload = void> =
    (state: TState, payload: TPayload) => TState;

// StateUpdaterRecord maps event types to their corresponding function
// example: 
// ```
// { 
//   incrementRequested: (state: {counter:number}) => ({counter: state.counter + 1}),
//   incrementByAmountRequested: (state: {counter:number}, payload:number) => ({counter: state.counter + payload}),
// }
// ```
type StateUpdaterRecord<TState extends State, TPayloadRecord extends PayloadRecord = {}> = {
    readonly [eventType in keyof TPayloadRecord]: StateUpdater<TState, TPayloadRecord[eventType]>;
};

// Extract PayloadRecord from state updater record
// When a user of the library defines a componentDef they need to provide the signatures of all the events.
// This utility type is useful to retrieve the payload types from the state updaters
// but some additional event (that do not update the state) can also be declared.
// 
// example:
// ```
// type MyState = { counter: number };
// const stateUpdaters = {
//     incrementRequested: (state: MyState) => ({ counter: state.counter + 1 }),
//     incrementByAmountRequested: (state: MyState, amount: number) => ({ counter: state.counter + amount }),
// };
// type MyEventSignatures = ExtractEventSignatures<typeof stateUpdaters>;
// // Resulting type:
// // {
// //   incrementRequested: void,
// //   incrementByAmountRequested: number,
// // }
// ```
export type ExtractEventSignatures<T extends StateUpdaterRecord<any, any>> =
    { [EventName in keyof T]: T[EventName] extends (state: any, payload: infer StateUpdaterPayload) => any ?
        StateUpdaterPayload extends Value ? StateUpdaterPayload : void
        : never };

// PayloadRecord maps event names to their payload types
// example: 
// ```
// { 
//   incrementRequested: void,
//   incrementByAmountRequested: number,
// }
// ```
export type PayloadRecord = Record<string, Payload>;   

// DependencyPayloadRecord maps dependency name to the payloads of their events
// example: 
// ```
// {
//  amount: { amountUpdated: number },
//  user: { userLoggedIn: User, userLoggedOut: void },
// }
// ```
// where "amount/amountUpdated", "user/userLoggedIn", "user/userLoggedOut" are valid event paths
export type EventDependencies = Record<string, PayloadRecord>;


// Extract an event signature with a specific event name and payload type
// example: 
// ```
// type User = { id: string, name: string };
// type MyPayloadRecord = { userLoggedIn: User, userLoggedOut: void };
// type MyEventSignature = ExtractEventSignature<MyPayloadRecord>;
// type Expected = 
// | ["userLoggedIn", string] 
// | ["userLoggedOut", void]
// ```
type ExtractEventSignature<TPayloadRecord extends PayloadRecord> = {
    [EventName in keyof TPayloadRecord]: [`${EventName & string}`, TPayloadRecord[EventName]]
}[keyof TPayloadRecord];


// Extract event paths from dependencies, and build a union of event names
// example: 
// ```
// type MyDependenciesPayloadRecord = {
//     amount: { amountUpdated: number },
//     user: { userLoggedIn: string, userLoggedOut: void },
// };
// type MyEventSignatures = ExtractDependenciesEventSignature<MyDependenciesPayloadRecord>;

// type Expected = 
// | ["amount/amountUpdated", number] 
// | ["user/userLoggedIn", string] 
// | ["user/userLoggedOut", void]
// ```
type ExtractDependenciesEventSignature<
    T extends EventDependencies> = keyof T extends infer DependencyName ?
    DependencyName extends string ?
    {
        [EventName in keyof T[DependencyName]]: [`${DependencyName & string}/${EventName & string}`, T[DependencyName][EventName]]
    }[keyof T[DependencyName]]
    : never : never;

// Extract event signatures from both own payload and dependencies, and build a union of event signatures
// example
// ```
// type User = { id: string, name: string };
// type MyPayloadRecord = { amountUpdated: number };
// type MyDependenciesPayloadRecord = {
//     user: { userLoggedIn: User, userLoggedOut: void },
// };
// type MyEventSignatures = ExtractAllEventSignature<MyPayloadRecord, MyDependenciesPayloadRecord>;

// type Expected = 
// | ["amountUpdated", number] 
// | ["user/userLoggedIn", User] 
// | ["user/userLoggedOut", void]
// ```
type ExtractAllEventSignature<
    TPayloadRecord extends PayloadRecord,
    TDependenciesPayloadRecord extends EventDependencies
> = ExtractEventSignature<TPayloadRecord> | ExtractDependenciesEventSignature<TDependenciesPayloadRecord>;

// Extract event paths from both own payload and dependencies, and build a union of event names
// ```
// type User = { id: string, name: string };
// type MyPayloadRecord = { amountUpdated: number };
// type MyDependenciesPayloadRecord = {
//     user: { userLoggedIn: User, userLoggedOut: void },
// };
// type MyEventSignatures = ExtractAllEventPath<MyPayloadRecord, MyDependenciesPayloadRecord>;

// type Expected = 
// | "amountUpdated"
// | "user/userLoggedIn"
// | "user/userLoggedOut"
// ```
type ExtractAllEventPath<
    TPayloadRecord extends PayloadRecord,
    TDependenciesPayloadRecord extends EventDependencies> =
    ExtractAllEventSignature<TPayloadRecord, TDependenciesPayloadRecord>[0];


// Extract the payload type for a given event name from both own payloads and dependencies
// ```
// type MyPayloadRecord = { incrementRequested: void };
// type MyDependenciesPayloadRecord = {
//     user: { userLoggedIn: string },
// };
// type Test1 = ExtractPayloadByEventName<MyPayloadRecord, MyDependenciesPayloadRecord, "incrementRequested">; // void
// type Test2 = ExtractPayloadByEventName<MyPayloadRecord, MyDependenciesPayloadRecord, "user/userLoggedIn">; // string
// ```
type ExtractPayloadByEventName<TPayloadRecord extends PayloadRecord,
    TDependenciesPayloadRecord extends EventDependencies,
    TEventName extends string> = (ExtractAllEventSignature<TPayloadRecord, TDependenciesPayloadRecord> & [TEventName, unknown])[1];

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
    : (state: TState, previousPayload: TPreviousPayload) => TNewPayload;


// Extract event paths from dependencies, and build a union of event names
// ```
// type MyState = { userName: string, adminName: string, greeting: string };
// type MyPayloadRecord = { helloRequested: string };
// type MyDependenciesPayloadRecord = {
//     user: { loggedIn: string, loggedOut: Date },
// };
// type MyEventForwarder = EventForwarder<MyState, MyPayloadRecord, MyDependenciesPayloadRecord>;
// // union of all valid event forwarders like:
//  const forwarder1: MyEventForwarder = { onEvent: "user/loggedIn", thenDispatch: "helloRequested" };
//  const forwarder2: MyEventForwarder = {
//     onEvent: "user/loggedIn", 
//     thenDispatch: "helloRequested", 
//     withPayload: (state, user) => `${state.greeting}, ${user}`,
//     onCondition: (state, user) => user !== state.adminName
// };
//  const forwarder3: MyEventForwarder = {
//     onEvent: "user/loggedIn", 
//     thenDispatch: "helloRequested", 
//     withPayload: (state) => state.greeting,
//     onCondition: (state, user) => user !== state.adminName
// };
// const error1: MyEventForwarder = { onEvent: "helloRequested", thenDispatch: "helloRequested" }; // error - forward to self
// const error2: MyEventForwarder = { onEvent: "user/loggedOut", thenDispatch: "helloRequested" }; // error - missing required withPayload
// ```
export type EventForwarder<
    TState extends State,
    TPayloadRecord extends PayloadRecord,
    TEventDependencies extends EventDependencies,
    TTriggeringEventName extends ExtractAllEventPath<TPayloadRecord, TEventDependencies> = ExtractAllEventPath<TPayloadRecord, TEventDependencies>,
    TDispatchingEventName extends ExtractAllEventPath<TPayloadRecord, TEventDependencies> = ExtractAllEventPath<TPayloadRecord, TEventDependencies>,
> = TTriggeringEventName extends string ? //prevents union distribution
    TDispatchingEventName extends string ? //prevents union distribution
    TTriggeringEventName extends TDispatchingEventName ? //prevents forward to self
    never : //here TTriggeringEventName is one specific event name / TDispatchingEventName is another, different one
    {
        readonly onEvent: TTriggeringEventName;
        readonly thenDispatch: TDispatchingEventName;
    } &
    {
        readonly onCondition?: ExtractPayloadByEventName<TPayloadRecord, TEventDependencies, TTriggeringEventName> extends void ? (
            state: TState // TODO selectors instead of state?
        ) => boolean
        : (
            state: TState,
            previousPayload: ExtractPayloadByEventName<TPayloadRecord, TEventDependencies, TTriggeringEventName>,
        ) => boolean;
    } &
    (
        ExtractPayloadByEventName<TPayloadRecord, TEventDependencies, TDispatchingEventName> extends void ?
        // no payload to dispatch
        {} // TODO reject with error if withPayload is provided
        :
        // payload can be dispatched
        (ExtractPayloadByEventName<TPayloadRecord, TEventDependencies, TTriggeringEventName> extends ExtractPayloadByEventName<TPayloadRecord, TEventDependencies, TDispatchingEventName> ?
            // same payload type for triggering event and dispatch - can omit mapper
            {
                readonly withPayload?: PayloadMapper<
                    TState,
                    ExtractPayloadByEventName<TPayloadRecord, TEventDependencies, TTriggeringEventName>,
                    ExtractPayloadByEventName<TPayloadRecord, TEventDependencies, TDispatchingEventName>
                >;
            } : {
                //  payload types are different - must provide a mapper
                readonly withPayload: PayloadMapper<
                    TState,
                    ExtractPayloadByEventName<TPayloadRecord, TEventDependencies, TTriggeringEventName>,
                    ExtractPayloadByEventName<TPayloadRecord, TEventDependencies, TDispatchingEventName>
                >;
            })
    ) : never : never;

///////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                         ComponentDef
//
// Component definition type for defining a component with
// - state : immutable, completely reconstructed by the state updaters after an event
// - selectors : to select values from the state
// - stateUpdaters : to update the state based on actions with payloads
// - eventForwarders : to forward events to other parts of the application
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
export type ComponentDef<
    TState extends State = State,
    TPayloadRecord extends PayloadRecord = {},
    TEventDependencies extends EventDependencies = {},
> = {
    readonly initialState: TState;
    readonly selectors?: SelectorRecord<TState>;
    readonly stateUpdaters?: Partial<StateUpdaterRecord<TState, TPayloadRecord>>;
    readonly eventForwarders?: EventForwarder<TState, TPayloadRecord, TEventDependencies>[];
};
