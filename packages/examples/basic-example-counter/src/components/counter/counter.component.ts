import { ComponentDef, ExtractUiContract } from "@softer-components/types";

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
  initialState: () => initialState,
  selectors: {
    count: state => state.count,
  },
  events: {
    incrementRequested: {
      payloadFactory: () => undefined,
    },
    decrementRequested: {
      payloadFactory: () => undefined,
    },
  },
  stateUpdaters: {
    incrementRequested: state => ({ ...state, count: state.count + 1 }),
    decrementRequested: state => ({ ...state, count: state.count - 1 }),
  },
} satisfies ComponentDef<typeof initialState, CounterEvents>;

export type CounterUiContract = ExtractUiContract<typeof counterComponentDef>;
