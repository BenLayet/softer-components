import { StateUpdaters } from "@softer-components/types";

import { Contract } from "./create-list.component.contract";
import { State } from "./create-list.component.state";

export const stateUpdaters: StateUpdaters<Contract, State> = {
  setExistingListNames: ({ payload: existingListNames, state }) => {
    state.existingListNames = existingListNames;
  },
  listNameChanged: ({ state, payload: listName }) => {
    state.listName = listName;
    state.shouldShowErrors = false;
  },
  createNewListSubmitted: ({ state }) => {
    state.shouldShowErrors = true;
  },
  createNewListRequested: ({ state }) => {
    state.isSaving = true;
    state.hasSaveFailed = false;
  },
  createNewListSucceeded: ({ state }) => {
    state.isSaving = false;
  },
  createNewListFailed: ({ state }) => {
    state.isSaving = true;
    state.hasSaveFailed = true;
  },
};
