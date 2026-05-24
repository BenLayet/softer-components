import type { StateUpdaters } from "@softer-components/types";

import { assertIsNotUndefined } from "../../../../utils/assert.functions";
import type { Contract } from "./item-row.component.contract";
import type { State } from "./item-row.component.state";

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
