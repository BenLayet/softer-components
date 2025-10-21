import {configureStore, createListenerMiddleware, ListenerMiddlewareInstance} from "@reduxjs/toolkit";
import {ComponentDef, Event, Payload, Selector, State,} from "@softer-components/types";
import {
    extractComponentPathStr,
    findEventForwarders,
    findStateUpdater as findComponentStateUpdater, initialStateTree,
    refreshStateTree
} from "./softerUtils";

export function configureSofterStore<
    TEvents extends Event = Event, // expects union
    TState extends State = State,
    TSelectors extends Record<string, Selector<TState>> = Record<
        string,
        Selector<TState>
    >,
    TChildrenEvents extends Record<string, Event> = Record<string, Event>,
>(
    rootComponentDef: ComponentDef<TEvents, TState, TSelectors, TChildrenEvents>,
) {
    const listenerMiddleware = createListenerMiddleware();
    startListeningForEventForwarders(
        rootComponentDef,
        listenerMiddleware,
    );
    return configureStore({
        preloadedState: initialStateTree(rootComponentDef),
        reducer: (state, action: any) => {
            const stateUpdater = findComponentStateUpdater(rootComponentDef, action.type,);
            if (!stateUpdater) return state;
            const componentPath = extractComponentPathStr(action.type);
            const componentState = state[componentPath];
            const nextComponentState = stateUpdater(componentState, action.payload);
            const updatedGlobalState = {
                ...state,
                [componentPath]: nextComponentState,
            };
            return refreshStateTree(updatedGlobalState, rootComponentDef);
        },
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware().prepend(listenerMiddleware.middleware),
    });
}

function startListeningForEventForwarders(
    rootComponentDef: ComponentDef,
    listenerMiddleware: ListenerMiddlewareInstance,
) {
    listenerMiddleware.startListening({
        predicate: () => true,
        effect: (action: any, listenerApi: any) => {
            const eventForwarders = findEventForwarders(rootComponentDef, action.type);
            eventForwarders.forEach((eventForwarder: any) => {
                const componentPath = eventForwarder.componentPath;
                const componentState = listenerApi.getState()[componentPath];
                if (eventForwarder.onCondition && !eventForwarder.onCondition(componentState, action.payload)) {
                    return;
                }
                let nextPayload: Payload;
                if (!!eventForwarder.withPayload) {
                    nextPayload = eventForwarder.withPayload(componentState, action.payload);
                } else {
                    nextPayload = action.payload;
                }
                const nextType = componentPath + eventForwarder.thenDispatch(componentState, action.payload);
                listenerApi.dispatch({
                    type: nextType,
                    payload: nextPayload,
                });
            });
        },
    });
}