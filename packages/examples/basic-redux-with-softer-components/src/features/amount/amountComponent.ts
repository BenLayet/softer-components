import {ComponentDef} from "@softer-components/types";

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


export type PublicAmountEvents = {
        amountUpdated: number,
};

type AmountEvents = PublicAmountEvents & {
    setAmountRequested: number,
};
// Component Definition
export const amountComponentDef: ComponentDef<AmountState, AmountEvents> = {
    initialState,
    stateUpdaters: {
        setAmountRequested
    },
    selectors: {
        selectAmount,
    },
    eventForwarders: [
        {
            onEvent: "setAmountRequested",
            thenDispatch: "amountUpdated",
        }
    ]
};
