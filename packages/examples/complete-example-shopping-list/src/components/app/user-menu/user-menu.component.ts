import {
  ComponentDef,
  ComponentEventsContract,
  Effects,
  ExtractComponentValuesContract,
  Selectors,
} from "@softer-components/types";

import { AuthenticationService } from "../../../port/authentication.service";

//State
const initialState = {
  isAuthenticated: false,
  username: "",
};
type State = typeof initialState;
// Selectors
const selectors = {
  isAuthenticated: state => state.isAuthenticated,
  isAnonymous: state => !state.isAuthenticated,
  username: state => state.username,
} satisfies Selectors<State>;

// Events
type eventNames =
  | "authenticated"
  | "logoutSucceeded"
  | "loginRequested"
  | "logoutRequested";
type AppEvents = ComponentEventsContract<
  eventNames,
  { authenticated: { username: string } }
>;

type Contract = {
  events: AppEvents;
  children: {};
  values: ExtractComponentValuesContract<typeof selectors>;
  effects: {
    logoutRequested: ["logoutSucceeded"];
  };
};
// Component definition
type Dependencies = {
  authenticationService: AuthenticationService;
};
// effects
const effects = ({
  authenticationService,
}: Dependencies): Effects<Contract> => ({
  logoutRequested: async ({ logoutSucceeded }) => {
    await authenticationService.signOut();
    logoutSucceeded();
  },
});

const componentDef = (dependencies: Dependencies): ComponentDef<Contract> => ({
  initialState,
  selectors,
  uiEvents: ["logoutRequested", "loginRequested"],
  updaters: {
    authenticated: ({ payload: { username }, state }) => {
      state.username = username;
      state.isAuthenticated = true;
    },
    logoutSucceeded: () => initialState,
  },
  effects: effects(dependencies),
});
// Exporting the component definition as a function to allow dependencies injection
export const userMenuDef = componentDef;
export type UserMenuContract = Contract;
export type UserMenuDependencies = Dependencies;
