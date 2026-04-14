import { Selectors } from "@softer-components/types";
import { createBaseSelectors, not, or } from "@softer-components/utils";
import { flow } from "lodash";

import { State, initialState } from "./create-list.component.state";

const listName = (state: State) => state.listName.trim();
const hasNameRequiredError = flow(listName, name => name === "");
const hasListAlreadyExistsError = (state: State) =>
  state.existingListNames.includes(listName(state));
const isListNameValid = not(
  or(hasListAlreadyExistsError, hasNameRequiredError),
);

export const selectors = {
  ...createBaseSelectors(initialState),
  listName,
  hasListAlreadyExistsError,
  hasNameRequiredError,
  isListNameValid,
} satisfies Selectors<State>;
