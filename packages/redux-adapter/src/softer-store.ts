import {
  configureStore,
  createListenerMiddleware,
  createReducer,
  ListenerMiddlewareInstance,
} from "@reduxjs/toolkit";
import { ComponentDef, State } from "@softer-components/types";
import {
  generateEventsToForward,
  initializeRootState as initializeSofterRootState,
  StateManager,
  updateSofterRootState,
} from "@softer-components/utils";
import {
  actionToEvent,
  addSofterRootTree,
  eventToAction,
  getSofterRootTree,
  isSofterEvent,
} from "./softer-mappers";
import { ReselectStateManager } from "./reselect-state-manager";

export type SofterStore = ReturnType<typeof configureStore> & {
  rootComponentDef: ComponentDef;
  stateManager: StateManager;
};
const stateManager = new ReselectStateManager();
const initialGlobalState = addSofterRootTree({});

export function configureSofterStore(
  rootComponentDef: ComponentDef
): SofterStore {
  const listenerMiddleware = createListenerMiddleware();
  startListeningForEventForwarders(rootComponentDef, listenerMiddleware);
  initializeSofterRootState(
    getSofterRootTree(initialGlobalState),
    rootComponentDef,
    stateManager
  );

  const softerReducer = createReducer(initialGlobalState, (builder: any) => {
    builder.addDefaultCase((state: any, action: any) => {
      if (!isSofterEvent(action)) {
        return state;
      }
      const softerRootState = getSofterRootTree(state);
      const event = actionToEvent(action);

      // updateSofterRootState updates the softerRootStateTree in place
      updateSofterRootState(
        softerRootState,
        rootComponentDef,
        event,
        stateManager
      );
    });
  });

  return {
    ...configureStore({
      preloadedState: initialGlobalState,
      reducer: softerReducer,
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().prepend(listenerMiddleware.middleware),
    }),
    rootComponentDef,
    stateManager,
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
      const softerRootState = getSofterRootTree(listenerApi.getState());
      const nextActions = generateEventsToForward(
        softerRootState,
        rootComponentDef,
        actionToEvent(action),
        stateManager
      ).map(eventToAction);
      nextActions.forEach((a) => listenerApi.dispatch(a));
    },
  });
}
