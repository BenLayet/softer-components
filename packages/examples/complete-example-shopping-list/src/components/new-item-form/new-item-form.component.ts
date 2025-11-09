import { ComponentDef, ExtractUiContract } from "@softer-components/types";
import { Item } from "../../model/Item";

// Initial state definition
const initialState = {
  name: "",
};

// Events type declaration
type NewItemFormEvents = {
  newItemSubmitted: { payload: Item };
  nameChanged: { payload: string };
  submitted: { payload: undefined };
};

// Component definition
export const newItemFormDef = {
  initialState: () => initialState,
  selectors: {
    name: state => state.name,
  },
  events: {
    newItemSubmitted: {
      payloadFactory: (p: Item) => p,
    },
    nameChanged: {
      payloadFactory: (name: string) => name,
    },
    submitted: {
      payloadFactory: () => undefined,
    },
  },
  stateUpdaters: {
    nameChanged: (state, name: string) => ({ ...state, name }),
  },
  eventForwarders: [
    {
      from: "submitted",
      to: "newItemSubmitted",
      withPayload: state => ({
        id: new Date().getTime().toString(),
        name: state.name,
      }),
    },
  ],
} satisfies ComponentDef<typeof initialState, NewItemFormEvents>;

export type NewItemFormUi = ExtractUiContract<typeof newItemFormDef>;
