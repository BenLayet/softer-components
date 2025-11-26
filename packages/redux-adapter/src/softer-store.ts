import {
  configureStore,
  createListenerMiddleware,
  createReducer,
  ListenerMiddlewareInstance,
} from "@reduxjs/toolkit";
import { ComponentDef, State } from "@softer-components/types";
import {
  generateEventsToForward,
  initializeRootState,
  StateManager,
  updateGlobalState,
} from "@softer-components/utils";
import { actionToEvent, eventToAction, isSofterEvent } from "./softer-mappers";
import { ReselectStateManager, SOFTER_PREFIX } from "./reselect-state-manager";
import { OWN_KEY, Tree } from "./tree";

export type SofterStore = ReturnType<typeof configureStore> & {
  rootComponentDef: ComponentDef;
  stateManager: StateManager;
};
const rootTree: Tree<State> = { [OWN_KEY]: {} };
const stateManager = new ReselectStateManager(rootTree);
const globalState = { [SOFTER_PREFIX]: rootTree };

export function configureSofterStore(
  rootComponentDef: ComponentDef
): SofterStore {
  const listenerMiddleware = createListenerMiddleware();
  startListeningForEventForwarders(rootComponentDef, listenerMiddleware);
  initializeRootState(rootComponentDef, stateManager);

  const softerReducer = createReducer(globalState, (builder: any) => {
    builder.addDefaultCase((state: any, action: any) => {
      if (!isSofterEvent(action)) {
        return state;
      }
      const event = actionToEvent(action);

      // TODO find a better way to sync the stateManager rootState with the Redux store state
      stateManager.rootState = state[SOFTER_PREFIX];
      // updateGlobalState updates the globalStateTree in place
      updateGlobalState(rootComponentDef, event, stateManager);

      // ensure the Redux state has the updated globalStateTree
      // can be updated in place due to Immer
      state[SOFTER_PREFIX] = stateManager.rootState;
    });
  });

  return {
    ...configureStore({
      preloadedState: globalState,
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
      const nextActions = generateEventsToForward(
        rootComponentDef,
        actionToEvent(action),
        stateManager
      ).map(eventToAction);
      nextActions.forEach((a) => listenerApi.dispatch(a));
    },
  });
  listenerMiddleware.startListening({
    predicate: () => true,
    effect: (_: any, listenerApi: any) => {
      // TODO find a better way to sync the stateManager rootState with the Redux store state
      stateManager.rootState = listenerApi.getState()[SOFTER_PREFIX];
    },
  });
}
