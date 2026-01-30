import { Effects } from "@softer-components/types";

import { listService } from "../../../../service/list-service.ts";
import { ListsContract } from "./lists.component.ts";

export const listsEffects: Effects<ListsContract> = {
  fetchRequested: async ({ fetchSucceeded, fetchFailed }) => {
    try {
      const allLists = await listService.getAll();
      fetchSucceeded(allLists);
    } catch (e: any) {
      fetchFailed(e.message);
    }
  },
  deleteRequested: async (
    { deleteSucceeded, deleteFailed },
    { payload: listId },
  ) => {
    try {
      await listService.delete(listId);
      deleteSucceeded();
    } catch (e: any) {
      deleteFailed(e.message);
      console.error(e);
    }
  },
};
