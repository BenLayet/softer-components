import {
  ComponentDef,
  ComponentEventsContract,
  EffectsDef,
  ExtractComponentValuesContract,
  Selectors,
} from "@softer-components/types";

import { List, ListId } from "../../../../model";

// Initial state definition
type Error = "FETCH_ERROR" | "DELETE_ERROR";
type ErrorMessage = string;
const initialState = {
  savedLists: [] as List[],
  isLoading: false,
  errors: {} as { [error in Error]?: {} },
};

// Selectors
const selectors = {
  savedLists: state => state.savedLists,
  savedListCount: state => state.savedLists.length,
  savedListNames: state => state.savedLists.map(list => list.name),
  isLoading: state => state.isLoading,
  isNotLoading: state => !state.isLoading,
  hasFetchError: state => state.errors["FETCH_ERROR"] !== undefined,
  hasDeleteError: state => state.errors["DELETE_ERROR"] !== undefined,
  shouldDisplayCount: state => state.savedLists.length > 0,
} satisfies Selectors<typeof initialState>;

// Events type declaration
const eventNames = [
  "displayed",
  "fetchRequested",
  "fetchSucceeded",
  "fetchFailed",
  "listClicked",
  "listSelected",
  "deleteClicked",
  "deleteRequested",
  "deleteSucceeded",
  "deleteFailed",
] as const;

// Effects definition
const effects = {
  fetchRequested: ["fetchSucceeded", "fetchFailed"],
  deleteRequested: ["deleteSucceeded", "deleteFailed"],
} satisfies EffectsDef<typeof eventNames>;

type Events = ComponentEventsContract<
  typeof eventNames,
  {
    fetchSucceeded: List[];
    fetchFailed: ErrorMessage;
    listClicked: List;
    listSelected: List;
    deleteClicked: List;
    deleteRequested: ListId;
    deleteSucceeded: ListId;
    deleteFailed: ErrorMessage;
  }
>;

// Contract definition
type Contract = {
  state: typeof initialState;
  values: ExtractComponentValuesContract<typeof selectors>;
  events: Events;
  children: {};
  effects: typeof effects;
};

// Component definition
const componentDef: ComponentDef<Contract> = {
  initialState,
  selectors,
  uiEvents: ["listClicked", "displayed", "deleteClicked"],
  updaters: {
    fetchRequested: ({ state }) => {
      state.isLoading = true;
      state.errors = {};
    },
    fetchSucceeded: ({ state, payload: savedLists }) => {
      state.savedLists = savedLists;
      state.isLoading = false;
    },
    fetchFailed: ({ state, payload: errorMessage }) => {
      state.isLoading = false;
      state.errors["FETCH_ERROR"] = errorMessage;
    },
    deleteRequested: ({ state }) => {
      state.isLoading = true;
    },
    deleteSucceeded: ({ state, payload: id }) => {
      state.isLoading = false;
      state.savedLists = state.savedLists.filter(list => list.id !== id);
      state.errors = {};
    },
    deleteFailed: ({ state, payload: errorMessage }) => {
      state.isLoading = false;
      state.errors["DELETE_ERROR"] = errorMessage;
    },
  },
  eventForwarders: [
    {
      from: "listClicked",
      to: "listSelected",
    },
    {
      from: "deleteClicked",
      to: "deleteRequested",
      withPayload: ({ payload: { id } }) => id,
    },
    {
      from: "displayed",
      to: "fetchRequested",
      onCondition: ({ selectors }) => selectors.isNotLoading(),
    },
  ],
  effects: {
    fetchRequested: ["fetchSucceeded", "fetchFailed"],
    deleteRequested: ["deleteSucceeded", "deleteFailed"],
  },
};

// Exports
export const savedListsDef = componentDef;
export type SavedListsContract = Contract;
