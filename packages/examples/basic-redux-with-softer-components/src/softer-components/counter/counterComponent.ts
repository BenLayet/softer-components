import { ComponentDef, ChainedEvent, ExtractEventHandlerPayloads, ExtractSelectorReturnTypes } from "@softer-components/types";

// State
const initialState = {
    value: 0,
    nextAmount: 1,
};
export type CounterState = typeof initialState;

// Event Handlers
const incrementRequested =
    (state: CounterState) => ({ ...state, value: state.value + 1 });
const decrementRequested =
    (state: CounterState) => ({ ...state, value: state.value - 1 });
const incrementByAmountRequested =
    (state: CounterState): CounterState => ({
        ...state,
        value: state.value + state.nextAmount,
    });
const setNextAmountRequested =
    (state: CounterState, amount: number): CounterState => ({
        ...state,
        nextAmount: amount,
    });
const eventHandlers = {
    incrementRequested,
    decrementRequested,
    incrementByAmountRequested,
    setNextAmountRequested,
};

type CounterEventPayloads = ExtractEventHandlerPayloads<typeof eventHandlers>;

// Selectors
const selectCount = ((state: CounterState) => state.value);
const selectIsEven = ((state: CounterState) => state.value % 2 === 0);

const selectors = {
    selectCount,
    selectIsEven,
};
type SelectorReturnTypes = ExtractSelectorReturnTypes<typeof selectors>;

//Chained Events
type EventDependencies = {
    amount: {
        amountUpdated: number,
    }
};

const chainedEvent1: ChainedEvent<CounterState, CounterEventPayloads, EventDependencies> = {
    onEvent: "amount/amountUpdated",
    thenDispatch: "setNextAmountRequested",
    onCondition: selectIsEven,
};

const chainedEvent2: ChainedEvent<CounterState, CounterEventPayloads, EventDependencies> = {
    onEvent: "incrementRequested",
    thenDispatch: "setNextAmountRequested",
    withPayload: (state) => state.nextAmount + 1,
    onCondition: (state) => selectCount(state) > 0,
};

const chainedEvents: ChainedEvent<CounterState, CounterEventPayloads, EventDependencies>[] =
    [chainedEvent1, chainedEvent2];

// Component Definition
export const counterComponentDef: ComponentDef<
    CounterState,
    CounterEventPayloads,
    SelectorReturnTypes,
    EventDependencies
> = {
    initialState,
    eventHandlers,
    selectors,
    chainedEvents
};


