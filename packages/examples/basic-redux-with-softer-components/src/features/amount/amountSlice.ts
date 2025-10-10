import {createSofterSlice} from "@softer-components/redux-adapter";
import {amountComponentDef} from "./amountComponent";
import { RootState } from "../../app/store";

const {slice, listenerOptions} = createSofterSlice("amount", amountComponentDef);
export const amountSlice = slice;
export const amountListenerOptions = listenerOptions;
export const {setAmountRequested} = amountSlice.actions;
export const {selectAmount} = amountSlice.selectors as unknown as {selectAmount: (state: RootState) => number}; //TODO fix types