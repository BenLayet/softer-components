import {
  ComponentDef,
  ExtractComponentChildrenContract,
  ExtractComponentValuesContract,
  Selectors,
} from "@softer-components/types";
import { List } from "../../model/List";
import { listDef } from "../list/list.component";

// Initial state definition
const initialState = {
  listName: "",
  savedLists: [] as List[],
};
const selectors = {
  listName: state => state.listName,
  savedLists: state => state.savedLists,
  nextListId: state => state.savedLists.length + 1,
} satisfies Selectors<typeof initialState>;

// Events type declaration
type ListSelectEvents = {
  listNameChanged: { payload: string };
  createNewListClicked: { payload: undefined };
  createNewListRequested: { payload: string };
  openPreviousListRequested: { payload: number };
  fetchSavedListRequested: { payload: undefined };
  fetchSavedListSucceeded: { payload: List[] };
  fetchSavedListFailed: { payload: undefined };
  listSelected: { payload: List };
};

const childrenComponents = {
  list: listDef,
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
  uiEvents: [
    "createNewListClicked",
    "listNameChanged",
    "openPreviousListRequested",
  ],
  updaters: {
    listNameChanged: ({ state, payload: listName }) => {
      state.listName = listName;
    },
  },
  eventForwarders: [
    {
      from: "createNewListClicked",
      to: "listSelected",
      withPayload: ({ values }) => ({
        id: values.nextListId(),
        name: values.listName(),
        items: [],
      }),
    },
    {
      from: "fetchSavedListRequested",
      to: "fetchSavedListSucceeded",
      withPayload: ({ values }) => [
        {
          id: values.nextListId(),
          name: "Mock list",
          items: [{ id: 1, name: "Mock item" }],
        },
      ],
    },
  ],
};
