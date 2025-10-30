import { ComponentDef } from "@softer-components/types";

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
};

// Component definition
export const listSelectDef = {
  initialState,
  selectors: {
    name: state => state.listName,
  },
  events: {
    listNameChanged: {
      stateUpdater: (state, payload) => ({ ...state, listName: payload }),
    },
    createNewListClicked: {
      forwarders: [
        {
          to: "createNewListRequested",
          withPayload: state => state.listName,
        },
      ],
    },
  },
} satisfies ComponentDef<typeof initialState, ListSelectEvents>;
