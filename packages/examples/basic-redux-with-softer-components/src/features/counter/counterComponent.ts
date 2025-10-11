import { ComponentDef, EventForwarder, ExtractEventSignatures, StateUpdater} from "@softer-components/types";

// State
const initialState = {
    value: 0,
    nextAmount: 1,
};
export type CounterState = typeof initialState;

// Selectors
const selectCount = ((state: CounterState) => state.value);
const selectIsEven = ((state: CounterState) => state.value % 2 === 0);

const selectors = {
    selectCount,
    selectIsEven,
};

// State Updaters
const incrementRequested:StateUpdater<CounterState> =
    (state: CounterState) => ({ ...state, value: state.value + 1 });
const decrementRequested:StateUpdater<CounterState> =
    (state: CounterState) => ({ ...state, value: state.value - 1 });
const incrementByAmountRequested:StateUpdater<CounterState> =
    (state: CounterState): CounterState => ({
        ...state,
        value: state.value + state.nextAmount,
    });
const setNextAmountRequested:StateUpdater<CounterState, number> =
    (state: CounterState, amount: number): CounterState => ({
        ...state,
        nextAmount: amount,
    });
const stateUpdaters = {
    incrementRequested,
    decrementRequested,
    incrementByAmountRequested,
    setNextAmountRequested,
};

type CounterEventPayloads = ExtractEventSignatures<typeof stateUpdaters>;


//Event forwarders
type EventDependencies = {
    amount: {
        amountUpdated: number,
    }
};
const eventForwarder1: EventForwarder<CounterState, CounterEventPayloads, EventDependencies> = {
    onEvent: "amount/amountUpdated",
    thenDispatch: "setNextAmountRequested",
};

const eventForwarder2: EventForwarder<CounterState, CounterEventPayloads, EventDependencies> = {
    onEvent: "incrementRequested",
    thenDispatch: "setNextAmountRequested",
    withPayload: (state) => state.value + 1,
    onCondition: (state) => selectCount(state) > 0,
};

const eventForwarders: EventForwarder<CounterState, CounterEventPayloads, EventDependencies>[] =
    [eventForwarder1, eventForwarder2];

// Component Definition
export const counterComponentDef: ComponentDef<
    CounterState,
    CounterEventPayloads,
    EventDependencies
> = {
    initialState,
    stateUpdaters,
    selectors,
    eventForwarders
};


