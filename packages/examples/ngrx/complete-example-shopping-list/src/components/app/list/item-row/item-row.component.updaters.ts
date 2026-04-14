import { StateUpdaters } from "@softer-components/types";
import { assertIsNotUndefined } from "@softer-components/utils";

import { Contract } from "./item-row.component.contract";
import { State } from "./item-row.component.state";

export const stateUpdaters: StateUpdaters<Contract, State> = {
  initialize: ({ payload: listItem }) => listItem,
  incrementRequested: ({ state }) => {
    assertIsNotUndefined(state);
    state.quantity += 1;
  },
  decrementRequested: ({ state }) => {
    assertIsNotUndefined(state);
    if (state.quantity > 0) {
      state.quantity -= 1;
    }
  },
};
