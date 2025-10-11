import { ComponentDef, EventForwarder, ExtractEventSignatures, StateUpdater} from "@softer-components/types";
import { PublicAmountEvents } from "../amount/amountComponent";

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
    amount: PublicAmountEvents;
};
const eventForwarder1: EventForwarder<CounterState, CounterEventPayloads, EventDependencies> = {
    onEvent: "amount/amountUpdated",
    thenDispatch: "setNextAmountRequested",
};

const eventForwarders: EventForwarder<CounterState, CounterEventPayloads, EventDependencies>[] =
    [eventForwarder1];

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


