import {
  configureStore,
  createListenerMiddleware,
  createReducer,
  ListenerMiddlewareInstance,
} from "@reduxjs/toolkit";
import { ComponentDef } from "@softer-components/types";
import {
  generateEventsToForward,
  initialStateTree,
  updateGlobalState,
} from "@softer-components/utils";
import {
  actionToEvent,
  initialReduxGlobalState,
  isSofterEvent,
  softerRootState,
} from "./softer-mappers";

export type SofterStore = ReturnType<typeof configureStore> & {
  rootComponentDef: ComponentDef;
};

export function configureSofterStore(
  rootComponentDef: ComponentDef
): SofterStore {
  const listenerMiddleware = createListenerMiddleware();
  startListeningForEventForwarders(rootComponentDef, listenerMiddleware);

  // ✅ Use createReducer which has built-in Immer support
  const softerReducer = createReducer(
    initialReduxGlobalState(initialStateTree(rootComponentDef)),
    (builder: any) => {
      builder.addDefaultCase((state, action) => {
        if (!isSofterEvent(action)) {
          return state;
        }

        const globalStateTree = softerRootState(state);
        if (!globalStateTree) {
          return state;
        }

        const event = actionToEvent(action);

        // ✅ updateGlobalState returns new state tree using Immer
        updateGlobalState(rootComponentDef, globalStateTree, event);
      });
    }
  );
  return {
    ...configureStore({
      preloadedState: initialReduxGlobalState(
        initialStateTree(rootComponentDef)
      ),
      reducer: softerReducer,
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().prepend(listenerMiddleware.middleware),
    }),
    rootComponentDef,
  };
}

function startListeningForEventForwarders(
  rootComponentDef: ComponentDef,
  listenerMiddleware: ListenerMiddlewareInstance
) {
  listenerMiddleware.startListening({
    predicate: () => true,
    effect: (action: any, listenerApi: any) => {
      if (!isSofterEvent(action)) {
        return;
      }
      const globalStateTree = softerRootState(listenerApi.getState());
      if (!globalStateTree) {
        return;
      }
      const nextActions = generateEventsToForward(
        rootComponentDef,
        globalStateTree,
        action
      );
      nextActions.forEach((a) => listenerApi.dispatch(a));
    },
  });
}
