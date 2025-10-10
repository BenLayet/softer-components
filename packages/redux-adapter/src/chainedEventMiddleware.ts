import {ListenerMiddlewareInstance, PayloadAction} from "@reduxjs/toolkit";
import {ChainedEvent, State} from "@softer-components/types";

export function startEventChains<TState extends State>(
    listenerMiddleware: ListenerMiddlewareInstance,
    chainedEvents: ChainedEvent<TState>[]) {
    chainedEvents.forEach(startEventChain(listenerMiddleware))
};

const startEventChain = (listenerMiddleware: ListenerMiddlewareInstance) => (chainedEvent: ChainedEvent<any>) => {
    listenerMiddleware.startListening({
        type: chainedEvent.onEvent,
        effect: async (action: PayloadAction, listenerApi) => {
            listenerApi.dispatch({type: chainedEvent.thenDispatch, payload: action.payload})
        }
    })
};