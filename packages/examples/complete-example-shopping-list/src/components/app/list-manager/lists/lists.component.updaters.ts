import { Updaters } from "@softer-components/types";

import { Contract } from "./lists.component.contract";
import { State } from "./lists.component.state";

export const updaters: Updaters<Contract, State> = {
  fetchRequested: ({ state }) => {
    state.isLoading = true;
    state.errors = {} as any;
  },
  fetchSucceeded: ({ state, payload: lists }) => {
    state.lists = lists as any;
    state.isLoading = false;
  },
  fetchFailed: ({ state, payload: errorMessage }) => {
    state.isLoading = false;
    (state.errors as any)["FETCH_ERROR"] = errorMessage;
  },
  deleteRequested: ({ state, payload: id }) => {
    state.isLoading = true;
    state.lists = state.lists.filter(list => list.id !== id);
  },
  deleteSucceeded: ({ state }) => {
    state.isLoading = false;
    state.errors = {} as any;
  },
  deleteFailed: ({ state, payload: errorMessage }) => {
    state.isLoading = false;
    (state.errors as any)["DELETE_ERROR"] = errorMessage;
  },
};
