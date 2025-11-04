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
export const newItemFormDef = {
  constructor: () => initialState,
  selectors: {
    name: state => state.name,
  },
  stateUpdaters: {
    nameChanged: (state, name) => ({ ...state, name }),
  },
  eventForwarders: [
    {
      from: "submitted",
      to: "newItemSubmitted",
      withPayload: state => state.name,
    },
  ],
} satisfies ComponentDef<typeof initialState, NewItemFormEvents>;
