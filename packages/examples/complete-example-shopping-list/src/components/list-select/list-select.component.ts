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
};
const selectors = {
  name: state => state.listName,
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
  children: ExtractComponentChildrenContract<typeof childrenComponents>;
};

// Component definition
export const listSelectDef: ComponentDef<ListSelectContract> = {
  initialState,
  selectors,
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
        name: selectors.name(),
        items: [],
      }),
    },
  ],
};
