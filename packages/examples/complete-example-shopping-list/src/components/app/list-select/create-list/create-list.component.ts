import {
  ComponentDef,
  ComponentEventsContract,
  EffectsDef,
  ExtractComponentValuesContract,
  Selectors,
} from "@softer-components/types";
import { not, or } from "@softer-components/utils";

import { List } from "../../../../model";

type ErrorMessage = string;
// Initial state definition
const initialState = {
  listName: "",
  existingListNames: [] as string[],
  shouldShowErrors: false,
  isSaving: false,
  hasSaveFailed: false,
};
type State = typeof initialState;

//selectors
const listName = (state: State) => state.listName.trim();
const hasNameRequiredError = (state: State) => listName(state) === "";
const hasSaveFailedError = (state: State) => state.hasSaveFailed;
const hasListAlreadyExistsError = (state: State) =>
  state.existingListNames.includes(listName(state));
const hasAnyError = or(
  hasNameRequiredError,
  hasListAlreadyExistsError,
  hasSaveFailedError,
);
const areErrorsVisible = (state: State) =>
  hasAnyError(state) && state.shouldShowErrors;
const isListNameValid = not(hasAnyError);
const selectors = {
  listName,
  isListNameValid,
  hasNameRequiredError,
  hasSaveFailedError,
  hasListAlreadyExistsError,
  areErrorsVisible,
} satisfies Selectors<State>;

// Events type declaration
type eventNames =
  | "listNameChanged"
  | "createNewListSubmitted"
  | "createNewListRequested"
  | "createNewListSucceeded"
  | "createNewListFailed"
  | "setExistingListNames";

type ListSelectEvents = ComponentEventsContract<
  eventNames,
  {
    setExistingListNames: string[];
    listNameChanged: string;
    createNewListRequested: string;
    createNewListSucceeded: List;
    createNewListFailed: ErrorMessage;
    listSelected: List;
  }
>;

// Events type declaration
const effects = {
  createNewListRequested: ["createNewListSucceeded", "createNewListFailed"],
} satisfies EffectsDef<eventNames>;

export type CreateListContract = {
  state: State;
  values: ExtractComponentValuesContract<typeof selectors>;
  events: ListSelectEvents;
  children: {};
  effects: typeof effects;
};

// Component definition
export const createListDef: ComponentDef<CreateListContract> = {
  initialState,
  selectors,
  uiEvents: ["createNewListSubmitted", "listNameChanged"],
  updaters: {
    setExistingListNames: ({ payload: existingListNames, state }) => {
      state.existingListNames = existingListNames;
    },
    listNameChanged: ({ state, payload: listName }) => {
      state.listName = listName;
      state.shouldShowErrors = false;
    },
    createNewListSubmitted: ({ state }) => {
      state.shouldShowErrors = true;
    },
    createNewListRequested: ({ state }) => {
      state.isSaving = true;
      state.hasSaveFailed = false;
    },
    createNewListSucceeded: ({ state }) => {
      state.isSaving = false;
    },
    createNewListFailed: ({ state }) => {
      state.isSaving = true;
      state.hasSaveFailed = true;
    },
  },
  eventForwarders: [
    {
      from: "createNewListSubmitted",
      to: "createNewListRequested",
      onCondition: ({ values }) => values.isListNameValid(),
      withPayload: ({ values }) => values.listName(),
    },
  ],
  effects,
};
