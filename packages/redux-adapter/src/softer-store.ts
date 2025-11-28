import {
  configureStore,
  createListenerMiddleware,
  createReducer,
  ListenerMiddlewareInstance,
} from "@reduxjs/toolkit";
import { ComponentDef } from "@softer-components/types";
import {
  generateEventsToForward,
  initializeRootState as initializeSofterRootState,
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
  softerUi: SofterViewModel;
};

export function configureSofterStore(
  rootComponentDef: ComponentDef,
): SofterStore {
  const stateManager = new TreeStateManager();
  const softerUi = new MemoizedApplicationViewModel(
    stateManager,
    rootComponentDef,
  );
  const initialGlobalState = addSofterRootTree({});

  function startListeningForEventForwarders(
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

  const listenerMiddleware = createListenerMiddleware();

  startListeningForEventForwarders(rootComponentDef, listenerMiddleware);
  initializeSofterRootState(
    getSofterRootTree(initialGlobalState),
    rootComponentDef,
    stateManager,
  );

  const softerReducer = createReducer(initialGlobalState, (builder: any) => {
    builder.addDefaultCase((state: any, action: any) => {
      if (!isSofterEvent(action)) {
        return state;
      }
      const softerRootState = getSofterRootTree(state);
      const event = actionToEvent(action);

      // updateSofterRootState updates the softerRootStateTree in place
      // it does not use the memoized softerUi but notifies the selectors manager when a state tree is removed
      updateSofterRootState(
        softerRootState,
        rootComponentDef,
        event,
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
    softerUi,
  };
}
