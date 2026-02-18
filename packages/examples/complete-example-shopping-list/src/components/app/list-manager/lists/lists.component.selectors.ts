import {
  ExtractComponentValuesContract,
  Selectors,
} from "@softer-components/types";

import { State } from "./lists.component.state";

export const selectors = {
  lists: (state: State) => state.lists,
  listCount: (state: State) => state.lists.length,
  listNames: (state: State) => state.lists.map(list => list.name),
  isLoading: (state: State) => state.isLoading,
  isNotLoading: (state: State) => !state.isLoading,
  hasFetchError: (state: State) => state.errors["FETCH_ERROR"] !== undefined,
} satisfies Selectors<State>;

export type Values = ExtractComponentValuesContract<typeof selectors>;
