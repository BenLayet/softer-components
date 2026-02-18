import type {
  ExtractComponentValuesContract,
  Selectors,
} from "@softer-components/types";

import { State } from "./app.component.state";

export const selectors = {
  page: state => state.page,
  isUserMenuVisible: state => state.page !== "SIGN_IN_FORM",
} satisfies Selectors<State>;
export type Values = ExtractComponentValuesContract<typeof selectors>;
