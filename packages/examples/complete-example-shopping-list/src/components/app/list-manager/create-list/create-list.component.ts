import {
  ComponentDef,
  ComponentEventsContract,
  Effects,
  ExtractComponentValuesContract,
  Selectors,
} from "@softer-components/types";
import { not, or } from "@softer-components/utils";

import { List } from "../../../../model";
import { ListService } from "../../../../port/list.service";

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

// Effect declaration
type EffectsContract = {
  createNewListRequested: ["createNewListSucceeded", "createNewListFailed"];
};

// Contract definition
type Contract = {
  values: ExtractComponentValuesContract<typeof selectors>;
  events: ListSelectEvents;
  children: {};
  effects: EffectsContract;
};
type Dependencies = {
  listService: ListService;
};
const effects: (dependencies: Dependencies) => Effects<Contract> = ({
  listService,
}) => ({
  createNewListRequested: async (
    { createNewListSucceeded, createNewListFailed },
    { payload: name },
  ) => {
    try {
      const list = await listService.create(name);
      createNewListSucceeded(list);
    } catch (e: any) {
      createNewListFailed(e.message);
    }
  },
});

// Component definition
const componentDef = (
  dependencies: Dependencies,
): ComponentDef<Contract, State> => ({
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
  effects: effects(dependencies),
});

// Exports
export const createListDef = componentDef;
export type CreateListContract = Contract;
export type CreateListDependencies = Dependencies;
