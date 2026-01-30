import { ComponentTreeEffects } from "@softer-components/types";

import { AppComponentContract } from "../src/components/app/app.component.ts";
import { List } from "../src/model";

export const mockEffects = (
  savedList: List[],
): ComponentTreeEffects<AppComponentContract> => ({
  "/listManager/createList": {
    createNewListRequested: ({ createNewListSucceeded }, { payload }) =>
      createNewListSucceeded({
        name: payload,
        id: "fake-uuid",
        listItems: [],
      }),
  },
  "/list": {
    saveRequested: ({ saveSucceeded }, { values }) => {
      savedList.push(values.list());
      saveSucceeded();
    },
  },
  "/listManager/lists": {
    deleteRequested: ({ deleteSucceeded }, { payload }) => {
      savedList.splice(
        savedList.findIndex(l => l.id === payload),
        1,
      );
      deleteSucceeded();
    },
    fetchRequested: ({ fetchSucceeded }) => fetchSucceeded(savedList),
  },
});
