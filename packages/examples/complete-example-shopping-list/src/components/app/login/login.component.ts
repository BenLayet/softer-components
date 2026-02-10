import {
  ComponentDef,
  ComponentEventsContract,
  Effects,
  ExtractComponentValuesContract,
  Selectors,
} from "@softer-components/types";

import { AuthenticationService } from "../../../port/authenticationService";

// State
type ErrorType = "invalid credentials" | "network error" | "unknown error";
type Error = { type: ErrorType; message?: string };
const initialState = {
  username: "",
  password: "",
  isProcessing: false,
  errors: [] as Error[],
};
type State = typeof initialState;

// Selectors
const selectors = {
  username: state => state.username,
  password: state => state.password,
  isProcessing: state => state.isProcessing,
  hasInvalidCredentialError: state =>
    state.errors.map(e => e.type).includes("invalid credentials"),
  hasNetworkError: state =>
    state.errors.map(e => e.type).includes("network error"),
  hasUnknownError: state =>
    state.errors.map(e => e.type).includes("unknown error"),
} satisfies Selectors<State>;

// Events
type eventNames =
  | "loginCancelled"
  | "usernameChanged"
  | "passwordChanged"
  | "loginSubmitted"
  | "loginSucceeded"
  | "loginFailed";

type EffectsContract = {
  loginSubmitted: ["loginSucceeded", "loginFailed"];
};
type Contract = {
  events: ComponentEventsContract<
    eventNames,
    {
      usernameChanged: string;
      passwordChanged: string;
      loginFailed: Error;
      loginSucceeded: { username: string };
    }
  >;
  children: {};
  values: ExtractComponentValuesContract<typeof selectors>;
  effects: EffectsContract;
};
type Dependencies = {
  authenticationService: AuthenticationService;
};
// Component definition
const effects: (dependencies: Dependencies) => Effects<Contract> = ({
  authenticationService,
}) => ({
  loginSubmitted: async ({ loginSucceeded, loginFailed }, { values }) => {
    try {
      if (
        await authenticationService.authenticate(
          values.username(),
          values.password(),
        )
      ) {
        loginSucceeded({ username: values.username() });
      } else {
        loginFailed({ type: "invalid credentials" });
      }
    } catch (e: any) {
      if (e.message === "network error") {
        loginFailed({ type: "network error", message: e.message });
      } else {
        loginFailed({ type: "unknown error", message: e.message });
      }
    }
  },
});

const componentDef = (
  dependencies: Dependencies,
): ComponentDef<Contract, State> => ({
  initialState,
  selectors,
  uiEvents: [
    "usernameChanged",
    "passwordChanged",
    "loginSubmitted",
    "loginCancelled",
  ],
  updaters: {
    usernameChanged: ({ state, payload: username }) => {
      state.username = username;
    },
    passwordChanged: ({ state, payload: password }) => {
      state.password = password;
    },
    loginSubmitted: ({ state }) => {
      state.isProcessing = true;
      state.errors = [];
    },
    loginSucceeded: ({ state }) => {
      state.isProcessing = false;
    },
    loginFailed: ({ state, payload: error }) => {
      state.isProcessing = false;
      state.errors.push(error);
    },
  },
  effects: effects(dependencies),
});
// Exporting the component definition as a function to allow dependencies injection
export const loginComponentDef = componentDef;
export type LoginContract = Contract;
export type LoginDependencies = Dependencies;
