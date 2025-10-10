import {counterComponentDef} from '../../softer-components/counter/counterComponent.ts';
import {createSofterSlice} from "@softer-components/redux-adapter";

const {slice} = createSofterSlice("counter", counterComponentDef);
export const counterSlice = slice;
export const {incrementRequested, decrementRequested, incrementByAmountRequested} = counterSlice.actions;
export const {selectCount} = counterSlice.selectors;
