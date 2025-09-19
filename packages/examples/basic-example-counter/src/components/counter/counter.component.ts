import { ComponentDef } from "@softer-components/types";

// State
const initialState = {
  value: 0,
};
type CounterState = typeof initialState;

// Selectors
const count = (state: CounterState) => state.value;

const selectors = {
  count,
};

// Events
type CounterEvents =
  | { type: "incrementRequested"; payload: void }
  | { type: "decrementRequested"; payload: void };
const uiEventTypes = ["incrementRequested" as const, "decrementRequested" as const];

// State Updaters
const incrementRequested = (state: CounterState) => ({
  ...state,
  value: state.value + 1,
});
const decrementRequested = (state: CounterState) => ({
  ...state,
  value: state.value - 1,
});
const stateUpdaters = {
  incrementRequested,
  decrementRequested,
};

// Component Definition
export const counterComponentDef={
  initialState,
  stateUpdaters,
  uiEventTypes,
  selectors,
} satisfies ComponentDef<
  CounterEvents,
  CounterState,
  typeof selectors,
  {},
  CounterEvents
> ;
