import { RootState } from '../../app/store';
import {counterComponentDef} from './counterComponent';
import {createSofterSlice} from "@softer-components/redux-adapter";

const {slice, listenerOptions} = createSofterSlice("counter", counterComponentDef);
export const counterSlice = slice;
export const counterListenerOptions = listenerOptions;
export const {incrementRequested, decrementRequested, incrementByAmountRequested} = counterSlice.actions;
export const {selectCount} = counterSlice.selectors as unknown as {selectCount: (state: RootState) => number}; //TODO fix types
