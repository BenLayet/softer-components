import {
  ComponentDef,
  CreateComponentChildrenContract,
  ExtractComponentValuesContract,
  Selectors,
} from "@softer-components/types";
import { List } from "../../model/List";
import { listDef } from "../list/list.component";

// Initial state definition
const initialState = {
  listName: "",
};
const selectors = {
  listName: state => state.listName,
} satisfies Selectors<typeof initialState>;

// Events type declaration
type ListSelectEvents = {
  listNameChanged: { payload: string };
  createNewListClicked: { payload: undefined };
  createNewListRequested: { payload: string };
  openPreviousListRequested: { payload: undefined };
  listSelected: { payload: List };
};

const childrenComponents = {
  list: listDef,
};

export type ListSelectContract = {
  state: typeof initialState;
  values: ExtractComponentValuesContract<typeof selectors>;
  events: ListSelectEvents;
  children: CreateComponentChildrenContract<typeof childrenComponents>;
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
      withPayload: ({ values: selectors }) => ({
        name: selectors.listName(),
        items: [],
      }),
    },
  ],
};
