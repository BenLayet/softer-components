import {
  ExtractComponentValuesContract,
  Selectors,
} from "@softer-components/types";

import { State } from "./user-context.component.state";

export const selectors = {
  username: (state: State) => state.username,
  isAuthenticated: (state: State) => state.isAuthenticated,
  isProcessing: (state: State) => state.isProcessing,
} satisfies Selectors<State>;
export type Values = ExtractComponentValuesContract<typeof selectors>;
