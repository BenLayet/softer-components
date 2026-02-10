import {
  ComponentDef,
  ComponentEventsContract,
  Effects,
  ExtractComponentValuesContract,
  Selectors,
} from "@softer-components/types";

import { AuthenticationService } from "../../../port/authentication.service";

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
  | "signInCancelled"
  | "usernameChanged"
  | "passwordChanged"
  | "signInFormSubmitted"
  | "signInSucceeded"
  | "signInFailed";

type EffectsContract = {
  signInFormSubmitted: ["signInSucceeded", "signInFailed"];
};
type Contract = {
  events: ComponentEventsContract<
    eventNames,
    {
      usernameChanged: string;
      passwordChanged: string;
      signInFailed: Error;
      signInSucceeded: { username: string };
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
  signInFormSubmitted: async (
    { signInSucceeded, signInFailed },
    { values },
  ) => {
    try {
      if (
        await authenticationService.signIn(values.username(), values.password())
      ) {
        signInSucceeded({ username: values.username() });
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
});

const componentDef = (
  dependencies: Dependencies,
): ComponentDef<Contract, State> => ({
  initialState,
  selectors,
  uiEvents: [
    "usernameChanged",
    "passwordChanged",
    "signInFormSubmitted",
    "signInCancelled",
  ],
  updaters: {
    usernameChanged: ({ state, payload: username }) => {
      state.username = username;
    },
    passwordChanged: ({ state, payload: password }) => {
      state.password = password;
    },
    signInFormSubmitted: ({ state }) => {
      state.isProcessing = true;
      state.errors = [];
    },
    signInSucceeded: ({ state }) => {
      state.isProcessing = false;
    },
    signInFailed: ({ state, payload: error }) => {
      state.isProcessing = false;
      state.errors.push(error);
    },
  },
  effects: effects(dependencies),
});
// Exporting the component definition as a function to allow dependencies injection
export const signInFormComponentDef = componentDef;
export type SignInContract = Contract;
export type SignInDependencies = Dependencies;
