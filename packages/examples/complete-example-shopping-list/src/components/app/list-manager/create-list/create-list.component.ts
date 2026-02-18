import {
  ComponentDef,
  Effects,
  EventsContract,
  ExtractComponentValuesContract,
  Selectors,
} from "@softer-components/types";

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
export const not = <T = any>(predicate: (value: T) => boolean) => {
  return (value: T) => !predicate(value);
};
export const or = <T = any>(...predicates: Array<(value: T) => boolean>) => {
  return (value: T) => predicates.some(predicate => predicate(value));
};

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

type ListSelectEvents = EventsContract<
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

// Contract definition
type Contract = {
  values: ExtractComponentValuesContract<typeof selectors>;
  events: ListSelectEvents;
  children: {};
};
//Effects definition
type Dependencies = {
  listService: ListService;
};
const effects = ({ listService }: Dependencies): Effects<Contract> => ({
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
