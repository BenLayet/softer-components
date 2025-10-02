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
type Payload = Value | void;
type State = Value | void;
type Selector<TState extends State, TResult extends Value = Value> = (state: TState) => TResult;
type EventLocator<TEventType extends string = string, TPath extends string[] = string[]> = {
    readonly eventType: TEventType;
    readonly path?: TPath;
};
type ComponentReducers<TState extends State, TEventPayloads extends Record<string, Payload>> = {
    readonly [K in keyof TEventPayloads]:
    TEventPayloads[K] extends void ? (state: TState) => void : (state: TState, action: {type: K, payload: TEventPayloads[K]}) => void
};

type ChainedEvent<TState extends State, TPreviousEvent extends Event = Event, TNextEvent extends Event = Event> = {
    readonly onEvent: EventLocator<TPreviousEvent["type"]>
    readonly thenDispatch: EventLocator<TNextEvent["type"]>;
    readonly withPayload?: (previousPayload?: TPreviousEvent["payload"], state?: TState) => object;
    readonly onCondition?: (previousPayload?: TPreviousEvent["payload"], state?: TState) => boolean;
};

export type ComponentDef<TState extends State> = {
    readonly initialState?: TState;
    readonly children?: Record<string, ComponentDef<State>>;
    readonly chainedEvents?: ChainedEvent<TState>[];
    readonly selectors?: Record<string, Selector<TState>>;
    readonly reducers?: ComponentReducers<TState, Record<string, Payload>>;
    readonly name?: string;
}

const eventPayloads= {
    test1: undefined,
    test2: 123,
    test3: "string",
    test4: { key: "value" },
    test5: [1, 2, 3],
};
const reducers: ComponentReducers<{ count: number }, typeof eventPayloads> = {
    test1: (state) => { state.count += 1; },
    test2: (state, action) => { state.count += action.payload; },
    test3: (state, action) => { console.log(action.payload); },
    test4: (state, action) => { console.log(action.payload.key); },
    test5: (state, action) => { console.log(action.payload.length);
        if(action.type !== "test5") {
            // This should error, as action.type is not "test5"
            throw new Error("Unexpected action type");
        }

     },
};

export { State, Payload, Value, Selector, EventLocator, ComponentReducers, ChainedEvent, ComponentDef };