import { createSofterSlice } from "@softer-components/redux-adapter";
import { amountComponentDef } from "./amountComponent";
import { RootState } from "../../app/store";

export const [amountSlice, amountListenerOptions] = createSofterSlice("counter/amount", amountComponentDef);
export const { setAmountRequested } = amountSlice.actions;
export const { selectAmount } = amountSlice.selectors as unknown as { selectAmount: (state: RootState) => number }; //TODO fix types