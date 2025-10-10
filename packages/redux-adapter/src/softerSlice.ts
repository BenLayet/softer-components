import {
    ComponentDef,
    EventHandlerMap,
    EventHandler,
    State,
    Payload,
    Value,
    ChainedEvent
} from '@softer-components/types'
import {
    CaseReducer,
    createSlice,
    PayloadAction,
    Slice,
} from '@reduxjs/toolkit';

type Reducers<
    TState extends State,
    TPayloads extends Record<string, Payload>,> = {
    [K in keyof TPayloads]: CaseReducer<TState, PayloadAction<TPayloads[K]>>
};

type Selectors<
    TState extends State,
    TSelectorMap extends Record<string, Value>> = {
    [K in keyof TSelectorMap]: (state: TState) => TSelectorMap[K]
};

function createReducer<
    TState extends State,
    TPayload extends Payload,
    Name extends string,
>(_actionType: Name, eventHandler: EventHandler<TState, TPayload>): CaseReducer<TState, PayloadAction<TPayload>>{
    return ((state: TState, action:PayloadAction<TPayload>)=> eventHandler(state, action.payload) ) as any;
}
function createReducers<
    TState extends State,
    TPayloads extends Record<string, Payload>,
>(eventHandlers: EventHandlerMap<TState, TPayloads> | undefined):Reducers<TState, TPayloads> {
    return Object.fromEntries(
        Object.entries(eventHandlers ?? {})
            .map(
                ([actionType, eventHandler]) =>
                    [actionType, createReducer(actionType, eventHandler)])) as any;
}

function chainLocalEvents<TState extends State>(slice:Slice<TState>, chainedEvents: ChainedEvent<TState>[]){
    chainedEvents
        .filter(event => !event.onEvent.includes('/'))
        .forEach(event => {
            slice.re
        })
}


export function createSofterSlice<
    TState extends State,
    TPayloads extends Record<string, Payload> = {},
    TSelectorReturnTypes extends Record<string, Value> = {},
    Name extends string = string,
>(path: Name, componentDef: ComponentDef<TState, TPayloads, TSelectorReturnTypes>):Slice<
    TState,
    Reducers<TState, TPayloads>,
    Name,
    Name,
    Selectors<TState, TSelectorReturnTypes>> {
    const slice = createSlice({
        name: path,
        initialState: componentDef.initialState,
        selectors: componentDef.selectors ?? {},
        reducers: createReducers(componentDef.eventHandlers)
    });
    componentDef.chainedEvents.filter(event => event.onEvent !== undefined).forEach(event => {})
    return slice as any;
}
