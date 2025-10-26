import {
  configureStore,
  createListenerMiddleware,
  ListenerMiddlewareInstance,
} from "@reduxjs/toolkit";
import {
  initialStateTree,
  newGlobalState,
  createEventsToForward,
} from "./softer-utils";
import { AnyComponentDef } from "@softer-components/types";

export function configureSofterStore(rootComponentDef: any) { //TODO fix type
  const listenerMiddleware = createListenerMiddleware();
  startListeningForEventForwarders(rootComponentDef, listenerMiddleware);
  return configureStore({
    preloadedState: initialStateTree(rootComponentDef),
    reducer: (state, action: any) =>
      newGlobalState(rootComponentDef, action, state),
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().prepend(listenerMiddleware.middleware),
  });
}

function startListeningForEventForwarders(
  rootComponentDef: AnyComponentDef,
  listenerMiddleware: ListenerMiddlewareInstance,
) {
  listenerMiddleware.startListening({
    predicate: () => true,
    effect: (action: any, listenerApi: any) => {
      const nextActions = createEventsToForward(
        rootComponentDef,
        listenerApi.getState(),
        action,
      );
      nextActions.forEach((a) => listenerApi.dispatch(a));
    },
  });
}
