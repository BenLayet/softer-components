import { Selectors } from '@softer-components/types';
import { flow } from 'lodash-es';

import { State, initialState } from './create-list.component.state';
import { not, or } from '../../../../utils/predicate.functions';
import { createBaseSelectors } from '@softer-components/app-utilities';

const listName = (state: State) => state.listName.trim();
const hasNameRequiredError = flow(listName, (name) => name === '');
const hasListAlreadyExistsError = (state: State) =>
  state.existingListNames.includes(listName(state));
const isListNameValid = not(or(hasListAlreadyExistsError, hasNameRequiredError));

export const selectors = {
  ...createBaseSelectors(initialState),
  listName,
  hasListAlreadyExistsError,
  hasNameRequiredError,
  isListNameValid,
} satisfies Selectors<State>;
