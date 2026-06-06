import type { ExtractComponentValuesContract, Selectors, State } from "@softer-components/types";

import { userContextSymbol } from "../user-context/user-context.component";

import type { ContextsDef } from "./user-menu.component.dependencies";

export const selectors = {
  isAuthenticated: (_, __, contextValues) =>
    contextValues[userContextSymbol].values.isAuthenticated(),
  isAnonymous: (_, __, contextValues) => !contextValues[userContextSymbol].values.isAuthenticated(),
  username: (_, __, contextValues) => contextValues[userContextSymbol].values.username(),
} satisfies Selectors<State, undefined, ContextsDef>;
export type Values = ExtractComponentValuesContract<typeof selectors>;
