import { ComponentDef } from "@softer-components/types";

// Initial state definition
const initialState = {
  name: "",
};

// Events type declaration
type NewItemFormEvents = {
  newItemSubmitted: { payload: string };
  nameChanged: { payload: string };
  submitted: { payload: undefined };
};

// Component definition
export const newItemFormDef: ComponentDef<
  typeof initialState,
  NewItemFormEvents
> = {
  initialState,
  selectors: {
    name: state => state.name,
  },
  events: {
    nameChanged: {
      stateUpdater: (state, name) => ({ ...state, name }),
    },
    submitted: {
      forwarders: [
        {
          to: "newItemSubmitted",
          withPayload: state => state.name,
        },
      ],
    },
    newItemSubmitted: {},
  },
};
