import {
  ComponentDef,
  ExtractChildrenContract,
  ExtractConstructorContract,
  ExtractSelectorContract,
} from "@softer-components/types";
import { isNotNull } from "@softer-components/utils";
import { flow } from "lodash-es";
import { Component } from "react";
import { List } from "../../model/List.ts";
import { shoppingListComponentDef } from "../shopping-list/shopping-list.component.ts";
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
export const appComponentDef = {
  constructor: () => initialState,
  selectors,
  stateUpdaters: {
    listSelected: (state, selectedList) => ({
      ...state,
      selectedList,
    }),
  },
  children: {
    shoppingList: { ...shoppingListComponentDef, exists: isListSelected },
    //listSelect: { ...listSelectComponentDef, exists: not(isListSelected) },
  },
} satisfies ComponentDef<AppState, AppEventContract>;

type AppSelectorContract = ExtractSelectorContract<typeof appComponentDef>;
type AppChildrenContract = ExtractChildrenContract<typeof appComponentDef>;
type AppConstructorContract = ExtractConstructorContract<
  typeof appComponentDef
>;

export type AppUi = {
  selectors: AppSelectorContract;
  events: AppEventContract;
  children: AppChildrenContract;
};
export type AppForParentContract = {
  constructor: AppConstructorContract;
  events: AppEventContract;
};
