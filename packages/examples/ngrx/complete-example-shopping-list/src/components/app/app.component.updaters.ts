import { StateUpdaters } from '@softer-components/types';

import { Contract } from './app.component.contract';
import { State, initialState } from './app.component.state';

export const stateUpdaters: StateUpdaters<Contract, State> = {
  listSelected: ({ state }) => {
    state.page = 'LIST';
  },
  showAllListsRequested: ({ state }) => {
    state.page = 'LIST_MANAGER';
  },
  resetRequested: () => initialState,
  goToSignInFormRequested: ({ state }) => {
    state.page = 'SIGN_IN_FORM';
  },
};
