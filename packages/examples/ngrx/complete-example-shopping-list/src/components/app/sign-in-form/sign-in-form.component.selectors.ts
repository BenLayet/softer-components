import type { Selectors } from "@softer-components/types";

import type { State} from "./sign-in-form.component.state";
import { initialState } from "./sign-in-form.component.state";
import { createBaseSelectors } from "@softer-components/app-utilities";

export const selectors = {
  ...createBaseSelectors(initialState),
  hasInvalidCredentialError: (state: State) =>
    state.errors.map((e) => e.type).includes("invalid credentials"),
  hasNetworkError: (state: State) => state.errors.map((e) => e.type).includes("network error"),
  hasUnknownError: (state: State) => state.errors.map((e) => e.type).includes("unknown error"),
} satisfies Selectors<State>;
