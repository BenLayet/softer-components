import { ComponentDef, EventsContract } from "@softer-components/types";
import { createBaseSelectors } from "@softer-components/utils";

// Initial state definition
const initialState = {
  count: 0,
};
type State = typeof initialState;
// Events type declaration
const uiEvents = ["incrementRequested", "decrementRequested"] as const;
type EventName = (typeof uiEvents)[number];
type CounterEvents = EventsContract<EventName, {}, typeof uiEvents>;
export type CounterContract = {
  events: CounterEvents;
  values: { count: number };
};
// Component definition
export const counterDef: ComponentDef<CounterContract, State> = {
  initialState,
  selectors: createBaseSelectors(initialState),
  uiEvents,
  stateUpdaters: {
    incrementRequested: ({ state }) => {
      state.count++;
    },
    decrementRequested: ({ state }) => {
      state.count--;
    },
  },
};
