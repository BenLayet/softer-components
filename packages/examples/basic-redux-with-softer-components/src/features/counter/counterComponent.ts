// State
import {ComponentDef} from "@softer-components/types";

const initialState = {
  value: 0,
};
export type CounterState = typeof initialState;

// Event Handlers
const incrementRequested = (state: CounterState) => ({ value: state.value + 1 });
const decrementRequested = (state: CounterState) => ({ value: state.value - 1 });
/*
const incrementByAmountRequested = (state: CounterState, amount: number): CounterState => ({
  value: state.value + amount,
});

 */
const resetRequested = () => initialState

// Selectors
const selectCount = (state: CounterState) => state.value;

// Component Definition
export const counterComponentDef: ComponentDef<CounterState, {
    incrementRequested: void,
    decrementRequested: void,
    resetRequested: void,
}, {selectCount: number}  > = {
  initialState,
  eventHandlers: {
    incrementRequested,
    decrementRequested,
    //incrementByAmountRequested,
    resetRequested,
  },
  selectors: {
    selectCount,
  },
};

