import {
  configureStore,
  createListenerMiddleware,
  createReducer,
  ListenerMiddlewareInstance,
} from "@reduxjs/toolkit";
import { ComponentDef } from "@softer-components/types";
import { initialStateFromComponentMap, mapComponentTree } from "./softerUtils";

export function configureSofterStore(
  rootComponentDef: ComponentDef<any, any, any, any>,
) {
  const componentMap = mapComponentTree(rootComponentDef);
  const listenerMiddleware = createListenerMiddleware();
  startListeningForComponentMapEventForwarders(
    componentMap,
    listenerMiddleware,
  );
  return configureStore({
    reducer: createSofterReducerFromComponentMap(componentMap),
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().prepend(listenerMiddleware.middleware),
  });
}

function createSofterReducerFromComponentMap(
  componentMap: Record<string, ComponentDef>,
) {
  return createReducer(
    initialStateFromComponentMap(componentMap),
    (builder: any) => {
      Object.entries(componentMap).forEach(([path, def]) => {
        Object.entries(def.stateUpdaters ?? {}).forEach(
          ([updaterName, updater]) => {
            builder.addCase(
              `${path}${updaterName}`,
              (state: any, action: any) => {
                state[path] = updater(state[path], action.payload);
              },
            );
          },
        );
      });
    },
  );
}
function startListeningForComponentMapEventForwarders(
  componentMap: Record<string, ComponentDef>,
  listenerMiddleware: ListenerMiddlewareInstance,
) {
  Object.entries(componentMap).forEach(([path, def]) => {
    startListeningForComponentEventForwarders(path, def, listenerMiddleware);
  });
}

function startListeningForComponentEventForwarders(
  path: string,
  component: ComponentDef,
  listenerMiddleware: ListenerMiddlewareInstance,
) {
  component.eventForwarders
    ?.map(createListenerOption(path))
    .forEach((listenerOption) => {
      //no need to handle unsubscribe listener as eventForwarders are synchronous and do not hold resources
      listenerMiddleware.startListening(listenerOption);
    });
}
const createListenerOption = (path: string) => (eventForwarder: any) => ({
  type: `${path}${eventForwarder.onEvent}`,
  effect: (action: any, listenerApi: any) => {
    const state = listenerApi.getState()[path];
    const previousPayload = action.payload;
    if (
      eventForwarder.onCondition &&
      !eventForwarder.onCondition(state, previousPayload)
    ) {
      return;
    }
    const nextPayload = eventForwarder.withPayload
      ? eventForwarder.withPayload(
          listenerApi.getState()[path],
          previousPayload,
        )
      : previousPayload;
    listenerApi.dispatch({
      type: path + eventForwarder.thenDispatch,
      payload: nextPayload,
    });
  },
});
