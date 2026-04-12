import { ComponentDef, EventsContract } from "@softer-components/types";
import { createBaseSelectors } from "@softer-components/utils";

// Initial state definition
export const initialState = {
  count: 42,
};
type State = typeof initialState;
// Events type declaration
export const allEvents = ["incrementRequested", "decrementRequested"] as const;
type CounterEvents = EventsContract<typeof allEvents>;
export type CounterContract = {
  events: CounterEvents;
  values: { count: number };
};
// Component definition
export const counterDef: ComponentDef<CounterContract, State> = {
  initialState,
  selectors: createBaseSelectors(initialState),
  allEvents,
  uiEvents: allEvents,
  stateUpdaters: {
    incrementRequested: ({ state }) => {
      state.count++;
    },
    decrementRequested: ({ state }) => {
      state.count--;
    },
  },
};
