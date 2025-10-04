import {ComponentDef} from "@softer-components/types";
import {amountComponentDef} from "../amount/amountComponent.ts";

// State
const initialState = {
    value: 0,
    nextAmount: 5,
};
export type CounterState = typeof initialState;

// Event Handlers
const incrementRequested =
    (state: CounterState) => ({...state, value: state.value + 1});
const decrementRequested =
    (state: CounterState) => ({...state, value: state.value - 1});
const incrementByAmountRequested =
    (state: CounterState, amount: number): CounterState => ({
        ...state,
        value: state.value + amount,
    });
const setNextAmountRequested =
    (state: CounterState, amount: number): CounterState => ({
        ...state,
        nextAmount: amount,
    });

// Selectors
const selectCount =
    (state: CounterState) => state.value;

// Component Definition
export const counterComponentDef: ComponentDef<CounterState, {
    incrementRequested: void,
    decrementRequested: void,
    incrementByAmountRequested: number,
    setNextAmountRequested: number,
}, { selectCount: number }> = {
    initialState,
    eventHandlers: {
        incrementRequested,
        decrementRequested,
        incrementByAmountRequested,
        setNextAmountRequested,
    },
    selectors: {
        selectCount,
    },
    children: {
        amount: amountComponentDef,
    }
};
