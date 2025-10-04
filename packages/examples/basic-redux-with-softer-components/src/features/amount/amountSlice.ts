import {createSofterSlice} from "@softer-components/redux-adapter";
import {amountComponentDef} from "./amountComponent.ts";

export const amountSlice = createSofterSlice("amount", amountComponentDef)
export const { setAmountRequested} = amountSlice.actions;
export const { selectAmount } = amountSlice.selectors;