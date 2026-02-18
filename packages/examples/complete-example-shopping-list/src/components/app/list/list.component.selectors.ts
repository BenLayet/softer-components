import {
  ExtractComponentValuesContract,
  Selectors,
} from "@softer-components/types";

import { List } from "../../../model";
import { Children } from "./list.component.children";
import { State } from "./list.component.state";

export const selectors = {
  id: (state: State) => state.id,
  name: (state: State) => state.name,
  nextItemName: (state: State) => state.nextItemName,
  nextItemSanitizedName: (state: State) => state.nextItemName.trim(),
  isNextItemNameValid: (state: State) => state.nextItemName.trim().length > 0,
  hasSaveFailedError: (state: State) =>
    state.errors["SAVE_FAILED"] !== undefined,
  isSaving: (state: State) => state.isSaving,
  list: (state: State, childrenValues: any) => {
    const list: List = {
      id: state.id,
      name: state.name,
      listItems: Object.values(childrenValues.itemRows).map((itemRow: any) =>
        itemRow.values.listItem(),
      ),
    };
    return list;
  },
} satisfies Selectors<State, Children>;

export type Values = ExtractComponentValuesContract<typeof selectors>;
