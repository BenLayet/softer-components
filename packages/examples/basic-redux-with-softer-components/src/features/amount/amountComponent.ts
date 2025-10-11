import { ComponentDef } from "@softer-components/types";

// State
const initialState = {
    amount: 5,
};
export type AmountState = typeof initialState;

// state updater
const setAmountRequested =
    (_state: AmountState, payload: number): AmountState => ({
        amount: payload,
    });

// Selectors
const selectAmount = (state: AmountState) => state.amount;
const selectors = {
    selectAmount,
};
//event forwarders
export type PublicAmountEvents = {
    amountUpdated: number,
};

type AmountEvents = PublicAmountEvents & {
    setAmountRequested: number,
};
// Component Definition
export const amountComponentDef: ComponentDef<AmountState, typeof selectors, AmountEvents> = {
    initialState,
    stateUpdaters: {
        setAmountRequested
    },
    selectors,
    eventForwarders: [
        {
            onEvent: "setAmountRequested",
            thenDispatch: "amountUpdated",
        }
    ]
};