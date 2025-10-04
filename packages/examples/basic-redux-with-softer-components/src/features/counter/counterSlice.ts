import {counterComponentDef, CounterState} from './counterComponent';
import {createSofterSlice} from "@softer-components/redux-adapter";

export const counterSlice = createSofterSlice<CounterState, {
    incrementRequested: void,
    decrementRequested: void,
    resetRequested: void,
}, {selectCount: number} , "counter" >("counter", counterComponentDef)

export const { incrementRequested, decrementRequested, resetRequested } = counterSlice.actions;
export const { selectCount } = counterSlice.selectors;