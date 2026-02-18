import { ChildrenUpdaters, StateUpdaters } from "@softer-components/types";

import { Contract } from "./list.component.contract";
import { State } from "./list.component.state";

export const stateUpdaters: StateUpdaters<Contract, State> = {
  initialize: ({ payload: list }) => {
    return {
      id: list.id,
      name: list.name,
      isSaving: false,
      errors: {},
      nextItemName: "",
    };
  },
  nextItemNameChanged: ({ state, payload: nextItemName }) => {
    state.nextItemName = nextItemName;
  },
  resetNextItemNameRequested: ({ state }) => {
    state.nextItemName = "";
  },
  saveRequested: ({ state }) => {
    state.isSaving = true;
    state.errors = {};
  },
  saveFailed: ({ state, payload: errorMessage }) => {
    state.errors["SAVE_FAILED"] = errorMessage;
    state.isSaving = false;
  },
  saveSucceeded: ({ state }) => {
    state.isSaving = false;
    state.errors = {};
  },
};

export const childrenUpdaters: ChildrenUpdaters<Contract> = {
  initialize: ({ payload: list, children }) => {
    children.itemRows = list.listItems.map(listItem => `${listItem.item.id}`);
  },
  createItemRequested: ({ children: { itemRows }, payload: listItem }) => {
    itemRows.push(`${listItem.item.id}`);
  },
  removeItemRequested: ({ children: { itemRows }, payload: idToRemove }) => {
    itemRows.splice(itemRows.indexOf(`${idToRemove}`), 1);
  },
};
