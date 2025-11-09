import { ComponentDef, ExtractUiContract } from "@softer-components/types";
import { List } from "../../model/List";

// Initial state definition
const initialState = {
  listName: "",
};

// Events type declaration
type ListSelectEvents = {
  listNameChanged: { payload: string };
  createNewListClicked: { payload: undefined };
  createNewListRequested: { payload: string };
  openPreviousListRequested: { payload: undefined };
  listSelected: { payload: List };
};

// Component definition
export const listSelectDef = {
  initialState: () => initialState,
  selectors: {
    name: state => state.listName,
  },
  events: {
    listNameChanged: {
      payloadFactory: (listName: string) => listName,
    },
    createNewListClicked: {
      payloadFactory: () => undefined,
    },
    createNewListRequested: {
      payloadFactory: (listName: string) => listName,
    },
    openPreviousListRequested: {
      payloadFactory: () => undefined,
    },
    listSelected: {
      payloadFactory: (list: List) => list,
    },
  },
  stateUpdaters: {
    listNameChanged: (state, listName: string) => ({
      ...state,
      listName,
    }),
  },
  eventForwarders: [
    {
      from: "createNewListClicked",
      to: "listSelected",
      withPayload: state => ({ name: state.listName, items: [] }),
    },
  ],
} satisfies ComponentDef<typeof initialState, ListSelectEvents>;

export type ListSelectUi = ExtractUiContract<typeof listSelectDef>;
