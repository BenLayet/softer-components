import {
  ExtractComponentValuesContract,
  Selectors,
} from "@softer-components/types";
import { createBaseSelectors } from "@softer-components/utils";

import { State, initialState } from "./lists.component.state";

export const selectors = {
  ...createBaseSelectors(initialState),
  listCount: (state: State) => state.lists.length,
  listNames: (state: State) => state.lists.map(list => list.name),
  isNotLoading: (state: State) => !state.isLoading,
  hasFetchError: (state: State) => state.errors["FETCH_ERROR"] !== undefined,
} satisfies Selectors<State>;

export type Values = ExtractComponentValuesContract<typeof selectors>;
