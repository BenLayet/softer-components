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
import { ReselectStateManager } from "./reselect-state-manager";
import { OWN_KEY, Tree } from "./tree";
import { SOFTER_PREFIX } from "./constants";
import { L } from "vitest/dist/chunks/reporters.d.BFLkQcL6.js";

export type SofterStore = ReturnType<typeof configureStore> & {
  rootComponentDef: ComponentDef;
  stateManager: StateManager;
};
const rootTree: Tree<State> = { [OWN_KEY]: {} };
const stateManager = new ReselectStateManager();
const globalState = { [SOFTER_PREFIX]: rootTree };

export function configureSofterStore(
  rootComponentDef: ComponentDef
): SofterStore {
  const listenerMiddleware = createListenerMiddleware();
  startListeningForEventForwarders(rootComponentDef, listenerMiddleware);
  initializeRootState(rootTree, rootComponentDef, stateManager);

  const softerReducer = createReducer(globalState, (builder: any) => {
    builder.addDefaultCase((state: any, action: any) => {
      if (!isSofterEvent(action)) {
        return state;
      }
      const event = actionToEvent(action);

      // updateGlobalState updates the globalStateTree in place
      updateGlobalState(state, rootComponentDef, event, stateManager);
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
        listenerApi.getState(),
        rootComponentDef,
        actionToEvent(action),
        stateManager
      ).map(eventToAction);
      nextActions.forEach((a) => listenerApi.dispatch(a));
    },
  });
}
