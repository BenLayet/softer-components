import { ComponentTreeEffects } from "@softer-components/types";

import { AppComponentContract } from "../src/components/app/app.component.ts";
import { List } from "../src/model";

export const mockEffects = (
  savedList: List[],
): ComponentTreeEffects<AppComponentContract> => ({
  "/listSelect": {
    createNewListRequested: (dispatchers: any, { payload }: any) =>
      dispatchers.createNewListSucceeded({
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
  "/listSelect/savedLists": {
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
