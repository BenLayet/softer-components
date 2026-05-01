import { ExtractComponentValuesContract, Selectors } from '@softer-components/types';

import { State, initialState } from './lists.component.state';
import { createBaseSelectors } from '@softer-components/app-utilities';

export const selectors = {
  ...createBaseSelectors(initialState),
  listCount: (state: State) => state.lists.length,
  listNames: (state: State) => state.lists.map((list) => list.name),
  isNotLoading: (state: State) => !state.isLoading,
  hasFetchError: (state: State) => state.errors['FETCH_ERROR'] !== undefined,
  hasDeleteError: (state: State) => state.errors['DELETE_ERROR'] !== undefined,
} satisfies Selectors<State>;

export type Values = ExtractComponentValuesContract<typeof selectors>;
