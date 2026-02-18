import { Selectors } from "@softer-components/types";

import { State } from "./sign-in-form.component.state";

export const selectors = {
  username: (state: State) => state.username,
  password: (state: State) => state.password,
  hasInvalidCredentialError: (state: State) =>
    state.errors.map(e => e.type).includes("invalid credentials"),
  hasNetworkError: (state: State) =>
    state.errors.map(e => e.type).includes("network error"),
  hasUnknownError: (state: State) =>
    state.errors.map(e => e.type).includes("unknown error"),
} satisfies Selectors<State>;
