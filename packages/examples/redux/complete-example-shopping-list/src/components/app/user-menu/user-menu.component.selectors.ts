import type { ExtractComponentValuesContract, Selectors, State } from "@softer-components/types";

import { type UserContextDef, userContextSymbol } from "../user-context/user-context.component";

export const selectors = {
  isAuthenticated: (_, __, contextValues) =>
    contextValues[userContextSymbol].values.isAuthenticated(),
  isAnonymous: (_, __, contextValues) => !contextValues[userContextSymbol].values.isAuthenticated(),
  username: (_, __, contextValues) => contextValues[userContextSymbol].values.username(),
} satisfies Selectors<State, undefined, UserContextDef>;
export type Values = ExtractComponentValuesContract<typeof selectors>;
