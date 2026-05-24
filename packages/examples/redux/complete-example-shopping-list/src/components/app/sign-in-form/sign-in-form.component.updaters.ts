import type { StateUpdaters } from "@softer-components/types";

import type { Contract } from "./sign-in-form.component.contract";
import type { State } from "./sign-in-form.component.state";

export const stateUpdaters: StateUpdaters<Contract, State> = {
  usernameChanged: ({ state, payload: username }) => {
    state.username = username;
  },
  passwordChanged: ({ state, payload: password }) => {
    state.password = password;
  },
  signInFormSubmitted: ({ state }) => {
    state.errors = [];
  },
  signInFailed: ({ state, payload: error }) => {
    state.errors.push(error);
  },
  demoUserClicked: ({ state, payload }) => {
    state.username = payload.username;
    state.password = payload.password;
  },
};
