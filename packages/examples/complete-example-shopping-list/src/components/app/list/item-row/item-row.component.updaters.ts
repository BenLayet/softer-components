import { StateUpdaters } from "@softer-components/types";

import { Contract } from "./item-row.component.contract";
import { State } from "./item-row.component.state";

export const stateUpdaters: StateUpdaters<Contract, State> = {
  initialize: ({ payload: listItem }) => listItem,
  incrementRequested: ({ state }) => {
    state.quantity += 1;
  },
  decrementRequested: ({ state }) => {
    if (state.quantity > 0) {
      state.quantity -= 1;
    }
  },
};
