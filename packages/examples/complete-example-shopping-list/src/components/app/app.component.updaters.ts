import { Updaters } from "@softer-components/types";

import { Contract } from "./app.component.contract";
import { State, initialState } from "./app.component.state";

export const updaters: Updaters<Contract, State> = {
  listSelected: ({ state }) => {
    state.page = "LIST";
  },
  selectListRequested: ({ state }) => {
    state.page = "LIST";
  },
  resetRequested: () => initialState,
  signInRequested: ({ state }) => {
    state.page = "SIGN_IN_FORM";
  },
};
