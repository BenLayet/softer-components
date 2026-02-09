import {
  configureStore,
  createListenerMiddleware,
  createReducer,
} from "@reduxjs/toolkit";
import { ComponentContract, ComponentDef } from "@softer-components/types";
import {
  EffectsManager,
  GlobalEvent,
  StateManager,
  StateReader,
  generateEventsToForward,
  initializeRootState,
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
  SofterApplicationViewModel,
  SofterViewModel,
} from "./softer-view-model";

export type SofterStore = ReturnType<typeof configureStore> & {
  softerViewModel: SofterViewModel;
};
type ReduxEffect = (action: any, listenerApi: any) => void;

export function createSofterStoreConfiguration(rootComponentDef: ComponentDef) {
  const softerViewModel = new SofterApplicationViewModel(rootComponentDef);
  const stateManager = softerViewModel.stateManager;
  const initialGlobalState = initializeGlobalState(
    rootComponentDef,
    stateManager,
  );
  const softerReducer = createSofterReducer(
    initialGlobalState,
    rootComponentDef,
    stateManager,
  );
  const effectsManager = new EffectsManager(rootComponentDef, stateManager);
  const eventProcessor = softerEventProcessor(
    rootComponentDef,
    stateManager,
    effectsManager,
  );

  const softerMiddleware = createSofterMiddleware(eventProcessor);
  return {
    softerViewModel,
    initialGlobalState,
    softerMiddleware,
    softerReducer,
    effectsManager,
  };
}

export function createSofterMiddleware(eventProcessor: ReduxEffect) {
  const listenerMiddleware = createListenerMiddleware();
  listenerMiddleware.startListening({
    predicate: () => true,
    effect: eventProcessor,
  });
  return listenerMiddleware.middleware;
}
export function configureSofterStore<T extends ComponentContract>(
  rootComponentDef: ComponentDef<T>,
): SofterStore {
  const config = createSofterStoreConfiguration(rootComponentDef);
  return {
    ...configureStore({
      preloadedState: config.initialGlobalState,
      reducer: config.softerReducer,
      middleware: (getDefaultMiddleware: Function) =>
        getDefaultMiddleware({ thunk: false }).prepend(config.softerMiddleware),
    }),
    softerViewModel: config.softerViewModel,
  };
}
function initializeGlobalState(
  rootComponentDef: ComponentDef,
  stateManager: StateManager,
) {
  const globalState = addSofterRootTree({});
  initializeRootState(
    getSofterRootTree(globalState),
    rootComponentDef,
    stateManager,
  );
  return globalState;
}
function createSofterReducer(
  initialGlobalState: {},
  rootComponentDef: ComponentDef,
  stateManager: StateManager,
) {
  return createReducer(initialGlobalState, (builder: any) => {
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
}

const softerEventProcessor =
  (
    rootComponentDef: ComponentDef,
    stateReader: StateReader,
    effectsManager: EffectsManager<any>,
  ) =>
  (action: any, listenerApi: any) => {
    if (!isSofterEvent(action)) {
      return;
    }
    // map state, dispatch and event to softer objects
    const dispatchEvent = (event: GlobalEvent) =>
      listenerApi.dispatch(eventToAction(event));
    const softerRootState = getSofterRootTree(listenerApi.getState());
    const event = actionToEvent(action);

    // create the next events chain
    const nextEvents = generateEventsToForward(
      softerRootState,
      rootComponentDef,
      event,
      stateReader,
    );
    nextEvents.forEach(dispatchEvent);

    // process effects
    void effectsManager.eventOccurred(event, softerRootState, dispatchEvent);
  };
