import {
  ExtractComponentValuesContract,
  Selector,
  Selectors,
} from "@softer-components/types";
import { flow } from "lodash";

import { List } from "../../../model";
import { Children } from "./list.component.children";
import { State } from "./list.component.state";

const id = (state: State) => state?.id ?? "";
const name = (state: State) => state?.name ?? "";
const nextItemName = (state: State) => state?.nextItemName ?? "";
const nextItemSanitizedName = flow(nextItemName, name => name.trim());
const isNextItemNameValid = flow(
  nextItemSanitizedName,
  name => name.length > 0,
);
const errors = (state: State) => state?.errors ?? {};
const hasSaveFailedError = flow(
  errors,
  errors => errors["SAVE_FAILED"] !== undefined,
);
const isSaving = (state: State) => state?.isSaving ?? false;
const list: Selector<State, Children> = (state, childrenValues) => {
  const list: List = {
    id: id(state),
    name: name(state),
    listItems: Object.values(childrenValues.itemRows).map((itemRow: any) =>
      itemRow.values.listItem(),
    ),
  };
  return list;
};
export const selectors = {
  id,
  name,
  nextItemName,
  nextItemSanitizedName,
  isNextItemNameValid,
  hasSaveFailedError,
  isSaving,
  list,
} satisfies Selectors<State, Children>;

export type Values = ExtractComponentValuesContract<typeof selectors>;
