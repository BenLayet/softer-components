import { Selectors } from "@softer-components/types";

import { State } from "./create-list.component.state";

export const selectors = {
  listName: (state: State) => state.listName.trim(),
  isListNameValid: (state: State) => state.listName.trim() !== "",
  hasNameRequiredError: (state: State) => state.listName.trim() === "",
  hasSaveFailedError: (state: State) => state.hasSaveFailed,
  hasListAlreadyExistsError: (state: State) =>
    state.existingListNames.includes(state.listName.trim()),
  areErrorsVisible: (state: State) =>
    (state.listName.trim() === "" ||
      state.existingListNames.includes(state.listName.trim()) ||
      state.hasSaveFailed) &&
    state.shouldShowErrors,
} satisfies Selectors<State>;
