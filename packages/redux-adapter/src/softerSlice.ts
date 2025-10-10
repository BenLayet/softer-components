import {
    ComponentDef,
    State,
    Payload,
    EventForwarder,
    EventDependencies
} from '@softer-components/types'
import {
    CaseReducer,
    createSlice,
    PayloadAction,
    Slice,
    SliceSelectors,
} from '@reduxjs/toolkit';

type Reducers<
    TState extends State,
    TPayloads extends Record<string, Payload>,> = {
        [K in keyof TPayloads]: CaseReducer<TState, PayloadAction<TPayloads[K]>>
    };

function createReducer<
    TState extends State,
    TPayload extends Payload,
>(stateUpdater: any): any {
    return ((state: TState, action: PayloadAction<TPayload>) => stateUpdater(state, action.payload));
}

function createReducers<
    TState extends State,
    TPayloadRecord extends Record<string, Payload>,
>(stateUpdaters:any): Reducers<TState, TPayloadRecord> {
    return Object.fromEntries(
        Object.entries(stateUpdaters ?? {})
            .map(
                ([actionType, stateUpdater]) =>
                    [actionType, createReducer(stateUpdater)])) as Reducers<TState, TPayloadRecord>;
}

type ListenerOption = {
    type: string,
    effect: (action: PayloadAction, listenerApi: any) => void,
};
const createListenerOption = <TState extends State,
    TPayloads extends Record<string,
        Payload> = {}, Name extends string = string,
    TEventDependencies extends EventDependencies = {}>(path: Name) => (eventForwarder: EventForwarder<TState, TPayloads, TEventDependencies>) => ({
        type: path + '/' + eventForwarder.onEvent,
        effect: (action: PayloadAction, listenerApi: { dispatch: (action: PayloadAction) => void }) => {
            listenerApi.dispatch({ type: path + '/' + eventForwarder.thenDispatch, payload: action.payload });
        }
    });


export function createSofterSlice<
    TState extends State,
    TPayloads extends Record<string, Payload> = {},
    Name extends string = string,
    TEventDependencies extends EventDependencies = {},
>(path: Name, componentDef: ComponentDef<TState, TPayloads, TEventDependencies>): {
    slice: Slice<
        typeof componentDef.initialState,
        Reducers<typeof componentDef.initialState, TPayloads>,
        Name,
        Name,
        typeof componentDef.selectors & SliceSelectors<TState>>,
    listenerOptions: ListenerOption[]
} {
    const slice:any= createSlice({
        name: path,
        initialState: componentDef.initialState,
        selectors: componentDef.selectors ?? {},
        reducers: createReducers<TState, TPayloads>(componentDef.stateUpdaters ?? {})
    })  ;

    const listenerOptions: ListenerOption[] = componentDef
        .eventForwarders?.map(createListenerOption(path)) ?? []

    return { slice, listenerOptions };
}
