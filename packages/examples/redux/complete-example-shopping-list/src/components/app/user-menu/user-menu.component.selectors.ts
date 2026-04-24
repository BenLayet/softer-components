import {
  ExtractComponentValuesContract,
  Selectors,
  State,
} from "@softer-components/types";

import { UserContextContract } from "../user-context";

export type Context = {
  userContext: UserContextContract;
};

export const selectors = {
  isAuthenticated: (_, __, { userContext }) =>
    userContext.values.isAuthenticated(),
  isAnonymous: (_, __, { userContext }) =>
    !userContext.values.isAuthenticated(),
  username: (_, __, { userContext }) => userContext.values.username(),
} satisfies Selectors<State, {}, Context>;
export type Values = ExtractComponentValuesContract<typeof selectors>;
