import {
  ComponentDef,
  Effects,
  EventsContract,
  ExtractComponentValuesContract,
  Selectors,
} from "@softer-components/types";

import { AppError } from "../../../model/errors";
import { AuthenticationService } from "../../../port/authentication.service";

// State
const initialState = {
  username: "",
  isAuthenticated: false,
  isProcessing: false,
};
type State = typeof initialState;

// Selectors
const selectors = {
  username: state => state.username,
  isAuthenticated: state => state.isAuthenticated,
  isProcessing: state => state.isProcessing,
} satisfies Selectors<State>;

// Events
type eventNames =
  | "signOutRequested"
  | "signOutSucceeded"
  | "signInRequested"
  | "signInSucceeded"
  | "signInFailed"
  | "authenticated";

type Contract = {
  events: EventsContract<
    eventNames,
    {
      signInFailed: AppError;
      signInRequested: { username: string; password: string };
      signInSucceeded: { username: string };
      authenticated: { username: string };
    }
  >;
  children: {};
  values: ExtractComponentValuesContract<typeof selectors>;
};
type Dependencies = {
  authenticationService: AuthenticationService;
};
// Component definition
const effects = ({
  authenticationService,
}: Dependencies): Effects<Contract> => ({
  signInRequested: async (
    { signInSucceeded, signInFailed },
    { payload: { username, password } },
  ) => {
    try {
      if (await authenticationService.signIn(username, password)) {
        signInSucceeded({ username });
      } else {
        signInFailed({ type: "invalid credentials" });
      }
    } catch (e: any) {
      if (e.message === "network error") {
        signInFailed({ type: "network error", message: e.message });
      } else {
        signInFailed({ type: "unknown error", message: e.message });
      }
    }
  },
  signOutRequested: async ({ signOutSucceeded }) => {
    await authenticationService.signOut();
    signOutSucceeded();
  },
});

const componentDef = (
  dependencies: Dependencies,
): ComponentDef<Contract, State> => ({
  initialState,
  selectors,
  updaters: {
    signInRequested: ({ state }) => {
      state.isProcessing = true;
    },
    signInSucceeded: ({ state, payload: { username } }) => {
      state.isProcessing = false;
      state.isAuthenticated = true;
      state.username = username;
    },
    signInFailed: ({ state }) => {
      state.isProcessing = false;
    },
    signOutRequested: ({ state }) => {
      state.isProcessing = true;
    },
    signOutSucceeded: ({ state }) => {
      state.isProcessing = false;
      state.isAuthenticated = false;
      state.username = "";
    },
  },
  eventForwarders: [{ from: "signInSucceeded", to: "authenticated" }],
  effects: effects(dependencies),
});
// Exporting the component definition as a function to allow dependencies injection
export const userContextDef = componentDef;
export type UserContextContract = Contract;
export type UserContextDependencies = Dependencies;
