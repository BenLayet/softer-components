import {
  ComponentDef,
  EventsContract,
  ExtractComponentValuesContract,
  Selectors,
} from "@softer-components/types";
import { SofterContext } from "@softer-components/utils";

import { UserContextContract } from "../user-context/user-context.component";

// Events
type eventNames =
  | "authenticated"
  | "signOutRequested"
  | "signOutSucceeded"
  | "signInRequested";
type AppEvents = EventsContract<
  eventNames,
  { authenticated: { username: string } }
>;

// Selectors
type Context = {
  userContext: UserContextContract;
};
const selectors = {
  isAuthenticated: (_, __, { userContext }) =>
    userContext.values.isAuthenticated(),
  isAnonymous: (_, __, { userContext }) =>
    !userContext.values.isAuthenticated(),
  username: (_, __, { userContext }) => userContext.values.username(),
} satisfies Selectors<{}, {}, Context>;

type Contract = {
  events: AppEvents;
  children: {};
  values: ExtractComponentValuesContract<typeof selectors>;
  context: Context;
};
// Component definition
const componentDef = ({
  context,
}: {
  context: SofterContext<{ userContext: UserContextContract }>;
}): ComponentDef<Contract> => ({
  selectors,
  uiEvents: ["signOutRequested", "signOutSucceeded", "signInRequested"],
  contextDefs: {
    userContext: context.getContextPath<UserContextContract>("userContext"),
  },
  contextsConfig: {
    userContext: {
      commands: [
        {
          from: "signOutRequested",
          to: "signOutRequested",
        },
      ],
      listeners: [
        {
          from: "signOutSucceeded",
          to: "signOutSucceeded",
        },
        {
          from: "authenticated",
          to: "authenticated",
        },
      ],
    },
  },
});
// Exporting the component definition as a function to allow dependencies injection
export const userMenuDef = componentDef;
export type UserMenuContract = Contract;
