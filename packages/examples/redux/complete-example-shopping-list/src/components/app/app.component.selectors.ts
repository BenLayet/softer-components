import { createBaseSelectors } from "@softer-components/app-utilities";
import type {
  ExtractComponentValuesContract,
  Selectors,
} from "@softer-components/types";

import { State, initialState } from "./app.component.state";

export const selectors = {
  ...createBaseSelectors(initialState),
  isUserMenuVisible: state => state.page !== "SIGN_IN_FORM",
} satisfies Selectors<State>;
export type Values = ExtractComponentValuesContract<typeof selectors>;
