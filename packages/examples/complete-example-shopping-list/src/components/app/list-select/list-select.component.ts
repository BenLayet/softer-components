import {
  ComponentDef,
  ComponentEventsContract,
  EffectsDef,
  ExtractComponentChildrenContract,
  ExtractComponentValuesContract,
  Selectors,
} from "@softer-components/types";

import { List } from "../../../model";
import { savedListsDef } from "./saved-lists/saved-lists.component.ts";

// Children components definition
const childrenComponents = {
  savedLists: savedListsDef,
};
type ChildrenContract = ExtractComponentChildrenContract<
  typeof childrenComponents
>;

type ErrorMessage = string;
type Error = "NAME_REQUIRED" | "SAVE_FAILED" | "LIST_ALREADY_EXISTS";
// Initial state definition
const initialState = {
  listName: "",
  errors: [] as Error[],
};
type State = typeof initialState;

const selectors = {
  listName: state => state.listName,
  isListNameValid: state => state.listName.trim() !== "",
  hasNameRequiredError: state => state.errors.includes("NAME_REQUIRED"),
  hasSaveFailedError: state => state.errors.includes("SAVE_FAILED"),
  hasListAlreadyExistsError: state =>
    state.errors.includes("LIST_ALREADY_EXISTS"),
  savedListsCount: (_, children) =>
    children.savedLists[0].selectors.savedListCount(),
} satisfies Selectors<State, ChildrenContract>;

// Events type declaration
const eventNames = [
  "listNameChanged",
  "createNewListClicked",
  "createNewListRequested",
  "createNewListSucceeded",
  "createNewListFailed",
  "listSelected",
] as const;

type ListSelectEvents = ComponentEventsContract<
  typeof eventNames,
  {
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
} satisfies EffectsDef<typeof eventNames>;

export type ListSelectContract = {
  state: State;
  values: ExtractComponentValuesContract<typeof selectors>;
  events: ListSelectEvents;
  children: ChildrenContract;
  effects: typeof effects;
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
  effects,
};
