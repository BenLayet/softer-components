import {
  ComponentDef,
  ExtractChildrenContract,
} from "@softer-components/types";
import { isNotNull, not } from "@softer-components/utils";
import { flow } from "lodash-es";
import { List } from "../../model/List.ts";
import { shoppingListDef as shoppingListDef } from "../shopping-list/shopping-list.component.ts";
import { listSelectDef } from "../list-select/list-select.component.ts";
// Events
type AppEventContract = {
  listSelected: { payload: List };
};

// State
const initialState = {
  selectedList: null as List | null,
};
type AppState = typeof initialState;

// Selectors
const selectedList = (state: AppState) => state.selectedList;
const isListSelected = flow(selectedList, isNotNull);
// Combine selectors
const selectors = {
  selectedList,
  isListSelected,
};

// Component definition
export const appDef = {
  initialState: () => initialState,
  selectors,
  events: {
    listSelected: {
      payloadFactory: (selectedList: List) => selectedList,
    },
  },
  stateUpdaters: {
    listSelected: (state, selectedList: List) => ({
      ...state,
      selectedList,
    }),
  },
  children: {
    shoppingList: {
      componentDef: shoppingListDef,
      exists: isListSelected,
    },
    listSelect: {
      componentDef: listSelectDef,
      exists: not(isListSelected),
      listeners: [
        {
          from: "listSelected",
          to: "listSelected",
        },
      ],
    },
  },
} satisfies ComponentDef<AppState, AppEventContract>;

export type AppChildrenContract = ExtractChildrenContract<typeof appDef>;
