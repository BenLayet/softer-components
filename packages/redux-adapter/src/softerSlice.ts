import { Event, ComponentDef, State, Selector } from "@softer-components/types";
import {
  CaseReducer,
  createSlice,
  PayloadAction,
  Slice,
  SliceSelectors,
} from "@reduxjs/toolkit";

function createReducer(stateUpdater: any): any {
  return (state: any, action: any) => stateUpdater(state, action.payload);
}

function createReducers(stateUpdaters: any) {
  return Object.fromEntries(
    Object.entries(stateUpdaters ?? {}).map(([actionType, stateUpdater]) => [
      actionType,
      createReducer(stateUpdater),
    ]),
  );
}

const createListenerOption = (path: any) => (eventForwarder: any) => ({
  type: `${path}/${eventForwarder.onEvent}`,
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
      type: path + "/" + eventForwarder.thenDispatch,
      payload: nextPayload,
    });
  },
});

type Reducers<TState extends State, TEvents extends Event> = {
  [K in TEvents["type"]]: CaseReducer<
    TState,
    PayloadAction<Extract<TEvents["payload"], { type: K }>>
  >;
};

export function createSofterSlice<
  Name extends string,
  TEvents extends Event,
  TState extends State,
  TSelectors extends Record<string, Selector<TState>> = {},
  TChildrenEvents extends Record<string, Event> = Record<string, Event>,
  TUiEvents extends TEvents = TEvents,
>(
  path: Name,
  componentDef: ComponentDef<
    TEvents,
    TState,
    TSelectors,
    TChildrenEvents,
    TUiEvents
  >,
): [
  Slice<
    typeof componentDef.initialState,
    Reducers<typeof componentDef.initialState, TEvents>,
    Name,
    Name,
    typeof componentDef.selectors & SliceSelectors<TState>
  >,
  any,
] {
  const slice: any = createSlice({
    name: path,
    initialState: componentDef.initialState,
    selectors: componentDef.selectors ?? {},
    reducers: createReducers(componentDef.stateUpdaters ?? {}),
  });

  const listenerOptions =
    componentDef.eventForwarders?.map(createListenerOption(path)) ?? [];

  return [slice, listenerOptions];
}
