import {
  ComponentDef,
  ComponentEventsContract,
  ExtractComponentValuesContract,
  Selectors,
} from "@softer-components/types";
import { SofterContext } from "@softer-components/utils";

import { AppError } from "../../../model/errors";
import { UserContextContract } from "../user-context/user-context.component";

// State
const initialState = {
  username: "",
  password: "",
  errors: [] as AppError[],
};
type State = typeof initialState;

// Selectors
const selectors = {
  username: state => state.username,
  password: state => state.password,
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
      signInFailed: AppError;
      signInSucceeded: { username: string };
    }
  >;
  children: {};
  requiredContext: {
    userContext: UserContextContract;
  };
  values: ExtractComponentValuesContract<typeof selectors>;
  effects: EffectsContract;
};

// Component definition
const componentDef = ({
  context,
}: {
  context: SofterContext<{ userContext: UserContextContract }>;
}): ComponentDef<Contract, State> => ({
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
      state.errors = [];
    },
    signInFailed: ({ state, payload: error }) => {
      state.errors.push(error);
    },
  },
  contextDefs: {
    userContext: context.getContextPath<UserContextContract>("userContext"),
  },
  contextConfig: {
    userContext: {
      commands: [
        {
          from: "signInFormSubmitted",
          to: "signInRequested",
          withPayload: ({ values }) => ({
            username: values.username(),
            password: values.password(),
          }),
        },
      ],
      listeners: [
        {
          from: "signInSucceeded",
          to: "signInSucceeded",
        },
        {
          from: "signInFailed",
          to: "signInFailed",
        },
      ],
    },
  },
});
// Exporting the component definition as a function to allow dependencies injection
export const signInFormComponentDef = componentDef;
export type SignInContract = Contract;
