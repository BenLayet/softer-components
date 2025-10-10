import {ComponentDef} from "@softer-components/types";

// State
const initialState = {
    amount: 5,
};
export type AmountState = typeof initialState;

// Event Handlers
const setAmountRequested =
    (_state: AmountState, payload: number): AmountState => ({
        amount: payload,
    });

// Selectors
const selectAmount = (state: AmountState) => state.amount;

// Component Definition
export const amountComponentDef: ComponentDef<AmountState, {
    setAmountRequested: number,
}, { selectAmount: number }> = {
    initialState,
    eventHandlers: {
        setAmountRequested
    },
    selectors: {
        selectAmount,
    },
    chainedEvents: [
        {
            onEvent: "setAmountRequested",
            thenDispatch: "amountUpdated",
        }
    ]
};
