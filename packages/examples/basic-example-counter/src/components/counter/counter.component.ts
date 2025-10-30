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

// Component definition
export const counterComponentDef = {
  initialState,
  selectors: {
    count: state => state.count,
  },
  events: {
    incrementRequested: {
      stateUpdater: state => ({
        ...state,
        count: state.count + 1,
      }),
    },
    decrementRequested: {
      stateUpdater: state => ({ ...state, count: state.count - 1 }),
    },
  },
} satisfies ComponentDef<typeof initialState, CounterEvents>;

//TODO export type CounterUiContract = ExtractUiContract<typeof counterComponentDef>;
