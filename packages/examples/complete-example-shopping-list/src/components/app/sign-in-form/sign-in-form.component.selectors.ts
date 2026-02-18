import { Selectors } from "@softer-components/types";
import { createBaseSelectors } from "@softer-components/utils";

import { State, initialState } from "./sign-in-form.component.state";

export const selectors = {
  ...createBaseSelectors(initialState),
  hasInvalidCredentialError: (state: State) =>
    state.errors.map(e => e.type).includes("invalid credentials"),
  hasNetworkError: (state: State) =>
    state.errors.map(e => e.type).includes("network error"),
  hasUnknownError: (state: State) =>
    state.errors.map(e => e.type).includes("unknown error"),
} satisfies Selectors<State>;
