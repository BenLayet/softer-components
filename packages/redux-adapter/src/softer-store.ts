import {
  configureStore,
  createListenerMiddleware,
  createReducer,
  ListenerMiddlewareInstance,
} from "@reduxjs/toolkit";
import { ComponentDef } from "@softer-components/types";
import {
  generateEventsToForward,
  initializeRootState,
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
import {
  MemoizedApplicationViewModel,
  SofterViewModel,
} from "./softer-view-model";
import { TreeStateManager } from "@softer-components/utils";

export type SofterStore = ReturnType<typeof configureStore> & {
  softerViewModel: SofterViewModel;
};

export function configureSofterStore(
  rootComponentDef: ComponentDef,
): SofterStore {
  const listenerMiddleware = createListenerMiddleware();

  const stateManager = new TreeStateManager();
  const softerViewModel = new MemoizedApplicationViewModel(
    stateManager,
    rootComponentDef,
  );
  const initialGlobalState = addSofterRootTree({});
  initializeRootState(
    getSofterRootTree(initialGlobalState),
    rootComponentDef,
    stateManager,
  );
  startListeningForEventForwarders(
    stateManager,
    rootComponentDef,
    listenerMiddleware,
  );

  const softerReducer = createReducer(initialGlobalState, (builder: any) => {
    builder.addDefaultCase((state: any, action: any) => {
      if (!isSofterEvent(action)) {
        return state;
      }
      // updateSofterRootState updates the softerRootStateTree in place
      // the stateManager notifies the softerViewModel when a state tree is removed
      // so the memoized selectors can be cleaned up.
      updateSofterRootState(
        getSofterRootTree(state),
        rootComponentDef,
        actionToEvent(action),
        stateManager,
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
    softerViewModel,
  };
}

function startListeningForEventForwarders(
  stateManager: StateManager,
  rootComponentDef: ComponentDef,
  listenerMiddleware: ListenerMiddlewareInstance,
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
        stateManager,
      ).map(eventToAction);
      nextActions.forEach((a) => listenerApi.dispatch(a));
    },
  });
}
