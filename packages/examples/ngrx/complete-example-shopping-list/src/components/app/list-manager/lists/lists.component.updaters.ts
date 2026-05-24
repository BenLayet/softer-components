import { StateUpdaters } from '@softer-components/types';

import { Contract } from './lists.component.contract';
import { State } from './lists.component.state';

export const stateUpdaters: StateUpdaters<Contract, State> = {
  fetchRequested: ({ state }) => {
    state.isLoading = true;
    state.errors = {};
  },
  fetchSucceeded: ({ state, payload: lists }) => {
    state.lists = lists;
    state.isLoading = false;
  },
  fetchFailed: ({ state, payload: errorMessage }) => {
    state.isLoading = false;
    state.errors['FETCH_ERROR'] = errorMessage;
  },
  deleteRequested: ({ state, payload: id }) => {
    state.isLoading = true;
    state.lists = state.lists.filter((list) => list.id !== id);
  },
  deleteSucceeded: ({ state }) => {
    state.isLoading = false;
    state.errors = {};
  },
  deleteFailed: ({ state, payload: errorMessage }) => {
    state.isLoading = false;
    state.errors['DELETE_ERROR'] = errorMessage;
  },
  emptyListCreated: ({ state, payload: list }) => {
    state.lists = [...state.lists, list];
  },
};
