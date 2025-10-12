import {
  ComponentDef,
  State,
  Payload,
  EventDependencies,
  SelectorRecord,
} from "@softer-components/types";
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

type Reducers<
  TState extends State,
  TPayloads extends Record<string, Payload>,
> = {
  [K in keyof TPayloads]: CaseReducer<TState, PayloadAction<TPayloads[K]>>;
};

export function createSofterSlice<
  TState extends State,
  TSelectors extends SelectorRecord<TState> = {},
  TPayloads extends Record<string, Payload> = {},
  Name extends string = string,
  TEventDependencies extends EventDependencies = {},
>(
  path: Name,
  componentDef: ComponentDef<TState, TSelectors, TPayloads, TEventDependencies>,
): [
  Slice<
    typeof componentDef.initialState,
    Reducers<typeof componentDef.initialState, TPayloads>,
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
