import { Effects } from "@softer-components/utils";
import { SavedListsContract } from "./saved-lists.component.ts";
import { listService } from "../../../../service/list-service.ts";

export const savedListsEffects: Effects<SavedListsContract> = {
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
      deleteSucceeded(listId);
    } catch (e: any) {
      deleteFailed(e.message);
      console.error(e);
    }
  },
};
