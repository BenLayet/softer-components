import {
  configureStore,
  createListenerMiddleware,
  createReducer,
} from "@reduxjs/toolkit";
import { ComponentDef } from "@softer-components/types";
import {
  EffectsManager,
  generateEventsToForward,
  GlobalEvent,
  initializeRootState,
  StateManager,
  StateReader,
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
  softerEffectsManager: EffectsManager;
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
  const eventForwarding = softerEventForwarding(rootComponentDef, stateManager);
  const effects = softerEffects(effectsManager);

  const softerMiddleware = createSofterMiddleware(eventForwarding, effects);
  return {
    softerViewModel,
    initialGlobalState,
    softerMiddleware,
    softerReducer,
    effectsManager,
  };
}

export function createSofterMiddleware(
  softerEventForwarding: ReduxEffect,
  softerEffects: ReduxEffect,
) {
  const listenerMiddleware = createListenerMiddleware();
  listenerMiddleware.startListening({
    predicate: () => true,
    effect: softerEventForwarding,
  });
  listenerMiddleware.startListening({
    predicate: () => true,
    effect: softerEffects,
  });
  return listenerMiddleware.middleware;
}
export function configureSofterStore(
  rootComponentDef: ComponentDef,
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
    softerEffectsManager: config.effectsManager,
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

const softerEventForwarding =
  (rootComponentDef: ComponentDef, stateReader: StateReader) =>
  (action: any, listenerApi: any) => {
    if (!isSofterEvent(action)) {
      return;
    }
    const dispatchEvent = (event: GlobalEvent) =>
      listenerApi.dispatch(eventToAction(event));
    const softerRootState = getSofterRootTree(listenerApi.getState());
    const event = actionToEvent(action);
    const nextActions = generateEventsToForward(
      softerRootState,
      rootComponentDef,
      event,
      stateReader,
    );
    nextActions.forEach(dispatchEvent);
  };
const softerEffects =
  (effectsManager: EffectsManager) => (action: any, listenerApi: any) => {
    if (!isSofterEvent(action)) {
      return;
    }
    setTimeout(() => {
      const dispatchEvent = (event: GlobalEvent) =>
        listenerApi.dispatch(eventToAction(event));
      effectsManager.eventOccurred(
        actionToEvent(action),
        getSofterRootTree(listenerApi.getState()),
        dispatchEvent,
      );
    });
  };
