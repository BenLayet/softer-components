import { RootState } from '../../app/store';
import {counterComponentDef} from './counterComponent';
import {createSofterSlice} from "@softer-components/redux-adapter";

export const [counterSlice, counterListenerOptions] = createSofterSlice("counter", counterComponentDef);
export const {incrementRequested, decrementRequested, incrementByAmountRequested} = counterSlice.actions;
export const {selectCount} = counterSlice.selectors as unknown as {selectCount: (state: RootState) => number}; //TODO fix types
export const {selectIsEven} = counterSlice.selectors as unknown as {selectIsEven: (state: RootState) => boolean}; //TODO fix types