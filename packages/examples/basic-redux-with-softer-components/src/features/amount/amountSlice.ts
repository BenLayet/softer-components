import { createSofterSlice } from "@softer-components/redux-adapter";
import { amountComponentDef } from "./amountComponent";

export const [amountSlice, amountListenerOptions] = createSofterSlice("counter/amount", amountComponentDef);
export const { setAmountRequested } = amountSlice.actions;
export const { selectAmount } = amountSlice.selectors; 
