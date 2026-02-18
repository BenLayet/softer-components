import {
  ComponentDef,
  Effects,
  EventsContract,
  ExtractComponentValuesContract,
  Selectors,
} from "@softer-components/types";

import { List, ListId } from "../../../../model";
import { ListService } from "../../../../port/list.service";

// Initial state definition
type Error = "FETCH_ERROR" | "DELETE_ERROR";
type ErrorMessage = string;
const initialState = {
  lists: [] as List[],
  isLoading: false,
  errors: {} as { [error in Error]?: {} },
};
type State = typeof initialState;

// Selectors
const selectors = {
  lists: state => state.lists,
  listCount: state => state.lists.length,
  listNames: state => state.lists.map(list => list.name),
  isLoading: state => state.isLoading,
  isNotLoading: state => !state.isLoading,
  hasFetchError: state => state.errors["FETCH_ERROR"] !== undefined,
} satisfies Selectors<State>;

// Events type declaration
type eventNames =
  | "initializeRequested"
  | "fetchRequested"
  | "fetchSucceeded"
  | "fetchFailed"
  | "listNamesChanged"
  | "listClicked"
  | "listSelected"
  | "deleteClicked"
  | "deleteRequested"
  | "deleteSucceeded"
  | "deleteFailed";
type Events = EventsContract<
  eventNames,
  {
    fetchSucceeded: List[];
    fetchFailed: ErrorMessage;
    listClicked: List;
    listSelected: List;
    deleteClicked: List;
    deleteRequested: ListId;
    deleteFailed: ErrorMessage;
    listNamesChanged: string[];
  }
>;

// Contract definition
type Contract = {
  state: typeof initialState;
  values: ExtractComponentValuesContract<typeof selectors>;
  events: Events;
  children: {};
};
// Effects definition
type Dependencies = {
  listService: ListService;
};
const effects = ({ listService }: Dependencies): Effects<ListsContract> => ({
  fetchRequested: async ({ fetchSucceeded, fetchFailed }) => {
    try {
      const allLists = await listService.getAll();
      fetchSucceeded(allLists);
    } catch (e: any) {
      fetchFailed(e.message);
    }
  },
  deleteRequested: async (
    { deleteSucceeded, deleteFailed },
    { payload: listId },
  ) => {
    try {
      await listService.delete(listId);
      deleteSucceeded();
    } catch (e: any) {
      deleteFailed(e.message);
    }
  },
});

// Component definition
const componentDef = ({
  dependencies,
}: {
  dependencies: Dependencies;
}): ComponentDef<Contract, State> => ({
  initialState,
  selectors,
  uiEvents: ["listClicked", "deleteClicked"],
  updaters: {
    fetchRequested: ({ state }) => {
      state.isLoading = true;
      state.errors = {};
    },
    fetchSucceeded: ({ state, payload: lists }) => {
      state.lists = lists;
      state.isLoading = false;
    },
    fetchFailed: ({ state, payload: errorMessage }) => {
      state.isLoading = false;
      state.errors["FETCH_ERROR"] = errorMessage;
    },
    deleteRequested: ({ state, payload: id }) => {
      state.isLoading = true;
      state.lists = state.lists.filter(list => list.id !== id);
    },
    deleteSucceeded: ({ state }) => {
      state.isLoading = false;
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
      withPayload: ({ payload: list, values }) =>
        values.isNotLoading() ? list : list,
    },
    {
      from: "deleteClicked",
      to: "deleteRequested",
      withPayload: ({ payload: { id }, values }) =>
        values.isNotLoading() ? id : id,
    },
    {
      from: "initializeRequested",
      to: "fetchRequested",
      onCondition: ({ values }) => values.isNotLoading(),
    },
    {
      from: "fetchSucceeded",
      to: "listNamesChanged",
      withPayload: ({ values }) => values.listNames(),
    },
    {
      from: "deleteSucceeded",
      to: "listNamesChanged",
      withPayload: ({ values }) => values.listNames(),
    },
  ],
  effects: effects(dependencies),
});

// Exports
export const listsDef = componentDef;
export type ListsContract = Contract;
export type ListsDependencies = Dependencies;
