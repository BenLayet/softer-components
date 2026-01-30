import { ComponentDef } from "@softer-components/types";

// Initial state definition
const initialState = {
  count: 0,
};

// Events type declaration
type CounterEvents = {
  incrementRequested: { payload: undefined };
  decrementRequested: { payload: undefined };
};
export type CounterContract = {
  state: typeof initialState;
  events: CounterEvents;
  values: { count: number };
  children: {};
};
// Component definition
export const counterDef: ComponentDef<CounterContract> = {
  initialState,
  selectors: {
    count: state => state.count,
  },
  uiEvents: ["decrementRequested", "incrementRequested"],
  updaters: {
    incrementRequested: ({ state }) => {
      state.count++;
    },
    decrementRequested: ({ state }) => {
      state.count--;
    },
  },
};
