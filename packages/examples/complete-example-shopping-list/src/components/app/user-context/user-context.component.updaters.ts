import { StateUpdaters } from "@softer-components/types";

import { Contract } from "./user-context.component.contract";
import { State } from "./user-context.component.state";

export const stateUpdaters: StateUpdaters<Contract, State> = {
  signInRequested: ({ state }) => {
    state.isProcessing = true;
  },
  signOutRequested: ({ state }) => {
    state.isProcessing = true;
  },
  loadUserRequested: ({ state }) => {
    state.isProcessing = true;
  },
  signInFailed: ({ state }) => {
    state.isProcessing = false;
  },
  unAuthenticated: ({ state }) => {
    state.isProcessing = false;
    state.isAuthenticated = false;
    state.username = "";
  },
  authenticated: ({ state, payload: { username } }) => {
    state.isProcessing = false;
    state.isAuthenticated = true;
    state.username = username;
  },
};
