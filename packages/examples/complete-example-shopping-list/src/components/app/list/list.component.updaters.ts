import { ChildrenUpdaters, StateUpdaters } from "@softer-components/types";
import { assertIsNotUndefined } from "@softer-components/utils";

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
    assertIsNotUndefined(
      state,
      "State should be defined when handling nextItemNameChanged event",
    );
    state.nextItemName = nextItemName;
  },
  resetNextItemNameRequested: ({ state }) => {
    assertIsNotUndefined(
      state,
      "State should be defined when handling resetNextItemNameRequested event",
    );
    state.nextItemName = "";
  },
  saveRequested: ({ state }) => {
    assertIsNotUndefined(
      state,
      "State should be defined when handling saveRequested event",
    );
    state.isSaving = true;
    state.errors = {};
  },
  saveFailed: ({ state, payload: errorMessage }) => {
    assertIsNotUndefined(
      state,
      "State should be defined when handling saveFailed event",
    );
    state.errors["SAVE_FAILED"] = errorMessage;
    state.isSaving = false;
  },
  saveSucceeded: ({ state }) => {
    assertIsNotUndefined(
      state,
      "State should be defined when handling saveSucceeded event",
    );
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
