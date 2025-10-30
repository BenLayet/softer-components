import {
  configureStore,
  createListenerMiddleware,
  ListenerMiddlewareInstance,
} from "@reduxjs/toolkit";
import { ComponentDef } from "@softer-components/types";
import {
  generateEventsToForward,
  initialStateTree,
  newGlobalState,
} from "@softer-components/utils";

export type SofterStore = ReturnType<typeof configureStore> & {
  rootComponentDef: ComponentDef;
};

export function configureSofterStore(
  rootComponentDef: ComponentDef<any>
): SofterStore {
  const listenerMiddleware = createListenerMiddleware();
  startListeningForEventForwarders(rootComponentDef, listenerMiddleware);
  //TODO build a map of state updaters at the time of registration for better performance
  //TODO build a map of event forwarders at the time of registration for better performance

  return {
    ...configureStore({
      preloadedState: initialStateTree(rootComponentDef),
      reducer: (state: any, action: any) =>
        newGlobalState(rootComponentDef, action, state),
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().prepend(listenerMiddleware.middleware),
    }),
    rootComponentDef,
  };
}

function startListeningForEventForwarders(
  rootComponentDef: ComponentDef<any, any>,
  listenerMiddleware: ListenerMiddlewareInstance
) {
  listenerMiddleware.startListening({
    predicate: () => true,
    effect: (action: any, listenerApi: any) => {
      const nextActions = generateEventsToForward(
        rootComponentDef,
        listenerApi.getState(),
        action
      );
      nextActions.forEach((a) => listenerApi.dispatch(a));
    },
  });
}
