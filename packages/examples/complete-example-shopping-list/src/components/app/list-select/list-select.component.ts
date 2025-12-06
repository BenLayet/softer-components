import {
  ComponentDef,
  ExtractComponentChildrenContract,
  ExtractComponentValuesContract,
  Selectors,
} from "@softer-components/types";
import { List } from "../../../model";
import { savedListsDef } from "./saved-lists/saved-lists.component.ts";

type ErrorMessage = string;
type Error = "NAME_REQUIRED" | "SAVE_FAILED" | "LIST_ALREADY_EXISTS";
// Initial state definition
const initialState = {
  listName: "",
  errors: [] as Error[],
};
const selectors = {
  listName: state => state.listName,
  isListNameValid: state => state.listName.trim() !== "",
  hasNameRequiredError: state => state.errors.includes("NAME_REQUIRED"),
  hasSaveFailedError: state => state.errors.includes("SAVE_FAILED"),
  hasListAlreadyExistsError: state =>
    state.errors.includes("LIST_ALREADY_EXISTS"),
} satisfies Selectors<typeof initialState>;

// Events type declaration
type ListSelectEvents = {
  listNameChanged: { payload: string };
  createNewListClicked: { payload: undefined };
  createNewListRequested: {
    payload: string;
    canTrigger: ["createNewListSucceeded", "createNewListFailed"];
  };
  createNewListSucceeded: { payload: List };
  createNewListFailed: { payload: ErrorMessage };
  listSelected: { payload: List };
};

const childrenComponents = {
  savedLists: savedListsDef,
};

export type ListSelectContract = {
  state: typeof initialState;
  values: ExtractComponentValuesContract<typeof selectors>;
  events: ListSelectEvents;
  children: ExtractComponentChildrenContract<typeof childrenComponents>;
};

// Component definition
export const listSelectDef: ComponentDef<ListSelectContract> = {
  initialState,
  selectors,
  uiEvents: ["createNewListClicked", "listNameChanged"],
  updaters: {
    listNameChanged: ({ state, payload: listName }) => {
      state.listName = listName;
      state.errors = [];
    },
    createNewListClicked: ({
      state,
      selectors: { listName },
      children: { savedLists },
    }) => {
      listName() === "" && state.errors.push("NAME_REQUIRED");
      savedLists["0"].selectors.savedListNames().includes(listName()) &&
        state.errors.push("LIST_ALREADY_EXISTS");
    },
    createNewListFailed: ({ state }) => {
      state.errors.push("SAVE_FAILED");
    },
  },
  eventForwarders: [
    {
      from: "createNewListSucceeded",
      to: "listSelected",
    },
    {
      from: "createNewListClicked",
      to: "createNewListRequested",
      onCondition: ({ selectors }) => selectors.listName().trim() !== "",
      withPayload: ({ selectors }) => selectors.listName(),
    },
  ],
  childrenComponents,
  childrenConfig: {
    savedLists: {
      listeners: [{ from: "listSelected", to: "listSelected" }],
    },
  },
  effects: {
    createNewListRequested: ["createNewListSucceeded", "createNewListFailed"],
  },
};
