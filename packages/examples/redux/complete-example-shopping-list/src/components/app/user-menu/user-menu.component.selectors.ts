import type {
  ExtractComponentValuesContract,
  Selectors,
  State,
} from "@softer-components/types";

import type { UserContextContract } from "../user-context/user-context.component";

export type Context = {
  userContext: UserContextContract;
};

export const selectors = {
  isAuthenticated: (_, __, { userContext }) =>
    userContext.values.isAuthenticated(),
  isAnonymous: (_, __, { userContext }) =>
    !userContext.values.isAuthenticated(),
  username: (_, __, { userContext }) => userContext.values.username(),
} satisfies Selectors<State, undefined, Context>;
export type Values = ExtractComponentValuesContract<typeof selectors>;
