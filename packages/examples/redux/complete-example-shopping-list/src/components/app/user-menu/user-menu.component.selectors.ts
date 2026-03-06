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
  isAuthenticated: (_: any, __: any, { userContext }) =>
    userContext.values.isAuthenticated(),
  isAnonymous: (_: any, __: any, { userContext }) =>
    !userContext.values.isAuthenticated(),
  username: (_: any, __: any, { userContext }) => userContext.values.username(),
} satisfies Selectors<State, {}, Context>;
export type Values = ExtractComponentValuesContract<typeof selectors>;
