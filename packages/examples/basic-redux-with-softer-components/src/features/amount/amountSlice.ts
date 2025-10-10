import {createSofterSlice} from "@softer-components/redux-adapter";
import {amountComponentDef} from "../../softer-components/counter/amountComponent.ts";

const {slice} = createSofterSlice("amount", amountComponentDef);
export const amountSlice = slice;
export const {setAmountRequested} = amountSlice.actions;
export const {selectAmount} = amountSlice.selectors;