import { isNotNull, not } from "@softer-components/utils";
import {
  ExtractChildrenContract,
  ExtractSelectorContract,
  StateUpdaters,
} from "@softer-components/types";
import { List } from "../../model/List.ts";
import { listSelectComponentDef } from "../list-select/list-select.component.ts";
import { shoppingListComponentDef } from "../shopping-list/shopping-list.component.ts";
import { flow } from "lodash-es";
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

// Events
type AppEventContract = {
  listSelected: { payload: List };
};

const stateUpdaters: StateUpdaters<AppState, AppEventContract> = {
  listSelected: (state, selectedList) => ({
    ...state,
    selectedList,
  }),
};
// Children
const children = {
  shoppingList: { ...shoppingListComponentDef, exists: isListSelected },
  listSelect: {
    ...listSelectComponentDef,
    exists: not(isListSelected),
  },
};

// Component definition
export const appComponentDef = {
  initialState,
  selectors,
  stateUpdaters,
  children,
};

type AppSelectorContract = ExtractSelectorContract<typeof selectors>;
type AppChildrenContract = ExtractChildrenContract<typeof children>;

export type AppUi = {
  selectors: AppSelectorContract;
  events: AppEventContract;
  children: AppChildrenContract;
};
export type AppForParentContract = {
  constructor: undefined;
  events: AppEventContract;
};
