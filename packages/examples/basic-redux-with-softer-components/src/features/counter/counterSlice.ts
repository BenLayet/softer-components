import {counterComponentDef, CounterState} from './counterComponent';
import {createSofterSlice} from "@softer-components/redux-adapter";

export const counterSlice = createSofterSlice<CounterState, {
    incrementRequested: void,
    decrementRequested: void,
    resetRequested: void,
    incrementByAmountRequested: number
}, {selectCount: number} , "counter" >("counter", counterComponentDef)

export const { incrementRequested, decrementRequested, resetRequested, incrementByAmountRequested } = counterSlice.actions;
export const { selectCount } = counterSlice.selectors;