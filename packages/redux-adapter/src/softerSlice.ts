import {
    ComponentDef,
    EventHandlerRecord,
    EventHandler,
    State,
    Payload,
    Value,
} from '@softer-components/types'
import {
    CaseReducer,
    createSlice,
    PayloadAction,
    Slice,
} from '@reduxjs/toolkit';

type Reducers<
    TState extends State,
    TPayloads extends Record<string, Payload>, > = {
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
>(_actionType: Name, eventHandler: EventHandler<TState, TPayload>): CaseReducer<TState, PayloadAction<TPayload>> {
    return ((state: TState, action: PayloadAction<TPayload>) => eventHandler(state, action.payload)) as any;
}

function createReducers<
    TState extends State,
    TPayloads extends Record<string, Payload>,
>(eventHandlers: EventHandlerRecord<TState, TPayloads> | undefined): Reducers<TState, TPayloads> {
    return Object.fromEntries(
        Object.entries(eventHandlers ?? {})
            .map(
                ([actionType, eventHandler]) =>
                    [actionType, createReducer(actionType, eventHandler)])) as any;
}

type ListenerOptions = {
    type: string,
    effect: (action: PayloadAction, listenerApi: any) => void,
}

export function createSofterSlice<
    TState extends State,
    TPayloads extends Record<string, Payload> = {},
    TSelectorReturnTypes extends Record<string, Value> = {},
    Name extends string = string,
    EventDependencies extends Record<string, Record<string, Payload>> = {},
>(path: Name, componentDef: ComponentDef<TState, TPayloads, TSelectorReturnTypes, EventDependencies>): {
    slice: Slice<
        TState,
        Reducers<TState, TPayloads>,
        Name,
        Name,
        Selectors<TState, TSelectorReturnTypes>>,
    listenerOptions: ListenerOptions[]
} {
    const slice: any = createSlice({
        name: path,
        initialState: componentDef.initialState,
        selectors: componentDef.selectors ?? {},
        reducers: createReducers(componentDef.eventHandlers)
    });

    const listenerOptions: ListenerOptions[] = componentDef
        .chainedEvents
        .map(chainedEvent => ({
            type: path + '/' + chainedEvent.onEvent,
            effect: async (action: PayloadAction, listenerApi) => {
                listenerApi.dispatch({type: path + '/' + chainedEvent.thenDispatch, payload: action.payload})
            }
        }))

    return {slice, listenerOptions};
}
