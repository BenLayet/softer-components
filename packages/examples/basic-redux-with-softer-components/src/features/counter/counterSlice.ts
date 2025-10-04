import {counterComponentDef} from './counterComponent';
import {createSofterSlice} from "@softer-components/redux-adapter";

export const counterSlice = createSofterSlice("counter", counterComponentDef)

export const { incrementRequested, decrementRequested,  incrementByAmountRequested } = counterSlice.actions;
export const { selectCount } = counterSlice.selectors;