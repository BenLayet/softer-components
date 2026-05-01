import { createBaseSelectors } from "@softer-components/app-utilities";
import { Selectors } from "@softer-components/types";
import { flow } from "lodash-es";

import { not, or } from "../../../../utils/predicate.functions";
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
